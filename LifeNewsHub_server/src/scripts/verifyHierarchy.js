require("dotenv").config();
const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: "utf8mb4",
};

async function verifyHierarchy() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log("数据层级关系示例（前20条）:\n");

    const [rows] = await connection.execute(`
      SELECT cm.name as main_cat, cs.name as sub_cat, ct.name as third_cat, ct.third_category_key
      FROM category_third ct
      JOIN category_sub cs ON ct.sub_category_id = cs.id
      JOIN category_main cm ON cs.main_category_id = cm.id
      ORDER BY cm.id, cs.id, ct.id
      LIMIT 20
    `);

    rows.forEach((r, idx) => {
      console.log(`${idx + 1}. ${r.main_cat} > ${r.sub_cat} > ${r.third_cat}`);
      console.log(`   Key: ${r.third_category_key}\n`);
    });

    // 统计每个一级分类下的三级分类数量
    console.log("\n各一级分类下的三级分类统计:\n");
    const [stats] = await connection.execute(`
      SELECT cm.name, COUNT(ct.id) as count
      FROM category_main cm
      LEFT JOIN category_sub cs ON cm.id = cs.main_category_id
      LEFT JOIN category_third ct ON cs.id = ct.sub_category_id
      GROUP BY cm.id, cm.name
      ORDER BY count DESC
    `);

    stats.forEach((s, idx) => {
      console.log(`${idx + 1}. ${s.name}: ${s.count} 个三级分类`);
    });
  } catch (error) {
    console.error("错误:", error);
  } finally {
    await connection.end();
  }
}

verifyHierarchy();
