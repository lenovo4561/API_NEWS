/**
 * 验证分类表关联关系
 * 根据 categories_1766374315708.json 验证三张表的关联关系是否正确
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

async function validateCategoryRelations() {
  console.log('开始验证分类表关联关系...\n');
  
  // 读取 JSON 文件
  const jsonPath = path.join(__dirname, '../categories_1766374315708.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  // 统计信息
  const stats = {
    jsonMainCount: 0,
    jsonSubCount: 0,
    jsonThirdCount: 0,
    dbMainCount: 0,
    dbSubCount: 0,
    dbThirdCount: 0,
    errors: [],
    warnings: []
  };

  // 从 JSON 中提取分类结构
  const jsonCategories = new Map(); // key: main_category_key, value: { subs: Map }
  
  for (const mainCat of jsonData.results) {
    const mainUri = mainCat.uri; // 如 "dmoz/Health"
    const mainKey = mainUri.split('/')[1]; // 提取 "Health"
    
    stats.jsonMainCount++;
    
    const subsMap = new Map(); // key: sub_category_key, value: { thirds: Set }
    
    if (mainCat.children && Array.isArray(mainCat.children)) {
      for (const subCat of mainCat.children) {
        const subUri = subCat.uri; // 如 "dmoz/Health/Medicine"
        const subKey = subUri.split('/')[2]; // 提取 "Medicine"
        
        stats.jsonSubCount++;
        
        const thirdsSet = new Set();
        
        if (subCat.children && Array.isArray(subCat.children)) {
          for (const thirdCat of subCat.children) {
            const thirdUri = thirdCat.uri; // 如 "dmoz/Health/Medicine/Medical_Specialties"
            const thirdKey = thirdUri.split('/')[3]; // 提取 "Medical_Specialties"
            
            stats.jsonThirdCount++;
            thirdsSet.add(thirdKey);
          }
        }
        
        subsMap.set(subKey, { thirds: thirdsSet });
      }
    }
    
    jsonCategories.set(mainKey, { subs: subsMap });
  }

  console.log('JSON文件统计:');
  console.log(`  一级分类数量: ${stats.jsonMainCount}`);
  console.log(`  二级分类数量: ${stats.jsonSubCount}`);
  console.log(`  三级分类数量: ${stats.jsonThirdCount}\n`);

  // 从数据库查询所有分类及其关联关系
  const dbQuery = `
    SELECT 
      cm.id as main_id,
      cm.category_key as main_key,
      cm.name as main_name,
      cs.id as sub_id,
      cs.sub_category_key as sub_key,
      cs.name as sub_name,
      ct.id as third_id,
      ct.third_category_key as third_key,
      ct.name as third_name
    FROM category_main cm
    LEFT JOIN category_sub cs ON cm.id = cs.main_category_id
    LEFT JOIN category_third ct ON cs.id = ct.sub_category_id
    ORDER BY cm.id, cs.id, ct.id
  `;

  const dbRows = await query(dbQuery);
  
  // 组织数据库数据
  const dbCategories = new Map(); // 与 jsonCategories 结构相同
  const dbMainIds = new Set();
  const dbSubIds = new Set();
  const dbThirdIds = new Set();
  
  for (const row of dbRows) {
    if (row.main_key) {
      dbMainIds.add(row.main_id);
      
      if (!dbCategories.has(row.main_key)) {
        dbCategories.set(row.main_key, { subs: new Map() });
      }
      
      if (row.sub_key) {
        dbSubIds.add(row.sub_id);
        
        const mainCat = dbCategories.get(row.main_key);
        if (!mainCat.subs.has(row.sub_key)) {
          mainCat.subs.set(row.sub_key, { thirds: new Set() });
        }
        
        if (row.third_key) {
          dbThirdIds.add(row.third_id);
          mainCat.subs.get(row.sub_key).thirds.add(row.third_key);
        }
      }
    }
  }

  stats.dbMainCount = dbMainIds.size;
  stats.dbSubCount = dbSubIds.size;
  stats.dbThirdCount = dbThirdIds.size;

  console.log('数据库统计:');
  console.log(`  一级分类数量: ${stats.dbMainCount}`);
  console.log(`  二级分类数量: ${stats.dbSubCount}`);
  console.log(`  三级分类数量: ${stats.dbThirdCount}\n`);

  // 验证一级分类
  console.log('验证一级分类...');
  for (const [mainKey, mainData] of jsonCategories) {
    if (!dbCategories.has(mainKey)) {
      stats.errors.push(`一级分类 "${mainKey}" 在JSON中存在但数据库中不存在`);
    }
  }
  
  for (const [mainKey] of dbCategories) {
    if (!jsonCategories.has(mainKey)) {
      stats.warnings.push(`一级分类 "${mainKey}" 在数据库中存在但JSON中不存在`);
    }
  }

  // 验证二级分类及其与一级分类的关联
  console.log('验证二级分类关联关系...');
  for (const [mainKey, mainData] of jsonCategories) {
    if (!dbCategories.has(mainKey)) continue;
    
    const dbMainData = dbCategories.get(mainKey);
    
    for (const [subKey, subData] of mainData.subs) {
      if (!dbMainData.subs.has(subKey)) {
        stats.errors.push(
          `二级分类 "${mainKey}/${subKey}" 在JSON中存在但数据库中不存在或关联错误`
        );
      }
    }
  }
  
  for (const [mainKey, mainData] of dbCategories) {
    if (!jsonCategories.has(mainKey)) continue;
    
    const jsonMainData = jsonCategories.get(mainKey);
    
    for (const [subKey] of mainData.subs) {
      if (!jsonMainData.subs.has(subKey)) {
        stats.warnings.push(
          `二级分类 "${mainKey}/${subKey}" 在数据库中存在但JSON中不存在`
        );
      }
    }
  }

  // 验证三级分类及其与二级分类的关联
  console.log('验证三级分类关联关系...');
  for (const [mainKey, mainData] of jsonCategories) {
    if (!dbCategories.has(mainKey)) continue;
    
    const dbMainData = dbCategories.get(mainKey);
    
    for (const [subKey, subData] of mainData.subs) {
      if (!dbMainData.subs.has(subKey)) continue;
      
      const dbSubData = dbMainData.subs.get(subKey);
      
      for (const thirdKey of subData.thirds) {
        if (!dbSubData.thirds.has(thirdKey)) {
          stats.errors.push(
            `三级分类 "${mainKey}/${subKey}/${thirdKey}" 在JSON中存在但数据库中不存在或关联错误`
          );
        }
      }
    }
  }
  
  for (const [mainKey, mainData] of dbCategories) {
    if (!jsonCategories.has(mainKey)) continue;
    
    const jsonMainData = jsonCategories.get(mainKey);
    
    for (const [subKey, subData] of mainData.subs) {
      if (!jsonMainData.subs.has(subKey)) continue;
      
      const jsonSubData = jsonMainData.subs.get(subKey);
      
      for (const thirdKey of subData.thirds) {
        if (!jsonSubData.thirds.has(thirdKey)) {
          stats.warnings.push(
            `三级分类 "${mainKey}/${subKey}/${thirdKey}" 在数据库中存在但JSON中不存在`
          );
        }
      }
    }
  }

  // 输出结果
  console.log('\n' + '='.repeat(80));
  console.log('验证结果汇总');
  console.log('='.repeat(80));
  
  console.log(`\n错误数量: ${stats.errors.length}`);
  if (stats.errors.length > 0) {
    console.log('\n错误列表:');
    stats.errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err}`);
    });
  }
  
  console.log(`\n警告数量: ${stats.warnings.length}`);
  if (stats.warnings.length > 0) {
    console.log('\n警告列表 (前20条):');
    stats.warnings.slice(0, 20).forEach((warn, idx) => {
      console.log(`  ${idx + 1}. ${warn}`);
    });
    if (stats.warnings.length > 20) {
      console.log(`  ... 还有 ${stats.warnings.length - 20} 条警告`);
    }
  }

  // 验证外键约束
  console.log('\n' + '='.repeat(80));
  console.log('验证外键约束完整性');
  console.log('='.repeat(80));
  
  // 检查 category_sub 中是否有无效的 main_category_id
  const invalidSubQuery = `
    SELECT cs.id, cs.name, cs.main_category_id
    FROM category_sub cs
    LEFT JOIN category_main cm ON cs.main_category_id = cm.id
    WHERE cm.id IS NULL
  `;
  const invalidSubs = await query(invalidSubQuery);
  
  console.log(`\n二级分类中无效的一级分类引用: ${invalidSubs.length}条`);
  if (invalidSubs.length > 0) {
    invalidSubs.forEach(row => {
      console.log(`  - ID: ${row.id}, 名称: ${row.name}, 引用的main_category_id: ${row.main_category_id} (不存在)`);
    });
  }

  // 检查 category_third 中是否有无效的 sub_category_id
  const invalidThirdQuery = `
    SELECT ct.id, ct.name, ct.sub_category_id
    FROM category_third ct
    LEFT JOIN category_sub cs ON ct.sub_category_id = cs.id
    WHERE cs.id IS NULL
  `;
  const invalidThirds = await query(invalidThirdQuery);
  
  console.log(`\n三级分类中无效的二级分类引用: ${invalidThirds.length}条`);
  if (invalidThirds.length > 0) {
    invalidThirds.forEach(row => {
      console.log(`  - ID: ${row.id}, 名称: ${row.name}, 引用的sub_category_id: ${row.sub_category_id} (不存在)`);
    });
  }

  console.log('\n' + '='.repeat(80));
  
  if (stats.errors.length === 0 && invalidSubs.length === 0 && invalidThirds.length === 0) {
    console.log('✓ 所有分类关联关系验证通过!');
  } else {
    console.log('✗ 发现关联关系错误，请检查上述问题');
  }
  
  console.log('='.repeat(80) + '\n');
  
  return {
    success: stats.errors.length === 0 && invalidSubs.length === 0 && invalidThirds.length === 0,
    stats,
    invalidSubs,
    invalidThirds
  };
}

// 运行验证
if (require.main === module) {
  validateCategoryRelations()
    .then(() => {
      console.log('验证完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('验证过程出错:', error);
      process.exit(1);
    });
}

module.exports = { validateCategoryRelations };
