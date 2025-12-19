const mysql = require("mysql2/promise");
require("dotenv").config({
  path: require("path").join(__dirname, "..", "..", ".env"),
});

/**
 * 导入 Arts 分类下的三级分类数据
 * 从 data.js 读取数据，将三级分类写入 category_third 表
 * third_category_key 使用英文名称，name 需要转换为中文
 */

// Arts 分类下的二级分类及其三级分类数据
// 格式：{ 二级分类名: [三级分类数组] }
const artsThirdCategories = {
  Animation: [
    "Anime",
    "Artists",
    "Awards",
    "Cartoons",
    "Collectibles",
    "Contests",
    "Experimental",
    "Festivals",
    "Magazines and E-zines",
    "Movies",
    "Organizations",
    "Production",
    "Stop-Motion",
    "Training",
    "Voice Actors",
    "Web",
    "Writers",
  ],
  Architecture: [
    "Archives",
    "Associations",
    "Building Types",
    "Education",
    "Experimental",
    "Famous Names",
    "History",
    "Landscape",
    "Preservation",
  ],
  "Art History": [
    "Acupuncture and Chinese Medicine",
    "Acutouch",
    "Alexander Technique",
    "Apitherapy",
    "Aromatherapy",
    "Ayurveda",
    "Bates Method",
    "Biofeedback",
    "Breathwork",
    "Chiropractic",
    "Clinics and Practitioners",
    "Coaching",
    "Color Therapies",
    "Crystals",
    "Ear Candling",
    "Energy Healing",
    "Essences",
    "Fasting and Cleansing",
    "Folk Medicine",
    "Herbs",
    "Holistic and Integrated Medicine",
    "Homeopathy",
    "Huna",
    "Hypnotherapy",
    "Magnetic Therapy",
    "Massage Therapy and Bodywork",
    "Meditation",
    "Naturopathy",
    "Non-Toxic Living",
    "Opposing Views",
    "Ozone Therapy",
    "Palmtherapy",
    "Practitioners",
    "Reflexology",
    "Reiki",
    "Tibetan Medicine",
    "Trepanation",
    "Urine Therapy",
  ],
  Awards: ["Golden Globe Awards", "Screen Actors Guild Awards", "Visual Arts"],
  Bodyart: [
    "Articles",
    "Bodypainting",
    "Games and Humor",
    "Image Galleries",
    "Licensing and Regulations",
    "Magazines and E-zines",
    "Piercing",
    "Schools and Instruction",
    "Studios",
    "Tattoo",
  ],
  "Classical Studies": [
    "Academic Departments",
    "Classicists",
    "Geography",
    "Greek",
    "Journals",
    "Organizations",
    "Roman",
  ],
  Comics: [
    "Comic Strips and Panels",
    "Conventions",
    "Creators",
    "Distributors",
    "Fan Pages",
    "Magazines and E-zines",
    "Manga",
    "Online",
    "Organizations",
    "Organizations and Institutions",
    "Other Media",
    "Retailers",
    "Reviews",
  ],
  Contests: [],
  Costumes: ["By Type", "Education", "Exhibitions", "Organizations"],
  Crafts: [
    "Artisans",
    "Associations",
    "Balloon Sculpting",
    "Basketry",
    "Beading",
    "Candles",
    "Ceramic Art and Pottery",
    "Classes and Projects",
    "Craft Swaps",
    "Decorative Painting",
    "Doll Making",
    "Enameling",
    "Flowers",
    "For Charity",
    "Galleries",
    "Glass",
    "Jewelry",
    "Knitting and Crochet",
    "Lacemaking",
    "Leatherworking",
    "Magazines and E-zines",
    "Marbling",
    "Metal Craft",
    "Modeling Compounds",
    "Mosaics",
    "Needlework",
    "Paper",
    "Publications",
    "Quilting",
    "Rubber Stamping",
    "Scrapbooking",
    "Soaps",
    "String Figures",
    "Textiles",
    "Wildcrafting",
    "Woodcraft",
  ],
  Design: [
    "Education",
    "Fashion",
    "Furniture",
    "Industrial",
    "Interior Design",
    "Magazines and E-zines",
    "Organizations",
  ],
  Digital: [
    "Evolutive",
    "Installations and Performances",
    "Magazines and E-zines",
    "Net Art",
    "Virtual Reality",
  ],
  Education: [
    "Colleges and Departments",
    "Educators",
    "Language Arts",
    "Learning Resources",
    "Organizations",
    "Publications",
    "Schools and Academies",
  ],
  Entertainment: ["History", "Online Media", "Reviews"],
  Genres: ["Environment and Nature", "Horror", "Science Fiction and Fantasy"],
  "Graphic Design": [
    "Collectives",
    "Education",
    "Employment",
    "Graphic Designers",
    "History",
    "Magazines and E-zines",
    "Organizations",
    "Personal Pages",
    "Software",
    "Typography",
  ],
  Humanities: [
    "Great Books Indices",
    "Literature in Art",
    "Scholarship and Technology",
  ],
  Illustration: [
    "Advertising",
    "Airbrush",
    "Caricature",
    "Cartoons",
    "Children's",
    "Editorial Illustration",
    "Graphics Illustrators",
    "Historic Illustrators",
    "Illustration Galleries",
    "Illustrative Painting",
    "Illustrator Portfolios",
    "Line-Art and Ink Illustrations",
    "Organizations",
    "Realism",
    "Representatives",
    "Science Fiction and Fantasy",
    "Sculptural and 3D",
    "Specialized",
    "Stock and Clip Art",
    "Studios",
    "Whimsical and Humorous",
  ],
  Literature: [
    "Awards and Bestsellers",
    "Biography",
    "Children's",
    "Cultural",
    "Drama",
    "Electronic Text Archives",
    "Festivals",
    "Fiction",
    "Genres",
    "Journals",
    "Magazines and E-zines",
    "Myths and Folktales",
    "Online Reading",
    "Performance",
    "Periods and Movements",
    "Poetry",
    "Reading Groups",
    "Reviews and Criticism",
    "Short Stories",
    "World Literature",
  ],
  "Magazines and E-zines": ["E-zines", "Magazines"],
  Movies: [
    "Awards",
    "Characters",
    "Contests",
    "Cultures and Groups",
    "Databases",
    "Education",
    "Film Festivals",
    "Filmmaking",
    "Genres",
    "Guides",
    "History",
    "Home Video",
    "Memorabilia",
    "Multimedia",
    "Organizations",
    "Quotations",
    "Reviews",
    "Showtimes",
    "Soundtracks",
    "Studios",
    "Theaters",
    "Theory and Criticism",
    "Trivia",
  ],
  Music: [
    "Anti-Music",
    "Arranging",
    "Awards",
    "Bands and Artists",
    "Charts",
    "Classifieds",
    "Clubs and Venues",
    "Collecting",
    "Competitions",
    "Composition",
    "Computers",
    "Concerts and Events",
    "DJs",
    "Education",
    "History",
    "Instruments",
    "Lyrics",
    "Marching",
    "Movies",
    "Music Videos",
    "Musicology",
    "Organizations",
    "Reviews",
    "Songwriting",
    "Sound Files",
    "Styles",
    "Technology",
    "Theory",
    "Trading",
    "Vocal",
    "Women in Music",
  ],
  "Online Writing": [
    "Drama",
    "E-zines",
    "Fiction",
    "Journals",
    "Mixed Genre",
    "Non-Fiction",
    "Poetry",
  ],
  Organizations: [],
  "Performing Arts": [
    "Acrobatics",
    "Acting",
    "Busking and Street Performing",
    "Circus",
    "Comedy",
    "Dance",
    "Education",
    "Festivals",
    "Hypnotism",
    "Magic",
    "Organizations",
    "Performers",
    "Publications",
    "Puppetry",
    "Storytelling",
    "Stunts",
    "Theatre",
    "Venues",
  ],
  "Periods and Movements": ["Art Nouveau", "Islamic"],
  Photography: [
    "Art Galleries",
    "Contests",
    "Education",
    "Equipment and Services",
    "Magazines and E-zines",
    "Organizations",
    "Photographers",
    "Techniques and Styles",
  ],
  Radio: [
    "Advocacy Organizations",
    "Formats",
    "History",
    "Industry",
    "International Broadcasters",
    "Internet",
    "Jingles",
    "Personalities",
    "Production Services",
    "Tributes",
  ],
  Television: [
    "Awards",
    "Cable Television",
    "Closed Captioning",
    "Commercials",
    "DVD",
    "Guides",
    "History",
    "Interactive",
    "Memorabilia",
    "Networks",
    "Programs",
    "Satellite",
    "Schedule and Programming",
    "Stations",
    "Theme Songs",
    "Tickets For Shows",
    "Trading",
    "Trivia",
  ],
  Video: [
    "Alternative Video",
    "Community Video",
    "Education",
    "Magazines and E-zines",
    "Training",
    "Video Editing",
  ],
  "Visual Arts": [
    "ASCII Art",
    "Assemblage Art",
    "Calligraphy",
    "Collage",
    "Collectives",
    "Computer Graphics",
    "Contests",
    "Drawing",
    "Education",
    "Environment and Nature",
    "Galleries",
    "Installation Art",
    "Magazines and E-zines",
    "Mail Art and Artistamps",
    "Native and Tribal",
    "Object-Based Art",
    "Organizations",
    "Painting",
    "Performance Art",
    "Printmaking",
    "Private Dealers",
    "Public Art",
    "Research",
    "Reviews",
    "Sculpture",
    "Site Specific Art",
    "Thematic",
  ],
  "Writers Resources": [
    "Book Writing",
    "Children's Writing",
    "Contests",
    "Copy Editing",
    "FAQs, Help, and Tutorials",
    "Fiction",
    "Freelancing",
    "Non-Fiction",
    "Online Communities",
    "Organizations",
    "Playwriting",
    "Poetry",
    "Publishing",
    "Research",
    "Screenwriting",
    "Software",
    "Style Guides",
    "Writing Exercises",
    "Young Writers",
  ],
};

// 英文到中文的翻译映射
const translationMap = {
  // Animation 子分类
  Anime: "动漫",
  Artists: "艺术家",
  Awards: "奖项",
  Cartoons: "卡通",
  Collectibles: "收藏品",
  Contests: "比赛",
  Experimental: "实验性",
  Festivals: "节日",
  "Magazines and E-zines": "杂志和电子杂志",
  Movies: "电影",
  Organizations: "组织",
  Production: "制作",
  "Stop-Motion": "定格动画",
  Training: "培训",
  "Voice Actors": "配音演员",
  Web: "网络",
  Writers: "作家",

  // Architecture 子分类
  Archives: "档案",
  Associations: "协会",
  "Building Types": "建筑类型",
  Education: "教育",
  "Famous Names": "著名建筑师",
  History: "历史",
  Landscape: "景观",
  Preservation: "保护",

  // Art History 子分类
  "Acupuncture and Chinese Medicine": "针灸和中医",
  Acutouch: "穴位按摩",
  "Alexander Technique": "亚历山大技巧",
  Apitherapy: "蜂疗",
  Aromatherapy: "芳香疗法",
  Ayurveda: "阿育吠陀",
  "Bates Method": "贝茨方法",
  Biofeedback: "生物反馈",
  Breathwork: "呼吸法",
  Chiropractic: "脊椎按摩疗法",
  "Clinics and Practitioners": "诊所和从业者",
  Coaching: "教练",
  "Color Therapies": "色彩疗法",
  Crystals: "水晶疗法",
  "Ear Candling": "耳烛疗法",
  "Energy Healing": "能量疗愈",
  Essences: "精油疗法",
  "Fasting and Cleansing": "禁食和清洁",
  "Folk Medicine": "民间医学",
  Herbs: "草药",
  "Holistic and Integrated Medicine": "整体和综合医学",
  Homeopathy: "顺势疗法",
  Huna: "夏威夷疗法",
  Hypnotherapy: "催眠疗法",
  "Magnetic Therapy": "磁疗",
  "Massage Therapy and Bodywork": "按摩和身体疗法",
  Meditation: "冥想",
  Naturopathy: "自然疗法",
  "Non-Toxic Living": "无毒生活",
  "Opposing Views": "反对观点",
  "Ozone Therapy": "臭氧疗法",
  Palmtherapy: "掌疗",
  Practitioners: "从业者",
  Reflexology: "反射疗法",
  Reiki: "灵气疗法",
  "Tibetan Medicine": "藏医",
  Trepanation: "颅骨钻孔术",
  "Urine Therapy": "尿疗",

  // Awards 子分类
  "Golden Globe Awards": "金球奖",
  "Screen Actors Guild Awards": "演员工会奖",
  "Visual Arts": "视觉艺术",

  // Bodyart 子分类
  Articles: "文章",
  Bodypainting: "身体彩绘",
  "Games and Humor": "游戏和幽默",
  "Image Galleries": "图片库",
  "Licensing and Regulations": "许可和法规",
  Piercing: "穿孔",
  "Schools and Instruction": "学校和教学",
  Studios: "工作室",
  Tattoo: "纹身",

  // Classical Studies 子分类
  "Academic Departments": "学术部门",
  Classicists: "古典学者",
  Geography: "地理",
  Greek: "希腊",
  Journals: "期刊",
  Roman: "罗马",

  // Comics 子分类
  "Comic Strips and Panels": "连环画和漫画",
  Conventions: "展会",
  Creators: "创作者",
  Distributors: "发行商",
  "Fan Pages": "粉丝页面",
  Manga: "漫画",
  Online: "在线",
  "Organizations and Institutions": "组织和机构",
  "Other Media": "其他媒体",
  Retailers: "零售商",
  Reviews: "评论",

  // Costumes 子分类
  "By Type": "按类型",
  Exhibitions: "展览",

  // Crafts 子分类
  Artisans: "工匠",
  "Balloon Sculpting": "气球雕塑",
  Basketry: "编篮",
  Beading: "串珠",
  Candles: "蜡烛",
  "Ceramic Art and Pottery": "陶瓷艺术和陶器",
  "Classes and Projects": "课程和项目",
  "Craft Swaps": "手工交换",
  "Decorative Painting": "装饰画",
  "Doll Making": "玩偶制作",
  Enameling: "珐琅",
  Flowers: "花艺",
  "For Charity": "慈善",
  Galleries: "画廊",
  Glass: "玻璃",
  Jewelry: "珠宝",
  "Knitting and Crochet": "编织和钩针",
  Lacemaking: "花边制作",
  Leatherworking: "皮革工艺",
  Marbling: "大理石花纹",
  "Metal Craft": "金属工艺",
  "Modeling Compounds": "造型材料",
  Mosaics: "马赛克",
  Needlework: "针线活",
  Paper: "纸艺",
  Publications: "出版物",
  Quilting: "拼布",
  "Rubber Stamping": "橡皮章",
  Scrapbooking: "剪贴簿",
  Soaps: "香皂",
  "String Figures": "翻花绳",
  Textiles: "纺织品",
  Wildcrafting: "野外采集",
  Woodcraft: "木工",

  // Design 子分类
  Fashion: "时尚",
  Furniture: "家具",
  Industrial: "工业设计",
  "Interior Design": "室内设计",

  // Digital 子分类
  Evolutive: "进化艺术",
  "Installations and Performances": "装置和表演",
  "Net Art": "网络艺术",
  "Virtual Reality": "虚拟现实",

  // Education 子分类
  "Colleges and Departments": "学院和系",
  Educators: "教育者",
  "Language Arts": "语言艺术",
  "Learning Resources": "学习资源",
  "Schools and Academies": "学校和学院",

  // Entertainment 子分类
  "Online Media": "在线媒体",

  // Genres 子分类
  "Environment and Nature": "环境和自然",
  Horror: "恐怖",
  "Science Fiction and Fantasy": "科幻和奇幻",

  // Graphic Design 子分类
  Collectives: "集体",
  Employment: "就业",
  "Graphic Designers": "平面设计师",
  "Personal Pages": "个人页面",
  Software: "软件",
  Typography: "字体设计",

  // Humanities 子分类
  "Great Books Indices": "名著索引",
  "Literature in Art": "艺术中的文学",
  "Scholarship and Technology": "学术和技术",

  // Illustration 子分类
  Advertising: "广告",
  Airbrush: "喷绘",
  Caricature: "讽刺画",
  "Children's": "儿童",
  "Editorial Illustration": "编辑插画",
  "Graphics Illustrators": "图形插画师",
  "Historic Illustrators": "历史插画师",
  "Illustration Galleries": "插画画廊",
  "Illustrative Painting": "插画绘画",
  "Illustrator Portfolios": "插画师作品集",
  "Line-Art and Ink Illustrations": "线条和墨水插画",
  Realism: "写实主义",
  Representatives: "代理",
  "Sculptural and 3D": "雕塑和3D",
  Specialized: "专业",
  "Stock and Clip Art": "素材和剪贴画",
  "Whimsical and Humorous": "异想天开和幽默",

  // Literature 子分类
  "Awards and Bestsellers": "奖项和畅销书",
  Biography: "传记",
  Cultural: "文化",
  Drama: "戏剧",
  "Electronic Text Archives": "电子文本档案",
  Fiction: "小说",
  Genres: "流派",
  "Myths and Folktales": "神话和民间故事",
  "Online Reading": "在线阅读",
  Performance: "表演",
  "Periods and Movements": "时期和运动",
  Poetry: "诗歌",
  "Reading Groups": "读书小组",
  "Reviews and Criticism": "评论和批评",
  "Short Stories": "短篇小说",
  "World Literature": "世界文学",

  // Magazines and E-zines 子分类
  "E-zines": "电子杂志",
  Magazines: "杂志",

  // Movies 子分类
  Characters: "角色",
  "Cultures and Groups": "文化和群体",
  Databases: "数据库",
  "Film Festivals": "电影节",
  Filmmaking: "电影制作",
  Guides: "指南",
  "Home Video": "家庭视频",
  Memorabilia: "纪念品",
  Multimedia: "多媒体",
  Quotations: "语录",
  Showtimes: "场次",
  Soundtracks: "原声带",
  Theaters: "剧院",
  "Theory and Criticism": "理论和批评",
  Trivia: "趣闻",

  // Music 子分类
  "Anti-Music": "反音乐",
  Arranging: "编曲",
  "Bands and Artists": "乐队和艺术家",
  Charts: "排行榜",
  Classifieds: "分类广告",
  "Clubs and Venues": "俱乐部和场馆",
  Collecting: "收藏",
  Competitions: "比赛",
  Composition: "作曲",
  Computers: "计算机",
  "Concerts and Events": "音乐会和活动",
  DJs: "DJ",
  Instruments: "乐器",
  Lyrics: "歌词",
  Marching: "军乐队",
  "Music Videos": "音乐视频",
  Musicology: "音乐学",
  Songwriting: "歌曲创作",
  "Sound Files": "音频文件",
  Styles: "风格",
  Technology: "技术",
  Theory: "理论",
  Trading: "交易",
  Vocal: "声乐",
  "Women in Music": "音乐中的女性",

  // Online Writing 子分类
  "Mixed Genre": "混合流派",
  "Non-Fiction": "非小说",

  // Performing Arts 子分类
  Acrobatics: "杂技",
  Acting: "表演",
  "Busking and Street Performing": "街头表演",
  Circus: "马戏",
  Comedy: "喜剧",
  Dance: "舞蹈",
  Hypnotism: "催眠",
  Magic: "魔术",
  Performers: "表演者",
  Puppetry: "木偶戏",
  Storytelling: "讲故事",
  Stunts: "特技",
  Theatre: "戏剧",
  Venues: "场馆",

  // Periods and Movements 子分类
  "Art Nouveau": "新艺术运动",
  Islamic: "伊斯兰",

  // Photography 子分类
  "Art Galleries": "艺术画廊",
  "Equipment and Services": "设备和服务",
  Photographers: "摄影师",
  "Techniques and Styles": "技巧和风格",

  // Radio 子分类
  "Advocacy Organizations": "倡导组织",
  Formats: "格式",
  Industry: "行业",
  "International Broadcasters": "国际广播公司",
  Internet: "互联网",
  Jingles: "广告歌",
  Personalities: "主持人",
  "Production Services": "制作服务",
  Tributes: "致敬",

  // Television 子分类
  "Cable Television": "有线电视",
  "Closed Captioning": "字幕",
  Commercials: "广告",
  DVD: "DVD",
  Interactive: "互动",
  Networks: "网络",
  Programs: "节目",
  Satellite: "卫星",
  "Schedule and Programming": "节目表和编程",
  Stations: "电视台",
  "Theme Songs": "主题曲",
  "Tickets For Shows": "演出门票",

  // Video 子分类
  "Alternative Video": "另类视频",
  "Community Video": "社区视频",
  "Video Editing": "视频编辑",

  // Visual Arts 子分类
  "ASCII Art": "ASCII艺术",
  "Assemblage Art": "拼贴艺术",
  Calligraphy: "书法",
  Collage: "拼贴画",
  "Computer Graphics": "计算机图形",
  Drawing: "绘画",
  "Installation Art": "装置艺术",
  "Mail Art and Artistamps": "邮件艺术和艺术邮票",
  "Native and Tribal": "原住民和部落",
  "Object-Based Art": "物体艺术",
  Painting: "绘画",
  "Performance Art": "行为艺术",
  Printmaking: "版画",
  "Private Dealers": "私人画商",
  "Public Art": "公共艺术",
  Research: "研究",
  Sculpture: "雕塑",
  "Site Specific Art": "场地特定艺术",
  Thematic: "主题",

  // Writers Resources 子分类
  "Book Writing": "图书写作",
  "Children's Writing": "儿童写作",
  "Copy Editing": "文案编辑",
  "FAQs, Help, and Tutorials": "常见问题和教程",
  Freelancing: "自由职业",
  "Online Communities": "在线社区",
  Playwriting: "剧本创作",
  Publishing: "出版",
  Screenwriting: "编剧",
  "Style Guides": "风格指南",
  "Writing Exercises": "写作练习",
  "Young Writers": "青年作家",
};

// 生成 category_key
function generateCategoryKey(name) {
  return name
    .replace(/[^\w\s-]/g, "") // 移除特殊字符
    .replace(/\s+/g, "_") // 空格替换为下划线
    .replace(/-+/g, "_") // 连字符替换为下划线
    .replace(/_{2,}/g, "_") // 多个下划线合并为一个
    .replace(/^_+|_+$/g, ""); // 移除首尾下划线
}

// 翻译函数
function translateToChineseName(englishName) {
  return translationMap[englishName] || englishName;
}

async function importThirdCategories() {
  let connection;

  try {
    // 连接数据库
    console.log("=== 连接到 MySQL 服务器 ===");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "Information",
    });
    console.log("✓ 数据库连接成功\n");

    // 获取 Arts 主分类的 ID
    console.log("=== 查询 Arts 主分类 ===");
    const [mainCategory] = await connection.query(
      "SELECT id, name FROM category_main WHERE category_key = ?",
      ["Arts"]
    );

    if (mainCategory.length === 0) {
      console.error("✗ 未找到 Arts 主分类！");
      return;
    }

    const artsMainId = mainCategory[0].id;
    console.log(`✓ 找到 Arts 主分类 (ID: ${artsMainId})\n`);

    // 统计信息
    let totalImported = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    // 遍历所有二级分类
    for (const [subCategoryName, thirdCategories] of Object.entries(
      artsThirdCategories
    )) {
      // 生成二级分类的 key
      const subCategoryKey = generateCategoryKey(subCategoryName);

      // 查询二级分类
      const [subCategory] = await connection.query(
        `SELECT id FROM category_sub 
         WHERE main_category_id = ? AND sub_category_key = ?`,
        [artsMainId, subCategoryKey]
      );

      if (subCategory.length === 0) {
        console.log(`⊘ 跳过 ${subCategoryName}: 二级分类不存在`);
        continue;
      }

      const subCategoryId = subCategory[0].id;

      if (thirdCategories.length === 0) {
        console.log(`⊘ ${subCategoryName}: 没有三级分类`);
        continue;
      }

      console.log(
        `\n=== 处理 ${subCategoryName} (${thirdCategories.length} 个三级分类) ===`
      );

      // 遍历该二级分类下的所有三级分类
      for (let i = 0; i < thirdCategories.length; i++) {
        const englishName = thirdCategories[i];
        const thirdCategoryKey = generateCategoryKey(englishName);
        const chineseName = translateToChineseName(englishName);

        try {
          // 检查三级分类是否已存在
          const [existing] = await connection.query(
            `SELECT id FROM category_third 
             WHERE sub_category_id = ? AND third_category_key = ?`,
            [subCategoryId, thirdCategoryKey]
          );

          if (existing.length > 0) {
            console.log(`  ⊘ 跳过: ${englishName} → ${chineseName} (已存在)`);
            totalSkipped++;
            continue;
          }

          // 插入三级分类
          const insertSQL = `
            INSERT INTO category_third 
            (third_category_key, sub_category_id, name, sort_order, status) 
            VALUES (?, ?, ?, ?, 1)
          `;

          await connection.query(insertSQL, [
            thirdCategoryKey,
            subCategoryId,
            chineseName,
            i + 1,
          ]);

          console.log(
            `  ✓ 导入成功: ${englishName} → ${chineseName} (key: ${thirdCategoryKey})`
          );
          totalImported++;
        } catch (error) {
          console.error(
            `  ✗ 导入失败: ${englishName} → ${chineseName}`,
            error.message
          );
          totalFailed++;
        }
      }
    }

    // 显示统计信息
    console.log("\n=== 导入统计 ===");
    console.log(`成功导入: ${totalImported} 条`);
    console.log(`跳过重复: ${totalSkipped} 条`);
    console.log(`导入失败: ${totalFailed} 条`);
    console.log(`总计处理: ${totalImported + totalSkipped + totalFailed} 条`);

    // 查询最终结果
    console.log("\n=== 验证导入结果 ===");
    const [result] = await connection.query(
      `
      SELECT 
        cs.name as sub_category_name,
        COUNT(ct.id) as third_count
      FROM category_sub cs
      LEFT JOIN category_third ct ON cs.id = ct.sub_category_id
      WHERE cs.main_category_id = ?
      GROUP BY cs.id, cs.name
      HAVING third_count > 0
      ORDER BY third_count DESC
    `,
      [artsMainId]
    );

    console.log("\nArts 分类下各二级分类的三级分类数量:");
    result.forEach((row) => {
      console.log(`  ${row.sub_category_name}: ${row.third_count} 个三级分类`);
    });

    console.log("\n✓ 导入完成！");
  } catch (error) {
    console.error("✗ 发生错误:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n✓ 数据库连接已关闭");
    }
  }
}

// 执行导入
if (require.main === module) {
  importThirdCategories()
    .then(() => {
      console.log("\n脚本执行完成");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n脚本执行失败:", error);
      process.exit(1);
    });
}

module.exports = { importThirdCategories };
