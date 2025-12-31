require("dotenv").config();
const { pool } = require("../config/database");
const fs = require("fs").promises;
const path = require("path");

// 英文到中文的翻译映射
const translations = {
  // Arts 艺术
  Architecture: "建筑",
  "Art History": "艺术史",
  Crafts: "手工艺",
  Dance: "舞蹈",
  Design: "设计",
  Fashion: "时尚",
  "Film & TV": "影视",
  Literature: "文学",
  Music: "音乐",
  Painting: "绘画",
  Photography: "摄影",
  Sculpture: "雕塑",
  Theater: "戏剧",
  "Visual Arts": "视觉艺术",
  Genres: "流派",
  Animation: "动画",
  Radio: "电台",
  Video: "视频",
  "Classical Studies": "古典研究",
  Costumes: "服装",
  Contests: "竞赛",

  // Business 商业
  Advertising: "广告",
  Banking: "银行",
  "E-commerce": "电子商务",
  Economics: "经济学",
  Entrepreneurship: "创业",
  Finance: "金融",
  Industry: "工业",
  Insurance: "保险",
  Investment: "投资",
  Management: "管理",
  Marketing: "市场营销",
  "Real Estate": "房地产",
  Retail: "零售",
  "Stock Market": "股市",
  "Aerospace and Defense": "航空航天与国防",
  "Agriculture and Forestry": "农林业",
  "Arts and Entertainment": "艺术娱乐",
  "Consumer Goods and Services": "消费品服务",
  Cooperatives: "合作社",
  "Customer Service": "客户服务",
  "Education and Training": "教育培训",
  "Electronics and Electrical": "电子电气",
  "Financial Services": "金融服务",
  "Food and Related Products": "食品相关产品",
  Healthcare: "医疗保健",
  Hospitality: "酒店服务",
  "Human Resources": "人力资源",
  "Industrial Goods and Services": "工业品服务",
  "Information Services": "信息服务",
  "Information Technology": "信息技术",
  "International Business and Trade": "国际商贸",
  Investing: "投资",
  "Major Companies": "大型企业",
  "Marketing and Advertising": "市场广告",
  "Mining and Drilling": "采矿钻探",
  Opportunities: "商机",
  "Publishing and Printing": "出版印刷",
  "Small Business": "小型企业",
  Telecommunications: "电信",
  "Textiles and Nonwovens": "纺织无纺布",
  "Transportation and Logistics": "运输物流",
  "Wholesale Trade": "批发贸易",
  "Retail Trade": "零售贸易",
  Accounting: "会计",
  "E-Commerce": "电子商务",

  // Education 教育
  "Distance Learning": "远程教育",
  "Early Childhood": "幼儿教育",
  "Higher Education": "高等教育",
  "Language Learning": "语言学习",
  "Online Courses": "在线课程",
  "Primary Education": "小学教育",
  "Secondary Education": "中学教育",
  "Special Education": "特殊教育",
  STEM: "STEM教育",
  "Vocational Training": "职业培训",

  // Entertainment 娱乐
  "Celebrity News": "明星新闻",
  Comics: "漫画",
  Events: "活动",
  Games: "游戏",
  Gossip: "八卦",
  Humor: "幽默",
  Movies: "电影",
  "TV Shows": "电视节目",

  // Environment 环境
  "Climate Change": "气候变化",
  Conservation: "保护",
  Energy: "能源",
  Pollution: "污染",
  Recycling: "回收",
  "Renewable Energy": "可再生能源",
  Sustainability: "可持续发展",
  Wildlife: "野生动物",

  // Health 健康
  Dental: "牙科",
  Diet: "饮食",
  Diseases: "疾病",
  Fitness: "健身",
  "Mental Health": "心理健康",
  Nutrition: "营养",
  "Public Health": "公共卫生",
  Wellness: "养生",
  Aging: "衰老",
  Animal: "动物",
  "Home Health": "家庭健康",
  Nursing: "护理",
  "Occupational Health and Safety": "职业健康安全",
  "Public Health and Safety": "公共卫生安全",
  "Reproductive Health": "生殖健康",
  Senses: "感官",
  "Specific Substances": "特定物质",
  "Support Groups": "支持小组",
  "Weight Loss": "减肥",
  Addictions: "成瘾",
  "Men's Health": "男性健康",

  // Politics 政治
  Diplomacy: "外交",
  Elections: "选举",
  Government: "政府",
  "International Relations": "国际关系",
  Law: "法律",
  Policy: "政策",

  // Science 科学
  Astronomy: "天文学",
  Biology: "生物学",
  Chemistry: "化学",
  Mathematics: "数学",
  Physics: "物理学",
  Research: "研究",
  Space: "太空",
  "Anomalies and Alternative Science": "异常另类科学",
  "Educational Resources": "教育资源",
  "Science in Society": "社会科学",

  // Sports 体育
  Baseball: "棒球",
  Basketball: "篮球",
  Cricket: "板球",
  Cycling: "自行车",
  Football: "足球",
  Golf: "高尔夫",
  Olympics: "奥运会",
  Rugby: "橄榄球",
  Soccer: "足球",
  Swimming: "游泳",
  Tennis: "网球",
  "Winter Sports": "冬季运动",
  "Adventure Racing": "冒险赛",
  Airsoft: "气枪",
  "Animal Sports": "动物运动",
  Archery: "射箭",
  Badminton: "羽毛球",
  Bocce: "地掷球",
  Boomerang: "回力镖",
  Bowling: "保龄球",
  Boxing: "拳击",
  Cheerleading: "啦啦队",
  "College and University": "大学",
  Croquet: "槌球",
  "Cue Sports": "台球",
  Darts: "飞镖",
  Disabled: "残障",
  Equestrian: "马术",
  "Extreme Sports": "极限运动",
  Fencing: "击剑",
  "Flying Discs": "飞盘",
  Footbag: "毽球",
  Gaelic: "盖尔运动",
  Goalball: "盲人门球",
  "Greyhound Racing": "灰狗竞速",
  Gymnastics: "体操",
  Handball: "手球",
  Hockey: "曲棍球",
  "Informal Sports": "非正式运动",
  "Jai Alai": "回力球",
  Kabbadi: "卡巴迪",
  Korfball: "合球",
  Lacrosse: "长曲棍球",
  "Laser Games": "激光游戏",
  Lumberjack: "伐木",
  "Martial Arts": "武术",
  Motorsports: "赛车",
  Netball: "投球",
  Officiating: "裁判",
  Orienteering: "定向越野",
  Paddleball: "板球",
  Paintball: "彩弹",
  Petanque: "法式滚球",
  Racquetball: "壁球",
  Rodeo: "牛仔竞技",
  "Rope Skipping": "跳绳",
  Rounders: "圆场棒球",
  Running: "跑步",
  "Sepak Takraw": "藤球",
  Skateboarding: "滑板",
  Skating: "滑冰",
  Softball: "垒球",
  "Strength Sports": "力量运动",
  "Table Tennis": "乒乓球",
  Tchoukball: "巧固球",
  "Team Handball": "手球",
  "Team Spirit": "团队精神",
  "Track and Field": "田径",
  Volleyball: "排球",
  Walking: "步行",
  "Water Sports": "水上运动",
  Women: "女子",
  Wrestling: "摔跤",
  "Youth and High School": "青少年高中",
  "Multi-Sports": "多项运动",
  Squash: "壁球",
  Pesäpallo: "芬兰式棒球",

  // Technology 科技
  AI: "人工智能",
  Apps: "应用程序",
  Blockchain: "区块链",
  "Cloud Computing": "云计算",
  Cybersecurity: "网络安全",
  "Data Science": "数据科学",
  Gadgets: "电子产品",
  Internet: "互联网",
  Mobile: "移动设备",
  Programming: "编程",
  Robotics: "机器人",
  Software: "软件",
  Startups: "创业公司",
  "Artificial Intelligence": "人工智能",
  "Artificial Life": "人工生命",
  "Bulletin Board Systems": "电子布告栏",
  "CAD and CAM": "CAD与CAM",
  Companies: "公司",
  "Computer Science": "计算机科学",
  "Data Communications": "数据通信",
  "Data Formats": "数据格式",
  "Desktop Publishing": "桌面出版",
  Emulators: "模拟器",
  Ethics: "伦理",
  Graphics: "图形",
  Hacking: "黑客",
  "Home Automation": "家庭自动化",
  Intranet: "内网",
  "Mobile Computing": "移动计算",
  Multimedia: "多媒体",
  "Open Source": "开源",
  "Parallel Computing": "并行计算",
  "Performance and Capacity": "性能容量",
  Security: "安全",
  "Speech Technology": "语音技术",
  Supercomputing: "超级计算",
  Systems: "系统",
  Amstrad: "Amstrad",
  Apple: "苹果",
  Atari: "Atari",
  Commodore: "Commodore",
  "HP 3000": "HP 3000",
  Handhelds: "手持设备",
  MSX: "MSX",
  Oric: "Oric",
  "RISC OS": "RISC OS",
  Sinclair: "Sinclair",
  "Tablet PCs": "平板电脑",
  "Virtual Reality": "虚拟现实",
  Algorithms: "算法",
  "E-Books": "电子书",
  "Human-Computer Interaction": "人机交互",

  // Travel 旅行
  Adventure: "冒险",
  "Budget Travel": "经济旅游",
  "Business Travel": "商务旅行",
  "Cultural Tourism": "文化旅游",
  Destinations: "目的地",
  Hotels: "酒店",
  "Luxury Travel": "豪华旅游",
  "Travel Tips": "旅游贴士",
  Travel: "旅行",

  // Lifestyle 生活方式
  Beauty: "美容",
  "Food & Drink": "美食饮品",
  "Home & Garden": "家居园艺",
  Relationships: "人际关系",
  Cooking: "烹饪",
  "Emergency Preparation": "应急准备",
  Entertaining: "娱乐招待",
  Family: "家庭",
  "Home Improvement": "家居装修",
  Homemaking: "家政",
  Homeowners: "房主",
  "Moving and Relocating": "搬家搬迁",
  "Personal Finance": "个人理财",
  "Personal Organization": "个人组织",
  "Rural Living": "乡村生活",
  "Urban Living": "城市生活",
  "Apartment Living": "公寓生活",
  "Do-It-Yourself": "DIY",

  // World 世界
  Africa: "非洲",
  Asia: "亚洲",
  Europe: "欧洲",
  "Middle East": "中东",
  "North America": "北美洲",
  Oceania: "大洋洲",
  "South America": "南美洲",

  // Games 游戏
  "Card Games": "卡牌游戏",
  "Developers and Publishers": "开发商发行商",
  Dice: "骰子",
  Gambling: "赌博",
  "Game Studies": "游戏研究",
  "Hand Games": "手游",
  Miniatures: "微缩模型",
  Online: "在线",
  "Paper and Pencil": "纸笔游戏",
  "Party Games": "派对游戏",
  "Play Groups": "游戏小组",
  Puzzles: "益智",
  Roleplaying: "角色扮演",
  "Tile Games": "瓷砖游戏",
  "Trading Card Games": "集换式卡牌",
  "Video Games": "电子游戏",
  "Board Games": "桌游",
  "Coin-Op": "投币游戏",
  "Play-By-Mail": "邮寄游戏",
  "Hand-Eye Coordination": "手眼协调",

  // Shopping 购物
  "Antiques and Collectibles": "古董收藏品",
  Auctions: "拍卖",
  Clothing: "服装",
  "Consumer Electronics": "消费电子",
  "Death Care": "殡葬服务",
  "Ethnic and Regional": "民族地区",
  Flowers: "鲜花",
  Food: "食品",
  "General Merchandise": "日用百货",
  Gifts: "礼品",
  Holidays: "节日",
  "Home and Garden": "家居园艺",
  Jewelry: "珠宝",
  Niche: "小众",
  "Office Products": "办公用品",
  Pets: "宠物",
  Tobacco: "烟草",
  Tools: "工具",
  "Toys and Games": "玩具游戏",
  Vehicles: "车辆",
  Weddings: "婚礼",

  // Society 社会
  Activism: "激进主义",
  Crime: "犯罪",
  Death: "死亡",
  Folklore: "民俗",
  Future: "未来",
  Genealogy: "家谱",
  Issues: "议题",
  "Lifestyle Choices": "生活方式",
  Military: "军事",
  Paranormal: "超自然",
  Philanthropy: "慈善",
  Philosophy: "哲学",
  Politics: "政治",
  "Religion and Spirituality": "宗教灵性",
  Sexuality: "性",
  Subcultures: "亚文化",
  Transgendered: "跨性别",
  Work: "工作",
  "Gay, Lesbian, and Bisexual": "同性恋双性恋",

  // Recreation 娱乐休闲
  Audio: "音频",
  Autos: "汽车",
  Aviation: "航空",
  Birding: "观鸟",
  Boating: "划船",
  Camps: "露营",
  Climbing: "攀岩",
  Guns: "枪支",
  Kites: "风筝",
  Knives: "刀具",
  "Living History": "生活史",
  Locks: "锁具",
  Models: "模型",
  Motorcycles: "摩托车",
  Nudism: "裸体主义",
  Outdoors: "户外",
  Parties: "派对",
  "Picture Ratings": "图片评级",
  "Roads and Highways": "道路高速",
  Scouting: "童子军",
  "Theme Parks": "主题公园",
  "Trains and Railroads": "火车铁路",
  Antiques: "古董",
  Whips: "鞭子",
};

// 检测字符串是否包含中文
function hasChinese(str) {
  return /[\u4e00-\u9fa5]/.test(str);
}

// 主函数
async function exportAndTranslate() {
  let connection;

  try {
    console.log("连接数据库...");
    connection = await pool.getConnection();

    // 1. 读取所有 category_sub 数据
    console.log("\n读取 category_sub 表数据...");
    const [rows] = await connection.execute(
      "SELECT id, name, main_category_id FROM category_sub ORDER BY main_category_id, id"
    );

    console.log(`找到 ${rows.length} 条记录`);

    // 2. 分析哪些需要翻译
    const needTranslation = [];
    const alreadyTranslated = [];

    rows.forEach((row) => {
      if (!hasChinese(row.name)) {
        needTranslation.push(row);
      } else {
        alreadyTranslated.push(row);
      }
    });

    console.log(`\n需要翻译: ${needTranslation.length} 条`);
    console.log(`已有中文: ${alreadyTranslated.length} 条`);

    // 3. 导出到文件
    const exportData = {
      exportTime: new Date().toISOString(),
      total: rows.length,
      needTranslation: needTranslation.length,
      alreadyTranslated: alreadyTranslated.length,
      data: needTranslation.map((row) => ({
        id: row.id,
        main_category_id: row.main_category_id,
        original: row.name,
        translated: translations[row.name] || `[待翻译] ${row.name}`,
      })),
    };

    const exportPath = path.join(__dirname, "subcategories_translation.json");
    await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2), "utf8");
    console.log(`\n已导出到: ${exportPath}`);

    // 4. 显示需要翻译的内容
    console.log("\n=== 需要翻译的二级分类 ===");
    needTranslation.forEach((row) => {
      const translated = translations[row.name];
      if (translated) {
        console.log(`✓ ID ${row.id}: ${row.name} -> ${translated}`);
      } else {
        console.log(`✗ ID ${row.id}: ${row.name} -> [未找到翻译]`);
      }
    });

    // 5. 统计未找到翻译的
    const missingTranslations = needTranslation.filter(
      (row) => !translations[row.name]
    );
    if (missingTranslations.length > 0) {
      console.log("\n=== 缺少翻译映射 ===");
      missingTranslations.forEach((row) => {
        console.log(`  '${row.name}': '',`);
      });
    }

    // 6. 询问是否执行更新
    console.log("\n=== 准备更新数据库 ===");
    const canTranslate = needTranslation.filter(
      (row) => translations[row.name]
    );
    console.log(`可以翻译 ${canTranslate.length} 条记录`);
    console.log(`缺少翻译 ${missingTranslations.length} 条记录`);

    // 7. 执行更新
    if (canTranslate.length > 0) {
      console.log("\n开始更新数据库...");
      let updated = 0;
      let skipped = 0;
      let failed = 0;

      for (const row of canTranslate) {
        const translated = translations[row.name];

        try {
          // 检查是否会产生重复
          const [existing] = await connection.execute(
            "SELECT id FROM category_sub WHERE main_category_id = ? AND name = ? AND id != ?",
            [row.main_category_id, translated, row.id]
          );

          if (existing.length > 0) {
            console.log(
              `⚠ 跳过 ID ${row.id}: ${row.name} -> ${translated} (已存在)`
            );
            skipped++;
            continue;
          }

          await connection.execute(
            "UPDATE category_sub SET name = ? WHERE id = ?",
            [translated, row.id]
          );
          console.log(`✓ 更新 ID ${row.id}: ${row.name} -> ${translated}`);
          updated++;
        } catch (error) {
          console.log(
            `✗ 失败 ID ${row.id}: ${row.name} -> ${translated} (${error.message})`
          );
          failed++;
        }
      }

      console.log(`\n=== 更新统计 ===`);
      console.log(`✓ 成功: ${updated} 条`);
      console.log(`⚠ 跳过: ${skipped} 条`);
      console.log(`✗ 失败: ${failed} 条`);
    }

    // 8. 验证更新
    console.log("\n=== 验证更新结果 ===");
    const [afterUpdate] = await connection.execute(
      "SELECT id, name FROM category_sub WHERE id IN (?)",
      [canTranslate.map((r) => r.id)]
    );

    afterUpdate.forEach((row) => {
      const hasZh = hasChinese(row.name);
      console.log(`${hasZh ? "✓" : "✗"} ID ${row.id}: ${row.name}`);
    });
  } catch (error) {
    console.error("错误:", error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// 运行
exportAndTranslate()
  .then(() => {
    console.log("\n完成！");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n执行失败:", error);
    process.exit(1);
  });
