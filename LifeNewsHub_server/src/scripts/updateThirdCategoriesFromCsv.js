const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

require("dotenv").config({
  path: require("path").join(__dirname, "..", "..", ".env"),
});

/**
 * 从翻译好的 CSV 文件更新 category_third 表的 name 字段
 */

// 简单的 CSV 解析函数
function parseCSV(content) {
  const lines = content.split("\n").filter((line) => line.trim());
  const headers = lines[0].split(",").map((h) => h.trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || "";
    });
    records.push(record);
  }

  return records;
}

async function updateThirdCategoriesFromCsv() {
  let connection;

  try {
    // 读取 CSV 文件
    const csvFilePath = path.join(
      __dirname,
      "..",
      "无标题电子表格 - third_categories_to_translate.csv"
    );

    console.log("=== 读取 CSV 文件 ===");
    console.log(`文件路径: ${csvFilePath}`);

    if (!fs.existsSync(csvFilePath)) {
      console.error("✗ CSV 文件不存在！");
      console.error(`请确认文件路径: ${csvFilePath}`);
      return;
    }

    const fileContent = fs.readFileSync(csvFilePath, "utf-8");

    // 解析 CSV
    const records = parseCSV(fileContent);

    console.log(`✓ 成功读取 ${records.length} 条记录\n`);

    // 连接数据库
    console.log("=== 连接到 MySQL 服务器 ===");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "Information",
    });
    console.log("✓ 数据库连接成功\n");

    // 统计
    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    console.log("=== 开始更新 category_third 表 ===\n");

    for (const record of records) {
      const id = parseInt(record.id);
      const chineseName = record.chinese_name || record["chinese_name"];

      if (!id || !chineseName) {
        console.log(`⊘ 跳过记录 ID ${record.id}: 缺少必要字段`);
        skipCount++;
        continue;
      }

      try {
        // 先查询当前记录
        const [existing] = await connection.query(
          "SELECT id, name FROM category_third WHERE id = ?",
          [id]
        );

        if (existing.length === 0) {
          console.log(`⊘ 跳过 ID ${id}: 记录不存在`);
          skipCount++;
          continue;
        }

        const oldName = existing[0].name;

        // 如果已经是中文，跳过
        if (oldName === chineseName) {
          skipCount++;
          continue;
        }

        // 更新 name 字段为中文
        await connection.query(
          "UPDATE category_third SET name = ? WHERE id = ?",
          [chineseName, id]
        );

        console.log(`✓ ID ${id}: "${oldName}" → "${chineseName}"`);
        successCount++;
      } catch (error) {
        console.error(`✗ 更新失败 ID ${id}:`, error.message);
        failCount++;
      }
    }

    // 显示统计信息
    console.log("\n=== 更新统计 ===");
    console.log(`成功更新: ${successCount} 条`);
    console.log(`跳过记录: ${skipCount} 条`);
    console.log(`更新失败: ${failCount} 条`);
    console.log(`总计处理: ${records.length} 条`);

    // 验证结果
    console.log("\n=== 验证更新结果 ===");
    const [result] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN name REGEXP '[\\u4e00-\\u9fa5]' THEN 1 ELSE 0 END) as chinese_count
      FROM category_third
      WHERE id >= 4509
    `);

    console.log(`数据库中记录总数: ${result[0].total}`);
    console.log(`包含中文的记录: ${result[0].chinese_count}`);

    console.log("\n✓ 更新完成！");
  } catch (error) {
    console.error("✗ 发生错误:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n✓ 数据库连接已关闭");
    }
  }
}

// 执行更新
if (require.main === module) {
  updateThirdCategoriesFromCsv()
    .then(() => {
      console.log("\n脚本执行完成");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n脚本执行失败:", error);
      process.exit(1);
    });
}

module.exports = { updateThirdCategoriesFromCsv };
