const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "..", "..", ".env"),
});

/**
 * 从 data.js 文件导入所有二级分类到 category_sub 表
 */

// 大分类中文名称到 category_key 的映射
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

// 解析 data.js 文件
function parseDataFile() {
  const dataFilePath = path.join(__dirname, "..", "..", "data.js");
  const content = fs.readFileSync(dataFilePath, "utf8");

  const categories = {};
  const lines = content.split("\n");

  let currentCategory = null;
  let currentEnglishNames = [];
  let currentChineseNames = [];
  let inEnglishBlock = false;
  let inChineseBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 检测分类标题行
    if (
      line.includes("二级分类:") ||
      line.match(/^(商业|计算机|游戏|健康|家|娱乐|科学|购物|社会|运动的)\s*-/)
    ) {
      const match = line.match(
        /(商业|计算机|游戏|健康|家|娱乐|科学|购物|社会|运动的)/
      );
      if (match) {
        if (currentCategory && currentEnglishNames.length > 0) {
          categories[currentCategory] = {
            english: currentEnglishNames,
            chinese: currentChineseNames,
          };
        }
        currentCategory = match[1];
        currentEnglishNames = [];
        currentChineseNames = [];
        inEnglishBlock = false;
        inChineseBlock = false;
      }
    }

    // 检测代码块开始
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

    // 收集英文名称
    if (
      inEnglishBlock &&
      line &&
      !line.startsWith("`") &&
      !line.includes("二级分类")
    ) {
      currentEnglishNames.push(line);
    }

    // 收集中文名称
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
    categories[currentCategory] = {
      english: currentEnglishNames,
      chinese: currentChineseNames,
    };
  }

  return categories;
}

// 生成 sub_category_key
function generateSubCategoryKey(englishName) {
  // 移除特殊字符，将空格和其他分隔符替换为下划线
  return englishName
    .replace(/[^\w\s-]/g, "") // 移除特殊字符
    .replace(/\s+/g, "_") // 空格替换为下划线
    .replace(/-+/g, "_") // 连字符替换为下划线
    .replace(/_{2,}/g, "_") // 多个下划线合并为一个
    .replace(/^_|_$/g, ""); // 移除首尾下划线
}

async function importSubCategories() {
  let connection;

  try {
    console.log("=== Starting Import Process ===\n");

    // 解析数据文件
    console.log("1. Parsing data.js file...");
    const categoriesData = parseDataFile();
    console.log(
      `✓ Found ${Object.keys(categoriesData).length} main categories\n`
    );

    // 连接到数据库
    console.log("2. Connecting to MySQL server...");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "Information",
    });
    console.log("✓ Connected to MySQL server\n");

    // 使用数据库
    await connection.query(`USE ${process.env.DB_NAME || "Information"}`);

    // 获取所有大分类
    console.log("3. Fetching main categories from database...");
    const [mainCategories] = await connection.query(
      "SELECT id, category_key, name FROM category_main WHERE status = 1"
    );
    console.log(
      `✓ Found ${mainCategories.length} main categories in database\n`
    );

    // 创建 category_key 到 ID 的映射
    const mainCategoryIdMap = {};
    mainCategories.forEach((cat) => {
      mainCategoryIdMap[cat.category_key] = cat.id;
    });

    // 插入子分类
    console.log("4. Inserting sub-categories...\n");
    let totalInserted = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const [chineseName, data] of Object.entries(categoriesData)) {
      const categoryKey = MAIN_CATEGORY_MAP[chineseName];
      const mainCategoryId = mainCategoryIdMap[categoryKey];

      if (!mainCategoryId) {
        console.log(
          `⚠ Warning: Main category "${chineseName}" (${categoryKey}) not found in database`
        );
        continue;
      }

      console.log(`\n--- Processing: ${chineseName} (${categoryKey}) ---`);
      console.log(`Main Category ID: ${mainCategoryId}`);
      console.log(`Sub-categories count: ${data.english.length}`);

      for (let i = 0; i < data.english.length; i++) {
        // 清理英文名和中文名中的特殊字符（`, ]; 等）
        const englishName = data.english[i].trim().replace(/[`,;\[\]]+$/g, "");
        const chineseSubName = (data.chinese[i] || englishName)
          .trim()
          .replace(/[`,;\[\]]+$/g, "");
        const subCategoryKey = generateSubCategoryKey(englishName);
        const sortOrder = i + 1;

        try {
          // 检查是否已存在
          const [existing] = await connection.query(
            "SELECT id FROM category_sub WHERE main_category_id = ? AND sub_category_key = ?",
            [mainCategoryId, subCategoryKey]
          );

          if (existing.length > 0) {
            console.log(
              `  ⊘ Skipped: ${englishName} (${subCategoryKey}) - already exists`
            );
            totalSkipped++;
            continue;
          }

          // 插入子分类
          const insertSQL = `
            INSERT INTO category_sub 
            (main_category_id, sub_category_key, name, description, sort_order, status)
            VALUES (?, ?, ?, ?, ?, 1)
          `;
          await connection.query(insertSQL, [
            mainCategoryId,
            subCategoryKey,
            chineseSubName,
            `${chineseSubName} (${englishName})`,
            sortOrder,
          ]);

          console.log(`  ✓ Inserted: ${chineseSubName} (${subCategoryKey})`);
          totalInserted++;
        } catch (error) {
          console.error(`  ✗ Error inserting ${englishName}: ${error.message}`);
          totalErrors++;
        }
      }
    }

    // 显示统计信息
    console.log("\n\n=== Import Summary ===");
    console.log(`Total inserted: ${totalInserted}`);
    console.log(`Total skipped: ${totalSkipped}`);
    console.log(`Total errors: ${totalErrors}`);

    // 显示每个大分类的子分类数量
    console.log("\n=== Sub-categories count by main category ===");
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

    console.log("\n✓ Import completed successfully!");
  } catch (error) {
    console.error("\n✗ Error during import:", error.message);
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
  importSubCategories().then(() => {
    console.log("\n=== Import script completed ===");
    process.exit(0);
  });
}

module.exports = { importSubCategories };
