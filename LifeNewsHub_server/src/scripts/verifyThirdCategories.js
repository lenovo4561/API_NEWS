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

    console.log("\n=== Arts 分类下的三级分类（前30条）===\n");

    const [rows] = await conn.query(`
      SELECT 
        ct.id, 
        ct.third_category_key, 
        ct.name, 
        cs.name as sub_name 
      FROM category_third ct 
      JOIN category_sub cs ON ct.sub_category_id = cs.id 
      WHERE cs.main_category_id = 16 
      ORDER BY cs.name, ct.sort_order 
      LIMIT 30
    `);

    rows.forEach((r) => {
      console.log(`${r.sub_name} > ${r.name} (key: ${r.third_category_key})`);
    });

    console.log(`\n总计查询到 ${rows.length} 条记录\n`);

    await conn.end();
  } catch (error) {
    console.error("错误:", error);
    process.exit(1);
  }
})();
