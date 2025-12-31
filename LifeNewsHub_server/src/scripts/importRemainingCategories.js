/**
 * 导入剩余分类数据到数据库
 * 根据 categories_1766374315708.json 将缺失的分类数据写入数据库
 * 确保数据唯一性和关联关系正确
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Information',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// 统计信息
const stats = {
  mainCategoriesChecked: 0,
  mainCategoriesInserted: 0,
  subCategoriesChecked: 0,
  subCategoriesInserted: 0,
  thirdCategoriesChecked: 0,
  thirdCategoriesInserted: 0,
  errors: []
};

/**
 * 从 URI 中提取分类名称
 */
function extractCategoryFromUri(uri, level) {
  const parts = uri.split('/');
  if (parts.length > level && parts[level]) {
    return parts[level];
  }
  return null;
}

/**
 * 检查并插入一级分类
 */
async function ensureMainCategory(connection, categoryKey, label) {
  stats.mainCategoriesChecked++;
  
  try {
    // 检查是否存在
    const [rows] = await connection.execute(
      'SELECT id FROM category_main WHERE category_key = ?',
      [categoryKey]
    );
    
    if (rows.length > 0) {
      return rows[0].id;
    }
    
    // 不存在则插入
    const [result] = await connection.execute(
      `INSERT INTO category_main (category_key, name, status, sort_order) 
       VALUES (?, ?, 1, ?)`,
      [categoryKey, label, stats.mainCategoriesChecked]
    );
    
    stats.mainCategoriesInserted++;
    console.log(`  ✓ 插入一级分类: ${categoryKey} (${label})`);
    return result.insertId;
  } catch (error) {
    stats.errors.push(`一级分类 ${categoryKey}: ${error.message}`);
    throw error;
  }
}

/**
 * 检查并插入二级分类
 */
async function ensureSubCategory(connection, mainCategoryId, subCategoryKey, label, sortOrder) {
  stats.subCategoriesChecked++;
  
  try {
    // 检查是否存在
    const [rows] = await connection.execute(
      'SELECT id FROM category_sub WHERE main_category_id = ? AND sub_category_key = ?',
      [mainCategoryId, subCategoryKey]
    );
    
    if (rows.length > 0) {
      return rows[0].id;
    }
    
    // 不存在则插入
    const [result] = await connection.execute(
      `INSERT INTO category_sub (main_category_id, sub_category_key, name, status, sort_order) 
       VALUES (?, ?, ?, 1, ?)`,
      [mainCategoryId, subCategoryKey, label, sortOrder]
    );
    
    stats.subCategoriesInserted++;
    console.log(`    ✓ 插入二级分类: ${subCategoryKey} (${label})`);
    return result.insertId;
  } catch (error) {
    stats.errors.push(`二级分类 ${subCategoryKey}: ${error.message}`);
    throw error;
  }
}

/**
 * 检查并插入三级分类
 */
async function ensureThirdCategory(connection, subCategoryId, thirdCategoryKey, label, sortOrder) {
  stats.thirdCategoriesChecked++;
  
  try {
    // 截断过长的key (最大50字符)
    const truncatedKey = thirdCategoryKey.length > 50 
      ? thirdCategoryKey.substring(0, 50) 
      : thirdCategoryKey;
    
    if (thirdCategoryKey.length > 50) {
      console.log(`      ⚠ 截断过长key: ${thirdCategoryKey} -> ${truncatedKey}`);
    }
    
    // 检查是否存在
    const [rows] = await connection.execute(
      'SELECT id FROM category_third WHERE sub_category_id = ? AND third_category_key = ?',
      [subCategoryId, truncatedKey]
    );
    
    if (rows.length > 0) {
      return rows[0].id;
    }
    
    // 不存在则插入
    const [result] = await connection.execute(
      `INSERT INTO category_third (sub_category_id, third_category_key, name, status, sort_order) 
       VALUES (?, ?, ?, 1, ?)`,
      [subCategoryId, truncatedKey, label, sortOrder]
    );
    
    stats.thirdCategoriesInserted++;
    if (stats.thirdCategoriesInserted % 100 === 0) {
      console.log(`      ✓ 已插入 ${stats.thirdCategoriesInserted} 个三级分类...`);
    }
    return result.insertId;
  } catch (error) {
    // 如果是唯一键冲突，可能是name重复但key不同，记录警告但继续
    if (error.code === 'ER_DUP_ENTRY') {
      console.log(`      ⚠ 三级分类已存在 (可能name重复): ${thirdCategoryKey} (${label})`);
      return null;
    }
    stats.errors.push(`三级分类 ${thirdCategoryKey}: ${error.message}`);
    throw error;
  }
}

/**
 * 主函数
 */
async function importCategories() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('开始导入分类数据...\n');
    
    // 读取 JSON 文件
    const jsonPath = path.join(__dirname, '../categories_1766374315708.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`从JSON文件读取到 ${jsonData.results.length} 个一级分类\n`);
    
    // 开始事务
    await connection.beginTransaction();
    
    try {
      // 遍历一级分类
      for (const mainCat of jsonData.results) {
        const mainUri = mainCat.uri; // "dmoz/Health"
        const mainKey = extractCategoryFromUri(mainUri, 1); // "Health"
        const mainLabel = mainCat.label.split('/').pop(); // 获取最后一部分作为label
        
        console.log(`处理一级分类: ${mainKey} (${mainLabel})`);
        
        // 确保一级分类存在
        const mainCategoryId = await ensureMainCategory(connection, mainKey, mainLabel);
        
        // 遍历二级分类
        if (mainCat.children && Array.isArray(mainCat.children)) {
          for (let subIdx = 0; subIdx < mainCat.children.length; subIdx++) {
            const subCat = mainCat.children[subIdx];
            const subUri = subCat.uri; // "dmoz/Health/Medicine"
            const subKey = extractCategoryFromUri(subUri, 2); // "Medicine"
            const subLabel = subCat.label.split('/').pop();
            
            // 确保二级分类存在
            const subCategoryId = await ensureSubCategory(
              connection, 
              mainCategoryId, 
              subKey, 
              subLabel, 
              subIdx + 1
            );
            
            // 遍历三级分类
            if (subCat.children && Array.isArray(subCat.children)) {
              for (let thirdIdx = 0; thirdIdx < subCat.children.length; thirdIdx++) {
                const thirdCat = subCat.children[thirdIdx];
                const thirdUri = thirdCat.uri; // "dmoz/Health/Medicine/Medical_Specialties"
                const thirdKey = extractCategoryFromUri(thirdUri, 3); // "Medical_Specialties"
                const thirdLabel = thirdCat.label.split('/').pop();
                
                // 确保三级分类存在
                await ensureThirdCategory(
                  connection, 
                  subCategoryId, 
                  thirdKey, 
                  thirdLabel, 
                  thirdIdx + 1
                );
              }
            }
          }
        }
      }
      
      // 提交事务
      await connection.commit();
      console.log('\n✓ 事务提交成功\n');
      
    } catch (error) {
      // 回滚事务
      await connection.rollback();
      console.error('\n✗ 发生错误，事务已回滚\n');
      throw error;
    }
    
    // 输出统计信息
    console.log('='.repeat(80));
    console.log('导入完成统计');
    console.log('='.repeat(80));
    console.log(`\n一级分类:`);
    console.log(`  检查: ${stats.mainCategoriesChecked} 个`);
    console.log(`  新插入: ${stats.mainCategoriesInserted} 个`);
    
    console.log(`\n二级分类:`);
    console.log(`  检查: ${stats.subCategoriesChecked} 个`);
    console.log(`  新插入: ${stats.subCategoriesInserted} 个`);
    
    console.log(`\n三级分类:`);
    console.log(`  检查: ${stats.thirdCategoriesChecked} 个`);
    console.log(`  新插入: ${stats.thirdCategoriesInserted} 个`);
    
    if (stats.errors.length > 0) {
      console.log(`\n错误数量: ${stats.errors.length}`);
      console.log('\n错误列表 (前10条):');
      stats.errors.slice(0, 10).forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err}`);
      });
    } else {
      console.log(`\n✓ 没有错误`);
    }
    
    console.log('\n' + '='.repeat(80));
    
    // 验证最终数据
    console.log('\n验证数据库数据...');
    const [mainCount] = await connection.execute('SELECT COUNT(*) as count FROM category_main');
    const [subCount] = await connection.execute('SELECT COUNT(*) as count FROM category_sub');
    const [thirdCount] = await connection.execute('SELECT COUNT(*) as count FROM category_third');
    
    console.log(`\n数据库当前统计:`);
    console.log(`  一级分类: ${mainCount[0].count} 个`);
    console.log(`  二级分类: ${subCount[0].count} 个`);
    console.log(`  三级分类: ${thirdCount[0].count} 个`);
    
  } catch (error) {
    console.error('导入过程出错:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// 运行导入
if (require.main === module) {
  importCategories()
    .then(() => {
      console.log('\n导入完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n导入失败:', error);
      process.exit(1);
    });
}

module.exports = { importCategories };
