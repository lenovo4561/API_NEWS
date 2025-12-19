const mysql = require("mysql2/promise");
require("dotenv").config({
  path: require("path").join(__dirname, "..", "..", ".env"),
});

/**
 * 迁移脚本：为 category_main 表添加 category_key 字段
 * 并更新现有数据
 */

// 分类名称与 category_key 的映射
const CATEGORY_KEY_MAP = {
  艺术: "Arts",
  商业: "Business",
  计算机: "Computers",
  游戏: "Games",
  健康: "Health",
  家: "Home",
  娱乐: "Recreation",
  科学: "Science",
  购物: "Shopping",
  社会: "Society",
  运动的: "Sports",
};

async function addCategoryKey() {
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
    console.log("\n=== Checking if category_key field exists ===");
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM category_main LIKE 'category_key'
    `);

    if (columns.length > 0) {
      console.log("✓ Field 'category_key' already exists");
      console.log("  Proceeding to update values...");
    } else {
      // 添加 category_key 字段（在 id 后面）
      console.log("\n=== Adding category_key field ===");
      const addColumnSQL = `
        ALTER TABLE category_main 
        ADD COLUMN category_key VARCHAR(50) COMMENT '分类英文标识' 
        AFTER id
      `;
      await connection.query(addColumnSQL);
      console.log("✓ Field 'category_key' added successfully");

      // 添加唯一索引
      console.log("\n=== Adding unique index for category_key ===");
      const addIndexSQL = `
        ALTER TABLE category_main 
        ADD UNIQUE KEY uk_category_key (category_key)
      `;
      await connection.query(addIndexSQL);
      console.log("✓ Unique index added for 'category_key'");
    }

    // 获取现有的分类数据
    console.log("\n=== Fetching existing categories ===");
    const [categories] = await connection.query(
      "SELECT id, name FROM category_main ORDER BY id"
    );
    console.log(`✓ Found ${categories.length} categories`);

    // 更新每个分类的 category_key
    console.log("\n=== Updating category_key values ===");
    for (const category of categories) {
      const categoryKey = CATEGORY_KEY_MAP[category.name];

      if (categoryKey) {
        const updateSQL = `
          UPDATE category_main 
          SET category_key = ? 
          WHERE id = ?
        `;
        await connection.query(updateSQL, [categoryKey, category.id]);
        console.log(
          `✓ Updated: ${category.name} (ID: ${category.id}) -> ${categoryKey}`
        );
      } else {
        console.log(
          `⚠ Warning: No category_key mapping found for "${category.name}" (ID: ${category.id})`
        );
      }
    }

    // 显示更新后的数据
    console.log("\n=== Current category_main data ===");
    const [updatedCategories] = await connection.query(
      "SELECT id, category_key, name, sort_order, status FROM category_main ORDER BY id"
    );
    console.table(updatedCategories);

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

// 如果直接运行此脚本
if (require.main === module) {
  addCategoryKey().then(() => {
    console.log("\n=== Migration script completed ===");
    process.exit(0);
  });
}

module.exports = { addCategoryKey };
