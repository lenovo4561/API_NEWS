const mysql = require("mysql2/promise");
require("dotenv").config();

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "Information",
    });

    console.log("\n=== 验证三级分类中文翻译结果 ===\n");

    // 查询总数
    const [total] = await conn.query(
      "SELECT COUNT(*) as count FROM category_third"
    );
    console.log(`数据库中三级分类总数: ${total[0].count}`);

    // 查询示例数据
    console.log("\n=== 前20条翻译后的数据示例 ===\n");
    const [samples] = await conn.query(`
      SELECT 
        ct.id,
        ct.third_category_key,
        ct.name,
        cs.name as sub_category_name
      FROM category_third ct
      JOIN category_sub cs ON ct.sub_category_id = cs.id
      WHERE ct.id >= 4509
      ORDER BY ct.id
      LIMIT 20
    `);

    samples.forEach((row) => {
      console.log(
        `ID ${row.id}: ${row.third_category_key} → ${row.name} (${row.sub_category_name})`
      );
    });

    console.log("\n=== 按子分类统计 ===\n");
    const [stats] = await conn.query(`
      SELECT 
        cs.name as sub_category_name,
        COUNT(ct.id) as total_count
      FROM category_third ct
      JOIN category_sub cs ON ct.sub_category_id = cs.id
      WHERE ct.id >= 4509
      GROUP BY cs.id, cs.name
      ORDER BY total_count DESC
      LIMIT 10
    `);

    stats.forEach((row) => {
      console.log(`${row.sub_category_name}: ${row.total_count} 条`);
    });

    console.log("\n✓ 验证完成！");

    await conn.end();
  } catch (error) {
    console.error("错误:", error);
    process.exit(1);
  }
})();
