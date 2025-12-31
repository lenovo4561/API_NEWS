const mysql = require("mysql2/promise");
const fs = require("fs").promises;
require("dotenv").config();

async function exportRemainingEnglish() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "Information",
  });

  console.log("查询剩余的纯英文记录...\n");

  const [allRows] = await conn.query("SELECT id, name FROM category_third");
  
  // 在JavaScript中过滤纯英文记录
  const englishRows = allRows.filter(row => !/[\u4e00-\u9fa5]/.test(row.name));
  
  console.log(`总记录: ${allRows.length}`);
  console.log(`剩余纯英文: ${englishRows.length}\n`);

  // 获取唯一的英文名称
  const uniqueNames = [...new Set(englishRows.map(r => r.name))].sort();
  
  console.log(`不同的英文名称: ${uniqueNames.length}\n`);

  // 保存到文件
  await fs.writeFile(
    "remaining_english_names.json",
    JSON.stringify(uniqueNames, null, 2),
    "utf8"
  );

  console.log("✓ 已导出到 remaining_english_names.json\n");
  
  // 显示前100个
  console.log("前100个待翻译名称:");
  uniqueNames.slice(0, 100).forEach((name, i) => {
    console.log(`${i + 1}. ${name}`);
  });

  await conn.end();
}

exportRemainingEnglish();
