const mysql = require("mysql2/promise");
require("dotenv").config({
  path: require("path").join(__dirname, "..", "..", ".env"),
});

/**
 * 迁移脚本：为 category_third 表添加 third_category_key 字段
 */

async function addThirdCategoryKey() {
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

    // 检查字段是否已存在
    console.log("\n=== Checking if third_category_key field exists ===");
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM category_third LIKE 'third_category_key'
    `);

    if (columns.length > 0) {
      console.log("✓ Field 'third_category_key' already exists");
      console.log("  Skipping field creation...");
    } else {
      // 添加 third_category_key 字段（在 id 后面）
      console.log("\n=== Adding third_category_key field ===");
      const addColumnSQL = `
        ALTER TABLE category_third 
        ADD COLUMN third_category_key VARCHAR(50) COMMENT '第三级分类英文标识' 
        AFTER id
      `;
      await connection.query(addColumnSQL);
      console.log("✓ Field 'third_category_key' added successfully");

      // 添加唯一索引（与 sub_category_id 组合）
      console.log("\n=== Adding unique index for third_category_key ===");
      const addIndexSQL = `
        ALTER TABLE category_third 
        ADD UNIQUE KEY uk_sub_third_key (sub_category_id, third_category_key)
      `;
      await connection.query(addIndexSQL);
      console.log("✓ Unique index added for 'third_category_key'");
    }

    // 获取现有的第三级分类数据
    console.log("\n=== Fetching existing third-level categories ===");
    const [thirdCategories] = await connection.query(
      "SELECT id, name FROM category_third ORDER BY id"
    );
    console.log(`✓ Found ${thirdCategories.length} third-level categories`);

    // 为现有数据生成 third_category_key（如果需要）
    if (thirdCategories.length > 0) {
      console.log("\n=== Generating third_category_key for existing data ===");
      let updatedCount = 0;

      for (const category of thirdCategories) {
        // 检查是否已有 third_category_key
        const [existing] = await connection.query(
          "SELECT third_category_key FROM category_third WHERE id = ?",
          [category.id]
        );

        if (existing[0]?.third_category_key) {
          console.log(
            `  ⊘ Skipped: ${category.name} (ID: ${category.id}) - already has key`
          );
          continue;
        }

        // 生成 key：将中文名称转换为拼音或使用简化的英文标识
        // 这里使用简单的规则，实际应用中可能需要更复杂的转换逻辑
        let generatedKey = generateKeyFromName(category.name);

        // 检查 key 是否在同一 sub_category 下重复
        const [checkDup] = await connection.query(
          `SELECT id FROM category_third 
           WHERE sub_category_id = (SELECT sub_category_id FROM category_third WHERE id = ?) 
           AND third_category_key = ?`,
          [category.id, generatedKey]
        );

        if (checkDup.length > 0) {
          // 如果重复，添加序号
          generatedKey = `${generatedKey}_${category.id}`;
        }

        const updateSQL = `
          UPDATE category_third 
          SET third_category_key = ? 
          WHERE id = ?
        `;
        await connection.query(updateSQL, [generatedKey, category.id]);
        console.log(
          `  ✓ Updated: ${category.name} (ID: ${category.id}) -> ${generatedKey}`
        );
        updatedCount++;
      }

      console.log(`\n✓ Updated ${updatedCount} records`);
    }

    // 显示更新后的数据
    console.log("\n=== Current category_third data (first 20 records) ===");
    const [updatedCategories] = await connection.query(
      `SELECT id, third_category_key, name, sub_category_id, sort_order, status 
       FROM category_third 
       ORDER BY id 
       LIMIT 20`
    );
    console.table(updatedCategories);

    // 显示统计信息
    console.log("\n=== Statistics ===");
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(third_category_key) as with_key,
        COUNT(*) - COUNT(third_category_key) as without_key
      FROM category_third
    `);
    console.table(stats);

    console.log("\n✓ Migration completed successfully!");
  } catch (error) {
    console.error("\n✗ Error during migration:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n✓ Database connection closed");
    }
  }
}

/**
 * 从中文名称生成英文 key
 * 这是一个简化版本，实际应用中可能需要更复杂的转换逻辑
 */
function generateKeyFromName(name) {
  // 预定义的中文到英文映射
  const nameMap = {
    JavaScript: "JavaScript",
    Python: "Python",
    Java: "Java",
    CPU: "CPU",
    显卡: "GPU",
    内存: "Memory",
    王者荣耀: "Honor_of_Kings",
    和平精英: "PUBG_Mobile",
    原神: "Genshin_Impact",
    动作片: "Action_Movies",
    喜剧片: "Comedy_Movies",
    科幻片: "Sci_Fi_Movies",
    中超: "Chinese_Super_League",
    英超: "Premier_League",
    西甲: "La_Liga",
    绘画: "Painting",
    音乐: "Music",
    舞蹈: "Dance",
    金融: "Finance",
    投资: "Investment",
    创业: "Entrepreneurship",
    编程: "Programming",
    硬件: "Hardware",
    网络: "Network",
    手游: "Mobile_Games",
    端游: "PC_Games",
    主机: "Console_Games",
    养生: "Health_Care",
    医疗: "Medical",
    健身: "Fitness",
    装修: "Decoration",
    家电: "Appliances",
    家具: "Furniture",
    电影: "Movies",
    综艺: "Variety_Shows",
    明星: "Celebrities",
    物理: "Physics",
    化学: "Chemistry",
    生物: "Biology",
    电商: "E_Commerce",
    优惠: "Discounts",
    海淘: "Cross_Border_Shopping",
    民生: "Livelihood",
    法制: "Law",
    教育: "Education",
    足球: "Football",
    篮球: "Basketball",
    跑步: "Running",
  };

  // 如果有预定义映射，使用映射
  if (nameMap[name]) {
    return nameMap[name];
  }

  // 否则，使用简单的转换规则
  // 移除特殊字符，将空格替换为下划线
  let key = name
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "");

  // 如果是纯中文，使用拼音首字母或保留原名
  if (/^[\u4e00-\u9fa5]+$/.test(key)) {
    key = `CN_${key}`;
  }

  return key || "Unknown";
}

// 如果直接运行此脚本
if (require.main === module) {
  addThirdCategoryKey().then(() => {
    console.log("\n=== Migration script completed ===");
    process.exit(0);
  });
}

module.exports = { addThirdCategoryKey };
