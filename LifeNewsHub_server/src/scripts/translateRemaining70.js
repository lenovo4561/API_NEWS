const mysql = require("mysql2/promise");
require("dotenv").config();

// 剩余70个名称的翻译映射
const remainingTranslations = {
  // 单字母和数字保持原样
  1: "1",
  2: "2",
  3: "3",
  "3D": "3D",
  6: "6",
  8: "8",
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  R: "R",
  Z: "Z",

  // 品牌名保持原样
  Amstrad: "Amstrad",
  Atari: "Atari",
  Commodore: "Commodore",
  DataCAD: "DataCAD",

  // 缩写和专业术语
  DIY: "DIY",
  DJs: "DJ",
  DSL: "DSL",
  DVD: "DVD",
  "Auto CAD": "AutoCAD",

  // 需要翻译的名称
  Eyewear: "眼镜",
  Fantasy: "奇幻",
  Fuzzy: "模糊",
  Golf: "高尔夫",
  Gymkhana: "马术障碍赛",
  Gyms: "健身房",
  Hypnotherapy: "催眠治疗",
  Hypnotism: "催眠术",
  Isotopes: "同位素",
  Jumps: "跳跃",
  "Kung Fu": "功夫",
  "Lindenmayer Systems": "林登迈尔系统",
  Luggage: "行李",
  "Luggage and Bags": "行李箱包",
  Lunchboxes: "午餐盒",
  Lyrics: "歌词",
  Metaprogramming: "元编程",
  Musicology: "音乐学",
  "Nutrition and Metabolism Disorders": "营养代谢障碍",
  "Nutritional and Metabolic Disorders": "营养代谢疾病",
  Outplacement: "再就业服务",
  Outsourcing: "外包",
  "Ozone Therapy": "臭氧疗法",
  "Philosophy of Mind": "心灵哲学",
  "Polymer Clay": "软陶",
  "Purity Tests": "纯度测试",
  Puzzle: "谜题",
  Quinto: "五人游戏",
  Quotations: "名言",
  Sweeteners: "甜味剂",
  Trivia: "冷知识",
  "Tug-of-War": "拔河",
  "Urban Primitive": "都市原始",
  Used: "二手",
  "Venture Capital": "风险投资",
  "Violence and Abuse": "暴力虐待",
  Visual: "视觉",
  Vocal: "声乐",
  "Voice Portals": "语音门户",
  "Voluntary Simplicity": "自愿简朴",
  Wheelchair: "轮椅",
  "World Literature": "世界文学",
  Yahtzee: "快艇骰子",
  Yoga: "瑜伽",
  "Young Writers": "青年作家",
  Youth: "青年",
  "Youth and Recreation": "青少年娱乐",
  "Zone Empire": "区域帝国",
  Zoroastrianism: "琐罗亚斯德教",
};

async function translateRemaining() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("📖 开始翻译剩余的70个英文名称...\n");

    let updatedCount = 0;
    let skippedCount = 0;
    let totalItems = Object.keys(remainingTranslations).length;
    let currentIndex = 0;

    for (const [english, chinese] of Object.entries(remainingTranslations)) {
      currentIndex++;

      // 如果英文和中文相同（保持原样的情况），跳过
      if (english === chinese) {
        skippedCount++;
        console.log(
          `⏭️  [${currentIndex}/${totalItems}] ${english} (保持原样)`
        );
        continue;
      }

      try {
        const [result] = await connection.execute(
          "UPDATE category_third SET name = ? WHERE name = ?",
          [chinese, english]
        );

        if (result.affectedRows > 0) {
          updatedCount += result.affectedRows;
          console.log(
            `✅ [${currentIndex}/${totalItems}] ${english} → ${chinese} (更新 ${result.affectedRows} 条)`
          );
        } else {
          skippedCount++;
          console.log(
            `⏭️  [${currentIndex}/${totalItems}] ${english} → ${chinese} (未找到匹配记录)`
          );
        }
      } catch (error) {
        console.error(
          `❌ [${currentIndex}/${totalItems}] 更新失败 ${english}:`,
          error.message
        );
      }
    }

    console.log(`\n==========================================`);
    console.log(`✅ 剩余名称翻译完成！`);
    console.log(`总数: ${totalItems}`);
    console.log(`更新记录数: ${updatedCount}`);
    console.log(`跳过: ${skippedCount}`);
    console.log(`==========================================\n`);

    // 验证还有多少英文名称
    console.log("验证剩余英文名称...");
    const [remaining] = await connection.execute(`
      SELECT COUNT(DISTINCT name) as count
      FROM category_third
      WHERE name REGEXP '^[A-Za-z0-9][A-Za-z0-9 &,.-]*$'
      AND name NOT REGEXP '[\\u4e00-\\u9fa5]'
    `);

    console.log(`\n剩余纯英文名称: ${remaining[0].count}`);
  } catch (error) {
    console.error("❌ 发生错误:", error);
  } finally {
    if (connection) await connection.end();
  }
}

translateRemaining();
