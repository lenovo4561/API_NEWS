/**
 * 导出新导入的三级分类数据为CSV文件
 * 用于在谷歌表格中翻译
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Information',
};

/**
 * 转义CSV字段
 */
function escapeCsvField(field) {
  if (field === null || field === undefined) {
    return '';
  }
  const str = String(field);
  // 如果包含逗号、引号或换行符，需要用双引号包围，并将内部的双引号转义
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function exportThirdCategoriesToCsv() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('开始导出新导入的三级分类数据...\n');
    
    // 查询新导入的三级分类（ID >= 148）
    const [rows] = await connection.execute(
      `SELECT 
        ct.id,
        ct.third_category_key,
        ct.sub_category_id,
        ct.name
       FROM category_third ct
       WHERE ct.id >= 148
       ORDER BY ct.id`
    );
    
    console.log(`查询到 ${rows.length} 条新导入的三级分类数据\n`);
    
    // 创建CSV内容
    const headers = [
      'id',
      'third_category_key',
      'sub_category_id',
      'name'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    rows.forEach(row => {
      const csvRow = [
        row.id,
        escapeCsvField(row.third_category_key),
        row.sub_category_id,
        escapeCsvField(row.name)
      ];
      csvContent += csvRow.join(',') + '\n';
    });
    
    // 保存CSV文件
    const outputPath = path.join(__dirname, '../../third_categories_to_translate.csv');
    fs.writeFileSync(outputPath, csvContent, 'utf8');
    
    console.log(`✓ CSV文件已生成: ${outputPath}`);
    console.log(`\n文件包含以下列:`);
    console.log('  - id: 三级分类ID（用于更新数据库）');
    console.log('  - third_category_key: 三级分类英文key');
    console.log('  - sub_category_id: 所属二级分类ID');
    console.log('  - name: 三级分类名称（待翻译成中文）');
    
    console.log(`\n总计: ${rows.length} 个三级分类待翻译`);
    
  } finally {
    await connection.end();
  }
}

exportThirdCategoriesToCsv()
  .then(() => {
    console.log('\n导出完成！');
    process.exit(0);
  })
  .catch(err => {
    console.error('导出失败:', err);
    process.exit(1);
  });
