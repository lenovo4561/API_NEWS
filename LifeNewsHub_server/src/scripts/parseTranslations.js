const fs = require("fs");
const path = require("path");

// 读取文件
const filePath = path.join(__dirname, "../../remaining_english_names.json");
const content = fs.readFileSync(filePath, "utf8");

// 分割成两个数组
const parts = content.split("]\n\n[");

// 手动解析英文数组
const englishLines = parts[0].split("\n").filter((line) => {
  line = line.trim();
  return line && !line.startsWith("[") && !line.startsWith("]");
});
const englishArray = englishLines.map((line) => {
  line = line.trim();
  // 移除开头的引号、结尾的引号和逗号
  if (line.startsWith('"')) line = line.substring(1);
  if (line.endsWith('",')) line = line.substring(0, line.length - 2);
  else if (line.endsWith('"')) line = line.substring(0, line.length - 1);
  return line;
});

// 手动解析中文数组
const chineseLines = parts[1].split("\n").filter((line) => {
  line = line.trim();
  return line && !line.startsWith("[") && !line.startsWith("]");
});
const chineseArray = chineseLines.map((line) => {
  line = line.trim();
  // 移除开头的引号、结尾的引号和逗号
  if (line.startsWith('"')) line = line.substring(1);
  if (line.endsWith('",')) line = line.substring(0, line.length - 2);
  else if (line.endsWith('"')) line = line.substring(0, line.length - 1);
  return line;
});

console.log(`英文数组长度: ${englishArray.length}`);
console.log(`中文数组长度: ${chineseArray.length}`);

// 创建一一对应的映射
const mapping = [];
const minLength = Math.min(englishArray.length, chineseArray.length);

for (let i = 0; i < minLength; i++) {
  mapping.push({
    english: englishArray[i],
    chinese: chineseArray[i],
  });
}

// 保存结果
const outputFile = path.join(__dirname, "../../translation_mapping.json");
fs.writeFileSync(outputFile, JSON.stringify(mapping, null, 2), "utf8");

console.log(`\n✅ 翻译映射已生成！`);
console.log(`总数量: ${mapping.length}`);
console.log(`文件路径: ${outputFile}`);

// 检查一些样本
console.log(`\n样本数据:`);
for (let i = 0; i < Math.min(10, mapping.length); i++) {
  console.log(`${i + 1}. ${mapping[i].english} → ${mapping[i].chinese}`);
}
