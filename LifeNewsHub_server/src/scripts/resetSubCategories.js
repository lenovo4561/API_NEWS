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

async function resetSubCategories() {
  let connection;

  try {
    console.log("=== Resetting Sub-Categories ===\n");

    // 连接数据库
    console.log("1. Connecting to MySQL server...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✓ Connected to MySQL server\n");

    // 获取10个艺术子分类的IDs
    const [arts] = await connection.execute(`
      SELECT id
      FROM category_sub
      WHERE main_category_id = 16
      ORDER BY id
      LIMIT 10
    `);

    const artsIds = arts.map((row) => row.id).join(",");
    console.log(`Arts sub-categories IDs: ${artsIds}\n`);

    // 删除除艺术子分类外的所有记录
    console.log("2. Deleting all sub-categories except Arts...");
    const [result] = await connection.execute(`
      DELETE FROM category_sub
      WHERE main_category_id != 16
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

    console.log("\n✓ Reset completed successfully!");
    console.log(
      "\nNext step: Run `npm run db:import-subs` to re-import all sub-categories"
    );
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

resetSubCategories();
