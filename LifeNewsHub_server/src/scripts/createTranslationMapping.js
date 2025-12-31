const fs = require("fs");
const path = require("path");

// 读取剩余英文名称
const remainingFile = path.join(
  __dirname,
  "../../remaining_english_names.json"
);
const remainingNames = JSON.parse(fs.readFileSync(remainingFile, "utf8"));

// 手动翻译映射（从完整翻译映射.txt提取）
const manualTranslations = {
  // 艺术类
  Genres: "流派",
  Animation: "动画",
  Radio: "电台",
  Video: "视频",
  "Classical Studies": "古典研究",
  Costumes: "服装",
  Contests: "竞赛",
  Multimedia: "多媒体",

  // 商业类
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

  // 计算机类
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

  // 游戏类
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

  // 健康类
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

  // 家居类
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

  // 科学类
  "Anomalies and Alternative Science": "异常另类科学",
  "Educational Resources": "教育资源",
  "Science in Society": "社会科学",

  // 购物类
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
  Travel: "旅行",
  Vehicles: "车辆",
  Weddings: "婚礼",

  // 社会类
  Activism: "激进主义",
  Crime: "犯罪",
  Death: "死亡",
  Disabled: "残障",
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

  // 体育类
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

  // 娱乐休闲类
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

// 创建一一对应的映射
const result = [];
let foundCount = 0;
let notFoundCount = 0;

remainingNames.forEach((name) => {
  if (manualTranslations[name]) {
    result.push({
      english: name,
      chinese: manualTranslations[name],
      status: "已翻译",
    });
    foundCount++;
  } else {
    result.push({
      english: name,
      chinese: "",
      status: "待翻译",
    });
    notFoundCount++;
  }
});

// 保存结果
const outputFile = path.join(__dirname, "../../translation_mapping.json");
fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), "utf8");

console.log(`\n翻译映射生成完成！`);
console.log(`总数量: ${remainingNames.length}`);
console.log(`已找到翻译: ${foundCount}`);
console.log(`待翻译: ${notFoundCount}`);
console.log(`\n文件已保存到: ${outputFile}`);

// 导出待翻译列表
const toTranslate = result.filter((item) => item.status === "待翻译");
const toTranslateFile = path.join(__dirname, "../../to_translate_list.json");
fs.writeFileSync(
  toTranslateFile,
  JSON.stringify(
    toTranslate.map((item) => item.english),
    null,
    2
  ),
  "utf8"
);
console.log(`待翻译列表已保存到: ${toTranslateFile}`);
