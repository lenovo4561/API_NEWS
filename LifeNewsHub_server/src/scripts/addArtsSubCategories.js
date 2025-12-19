const mysql = require("mysql2/promise");
require("dotenv").config({
  path: require("path").join(__dirname, "..", "..", ".env"),
});

/**
 * 为"艺术"大分类添加二级分类
 * 同时为 category_sub 表添加 sub_category_key 字段
 */

// 艺术类二级分类数据
const ARTS_SUB_CATEGORIES = [
  { key: "Animation", name: "动画片", description: "动画艺术" },
  { key: "Architecture", name: "建筑学", description: "建筑设计与艺术" },
  { key: "Art_History", name: "艺术史", description: "艺术历史研究" },
  { key: "Awards", name: "奖项", description: "艺术类奖项" },
  { key: "Bodyart", name: "人体彩绘", description: "人体艺术彩绘" },
  { key: "Classical_Studies", name: "古典学", description: "古典艺术研究" },
  { key: "Comics", name: "漫画", description: "漫画艺术" },
  { key: "Contests", name: "竞赛", description: "艺术竞赛" },
  { key: "Costumes", name: "服装", description: "服装设计艺术" },
  { key: "Crafts", name: "工艺", description: "工艺美术" },
  { key: "Design", name: "设计", description: "艺术设计" },
  { key: "Digital", name: "数字艺术", description: "数字艺术创作" },
  { key: "Education", name: "教育", description: "艺术教育" },
  { key: "Entertainment", name: "娱乐", description: "娱乐艺术" },
  { key: "Genres", name: "类型", description: "艺术类型" },
  { key: "Graphic_Design", name: "平面设计", description: "平面艺术设计" },
  { key: "Humanities", name: "人文科学", description: "人文艺术" },
  { key: "Illustration", name: "插图", description: "插画艺术" },
  { key: "Literature", name: "文学", description: "文学艺术" },
  {
    key: "Magazines_and_Ezines",
    name: "杂志和电子杂志",
    description: "艺术类杂志",
  },
  { key: "Movies", name: "电影", description: "电影艺术" },
  { key: "Music", name: "音乐", description: "音乐艺术" },
  { key: "Online_Writing", name: "在线写作", description: "在线创作" },
  { key: "Organizations", name: "组织", description: "艺术组织" },
  { key: "Performing_Arts", name: "表演艺术", description: "舞台表演艺术" },
  {
    key: "Periods_and_Movements",
    name: "时期和运动",
    description: "艺术流派与运动",
  },
  { key: "Photography", name: "摄影", description: "摄影艺术" },
  { key: "Radio", name: "广播", description: "广播艺术" },
  { key: "Television", name: "电视", description: "电视艺术" },
  { key: "Video", name: "视频", description: "视频艺术" },
  { key: "Visual_Arts", name: "视觉艺术", description: "视觉艺术创作" },
  { key: "Writers_Resources", name: "作家资源", description: "作家创作资源" },
];

async function addArtsSubCategories() {
  let connection;

  try {
    // 连接到数据库
    console.log("Connecting to MySQL server...");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "Information",
    });
    console.log("✓ Connected to MySQL server");

    // 使用数据库
    await connection.query(`USE ${process.env.DB_NAME || "Information"}`);

    // 1. 检查 sub_category_key 字段是否存在
    console.log("\n=== Checking if sub_category_key field exists ===");
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM category_sub LIKE 'sub_category_key'
    `);

    if (columns.length === 0) {
      // 添加 sub_category_key 字段
      console.log("\n=== Adding sub_category_key field ===");
      const addColumnSQL = `
        ALTER TABLE category_sub 
        ADD COLUMN sub_category_key VARCHAR(50) COMMENT '子分类英文标识' 
        AFTER id
      `;
      await connection.query(addColumnSQL);
      console.log("✓ Field 'sub_category_key' added successfully");

      // 添加唯一索引（与 main_category_id 组合）
      console.log("\n=== Adding unique index for sub_category_key ===");
      const addIndexSQL = `
        ALTER TABLE category_sub 
        ADD UNIQUE KEY uk_main_sub_key (main_category_id, sub_category_key)
      `;
      await connection.query(addIndexSQL);
      console.log("✓ Unique index added for 'sub_category_key'");
    } else {
      console.log("✓ Field 'sub_category_key' already exists");
    }

    // 2. 获取"艺术"分类的ID
    console.log("\n=== Finding Arts category ===");
    const [artsCategory] = await connection.query(
      "SELECT id, name FROM category_main WHERE category_key = 'Arts' LIMIT 1"
    );

    if (artsCategory.length === 0) {
      console.error('✗ "Arts" category not found in category_main table');
      process.exit(1);
    }

    const artsCategoryId = artsCategory[0].id;
    console.log(
      `✓ Found Arts category: ID=${artsCategoryId}, Name=${artsCategory[0].name}`
    );

    // 3. 检查是否已有艺术类子分类
    const [existingSubs] = await connection.query(
      "SELECT COUNT(*) as count FROM category_sub WHERE main_category_id = ?",
      [artsCategoryId]
    );
    const existingCount = existingSubs[0].count;
    console.log(`  Current sub-categories count: ${existingCount}`);

    // 4. 插入艺术类二级分类
    console.log("\n=== Inserting Arts sub-categories ===");
    let insertedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < ARTS_SUB_CATEGORIES.length; i++) {
      const sub = ARTS_SUB_CATEGORIES[i];
      const sortOrder = i + 1;

      try {
        // 检查是否已存在（通过 sub_category_key）
        const [existing] = await connection.query(
          "SELECT id FROM category_sub WHERE main_category_id = ? AND sub_category_key = ?",
          [artsCategoryId, sub.key]
        );

        if (existing.length > 0) {
          console.log(`  ⊘ Skipped: ${sub.name} (${sub.key}) - already exists`);
          skippedCount++;
          continue;
        }

        const insertSQL = `
          INSERT INTO category_sub 
          (main_category_id, sub_category_key, name, description, sort_order, status)
          VALUES (?, ?, ?, ?, ?, 1)
        `;
        await connection.query(insertSQL, [
          artsCategoryId,
          sub.key,
          sub.name,
          sub.description,
          sortOrder,
        ]);
        console.log(`  ✓ Inserted: ${sub.name} (${sub.key})`);
        insertedCount++;
      } catch (error) {
        console.error(`  ✗ Failed to insert ${sub.name}: ${error.message}`);
      }
    }

    console.log(
      `\n✓ Insertion completed: ${insertedCount} inserted, ${skippedCount} skipped`
    );

    // 5. 显示艺术类所有子分类
    console.log("\n=== Arts sub-categories in database ===");
    const [allArtsSubs] = await connection.query(
      `SELECT id, sub_category_key, name, sort_order, status 
       FROM category_sub 
       WHERE main_category_id = ? 
       ORDER BY sort_order`,
      [artsCategoryId]
    );
    console.table(allArtsSubs);

    // 6. 显示统计信息
    console.log("\n=== Statistics ===");
    const [stats] = await connection.query(`
      SELECT 
        cm.name as main_category,
        COUNT(cs.id) as sub_count
      FROM category_main cm
      LEFT JOIN category_sub cs ON cm.id = cs.main_category_id
      WHERE cm.category_key = 'Arts'
      GROUP BY cm.id, cm.name
    `);
    console.table(stats);

    console.log("\n✓ Arts sub-categories setup completed successfully!");
  } catch (error) {
    console.error("\n✗ Error during setup:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n✓ Database connection closed");
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  addArtsSubCategories().then(() => {
    console.log("\n=== Script completed ===");
    process.exit(0);
  });
}

module.exports = { addArtsSubCategories };
