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

async function cleanupDuplicates() {
  let connection;

  try {
    console.log("=== Starting Cleanup ===\n");

    // 连接数据库
    console.log("1. Connecting to MySQL server...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✓ Connected to MySQL server\n");

    // 检查重复记录
    console.log("2. Checking for duplicates...");
    const [duplicates] = await connection.execute(`
      SELECT main_category_id, name, COUNT(*) as count
      FROM category_sub
      GROUP BY main_category_id, name
      HAVING count > 1
      ORDER BY main_category_id, name
    `);

    console.log(`✓ Found ${duplicates.length} duplicate name groups\n`);

    if (duplicates.length > 0) {
      console.log("Duplicates:");
      console.table(duplicates);

      // 删除 id >= 610 的记录（这些是第二次导入的）
      console.log("\n3. Deleting recent imports (id >= 610)...");
      const [result] = await connection.execute(`
        DELETE FROM category_sub 
        WHERE id >= 610
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
    } else {
      console.log("No duplicates found.");
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

cleanupDuplicates();
