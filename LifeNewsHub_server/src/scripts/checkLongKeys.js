/**
 * 检查 JSON 中超长的 key
 */

const fs = require('fs');
const path = require('path');

function extractCategoryFromUri(uri, level) {
  const parts = uri.split('/');
  if (parts.length > level && parts[level]) {
    return parts[level];
  }
  return null;
}

const jsonPath = path.join(__dirname, '../categories_1766374315708.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const longKeys = [];

for (const mainCat of jsonData.results) {
  const mainKey = extractCategoryFromUri(mainCat.uri, 1);
  
  if (mainKey && mainKey.length > 50) {
    longKeys.push({ level: 'main', key: mainKey, length: mainKey.length });
  }
  
  if (mainCat.children && Array.isArray(mainCat.children)) {
    for (const subCat of mainCat.children) {
      const subKey = extractCategoryFromUri(subCat.uri, 2);
      
      if (subKey && subKey.length > 50) {
        longKeys.push({ level: 'sub', key: subKey, length: subKey.length });
      }
      
      if (subCat.children && Array.isArray(subCat.children)) {
        for (const thirdCat of subCat.children) {
          const thirdKey = extractCategoryFromUri(thirdCat.uri, 3);
          
          if (thirdKey && thirdKey.length > 50) {
            longKeys.push({ 
              level: 'third', 
              key: thirdKey, 
              length: thirdKey.length,
              uri: thirdCat.uri
            });
          }
        }
      }
    }
  }
}

console.log(`找到 ${longKeys.length} 个超过50字符的key:\n`);
longKeys.sort((a, b) => b.length - a.length);
longKeys.forEach((item, idx) => {
  console.log(`${idx + 1}. [${item.level}] ${item.key}`);
  console.log(`   长度: ${item.length}`);
  if (item.uri) {
    console.log(`   URI: ${item.uri}`);
  }
  console.log();
});
