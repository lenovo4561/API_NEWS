/**
 * 验证 category_third 表中的 name 字段是否是 third_category_key 的正确中文翻译
 * 
 * 检查项目：
 * 1. 从 third_category_key 转换为英文短语（下划线转空格）
 * 2. 检查 name 是否是该英文短语的正确中文翻译
 * 3. 发现不匹配的记录
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'information',
};

// 加载翻译映射
let translationMap = {};
const mappingFile = path.join(__dirname, '../../translation_mapping.json');
if (fs.existsSync(mappingFile)) {
  const mappingData = JSON.parse(fs.readFileSync(mappingFile, 'utf-8'));
  mappingData.forEach(item => {
    if (item.english && item.chinese) {
      // 去掉中文首尾的引号
      const chinese = item.chinese.replace(/^"(.*)",$/, '$1');
      translationMap[item.english.toLowerCase()] = chinese;
    }
  });
  console.log(`✓ 已加载 ${Object.keys(translationMap).length} 条翻译映射\n`);
}

// 将 third_category_key 转换为英文短语
function keyToEnglish(key) {
  if (!key) return '';
  // 将下划线替换为空格
  return key.replace(/_/g, ' ');
}

// 根据英文短语获取预期的中文翻译
function getExpectedChinese(englishPhrase) {
  if (!englishPhrase) return null;
  
  // 查找翻译映射
  const translation = translationMap[englishPhrase.toLowerCase()];
  if (translation) {
    return translation;
  }
  
  return null; // 没有找到翻译
}

// 检查中文名称是否包含中文字符
function hasChinese(str) {
  return /[\u4e00-\u9fa5]/.test(str);
}

async function verifyTranslations() {
  let connection;
  
  try {
    console.log('========================================');
    console.log('验证三级分类翻译对应关系');
    console.log('========================================\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 获取所有三级分类记录
    const [records] = await connection.execute(`
      SELECT 
        ct.id,
        ct.third_category_key,
        ct.name,
        cs.name as sub_name,
        cm.name as main_name
      FROM category_third ct
      LEFT JOIN category_sub cs ON ct.sub_category_id = cs.id
      LEFT JOIN category_main cm ON cs.main_category_id = cm.id
      WHERE ct.status = 1
      ORDER BY cm.name, cs.name, ct.name
    `);
    
    console.log(`总计 ${records.length} 条三级分类记录\n`);
    
    const issues = {
      noKey: [],           // 没有 key 的记录
      noChinese: [],       // name 不是中文的记录
      noTranslation: [],   // 找不到翻译映射的记录
      mismatch: [],        // 翻译不匹配的记录
      correct: []          // 翻译正确的记录
    };
    
    for (const record of records) {
      const { id, third_category_key, name, sub_name, main_name } = record;
      
      // 1. 检查是否有 key
      if (!third_category_key || third_category_key.trim() === '') {
        issues.noKey.push({
          id,
          name,
          path: `${main_name} > ${sub_name} > ${name}`
        });
        continue;
      }
      
      // 2. 检查 name 是否包含中文
      if (!hasChinese(name)) {
        issues.noChinese.push({
          id,
          third_category_key,
          name,
          path: `${main_name} > ${sub_name} > ${name}`
        });
        continue;
      }
      
      // 3. 获取英文短语和预期的中文翻译
      const englishPhrase = keyToEnglish(third_category_key);
      const expectedChinese = getExpectedChinese(englishPhrase);
      
      // 4. 检查是否找到了翻译
      if (!expectedChinese) {
        issues.noTranslation.push({
          id,
          third_category_key,
          englishPhrase,
          actualName: name,
          path: `${main_name} > ${sub_name}`
        });
        continue;
      }
      
      // 5. 检查翻译是否匹配
      if (name !== expectedChinese) {
        issues.mismatch.push({
          id,
          third_category_key,
          englishPhrase,
          expectedChinese,
          actualName: name,
          path: `${main_name} > ${sub_name}`
        });
      } else {
        issues.correct.push({
          id,
          third_category_key,
          name
        });
      }
    }
    
    // 输出统计结果
    console.log('========================================');
    console.log('验证结果统计');
    console.log('========================================\n');
    
    console.log(`✓ 翻译正确的记录: ${issues.correct.length} 条`);
    console.log(`✗ 缺少 key 的记录: ${issues.noKey.length} 条`);
    console.log(`✗ name 不是中文的记录: ${issues.noChinese.length} 条`);
    console.log(`? 找不到翻译映射的记录: ${issues.noTranslation.length} 条`);
    console.log(`✗ 翻译不匹配的记录: ${issues.mismatch.length} 条\n`);
    
    // 详细输出问题记录
    if (issues.noKey.length > 0) {
      console.log('========================================');
      console.log(`缺少 third_category_key 的记录 (${issues.noKey.length} 条)`);
      console.log('========================================\n');
      issues.noKey.slice(0, 10).forEach(item => {
        console.log(`ID: ${item.id}`);
        console.log(`路径: ${item.path}`);
        console.log('---');
      });
      if (issues.noKey.length > 10) {
        console.log(`... 还有 ${issues.noKey.length - 10} 条记录\n`);
      }
    }
    
    if (issues.noChinese.length > 0) {
      console.log('========================================');
      console.log(`name 字段不是中文的记录 (${issues.noChinese.length} 条)`);
      console.log('========================================\n');
      issues.noChinese.slice(0, 20).forEach(item => {
        console.log(`ID: ${item.id}`);
        console.log(`Key: ${item.third_category_key}`);
        console.log(`Name: ${item.name}`);
        console.log(`路径: ${item.path}`);
        console.log('---');
      });
      if (issues.noChinese.length > 20) {
        console.log(`... 还有 ${issues.noChinese.length - 20} 条记录\n`);
      }
    }
    
    if (issues.noTranslation.length > 0) {
      console.log('========================================');
      console.log(`找不到翻译映射的记录 (${issues.noTranslation.length} 条)`);
      console.log('========================================\n');
      issues.noTranslation.slice(0, 20).forEach(item => {
        console.log(`ID: ${item.id}`);
        console.log(`Key: ${item.third_category_key}`);
        console.log(`英文短语: ${item.englishPhrase}`);
        console.log(`实际 Name: ${item.actualName}`);
        console.log(`路径: ${item.path}`);
        console.log('---');
      });
      if (issues.noTranslation.length > 20) {
        console.log(`... 还有 ${issues.noTranslation.length - 20} 条记录\n`);
      }
    }
    
    if (issues.mismatch.length > 0) {
      console.log('========================================');
      console.log(`翻译不匹配的记录 (${issues.mismatch.length} 条)`);
      console.log('========================================\n');
      issues.mismatch.slice(0, 30).forEach(item => {
        console.log(`ID: ${item.id}`);
        console.log(`Key: ${item.third_category_key}`);
        console.log(`英文短语: ${item.englishPhrase}`);
        console.log(`预期中文: ${item.expectedChinese}`);
        console.log(`实际 Name: ${item.actualName}`);
        console.log(`路径: ${item.path}`);
        console.log('---');
      });
      if (issues.mismatch.length > 30) {
        console.log(`... 还有 ${issues.mismatch.length - 30} 条记录\n`);
      }
    }
    
    // 保存详细报告到文件
    const reportPath = path.join(__dirname, '../../third_category_translation_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2), 'utf-8');
    console.log(`\n✓ 详细报告已保存到: ${reportPath}\n`);
    
    // 输出总结
    console.log('========================================');
    console.log('验证总结');
    console.log('========================================\n');
    
    const totalIssues = issues.noKey.length + issues.noChinese.length + 
                       issues.noTranslation.length + issues.mismatch.length;
    const accuracy = ((issues.correct.length / records.length) * 100).toFixed(2);
    
    console.log(`总记录数: ${records.length}`);
    console.log(`正确记录数: ${issues.correct.length}`);
    console.log(`问题记录数: ${totalIssues}`);
    console.log(`准确率: ${accuracy}%\n`);
    
    if (totalIssues === 0) {
      console.log('✓ 所有记录的翻译都是正确的！\n');
    } else {
      console.log('✗ 发现翻译问题，请查看上面的详细信息。\n');
    }
    
  } catch (error) {
    console.error('验证过程中发生错误:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 运行验证
verifyTranslations();
