const mysql = require("mysql2/promise");
const fs = require("fs").promises;
require("dotenv").config();

async function exportNonChineseNames() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "Information",
  });

  console.log("导出数据库中的所有非中文记录...\n");

  const [rows] = await conn.query(`
    SELECT id, name, third_category_key
    FROM category_third 
    WHERE name NOT REGEXP '[\u4e00-\u9fa5]'
    ORDER BY name
  `);

  console.log(`共 ${rows.length} 条非中文记录\n`);

  // 导出到文件
  await fs.writeFile(
    "actual_non_chinese_names.json",
    JSON.stringify(rows, null, 2),
    "utf8"
  );

  console.log("✓ 已导出到 actual_non_chinese_names.json\n");

  // 统计不同的名称
  const uniqueNames = [...new Set(rows.map(r => r.name))];
  console.log(`不同的名称数量: ${uniqueNames.length}\n`);

  // 显示前50个
  console.log("前50个非中文名称:");
  uniqueNames.slice(0, 50).forEach((name, i) => {
    console.log(`${i + 1}. ${name}`);
  });

  await conn.end();
}

exportNonChineseNames();
