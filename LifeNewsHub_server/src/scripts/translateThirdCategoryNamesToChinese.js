const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

/**
 * 将 category_third 表中所有非中文的 name 字段翻译成中文
 * 1. 导出所有非中文的 name 值
 * 2. 使用翻译映射将英文翻译成中文
 * 3. 更新回数据库
 */

// 检查是否包含中文字符
function containsChinese(text) {
  return /[\u4e00-\u9fa5]/.test(text);
}

// 从 importAllThirdCategoriesWithTranslation.js 加载翻译映射
async function loadTranslationMap() {
  try {
    const scriptPath = path.join(__dirname, "importAllThirdCategoriesWithTranslation.js");
    const scriptContent = await fs.readFile(scriptPath, "utf8");
    
    // 提取 translationMap 对象
    const mapStart = scriptContent.indexOf("const translationMap = {");
    const mapEnd = scriptContent.indexOf("};", mapStart) + 2;
    
    if (mapStart === -1 || mapEnd === -1) {
      console.error("无法找到 translationMap");
      return {};
    }
    
    const mapCode = scriptContent.substring(mapStart, mapEnd);
    
    // 使用 eval 来解析（在实际生产环境应该用更安全的方法）
    const translationMap = {};
    eval(mapCode.replace("const translationMap = ", "Object.assign(translationMap, "));
    
    return translationMap;
  } catch (error) {
    console.error("加载翻译映射失败:", error.message);
    return {};
  }
}

// 加载完整翻译映射文件中的额外翻译
async function loadAdditionalTranslations() {
  try {
    const filePath = path.join(__dirname, "完整翻译映射.txt");
    const content = await fs.readFile(filePath, "utf8");
    
    const additionalMap = {};
    const lines = content.split("\n");
    
    for (const line of lines) {
      // 匹配格式: 'English': '中文',
      const match = line.match(/'([^']+)':\s*'([^']+)'/);
      if (match) {
        additionalMap[match[1]] = match[2];
      }
    }
    
    return additionalMap;
  } catch (error) {
    console.log("注意: 未找到完整翻译映射文件，仅使用主映射");
    return {};
  }
}

// 翻译英文到中文
function translateToChinese(text, translationMap) {
  if (!text || containsChinese(text)) {
    return null; // 已经是中文或空值
  }
  
  // 直接匹配
  if (translationMap[text]) {
    return translationMap[text];
  }
  
  // 尝试去除多余空格后匹配
  const normalized = text.trim().replace(/\s+/g, " ");
  if (translationMap[normalized]) {
    return translationMap[normalized];
  }
  
  // 尝试首字母大写匹配
  const titleCase = text
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  if (translationMap[titleCase]) {
    return translationMap[titleCase];
  }
  
  // 返回 null 表示未找到翻译
  return null;
}

async function translateAllNames() {
  let connection;
  const reportFile = path.join(__dirname, "../../translate_report.txt");
  const untranslatedFile = path.join(__dirname, "../../untranslated_names.json");

  try {
    // 连接数据库
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "Information",
    });

    console.log("✓ 数据库连接成功");

    // 加载翻译映射
    console.log("\n加载翻译映射...");
    const mainMap = await loadTranslationMap();
    const additionalMap = await loadAdditionalTranslations();
    const translationMap = { ...mainMap, ...additionalMap };
    
    console.log(`✓ 主翻译映射: ${Object.keys(mainMap).length} 条`);
    console.log(`✓ 额外翻译映射: ${Object.keys(additionalMap).length} 条`);
    console.log(`✓ 总翻译映射: ${Object.keys(translationMap).length} 条`);

    // 查询所有记录
    console.log("\n========================================");
    console.log("步骤 1: 查询所有 category_third 记录");
    console.log("========================================");

    const [rows] = await connection.query(
      "SELECT id, name, third_category_key FROM category_third ORDER BY id"
    );

    console.log(`✓ 共查询到 ${rows.length} 条记录`);

    // 分析和准备翻译
    console.log("\n========================================");
    console.log("步骤 2: 分析和翻译");
    console.log("========================================");

    const stats = {
      total: rows.length,
      alreadyChinese: 0,
      foundTranslation: 0,
      notFoundTranslation: 0,
      toUpdate: []
    };

    const untranslatedNames = new Set();

    for (const row of rows) {
      if (containsChinese(row.name)) {
        stats.alreadyChinese++;
        continue;
      }

      const chineseName = translateToChinese(row.name, translationMap);
      
      if (chineseName) {
        stats.foundTranslation++;
        stats.toUpdate.push({
          id: row.id,
          originalName: row.name,
          chineseName: chineseName,
          key: row.third_category_key
        });
      } else {
        stats.notFoundTranslation++;
        untranslatedNames.add(row.name);
      }
    }

    console.log(`总记录数: ${stats.total}`);
    console.log(`已是中文: ${stats.alreadyChinese}`);
    console.log(`找到翻译: ${stats.foundTranslation}`);
    console.log(`未找到翻译: ${stats.notFoundTranslation}`);

    // 保存未翻译的名称
    if (untranslatedNames.size > 0) {
      await fs.writeFile(
        untranslatedFile,
        JSON.stringify(Array.from(untranslatedNames).sort(), null, 2),
        "utf8"
      );
      console.log(`\n✓ 未翻译的名称已保存到: ${untranslatedFile}`);
    }

    // 生成报告
    console.log("\n========================================");
    console.log("步骤 3: 生成报告");
    console.log("========================================");

    let report = "Category Third Names 中文翻译报告\n";
    report += "=".repeat(80) + "\n\n";
    report += `生成时间: ${new Date().toLocaleString("zh-CN")}\n\n`;
    report += `统计信息:\n`;
    report += `-`.repeat(80) + "\n";
    report += `总记录数: ${stats.total}\n`;
    report += `已是中文: ${stats.alreadyChinese}\n`;
    report += `找到翻译: ${stats.foundTranslation}\n`;
    report += `未找到翻译: ${stats.notFoundTranslation}\n\n`;

    if (stats.toUpdate.length > 0) {
      report += `将要更新的记录 (共 ${stats.toUpdate.length} 条):\n`;
      report += "=".repeat(80) + "\n\n";

      stats.toUpdate.forEach((record, index) => {
        report += `${index + 1}. ID: ${record.id}\n`;
        report += `   Key: ${record.key || "N/A"}\n`;
        report += `   英文: ${record.originalName}\n`;
        report += `   中文: ${record.chineseName}\n`;
        report += `-`.repeat(80) + "\n";
      });
    }

    if (untranslatedNames.size > 0) {
      report += `\n未找到翻译的名称 (共 ${untranslatedNames.size} 条):\n`;
      report += "=".repeat(80) + "\n";
      Array.from(untranslatedNames)
        .sort()
        .forEach((name, index) => {
          report += `${index + 1}. ${name}\n`;
        });
    }

    await fs.writeFile(reportFile, report, "utf8");
    console.log(`✓ 报告已生成: ${reportFile}`);

    // 询问是否更新
    if (stats.toUpdate.length === 0) {
      console.log("\n✓ 没有需要翻译的记录");
      return;
    }

    console.log("\n========================================");
    console.log("步骤 4: 更新数据库");
    console.log("========================================");

    console.log(`\n发现 ${stats.toUpdate.length} 条记录可以翻译成中文`);
    console.log("\n示例:");
    stats.toUpdate.slice(0, 5).forEach((record) => {
      console.log(`  ID ${record.id}: "${record.originalName}" → "${record.chineseName}"`);
    });

    // 检查是否有 --execute 参数
    const shouldExecute = process.argv.includes("--execute");

    if (!shouldExecute) {
      console.log("\n✓ 分析完成！");
      console.log("\n下一步:");
      console.log("1. 检查报告: translate_report.txt");
      if (untranslatedNames.size > 0) {
        console.log("2. 查看未翻译的名称: untranslated_names.json");
      }
      console.log(`${untranslatedNames.size > 0 ? "3" : "2"}. 如确认无误，使用以下命令执行更新:`);
      console.log("   node src/scripts/translateThirdCategoryNamesToChinese.js --execute");
      return;
    }

    // 执行更新
    console.log("\n开始更新数据库...");
    let updateCount = 0;
    let errorCount = 0;

    for (const record of stats.toUpdate) {
      try {
        await connection.execute(
          "UPDATE category_third SET name = ? WHERE id = ?",
          [record.chineseName, record.id]
        );
        updateCount++;

        if (updateCount % 100 === 0) {
          console.log(`  已更新 ${updateCount}/${stats.toUpdate.length} 条记录...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`  ✗ 更新 ID ${record.id} 失败:`, error.message);
      }
    }

    console.log("\n========================================");
    console.log("更新完成!");
    console.log("========================================");
    console.log(`成功更新: ${updateCount} 条`);
    console.log(`失败: ${errorCount} 条`);

    // 验证更新结果
    console.log("\n验证更新结果...");
    const [chineseCount] = await connection.query(
      "SELECT COUNT(*) as count FROM category_third WHERE name REGEXP '[\\u4e00-\\u9fa5]'"
    );
    const [totalCount] = await connection.query(
      "SELECT COUNT(*) as count FROM category_third"
    );
    const [nonChineseCount] = await connection.query(
      "SELECT COUNT(*) as count FROM category_third WHERE name NOT REGEXP '[\\u4e00-\\u9fa5]'"
    );
    
    console.log(`当前总记录数: ${totalCount[0].count}`);
    console.log(`包含中文的记录: ${chineseCount[0].count}`);
    console.log(`非中文记录: ${nonChineseCount[0].count}`);

  } catch (error) {
    console.error("\n❌ 错误:", error.message);
    console.error(error.stack);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n✓ 数据库连接已关闭");
    }
  }
}

// 运行脚本
console.log("Category Third Names 中文翻译工具");
console.log("=".repeat(80));
translateAllNames().catch((error) => {
  console.error("脚本执行失败:", error);
  process.exit(1);
});
