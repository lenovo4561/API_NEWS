const mysql = require("mysql2/promise");
require("dotenv").config({
  path: require("path").join(__dirname, "..", "..", ".env"),
});

/**
 * 检查 category_sub 表中 sub_category_key 和 name 不匹配的记录
 */

async function checkSubCategoryMismatch() {
  let connection;

  try {
    console.log("=== Checking category_sub table ===\n");

    // 连接到数据库
    console.log("Connecting to MySQL server...");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "Information",
    });
    console.log("✓ Connected to MySQL server\n");

    // 查询所有子分类
    console.log("Fetching all sub-categories...");
    const [subCategories] = await connection.query(`
      SELECT 
        cs.id,
        cs.sub_category_key,
        cs.name as chinese_name,
        cm.category_key as main_category_key,
        cm.name as main_category_name
      FROM category_sub cs
      JOIN category_main cm ON cs.main_category_id = cm.id
      ORDER BY cm.category_key, cs.id
    `);
    console.log(`✓ Found ${subCategories.length} sub-categories\n`);

    // 从 data.js 解析出正确的映射关系
    const fs = require("fs");
    const path = require("path");
    const dataFilePath = path.join(__dirname, "..", "..", "data.js");
    const content = fs.readFileSync(dataFilePath, "utf8");

    // 创建英文名到中文名的映射
    const correctMapping = {};
    const lines = content.split("\n");
    let currentCategory = null;
    let currentEnglishNames = [];
    let currentChineseNames = [];
    let inEnglishBlock = false;
    let inChineseBlock = false;

    const MAIN_CATEGORY_MAP = {
      商业: "Business",
      计算机: "Computers",
      游戏: "Games",
      健康: "Health",
      家: "Home",
      娱乐: "Recreation",
      科学: "Science",
      购物: "Shopping",
      社会: "Society",
      运动的: "Sports",
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (
        line.includes("二级分类:") ||
        line.match(/^(商业|计算机|游戏|健康|家|娱乐|科学|购物|社会|运动的)\s*-/)
      ) {
        const match = line.match(
          /(商业|计算机|游戏|健康|家|娱乐|科学|购物|社会|运动的)/
        );
        if (match) {
          if (currentCategory && currentEnglishNames.length > 0) {
            const mainKey = MAIN_CATEGORY_MAP[currentCategory];
            if (!correctMapping[mainKey]) {
              correctMapping[mainKey] = {};
            }
            for (let j = 0; j < currentEnglishNames.length; j++) {
              const engName = currentEnglishNames[j];
              const chiName = currentChineseNames[j] || engName;
              const key = engName
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "_")
                .replace(/-+/g, "_")
                .replace(/_{2,}/g, "_")
                .replace(/^_|_$/g, "");
              correctMapping[mainKey][key] = chiName;
            }
          }
          currentCategory = match[1];
          currentEnglishNames = [];
          currentChineseNames = [];
          inEnglishBlock = false;
          inChineseBlock = false;
        }
      }

      if (line.startsWith("`")) {
        if (!inEnglishBlock && !inChineseBlock) {
          inEnglishBlock = true;
          continue;
        } else if (inEnglishBlock) {
          inEnglishBlock = false;
          inChineseBlock = true;
          continue;
        } else if (inChineseBlock) {
          inChineseBlock = false;
          continue;
        }
      }

      if (
        inEnglishBlock &&
        line &&
        !line.startsWith("`") &&
        !line.includes("二级分类")
      ) {
        currentEnglishNames.push(line);
      }

      if (
        inChineseBlock &&
        line &&
        !line.startsWith("`") &&
        !line.includes("二级分类")
      ) {
        currentChineseNames.push(line);
      }
    }

    // 处理最后一个分类
    if (currentCategory && currentEnglishNames.length > 0) {
      const mainKey = MAIN_CATEGORY_MAP[currentCategory];
      if (!correctMapping[mainKey]) {
        correctMapping[mainKey] = {};
      }
      for (let j = 0; j < currentEnglishNames.length; j++) {
        const engName = currentEnglishNames[j];
        const chiName = currentChineseNames[j] || engName;
        const key = engName
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "_")
          .replace(/-+/g, "_")
          .replace(/_{2,}/g, "_")
          .replace(/^_|_$/g, "");
        correctMapping[mainKey][key] = chiName;
      }
    }

    // 检查不匹配的记录
    console.log("=== Checking for mismatches ===\n");
    const mismatches = [];

    for (const record of subCategories) {
      const mainKey = record.main_category_key;
      const subKey = record.sub_category_key;
      const currentName = record.chinese_name;

      if (correctMapping[mainKey] && correctMapping[mainKey][subKey]) {
        const correctName = correctMapping[mainKey][subKey];
        if (currentName !== correctName) {
          mismatches.push({
            id: record.id,
            main_category: mainKey,
            sub_category_key: subKey,
            current_name: currentName,
            correct_name: correctName,
          });
        }
      }
    }

    if (mismatches.length === 0) {
      console.log("✓ No mismatches found! All records are correct.\n");
    } else {
      console.log(`✗ Found ${mismatches.length} mismatches:\n`);
      console.table(mismatches);

      // 询问是否修复
      console.log("\n=== Fixing mismatches ===\n");
      for (const mismatch of mismatches) {
        const updateSQL = `
          UPDATE category_sub
          SET name = ?
          WHERE id = ?
        `;
        await connection.query(updateSQL, [mismatch.correct_name, mismatch.id]);
        console.log(
          `✓ Fixed ID ${mismatch.id}: "${mismatch.current_name}" -> "${mismatch.correct_name}"`
        );
      }
      console.log(`\n✓ Fixed ${mismatches.length} records`);
    }

    // 显示更新后的统计
    console.log("\n=== Final Statistics ===");
    const [stats] = await connection.query(`
      SELECT 
        cm.category_key,
        cm.name as main_category,
        COUNT(cs.id) as sub_count
      FROM category_main cm
      LEFT JOIN category_sub cs ON cm.id = cs.main_category_id
      GROUP BY cm.id, cm.category_key, cm.name
      ORDER BY cm.category_key
    `);
    console.table(stats);

    console.log("\n✓ Check completed successfully!");
  } catch (error) {
    console.error("\n✗ Error during check:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n✓ Database connection closed");
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  checkSubCategoryMismatch().then(() => {
    console.log("\n=== Check script completed ===");
    process.exit(0);
  });
}

module.exports = { checkSubCategoryMismatch };
