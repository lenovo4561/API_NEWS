/**
 * 从 categories_1766374315708.json 导入所有三级分类到数据库
 *
 * 规则：
 * 1. 解析三层结构：category_main -> category_sub -> category_third
 * 2. third_category_key = URI 最后一部分（如 Medical_Specialties）
 * 3. name = label 最后一部分，下划线替换为空格（如 Medical Specialties -> 医疗专科）
 * 4. 需要根据层级建立正确的依赖关系
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "Information",
};

// 辅助函数：提取 URI 的最后一部分作为 key
function extractKey(uri) {
  const parts = uri.split("/");
  return parts[parts.length - 1];
}

// 辅助函数：提取 label 的最后一部分
function extractLabel(label) {
  const parts = label.split("/");
  const lastPart = parts[parts.length - 1];
  // 将下划线替换为空格
  return lastPart.replace(/_/g, " ");
}

// 辅助函数：简单的英译中（这里需要实际的翻译逻辑）
// 由于没有翻译API，这里先使用英文label，后续可以手动调整或集成翻译服务
function translateToChineseSimple(englishText) {
  // 这里可以集成翻译API，目前返回英文
  // 可以根据实际需求添加翻译逻辑
  return englishText;
}

async function importThirdCategories() {
  let connection;

  try {
    // 读取 JSON 文件
    const jsonPath = path.join(__dirname, "../categories_1766374315708.json");
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);

    console.log("开始导入三级分类数据...\n");

    // 统计信息
    let stats = {
      mainCategories: 0,
      subCategories: 0,
      thirdCategories: 0,
      mainInserted: 0,
      subInserted: 0,
      thirdInserted: 0,
      mainSkipped: 0,
      subSkipped: 0,
      thirdSkipped: 0,
    };

    // 遍历所有一级分类
    for (const mainCategory of jsonData.results) {
      stats.mainCategories++;

      const mainUri = mainCategory.uri;
      const mainCategoryKey = extractKey(mainUri);
      const mainCategoryName = extractLabel(mainCategory.label);

      console.log(`\n处理一级分类: ${mainCategoryKey} (${mainCategoryName})`);

      // 查找或创建主分类
      const [mainRows] = await connection.execute(
        "SELECT id FROM category_main WHERE category_key = ?",
        [mainCategoryKey]
      );

      let mainCategoryId;

      if (mainRows.length > 0) {
        mainCategoryId = mainRows[0].id;
        stats.mainSkipped++;
        console.log(`  ✓ 一级分类已存在 (ID: ${mainCategoryId})`);
      } else {
        const [insertResult] = await connection.execute(
          `INSERT INTO category_main (category_key, name, description, sort_order, status) 
           VALUES (?, ?, ?, ?, 1)`,
          [
            mainCategoryKey,
            translateToChineseSimple(mainCategoryName),
            `${mainCategoryName} 相关资讯`,
            stats.mainCategories,
          ]
        );
        mainCategoryId = insertResult.insertId;
        stats.mainInserted++;
        console.log(`  ✓ 创建一级分类 (ID: ${mainCategoryId})`);
      }

      // 处理二级分类
      if (!mainCategory.children || mainCategory.children.length === 0) {
        console.log(`  ⚠ 没有二级分类`);
        continue;
      }

      for (let i = 0; i < mainCategory.children.length; i++) {
        const subCategory = mainCategory.children[i];
        stats.subCategories++;

        const subUri = subCategory.uri;
        const subCategoryKey = extractKey(subUri);
        const subCategoryName = extractLabel(subCategory.label);

        console.log(`  处理二级分类: ${subCategoryKey} (${subCategoryName})`);

        // 查找或创建子分类
        const [subRows] = await connection.execute(
          "SELECT id FROM category_sub WHERE main_category_id = ? AND sub_category_key = ?",
          [mainCategoryId, subCategoryKey]
        );

        let subCategoryId;

        if (subRows.length > 0) {
          subCategoryId = subRows[0].id;
          stats.subSkipped++;
          console.log(`    ✓ 二级分类已存在 (ID: ${subCategoryId})`);
        } else {
          const [insertResult] = await connection.execute(
            `INSERT INTO category_sub (sub_category_key, main_category_id, name, description, sort_order, status) 
             VALUES (?, ?, ?, ?, ?, 1)`,
            [
              subCategoryKey,
              mainCategoryId,
              translateToChineseSimple(subCategoryName),
              `${subCategoryName} 相关内容`,
              i + 1,
            ]
          );
          subCategoryId = insertResult.insertId;
          stats.subInserted++;
          console.log(`    ✓ 创建二级分类 (ID: ${subCategoryId})`);
        }

        // 处理三级分类
        if (!subCategory.children || subCategory.children.length === 0) {
          console.log(`    ⚠ 没有三级分类`);
          continue;
        }

        for (let j = 0; j < subCategory.children.length; j++) {
          const thirdCategory = subCategory.children[j];
          stats.thirdCategories++;

          const thirdUri = thirdCategory.uri;
          const thirdCategoryKey = extractKey(thirdUri);
          const thirdCategoryName = extractLabel(thirdCategory.label);

          // 查找是否已存在
          const [thirdRows] = await connection.execute(
            "SELECT id FROM category_third WHERE sub_category_id = ? AND third_category_key = ?",
            [subCategoryId, thirdCategoryKey]
          );

          if (thirdRows.length > 0) {
            stats.thirdSkipped++;
            console.log(`      - 三级分类已存在: ${thirdCategoryKey}`);
          } else {
            await connection.execute(
              `INSERT INTO category_third (third_category_key, sub_category_id, name, description, sort_order, status) 
               VALUES (?, ?, ?, ?, ?, 1)`,
              [
                thirdCategoryKey,
                subCategoryId,
                translateToChineseSimple(thirdCategoryName),
                `${thirdCategoryName}`,
                j + 1,
              ]
            );
            stats.thirdInserted++;
            console.log(
              `      ✓ 创建三级分类: ${thirdCategoryKey} (${thirdCategoryName})`
            );
          }
        }
      }
    }

    // 输出统计信息
    console.log("\n========================================");
    console.log("导入完成！统计信息：");
    console.log("========================================");
    console.log(`一级分类：`);
    console.log(`  总计：${stats.mainCategories}`);
    console.log(`  新增：${stats.mainInserted}`);
    console.log(`  跳过：${stats.mainSkipped}`);
    console.log(`\n二级分类：`);
    console.log(`  总计：${stats.subCategories}`);
    console.log(`  新增：${stats.subInserted}`);
    console.log(`  跳过：${stats.subSkipped}`);
    console.log(`\n三级分类：`);
    console.log(`  总计：${stats.thirdCategories}`);
    console.log(`  新增：${stats.thirdInserted}`);
    console.log(`  跳过：${stats.thirdSkipped}`);
    console.log("========================================\n");

    // 验证导入结果
    console.log("验证导入结果...\n");

    const [mainCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM category_main"
    );
    console.log(`数据库中的一级分类总数：${mainCount[0].count}`);

    const [subCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM category_sub"
    );
    console.log(`数据库中的二级分类总数：${subCount[0].count}`);

    const [thirdCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM category_third"
    );
    console.log(`数据库中的三级分类总数：${thirdCount[0].count}\n`);

    // 显示层级关系示例
    console.log("层级关系示例（前5条）：\n");
    const [examples] = await connection.execute(`
      SELECT 
        cm.category_key as main_key,
        cm.name as main_name,
        cs.sub_category_key as sub_key,
        cs.name as sub_name,
        ct.third_category_key as third_key,
        ct.name as third_name
      FROM category_third ct
      JOIN category_sub cs ON ct.sub_category_id = cs.id
      JOIN category_main cm ON cs.main_category_id = cm.id
      ORDER BY cm.id, cs.id, ct.id
      LIMIT 5
    `);

    examples.forEach((row, index) => {
      console.log(
        `${index + 1}. ${row.main_key}/${row.sub_key}/${row.third_key}`
      );
      console.log(
        `   ${row.main_name} > ${row.sub_name} > ${row.third_name}\n`
      );
    });
  } catch (error) {
    console.error("导入失败：", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行导入
if (require.main === module) {
  importThirdCategories()
    .then(() => {
      console.log("脚本执行完成");
      process.exit(0);
    })
    .catch((error) => {
      console.error("脚本执行失败：", error);
      process.exit(1);
    });
}

module.exports = importThirdCategories;
