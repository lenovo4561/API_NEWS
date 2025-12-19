const mysql = require("mysql2/promise");
require("dotenv").config();

async function addLangField() {
  let connection;

  try {
    console.log("Connecting to database...");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "Information",
    });
    console.log("✓ Connected to database");

    // 检查 lang 字段是否已存在
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM info LIKE 'lang'"
    );

    if (columns.length > 0) {
      console.log("✓ lang 字段已存在");
    } else {
      console.log("\n=== Adding lang field ===");

      // 添加 lang 字段
      await connection.query(`
        ALTER TABLE info 
        ADD COLUMN lang VARCHAR(10) DEFAULT 'zh-CN' COMMENT '语言: zh-CN, en-US, ja-JP等'
        AFTER url
      `);
      console.log("✓ lang 字段添加成功");

      // 添加索引
      await connection.query(`
        ALTER TABLE info 
        ADD INDEX idx_lang (lang)
      `);
      console.log("✓ lang 字段索引添加成功");
    }

    // 显示更新后的表结构
    console.log("\n=== Updated info table structure ===");
    const [structure] = await connection.query("DESCRIBE info");
    console.table(structure);

    // 显示所有索引
    console.log("\n=== Indexes on info table ===");
    const [indexes] = await connection.query("SHOW INDEX FROM info");
    const indexInfo = indexes.map((idx) => ({
      Column: idx.Column_name,
      Index: idx.Key_name,
      Unique: idx.Non_unique === 0 ? "Yes" : "No",
    }));
    console.table(indexInfo);

    console.log("\n✅ lang 字段添加完成！");
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log("✓ Connection closed");
    }
  }
}

addLangField();
