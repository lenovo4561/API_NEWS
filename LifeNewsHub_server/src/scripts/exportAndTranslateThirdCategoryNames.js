const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

/**
 * 导出并翻译 category_third 表中的 name 字段
 * 1. 导出所有 name 值到文件
 * 2. 识别非中文的值
 * 3. 将非中文值转换为英文
 * 4. 更新回数据库
 */

// 检查是否包含中文字符
function containsChinese(text) {
  return /[\u4e00-\u9fa5]/.test(text);
}

// 将非中文的值转换为标准英文
function convertToEnglish(text) {
  if (!text) return text;
  
  // 如果已经是标准英文格式（字母、数字、空格、常见标点），保持不变
  if (/^[a-zA-Z0-9\s\-&'/().,]+$/.test(text) && !/Ã/.test(text)) {
    return text;
  }
  
  // 对于包含特殊字符的，尝试清理
  let result = text;
  
  // 处理常见的编码错误
  result = result
    .replace(/Ã©/g, 'e')  // é 的错误编码
    .replace(/é/g, 'e')   // 直接替换 é
    .replace(/à/g, 'a')
    .replace(/è/g, 'e')
    .replace(/ù/g, 'u')
    .replace(/ñ/g, 'n');
  
  // 替换下划线为空格
  result = result.replace(/_/g, ' ');
  
  // 移除其他非ASCII字符
  result = result.replace(/[^\x20-\x7E]/g, '');
  
  result = result.trim();
  
  return result || text;
}

async function exportAndTranslate() {
  let connection;
  const exportFile = path.join(__dirname, '../../category_third_names_export.json');
  const reportFile = path.join(__dirname, '../../category_third_names_report.txt');

  try {
    // 连接数据库
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "Information",
    });

    console.log("✓ 数据库连接成功");

    // 第一步：导出所有 name 字段
    console.log("\n========================================");
    console.log("步骤 1: 导出 category_third 表中的 name 字段");
    console.log("========================================");

    const [rows] = await connection.query(
      "SELECT id, name, third_category_key FROM category_third ORDER BY id"
    );

    console.log(`✓ 共导出 ${rows.length} 条记录`);

    // 第二步：分析数据
    console.log("\n========================================");
    console.log("步骤 2: 分析数据");
    console.log("========================================");

    const dataAnalysis = {
      total: rows.length,
      chinese: 0,
      nonChinese: 0,
      empty: 0,
      records: [],
      nonChineseRecords: []
    };

    rows.forEach(row => {
      const record = {
        id: row.id,
        originalName: row.name,
        third_category_key: row.third_category_key,
        hasChinese: containsChinese(row.name),
        englishName: null,
        needsUpdate: false
      };

      if (!row.name || row.name.trim() === '') {
        dataAnalysis.empty++;
      } else if (containsChinese(row.name)) {
        dataAnalysis.chinese++;
      } else {
        dataAnalysis.nonChinese++;
        record.englishName = convertToEnglish(row.name);
        record.needsUpdate = record.englishName !== record.originalName;
        dataAnalysis.nonChineseRecords.push(record);
      }

      dataAnalysis.records.push(record);
    });

    console.log(`总记录数: ${dataAnalysis.total}`);
    console.log(`包含中文: ${dataAnalysis.chinese}`);
    console.log(`非中文: ${dataAnalysis.nonChinese}`);
    console.log(`空值: ${dataAnalysis.empty}`);

    // 保存导出文件
    await fs.writeFile(
      exportFile,
      JSON.stringify(dataAnalysis, null, 2),
      'utf8'
    );
    console.log(`\n✓ 数据已导出到: ${exportFile}`);

    // 第三步：生成报告
    console.log("\n========================================");
    console.log("步骤 3: 生成转换报告");
    console.log("========================================");

    let report = "Category Third Names 转换报告\n";
    report += "=".repeat(80) + "\n\n";
    report += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
    report += `统计信息:\n`;
    report += `-`.repeat(80) + "\n";
    report += `总记录数: ${dataAnalysis.total}\n`;
    report += `包含中文: ${dataAnalysis.chinese}\n`;
    report += `非中文记录: ${dataAnalysis.nonChinese}\n`;
    report += `空值: ${dataAnalysis.empty}\n`;
    report += `需要更新: ${dataAnalysis.nonChineseRecords.filter(r => r.needsUpdate).length}\n\n`;

    if (dataAnalysis.nonChineseRecords.length > 0) {
      report += `非中文记录详情 (共 ${dataAnalysis.nonChineseRecords.length} 条):\n`;
      report += "=".repeat(80) + "\n\n";

      dataAnalysis.nonChineseRecords.forEach((record, index) => {
        report += `${index + 1}. ID: ${record.id}\n`;
        report += `   Key: ${record.third_category_key || 'N/A'}\n`;
        report += `   原值: ${record.originalName}\n`;
        report += `   英文: ${record.englishName}\n`;
        report += `   需更新: ${record.needsUpdate ? '是' : '否'}\n`;
        report += `-`.repeat(80) + "\n";
      });
    }

    await fs.writeFile(reportFile, report, 'utf8');
    console.log(`✓ 报告已生成: ${reportFile}`);

    // 第四步：询问是否更新数据库
    console.log("\n========================================");
    console.log("步骤 4: 更新数据库");
    console.log("========================================");

    const needsUpdateRecords = dataAnalysis.nonChineseRecords.filter(r => r.needsUpdate);
    
    if (needsUpdateRecords.length === 0) {
      console.log("✓ 所有非中文记录已经是标准英文格式，无需更新");
      return;
    }

    console.log(`\n发现 ${needsUpdateRecords.length} 条记录需要更新为英文格式`);
    console.log("\n示例:");
    needsUpdateRecords.slice(0, 5).forEach(record => {
      console.log(`  ID ${record.id}: "${record.originalName}" → "${record.englishName}"`);
    });

    // 询问用户确认
    console.log("\n是否执行更新? (请在下面的提示中手动确认)");
    console.log("建议先检查导出文件和报告，确认无误后再执行更新");
    
    // 如果有命令行参数 --execute，则自动执行
    const shouldExecute = process.argv.includes('--execute');
    
    if (!shouldExecute) {
      console.log("\n✓ 导出和分析完成！");
      console.log("\n下一步:");
      console.log("1. 检查导出文件: category_third_names_export.json");
      console.log("2. 查看报告: category_third_names_report.txt");
      console.log("3. 如确认无误，使用以下命令执行更新:");
      console.log("   node src/scripts/exportAndTranslateThirdCategoryNames.js --execute");
      return;
    }

    // 执行更新
    console.log("\n开始更新数据库...");
    let updateCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    for (const record of needsUpdateRecords) {
      try {
        // 先检查更新后的值是否会与现有记录冲突
        const [existing] = await connection.execute(
          "SELECT id FROM category_third WHERE sub_category_id = (SELECT sub_category_id FROM category_third WHERE id = ?) AND name = ? AND id != ?",
          [record.id, record.englishName, record.id]
        );
        
        if (existing.length > 0) {
          console.log(`  ⚠ 跳过 ID ${record.id}: 更新后的值"${record.englishName}"已存在，删除重复记录`);
          // 删除重复的记录
          await connection.execute("DELETE FROM category_third WHERE id = ?", [record.id]);
          skipCount++;
          continue;
        }
        
        await connection.execute(
          "UPDATE category_third SET name = ? WHERE id = ?",
          [record.englishName, record.id]
        );
        updateCount++;
        
        if (updateCount % 50 === 0) {
          console.log(`  已更新 ${updateCount}/${needsUpdateRecords.length} 条记录...`);
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
    console.log(`跳过(重复): ${skipCount} 条`);
    console.log(`失败: ${errorCount} 条`);

    // 验证更新结果
    console.log("\n验证更新结果...");
    const [chineseCount] = await connection.query(
      "SELECT COUNT(*) as count FROM category_third WHERE name REGEXP '[\u4e00-\u9fa5]'"
    );
    const [totalCount] = await connection.query(
      "SELECT COUNT(*) as count FROM category_third"
    );
    console.log(`当前总记录数: ${totalCount[0].count}`);
    console.log(`包含中文的记录: ${chineseCount[0].count}`);
    console.log(`非中文记录: ${totalCount[0].count - chineseCount[0].count}`);

  } catch (error) {
    console.error("\n❌ 错误:", error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n✓ 数据库连接已关闭");
    }
  }
}

// 运行脚本
console.log("Category Third Names 导出和翻译工具");
console.log("=".repeat(80));
exportAndTranslate().catch(error => {
  console.error("脚本执行失败:", error);
  process.exit(1);
});
