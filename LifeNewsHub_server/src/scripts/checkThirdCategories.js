/**
 * 检查三级分类数据
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Information',
};

async function checkThirdCategories() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 查询总数
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM category_third'
    );
    console.log(`三级分类总数: ${countResult[0].total}\n`);
    
    // 查询前20条数据
    const [rows] = await connection.execute(
      `SELECT ct.id, ct.third_category_key, ct.name, 
              cs.name as sub_name, cm.name as main_name
       FROM category_third ct
       JOIN category_sub cs ON ct.sub_category_id = cs.id
       JOIN category_main cm ON cs.main_category_id = cm.id
       ORDER BY ct.id
       LIMIT 20`
    );
    
    console.log('前20条三级分类数据:');
    console.log('='.repeat(80));
    rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ID: ${row.id}`);
      console.log(`   ${row.main_name} > ${row.sub_name} > ${row.name}`);
      console.log(`   Key: ${row.third_category_key}`);
      console.log();
    });
    
    // 按一级分类统计
    const [stats] = await connection.execute(
      `SELECT cm.name as main_category, COUNT(ct.id) as count
       FROM category_main cm
       LEFT JOIN category_sub cs ON cm.id = cs.main_category_id
       LEFT JOIN category_third ct ON cs.id = ct.sub_category_id
       GROUP BY cm.id, cm.name
       ORDER BY count DESC`
    );
    
    console.log('='.repeat(80));
    console.log('各一级分类的三级分类数量:');
    console.log('='.repeat(80));
    stats.forEach(stat => {
      console.log(`${stat.main_category}: ${stat.count} 个`);
    });
    
  } finally {
    await connection.end();
  }
}

checkThirdCategories()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('错误:', err);
    process.exit(1);
  });
