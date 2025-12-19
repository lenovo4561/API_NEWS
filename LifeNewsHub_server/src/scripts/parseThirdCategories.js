const fs = require("fs");
const path = require("path");

/**
 * 解析 data.js 中的 HTML 三级分类结构
 * 输出 JSON 格式的三级分类数据
 *
 * 结构层级：
 * Level 1 (Main): Arts
 * Level 2 (Sub): Animation, Architecture, etc.
 * Level 3 (Third): Anime, Artists (under Animation), Archives, Associations (under Architecture), etc.
 */

// 读取 data.js 文件
const dataPath = path.join(__dirname, "..", "..", "data.js");
const htmlContent = fs.readFileSync(dataPath, "utf-8");

// 简化的解析函数 - 只解析 Arts 下的结构
function parseThirdCategories(html) {
  const result = {
    name: "Arts",
    key: "Arts",
    subCategories: [],
  };

  // 找到 Arts 的内容区域
  const artsMatch = html.match(
    /<div[^>]*class="dropdown-submenu[^"]*"><a[^>]*>\s*Arts\s*<\/a><div[^>]*class="dropdown-menu[^"]*">([\s\S]*?)<\/div><!----><\/div><div[^>]*class="dropdown-submenu[^"]*"><a[^>]*>\s*Business\s*</
  );

  if (!artsMatch) {
    console.log("Could not find Arts section");
    return result;
  }

  const artsContent = artsMatch[1];

  // 解析二级分类 (有三级子类的)
  const subWithThirdRegex =
    /<div[^>]*class="dropdown-submenu[^"]*"><a[^>]*>\s*([^<]+?)\s*<\/a><div[^>]*class="dropdown-menu[^"]*">([\s\S]*?)<\/div><!----><\/div>/g;

  let subMatch;
  while ((subMatch = subWithThirdRegex.exec(artsContent)) !== null) {
    const subName = subMatch[1].trim();
    const thirdContent = subMatch[2];

    const thirdCategories = [];

    // 解析三级分类
    const thirdRegex =
      /<div[^>]*class="dropdown-item[^"]*"><a[^>]*>\s*([^<]+?)\s*<\/a><!----><\/div>/g;
    let thirdMatch;

    while ((thirdMatch = thirdRegex.exec(thirdContent)) !== null) {
      const thirdName = thirdMatch[1].trim();
      if (thirdName) {
        thirdCategories.push({
          name: thirdName,
          key: generateCategoryKey(thirdName),
        });
      }
    }

    result.subCategories.push({
      name: subName,
      key: generateCategoryKey(subName),
      thirdCategories: thirdCategories,
    });
  }

  // 解析直接的二级分类 (没有三级子类的)
  const directSubRegex =
    /<div[^>]*class="dropdown-item[^"]*"><a[^>]*>\s*([^<]+?)\s*<\/a><!----><\/div>/g;

  let directMatch;
  while ((directMatch = directSubRegex.exec(artsContent)) !== null) {
    const subName = directMatch[1].trim();
    if (subName) {
      result.subCategories.push({
        name: subName,
        key: generateCategoryKey(subName),
        thirdCategories: [],
      });
    }
  }

  return result;
}

// 生成 category_key
function generateCategoryKey(name) {
  return name
    .replace(/[^\w\s-]/g, "") // 移除特殊字符
    .replace(/\s+/g, "_") // 空格替换为下划线
    .replace(/-+/g, "_") // 连字符替换为下划线
    .replace(/_{2,}/g, "_") // 多个下划线合并为一个
    .replace(/^_+|_+$/g, ""); // 移除首尾下划线
}

// 执行解析
console.log("=== Parsing HTML for third-level categories ===\n");

const parsedData = parseThirdCategories(htmlContent);

// 统计信息
console.log("Statistics:");
console.log(`- Main category: ${parsedData.name}`);
console.log(`- Sub categories: ${parsedData.subCategories.length}`);

let totalThird = 0;
let subsWithThirds = 0;
parsedData.subCategories.forEach((sub) => {
  totalThird += sub.thirdCategories.length;
  if (sub.thirdCategories.length > 0) {
    subsWithThirds++;
  }
});

console.log(`- Sub categories with thirds: ${subsWithThirds}`);
console.log(`- Total third-level categories: ${totalThird}\n`);

// 显示摘要
console.log("Sub-categories summary:");
parsedData.subCategories.slice(0, 10).forEach((sub) => {
  const thirdCount = sub.thirdCategories.length;
  if (thirdCount > 0) {
    console.log(`  ${sub.name}: ${thirdCount} thirds`);
  } else {
    console.log(`  ${sub.name}: (no thirds)`);
  }
});
if (parsedData.subCategories.length > 10) {
  console.log(`  ... and ${parsedData.subCategories.length - 10} more`);
}

// 输出到文件
const outputPath = path.join(__dirname, "..", "..", "thirdCategories.json");
fs.writeFileSync(outputPath, JSON.stringify(parsedData, null, 2), "utf-8");

console.log(`\n✓ JSON file saved to: ${outputPath}`);

// 同时输出 JS 模块格式
const jsOutputPath = path.join(__dirname, "..", "..", "thirdCategories.js");
const jsContent = `/**
 * 三级分类数据 - Arts 分类下的所有二级和三级分类
 * 自动生成于 ${new Date().toISOString()}
 * 
 * 结构：
 * - Arts (主分类)
 *   - Animation (二级分类)
 *     - Anime, Artists, Awards, ... (三级分类)
 *   - Architecture (二级分类)
 *     - Archives, Associations, ... (三级分类)
 *   - Art History (二级分类，无三级)
 *   ...
 */

const thirdCategories = ${JSON.stringify(parsedData, null, 2)};

module.exports = thirdCategories;
`;

fs.writeFileSync(jsOutputPath, jsContent, "utf-8");
console.log(`✓ JS module saved to: ${jsOutputPath}\n`);

console.log("=== Parsing completed ===");
