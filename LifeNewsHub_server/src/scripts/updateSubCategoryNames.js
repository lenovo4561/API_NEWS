require("dotenv").config();
const mysql = require("mysql2/promise");

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "Information",
};

// 英文到中文的翻译映射
const translationMap = {
  // Arts 艺术类
  Bodyart: "人体彩绘",
  Digital: "数字艺术",
  Graphic_Design: "平面设计",
  Literature: "文学",
  Music: "音乐",
  Performing_Arts: "表演艺术",
  Photography: "摄影",
  Visual_Arts: "视觉艺术",

  // Health 健康类
  Medicine: "医学",
  Fitness: "健康",
  Mental_Health: "心理健康",
  Nutrition: "营养",
  Public_Health: "公共卫生",

  // Technology 技术类
  Software: "软件",
  Hardware: "硬件",
  Internet: "互联网",
  Electronics: "电子产品",

  // Business 商业类
  Finance: "金融",
  Marketing: "营销",
  Management: "管理",
  E_Commerce: "电子商务",

  // Sports 体育类
  Football: "足球",
  Basketball: "篮球",
  Tennis: "网球",
  Swimming: "游泳",

  // Education 教育类
  Higher_Education: "高等教育",
  K_12: "基础教育",
  Online_Learning: "在线学习",

  // Entertainment 娱乐类
  Movies: "电影",
  Television: "电视",
  Games: "游戏",
  Humor: "幽默",

  // Science 科学类
  Biology: "生物学",
  Chemistry: "化学",
  Physics: "物理学",
  Astronomy: "天文学",

  // Travel 旅游类
  Destinations: "目的地",
  Transportation: "交通",
  Lodging: "住宿",

  // Food 美食类
  Recipes: "食谱",
  Restaurants: "餐厅",
  Beverages: "饮料",
};

// 判断字符串是否包含中文
function containsChinese(str) {
  return /[\u4e00-\u9fa5]/.test(str);
}

// 将下划线格式转换为空格格式
function keyToName(key) {
  return key.replace(/_/g, " ");
}

async function updateSubCategoryNames() {
  let connection;

  try {
    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log("✓ 数据库连接成功");

    // 查询所有二级分类
    const [rows] = await connection.execute(
      "SELECT id, name, sub_category_key FROM category_sub ORDER BY id"
    );

    console.log(`\n找到 ${rows.length} 条二级分类记录\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;

    for (const row of rows) {
      const { id, name, sub_category_key } = row;

      // 如果已经是中文，跳过
      if (containsChinese(name)) {
        console.log(`✓ [跳过] ID: ${id}, Name: "${name}" (已是中文)`);
        skippedCount++;
        continue;
      }

      // 查找翻译
      let chineseName = null;

      // 1. 先用 sub_category_key 查找
      if (sub_category_key && translationMap[sub_category_key]) {
        chineseName = translationMap[sub_category_key];
      }
      // 2. 如果 key 不存在，尝试用 name 查找（去掉空格后）
      else if (translationMap[name.replace(/\s+/g, "_")]) {
        chineseName = translationMap[name.replace(/\s+/g, "_")];
      }
      // 3. 尝试直接用 name 查找
      else if (translationMap[name]) {
        chineseName = translationMap[name];
      }

      if (chineseName) {
        // 更新为中文名称
        await connection.execute(
          "UPDATE category_sub SET name = ? WHERE id = ?",
          [chineseName, id]
        );
        console.log(`✓ [更新] ID: ${id}, "${name}" → "${chineseName}"`);
        updatedCount++;
      } else {
        console.log(
          `⚠ [未找到翻译] ID: ${id}, Name: "${name}", Key: "${
            sub_category_key || "N/A"
          }"`
        );
        notFoundCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("更新统计:");
    console.log(`  已更新: ${updatedCount} 条`);
    console.log(`  已跳过 (已是中文): ${skippedCount} 条`);
    console.log(`  未找到翻译: ${notFoundCount} 条`);
    console.log(`  总计: ${rows.length} 条`);
    console.log("=".repeat(60));

    // 显示更新后的结果
    console.log("\n更新后的二级分类列表:");
    const [updatedRows] = await connection.execute(
      "SELECT id, name, sub_category_key FROM category_sub ORDER BY id"
    );
    console.table(updatedRows);
  } catch (error) {
    console.error("❌ 错误:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n✓ 数据库连接已关闭");
    }
  }
}

// 运行脚本
updateSubCategoryNames();
