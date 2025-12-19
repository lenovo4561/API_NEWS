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

    console.log("\n=== Arts 分类下所有三级分类数据统计 ===\n");

    // 查询每个二级分类下的三级分类数量
    const [stats] = await conn.query(`
      SELECT 
        cs.name as sub_category_name,
        cs.sub_category_key,
        COUNT(ct.id) as third_count
      FROM category_sub cs
      LEFT JOIN category_third ct ON cs.id = ct.sub_category_id
      WHERE cs.main_category_id = 16
      GROUP BY cs.id, cs.name, cs.sub_category_key
      HAVING third_count > 0
      ORDER BY third_count DESC
    `);

    console.log("各二级分类的三级分类数量:");
    let totalThird = 0;
    stats.forEach((row, index) => {
      console.log(
        `${index + 1}. ${row.sub_category_name} (${row.sub_category_key}): ${
          row.third_count
        } 个三级分类`
      );
      totalThird += row.third_count;
    });

    console.log(
      `\n总计: ${stats.length} 个二级分类，共 ${totalThird} 个三级分类\n`
    );

    // 查询所有三级分类数据
    console.log("=== 所有三级分类详细信息 ===\n");

    const [allThird] = await conn.query(`
      SELECT 
        ct.id,
        ct.third_category_key,
        ct.name,
        cs.name as sub_category_name,
        cs.sub_category_key,
        ct.sort_order
      FROM category_third ct
      JOIN category_sub cs ON ct.sub_category_id = cs.id
      WHERE cs.main_category_id = 16
      ORDER BY cs.name, ct.sort_order
    `);

    let currentSub = "";
    allThird.forEach((row) => {
      if (currentSub !== row.sub_category_name) {
        currentSub = row.sub_category_name;
        console.log(`\n【${currentSub}】`);
      }
      console.log(
        `  - ${row.name} (key: ${row.third_category_key}, sort: ${row.sort_order})`
      );
    });

    console.log("\n✓ 数据验证完成！");

    await conn.end();
  } catch (error) {
    console.error("错误:", error);
    process.exit(1);
  }
})();
