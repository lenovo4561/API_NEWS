const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

// 读取分类 JSON 文件
const categoriesFile = path.join(
  __dirname,
  "src",
  "categories_1766374315708.json"
);
const categoriesData = JSON.parse(fs.readFileSync(categoriesFile, "utf8"));

// 递归获取所有三级分类的 URI（只获取没有子节点的叶子节点，即三级分类）
function getAllThirdLevelUris(node, uris = [], level = 0) {
  // 如果有子节点，继续递归
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      getAllThirdLevelUris(child, uris, level + 1);
    });
  } else {
    // 叶子节点（三级分类），并且不是根节点
    if (node.uri && node.uri !== "dmoz/Science") {
      // 检查URI是否有3个部分（dmoz/主分类/子分类/三级分类）
      const parts = node.uri.replace(/^dmoz\//i, "").split("/");
      if (parts.length === 3) {
        uris.push(node.uri);
      }
    }
  }

  return uris;
}

// 找到 Science 分类
const scienceCategory = categoriesData.results.find(
  (cat) => cat.uri === "dmoz/Science"
);

if (!scienceCategory) {
  console.error("❌ 未找到 Science 分类");
  process.exit(1);
}

// 获取所有 Science 三级分类的 URI
const allUris = getAllThirdLevelUris(scienceCategory);

console.log(`✓ 找到 ${allUris.length} 个 Science 三级分类的 URI`);
console.log("开始遍历请求...\n");

// 依次执行命令
let currentIndex = 0;
let successCount = 0;
let errorCount = 0;

function executeNext() {
  if (currentIndex >= allUris.length) {
    console.log("\n===========================================");
    console.log("✓ 所有请求已完成");
    console.log(
      `成功: ${successCount}, 失败: ${errorCount}, 总计: ${allUris.length}`
    );
    console.log("===========================================");
    return;
  }

  const uri = allUris[currentIndex];
  const command = `node src/services/fetchAndSaveNews.js --uri="${uri}" --stream=true --mins=43200`;

  console.log(`[${currentIndex + 1}/${allUris.length}] 正在处理: ${uri}`);
  console.log(`执行命令: ${command}`);

  const startTime = Date.now();

  exec(command, (error, stdout, stderr) => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (error) {
      console.error(`❌ 失败 (${duration}s): ${uri}`);
      console.error(`错误信息: ${error.message}`);
      errorCount++;
    } else {
      console.log(`✓ 成功 (${duration}s): ${uri}`);
      successCount++;
    }

    if (stdout) {
      console.log("输出:", stdout.substring(0, 200));
    }
    if (stderr) {
      console.error("错误:", stderr.substring(0, 200));
    }

    console.log("-------------------------------------------\n");

    // 继续下一个
    currentIndex++;
    executeNext();
  });
}

// 开始执行
executeNext();
