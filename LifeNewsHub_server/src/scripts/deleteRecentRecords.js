const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "..", "..", ".env"),
});

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "Information",
};

async function deleteRecentSportsRecords() {
  let connection;

  try {
    console.log("=== Deleting Recent Sports Records ===\n");

    // 连接数据库
    console.log("1. Connecting to MySQL server...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✓ Connected to MySQL server\n");

    // 删除 id >= 767 的记录
    console.log("2. Deleting records with id >= 767...");
    const [result] = await connection.execute(`
      DELETE FROM category_sub 
      WHERE id >= 767
    `);

    console.log(`✓ Deleted ${result.affectedRows} records\n`);

    // 显示最终统计
    const [counts] = await connection.execute(`
      SELECT c.name as main_category, c.category_key, COUNT(s.id) as sub_count
      FROM category_main c
      LEFT JOIN category_sub s ON c.id = s.main_category_id
      GROUP BY c.id, c.name, c.category_key
      ORDER BY c.id
    `);

    console.log("Final count by main category:");
    console.table(counts);

    console.log("\n✓ Cleanup completed successfully!");
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n✓ Database connection closed");
    }
  }
}

deleteRecentSportsRecords();
