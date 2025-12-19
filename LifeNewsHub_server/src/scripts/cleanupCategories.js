const mysql = require("mysql2/promise");
require("dotenv").config({
  path: require("path").join(__dirname, "..", "..", ".env"),
});

async function cleanupOldCategories() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: "Information",
    });

    console.log("清理旧分类...");

    // 删除旧的大分类（会级联删除相关子分类）
    await connection.query(
      `DELETE FROM category_main WHERE name IN ('科技', '体育', '财经', '生活')`
    );
    console.log("✓ 旧分类已删除");

    // 显示剩余的分类
    console.log("\n=== 最新大分类列表 ===");
    const [main] = await connection.query(
      "SELECT id, name, description, sort_order FROM category_main WHERE status = 1 ORDER BY sort_order"
    );
    console.table(main);

    console.log("\n=== 子分类统计 ===");
    const [stats] = await connection.query(`
      SELECT m.name as '大分类', COUNT(s.id) as '子分类数量' 
      FROM category_main m 
      LEFT JOIN category_sub s ON m.id = s.main_category_id 
      WHERE m.status = 1 
      GROUP BY m.id, m.name 
      ORDER BY m.sort_order
    `);
    console.table(stats);

    console.log("\n✅ 清理完成！");
  } catch (error) {
    console.error("❌ 错误:", error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

cleanupOldCategories();
