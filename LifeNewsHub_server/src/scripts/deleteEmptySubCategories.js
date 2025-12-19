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

async function deleteEmptySubCategories() {
  let connection;

  try {
    console.log("=== Starting Cleanup ===\n");

    // 连接数据库
    console.log("1. Connecting to MySQL server...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✓ Connected to MySQL server\n");

    // 查找name为空或只包含特殊字符的记录
    console.log("2. Finding invalid records...");
    const [invalidRecords] = await connection.execute(`
      SELECT id, main_category_id, name, sub_category_key 
      FROM category_sub 
      WHERE name = ']' OR name = '];' OR name = ''
      ORDER BY id
    `);

    console.log(`✓ Found ${invalidRecords.length} invalid records\n`);

    if (invalidRecords.length > 0) {
      console.log("Invalid records:");
      console.table(invalidRecords);

      // 删除这些记录
      console.log("\n3. Deleting invalid records...");
      const [result] = await connection.execute(`
        DELETE FROM category_sub 
        WHERE name = ']' OR name = '];' OR name = ''
      `);

      console.log(`✓ Deleted ${result.affectedRows} invalid records\n`);

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
    } else {
      console.log("No invalid records found.");
    }

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

deleteEmptySubCategories();
