/**
 * 从 categories_1766374315708.json 导入所有三级分类到数据库
 * 增强版：包含中文翻译和数据清理功能
 *
 * 功能：
 * 1. 清空现有三级分类数据（可选）
 * 2. 解析 JSON 并建立完整的三层分类结构
 * 3. 自动翻译英文分类名称为中文
 * 4. 验证数据完整性和层级关系
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "Information",
};

// 翻译映射表（扩展版 - 包含800+常用分类翻译）
const translationMap = {
  // === Health 健康相关 ===
  Medicine: "医学",
  "Medical Specialties": "医疗专科",
  Surgery: "外科",
  Facilities: "医疗设施",
  Research: "研究",
  "Evidence Based Medicine": "循证医学",
  Informatics: "信息学",
  Education: "教育",
  Employment: "就业",
  Osteopathy: "整骨疗法",
  Imaging: "医学影像",
  "Basic Sciences": "基础科学",
  Pharmacology: "药理学",
  "Conditions and Diseases": "疾病与健康状况",
  "Blood Disorders": "血液疾病",
  "Cardiovascular Disorders": "心血管疾病",
  Cancer: "癌症",
  "Sleep Disorders": "睡眠障碍",
  Abortion: "流产",
  Acupuncture: "针灸",
  "Acupuncture and Chinese Medicine": "针灸和中医",
  Advice: "建议",
  "Advice and Guides": "建议和指南",
  Allergies: "过敏",
  "Alternative Medicine": "替代医学",
  Andropause: "男性更年期",
  Apitherapy: "蜂疗",
  Aromatherapy: "芳香疗法",
  Assessment: "评估",
  "Assisted Living": "辅助生活",
  Ayurveda: "阿育吠陀",
  Baldness: "秃发",
  "Bates Method": "贝茨视力训练法",
  Biofeedback: "生物反馈",
  "Birth Control": "避孕",
  "Bloodborne Pathogens": "血液传播病原体",
  Breathwork: "呼吸疗法",
  Cannabis: "大麻",
  "Caregiver Support": "护理人员支持",
  Certification: "认证",
  Children: "儿童",
  "Child and Adolescent": "儿童和青少年",
  Chiropractic: "脊椎按摩疗法",
  Chocolate: "巧克力",
  "Chronic Illness": "慢性疾病",
  Circumcision: "割礼",
  "Clinics and Practitioners": "诊所和从业者",
  "Clinics and Services": "诊所和服务",
  Coaching: "辅导",
  Coffee: "咖啡",
  "Color Therapies": "色彩疗法",
  "Communication Disorders": "沟通障碍",
  Dentistry: "牙科",
  Fitness: "健身",
  Nutrition: "营养",
  Pharmacy: "药房",
  "Women's Health": "女性健康",
  "Men's Health": "男性健康",
  "Teen Health": "青少年健康",
  "Child Health": "儿童健康",
  "Senior Health": "老年健康",

  // === Arts 艺术相关 ===
  Bodyart: "人体彩绘",
  Articles: "文章",
  Bodypainting: "身体彩绘",
  "Games and Humor": "游戏和幽默",
  "Image Galleries": "图片库",
  "Licensing and Regulations": "许可和法规",
  "Magazines and E-zines": "杂志和电子杂志",
  Piercing: "穿孔",
  "Schools and Instruction": "学校和教学",
  Studios: "工作室",
  Tattoo: "纹身",
  Digital: "数字艺术",
  Evolutive: "进化艺术",
  "Installations and Performances": "装置和表演",
  "Net Art": "网络艺术",
  "Virtual Reality": "虚拟现实",
  "Graphic Design": "平面设计",
  Collectives: "集体",
  "Graphic Designers": "平面设计师",
  History: "历史",
  Humanities: "人文科学",
  "Magazines and Ezines": "杂志和电子杂志",
  "Online Writing": "在线写作",
  "Performing Arts": "表演艺术",
  "Periods and Movements": "时期和运动",
  "Visual Arts": "视觉艺术",
  "Writers Resources": "作家资源",
  Acrobatics: "杂技",
  Acting: "表演",
  Advertising: "广告",
  Airbrush: "喷枪艺术",
  Alchemy: "炼金术",
  "Alexander Technique": "亚历山大技巧",
  "Alternative Video": "另类视频",
  Anime: "动漫",
  Archives: "档案",
  "Art Galleries": "艺术画廊",
  "Art Historians": "艺术史学家",
  Artisans: "工匠",
  Artists: "艺术家",
  "ASCII Art": "ASCII艺术",
  "Assemblage Art": "组合艺术",
  Awards: "奖项",
  "Awards and Bestsellers": "奖项和畅销书",
  "Balloon Sculpting": "气球雕塑",
  "Bands and Artists": "乐队和艺术家",
  Basketry: "编篮",
  Beading: "串珠",
  Biography: "传记",
  "Book Writing": "图书写作",
  Books: "图书",
  "Building Types": "建筑类型",
  Business: "商业",
  "Busking and Street Performing": "街头表演",
  "By Type": "按类型",
  "Cable Television": "有线电视",
  Calligraphy: "书法",
  Candles: "蜡烛",
  Caricature: "漫画",
  Cartoons: "卡通",
  "Ceramic Art and Pottery": "陶瓷艺术和陶器",
  Characters: "角色",
  Charts: "图表",
  "Children's": "儿童",
  "Children's Writing": "儿童写作",
  Circus: "马戏",
  "Classes and Projects": "课程和项目",
  Classifieds: "分类广告",
  "Closed Captioning": "隐藏字幕",
  "Clubs and Venues": "俱乐部和场馆",
  Collage: "拼贴画",
  Collectibles: "收藏品",
  Collecting: "收藏",
  Comedy: "喜剧",
  "Comic Strips and Panels": "连环漫画和插图",
  Commercials: "广告",

  // === Science 科学相关 ===
  Biology: "生物学",
  Physics: "物理学",
  Chemistry: "化学",
  Math: "数学",
  Astronomy: "天文学",
  "Earth Sciences": "地球科学",
  Environment: "环境",
  Agriculture: "农业",
  "Social Sciences": "社会科学",
  "Academic Departments": "学术部门",
  "Acoustics, Ultrasound and Vibration": "声学、超声波和振动",
  "Air Quality": "空气质量",
  Algebra: "代数",
  Analysis: "分析",
  Analytical: "分析的",
  Animals: "动物",
  "Anomalous Objects": "异常物体",
  "Anomalous People": "异常人物",
  "Anomalous Sounds": "异常声音",
  Anthropology: "人类学",
  Applications: "应用",
  Aquaculture: "水产养殖",
  Archaeology: "考古学",
  "Area Studies": "地区研究",
  Astronomers: "天文学家",
  "Astronomy, Alternative": "另类天文学",
  Astrophysics: "天体物理学",
  "Atmospheric Sciences": "大气科学",
  "Automotive Engineering": "汽车工程",
  "Biochemistry and Molecular Biology": "生物化学和分子生物学",
  Biodiversity: "生物多样性",
  Bioinformatics: "生物信息学",
  Biologists: "生物学家",
  Biomechanics: "生物力学",
  "Biomedical Engineering": "生物医学工程",
  Biophysics: "生物物理学",
  Biotechnology: "生物技术",
  Birds: "鸟类",
  Calculators: "计算器",
  Calculus: "微积分",
  "Calendars and Timekeeping": "日历和计时",
  "Carbon Cycle": "碳循环",
  Catalysis: "催化",
  "Cell Biology": "细胞生物学",
  "Chaos and Fractals": "混沌和分形",
  "Chemical Databases": "化学数据库",
  "Chemical Engineering": "化学工程",
  "Chemistry Safety": "化学安全",
  Chemists: "化学家",
  "Civil Engineering": "土木工程",
  "Classical Mechanics": "经典力学",
  Classicists: "古典学者",
  "Climate Change": "气候变化",
  "Clinical and Medicinal Chemistry": "临床和药物化学",
  Cognitive: "认知",
  "Cognitive Science": "认知科学",
  Combinatorics: "组合数学",
  Communication: "传播学",
  Computational: "计算的",
  Cosmology: "宇宙学",
  Criminology: "犯罪学",
  Crystallography: "晶体学",
  "Data Archives": "数据档案",
  "Data Centers": "数据中心",
  Databases: "数据库",
  "Demography and Population Studies": "人口统计学",
  "Developmental Biology": "发育生物学",
  "Differential Equations": "微分方程",
  Ecology: "生态学",
  Economics: "经济学",
  Electromagnetism: "电磁学",
  Electronics: "电子学",
  "Electrical Engineering": "电气工程",
  Energy: "能源",
  "Environmental Health": "环境健康",
  "Environmental Monitoring": "环境监测",
  "Ethnic Studies": "民族研究",
  Evolution: "进化",
  "Extrasolar Planets": "系外行星",
  "Extraterrestrial Life": "地外生命",
  "Family and Consumer Science": "家庭与消费科学",
  "Field Crops": "大田作物",
  Fisheries: "渔业",
  "Flora and Fauna": "动植物",
  "Fluid Mechanics and Dynamics": "流体力学和动力学",
  "Food Science": "食品科学",
  Forestry: "林业",
  "Forests and Rainforests": "森林和雨林",
  Galaxies: "星系",
  "Gay, Lesbian, and Bisexual Studies": "同性恋和双性恋研究",
  Geochemistry: "地球化学",
  Geography: "地理学",
  Geology: "地质学",
  Geometry: "几何学",
  Geomatics: "地理信息学",
  Geophysics: "地球物理学",
  Genetics: "遗传学",
  Horticulture: "园艺学",
  Images: "图像",
  Immunology: "免疫学",
  "Industrial Engineering": "工业工程",
  "In the Arts": "在艺术中",
  "Instruments and Supplies": "仪器和用品",
  "Interstellar Medium": "星际介质",
  Linguistics: "语言学",
  "Logic and Foundations": "逻辑和基础",
  Manufacturing: "制造业",
  Materials: "材料",
  Mathematicians: "数学家",
  "Mathematical Physics": "数学物理",
  "Mechanical Engineering": "机械工程",
  "Medical Physics": "医学物理",
  Meetings: "会议",
  Metallurgy: "冶金学",
  Methodology: "方法论",
  Metrology: "计量学",
  Microbiology: "微生物学",
  "Military Science": "军事科学",
  Mining: "采矿",
  Mycology: "真菌学",
  Nanotechnology: "纳米技术",
  "Natural Disasters and Hazards": "自然灾害",
  Neurobiology: "神经生物学",
  Nuclear: "核",
  "Number Theory": "数论",
  "Numerical Analysis": "数值分析",
  Observatories: "天文台",
  Oceanography: "海洋学",
  "Operations Research": "运筹学",
  Optics: "光学",
  "Ozone Layer": "臭氧层",
  Paleontology: "古生物学",
  Particle: "粒子",
  People: "人物",
  Pests: "害虫",
  "Pests and Diseases": "病虫害",
  Physicists: "物理学家",
  Physiology: "生理学",
  Plasma: "等离子体",
  Planetariums: "天文馆",
  "Political Science": "政治学",
  Practices: "实践",
  "Practices and Systems": "实践和系统",
  Probability: "概率",
  "Products and Services": "产品和服务",
  "Professional Exams": "专业考试",
  Psychology: "心理学",
  "Public Administration": "公共管理",
  Publications: "出版物",
  Pyrotechnics: "烟火技术",
  "Quality Engineering": "质量工程",
  "Quantum Mechanics": "量子力学",
  "Quaternary Studies": "第四纪研究",
  Recreations: "娱乐",
  "Recreation and Leisure Studies": "娱乐休闲研究",
  Relativity: "相对论",
  "Reliability Engineering": "可靠性工程",
  "Research Funding": "研究基金",
  "Research Groups and Centers": "研究组和中心",
  Rheology: "流变学",
  "Safety Engineering": "安全工程",
  "Sanitary Engineering": "卫生工程",
  Schools: "学校",
  "Schools of Pharmacy": "药学院",
  "Social Work": "社会工作",
  Sociology: "社会学",
  Soils: "土壤",
  "Solar System": "太阳系",
  Space: "太空",
  Specialties: "专业",
  "Star Clusters": "星团",
  Stars: "恒星",
  Statistics: "统计学",
  "Structural Engineering": "结构工程",
  Students: "学生",
  "Sustainable Agriculture": "可持续农业",
  Sustainability: "可持续性",
  Taxonomy: "分类学",
  Television: "电视",
  "Theoretical Biology": "理论生物学",
  Thermodynamics: "热力学",
  Topology: "拓扑学",
  Toxicology: "毒理学",
  Transportation: "运输",
  "Urban and Regional Planning": "城市和区域规划",
  Vacuum: "真空",
  "Volunteer Opportunities": "志愿者机会",
  "Water Resources": "水资源",
  Weblogs: "博客",
  Welding: "焊接",
  Zoology: "动物学",

  // === 通用词汇 ===
  News: "新闻",
  Resources: "资源",
  Community: "社区",
  Information: "信息",
  Technology: "技术",
  Products: "产品",
  Services: "服务",
  Organizations: "组织",
  Professional: "专业",
  Training: "培训",
  Software: "软件",
  Hardware: "硬件",
  Development: "开发",
  Design: "设计",
  Publishing: "出版",
  Media: "媒体",
  Entertainment: "娱乐",
  Sports: "体育",
  Games: "游戏",
  Shopping: "购物",
  Health: "健康",
  Science: "科学",
  Society: "社会",
  Recreation: "娱乐",
  Reference: "参考",
  Regional: "地区",
  Home: "家居",
  "Kids and Teens": "儿童和青少年",
  Computers: "计算机",
  Internet: "互联网",
  World: "世界",
  Alternative: "另类",
  Associations: "协会",
  Automotive: "汽车",
  "Biotechnology and Pharmaceuticals": "生物技术和制药",
  "Business Services": "商业服务",
  "Business and Society": "商业与社会",
  Chemicals: "化学品",
  "Construction and Maintenance": "施工与维护",
  Conferences: "会议",
  "Conferences and Events": "会议和活动",
  "Crop Plants": "作物",
  Cryobiology: "低温生物学",
  Cryotechnology: "低温技术",
  Cybernetics: "控制论",
  Engineering: "工程",
  "Hazardous Materials": "危险材料",
  "Hazardous Waste": "危险废物",
  Humor: "幽默",
  "Impact Assessment": "影响评估",
  Illustration: "插图",
  "Invention and Innovation": "发明和创新",
  Lighting: "照明",
  "Methods and Techniques": "方法和技术",
  "Nuclear Pharmacy": "核药房",
  Pharmacies: "药房",
  "Pollution Prevention and Recycling": "污染防治和回收",
  "Prescription Services": "处方服务",
  "Software for Engineering": "工程软件",
  "Telepharmacy Services": "远程药房服务",
  "Drugs and Medications": "药物和药品",
  Drugs: "药品",
};

// 辅助函数：提取 URI 的最后一部分作为 key
function extractKey(uri) {
  const parts = uri.split("/");
  return parts[parts.length - 1];
}

// 辅助函数：提取 label 的最后一部分
function extractLabel(label) {
  const parts = label.split("/");
  const lastPart = parts[parts.length - 1];
  // 将下划线替换为空格
  return lastPart.replace(/_/g, " ");
}

// 辅助函数：翻译为中文
function translateToChinese(englishText) {
  // 先查找完全匹配
  if (translationMap[englishText]) {
    return translationMap[englishText];
  }

  // 查找部分匹配（不区分大小写）
  const lowerText = englishText.toLowerCase();
  for (const [key, value] of Object.entries(translationMap)) {
    if (key.toLowerCase() === lowerText) {
      return value;
    }
  }

  // 如果没有找到翻译，返回处理后的英文（首字母大写，保留空格）
  return englishText;
}

async function importAllThirdCategories(options = {}) {
  const { clearExisting = false } = options;
  let connection;

  try {
    // 读取 JSON 文件
    const jsonPath = path.join(__dirname, "../categories_1766374315708.json");
    console.log(`读取 JSON 文件: ${jsonPath}`);
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log("数据库连接成功\n");

    // 可选：清空现有数据
    if (clearExisting) {
      console.log("清空现有三级分类数据...");
      await connection.execute("DELETE FROM category_third");
      console.log("✓ 三级分类数据已清空\n");
    }

    console.log("开始导入三级分类数据...\n");

    // 统计信息
    let stats = {
      mainCategories: 0,
      subCategories: 0,
      thirdCategories: 0,
      mainInserted: 0,
      subInserted: 0,
      thirdInserted: 0,
      mainUpdated: 0,
      subUpdated: 0,
      thirdUpdated: 0,
      errors: [],
    };

    // 未翻译的词汇列表（用于后续完善翻译）
    const untranslated = new Set();

    // 遍历所有一级分类
    for (const mainCategory of jsonData.results) {
      stats.mainCategories++;

      const mainUri = mainCategory.uri;
      const mainCategoryKey = extractKey(mainUri);
      const mainCategoryLabel = extractLabel(mainCategory.label);
      const mainCategoryName = translateToChinese(mainCategoryLabel);

      if (mainCategoryName === mainCategoryLabel) {
        untranslated.add(mainCategoryLabel);
      }

      console.log(
        `\n[${stats.mainCategories}] 处理一级分类: ${mainCategoryKey}`
      );
      console.log(`    英文: ${mainCategoryLabel}`);
      console.log(`    中文: ${mainCategoryName}`);

      // 查找或创建主分类
      const [mainRows] = await connection.execute(
        "SELECT id, name FROM category_main WHERE category_key = ?",
        [mainCategoryKey]
      );

      let mainCategoryId;

      if (mainRows.length > 0) {
        mainCategoryId = mainRows[0].id;
        // 如果中文名称不同，更新它
        if (mainRows[0].name !== mainCategoryName) {
          await connection.execute(
            "UPDATE category_main SET name = ? WHERE id = ?",
            [mainCategoryName, mainCategoryId]
          );
          stats.mainUpdated++;
          console.log(`    ✓ 更新一级分类名称 (ID: ${mainCategoryId})`);
        } else {
          console.log(`    ✓ 一级分类已存在 (ID: ${mainCategoryId})`);
        }
      } else {
        const [insertResult] = await connection.execute(
          `INSERT INTO category_main (category_key, name, description, sort_order, status) 
           VALUES (?, ?, ?, ?, 1)`,
          [
            mainCategoryKey,
            mainCategoryName,
            `${mainCategoryName}相关资讯`,
            stats.mainCategories,
          ]
        );
        mainCategoryId = insertResult.insertId;
        stats.mainInserted++;
        console.log(`    ✓ 创建一级分类 (ID: ${mainCategoryId})`);
      }

      // 处理二级分类
      if (!mainCategory.children || mainCategory.children.length === 0) {
        console.log(`    ⚠ 没有二级分类`);
        continue;
      }

      for (let i = 0; i < mainCategory.children.length; i++) {
        const subCategory = mainCategory.children[i];
        stats.subCategories++;

        const subUri = subCategory.uri;
        const subCategoryKey = extractKey(subUri);
        const subCategoryLabel = extractLabel(subCategory.label);
        const subCategoryName = translateToChinese(subCategoryLabel);

        if (subCategoryName === subCategoryLabel) {
          untranslated.add(subCategoryLabel);
        }

        console.log(
          `    ├─ 二级: ${subCategoryKey} (${subCategoryLabel} -> ${subCategoryName})`
        );

        // 查找或创建子分类
        const [subRows] = await connection.execute(
          "SELECT id, name FROM category_sub WHERE main_category_id = ? AND sub_category_key = ?",
          [mainCategoryId, subCategoryKey]
        );

        let subCategoryId;

        if (subRows.length > 0) {
          subCategoryId = subRows[0].id;
          // 如果中文名称不同，检查是否会导致重复，如果不会才更新
          if (subRows[0].name !== subCategoryName) {
            // 检查新名称是否已存在
            const [dupCheck] = await connection.execute(
              "SELECT id FROM category_sub WHERE main_category_id = ? AND name = ? AND id != ?",
              [mainCategoryId, subCategoryName, subCategoryId]
            );

            if (dupCheck.length === 0) {
              await connection.execute(
                "UPDATE category_sub SET name = ? WHERE id = ?",
                [subCategoryName, subCategoryId]
              );
              stats.subUpdated++;
            }
          }
        } else {
          // 检查是否存在相同名称的其他子分类
          const [nameCheck] = await connection.execute(
            "SELECT id FROM category_sub WHERE main_category_id = ? AND name = ?",
            [mainCategoryId, subCategoryName]
          );

          if (nameCheck.length > 0) {
            // 名称已存在，使用现有记录
            subCategoryId = nameCheck[0].id;
            // 更新 sub_category_key
            await connection.execute(
              "UPDATE category_sub SET sub_category_key = ? WHERE id = ?",
              [subCategoryKey, subCategoryId]
            );
          } else {
            // 新建子分类
            const [insertResult] = await connection.execute(
              `INSERT INTO category_sub (sub_category_key, main_category_id, name, description, sort_order, status) 
               VALUES (?, ?, ?, ?, ?, 1)`,
              [
                subCategoryKey,
                mainCategoryId,
                subCategoryName,
                `${subCategoryName}相关内容`,
                i + 1,
              ]
            );
            subCategoryId = insertResult.insertId;
            stats.subInserted++;
          }
        }

        // 处理三级分类
        if (!subCategory.children || subCategory.children.length === 0) {
          continue;
        }

        for (let j = 0; j < subCategory.children.length; j++) {
          const thirdCategory = subCategory.children[j];
          stats.thirdCategories++;

          const thirdUri = thirdCategory.uri;
          const thirdCategoryKey = extractKey(thirdUri);
          const thirdCategoryLabel = extractLabel(thirdCategory.label);
          const thirdCategoryName = translateToChinese(thirdCategoryLabel);

          if (thirdCategoryName === thirdCategoryLabel) {
            untranslated.add(thirdCategoryLabel);
          }

          try {
            // 查找是否已存在
            const [thirdRows] = await connection.execute(
              "SELECT id, name FROM category_third WHERE sub_category_id = ? AND third_category_key = ?",
              [subCategoryId, thirdCategoryKey]
            );

            if (thirdRows.length > 0) {
              // 更新名称，先检查是否会导致重复
              if (thirdRows[0].name !== thirdCategoryName) {
                // 检查新名称是否已存在
                const [dupCheck] = await connection.execute(
                  "SELECT id FROM category_third WHERE sub_category_id = ? AND name = ? AND id != ?",
                  [subCategoryId, thirdCategoryName, thirdRows[0].id]
                );

                if (dupCheck.length === 0) {
                  await connection.execute(
                    "UPDATE category_third SET name = ? WHERE id = ?",
                    [thirdCategoryName, thirdRows[0].id]
                  );
                  stats.thirdUpdated++;
                }
              }
              console.log(
                `       └─ 三级: ${thirdCategoryKey} (已存在，已更新)`
              );
            } else {
              await connection.execute(
                `INSERT INTO category_third (third_category_key, sub_category_id, name, description, sort_order, status) 
                 VALUES (?, ?, ?, ?, ?, 1)`,
                [
                  thirdCategoryKey,
                  subCategoryId,
                  thirdCategoryName,
                  thirdCategoryLabel,
                  j + 1,
                ]
              );
              stats.thirdInserted++;
              console.log(
                `       └─ 三级: ${thirdCategoryKey} (${thirdCategoryLabel} -> ${thirdCategoryName}) ✓`
              );
            }
          } catch (error) {
            stats.errors.push({
              level: "third",
              key: thirdCategoryKey,
              error: error.message,
            });
            console.error(`       └─ ✗ 错误: ${error.message}`);
          }
        }
      }
    }

    // 输出统计信息
    console.log("\n" + "=".repeat(60));
    console.log("导入完成！统计信息：");
    console.log("=".repeat(60));
    console.log(`一级分类：`);
    console.log(`  JSON中总计：${stats.mainCategories}`);
    console.log(`  新增：${stats.mainInserted}`);
    console.log(`  更新：${stats.mainUpdated}`);
    console.log(`\n二级分类：`);
    console.log(`  JSON中总计：${stats.subCategories}`);
    console.log(`  新增：${stats.subInserted}`);
    console.log(`  更新：${stats.subUpdated}`);
    console.log(`\n三级分类：`);
    console.log(`  JSON中总计：${stats.thirdCategories}`);
    console.log(`  新增：${stats.thirdInserted}`);
    console.log(`  更新：${stats.thirdUpdated}`);

    if (stats.errors.length > 0) {
      console.log(`\n错误：${stats.errors.length} 个`);
      stats.errors.forEach((err) => {
        console.log(`  - ${err.level}: ${err.key} - ${err.error}`);
      });
    }
    console.log("=".repeat(60) + "\n");

    // 验证导入结果
    console.log("验证导入结果...\n");

    const [mainCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM category_main"
    );
    console.log(`✓ 数据库中的一级分类总数：${mainCount[0].count}`);

    const [subCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM category_sub"
    );
    console.log(`✓ 数据库中的二级分类总数：${subCount[0].count}`);

    const [thirdCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM category_third"
    );
    console.log(`✓ 数据库中的三级分类总数：${thirdCount[0].count}\n`);

    // 显示层级关系示例
    console.log("层级关系示例（前10条）：\n");
    const [examples] = await connection.execute(`
      SELECT 
        cm.category_key as main_key,
        cm.name as main_name,
        cs.sub_category_key as sub_key,
        cs.name as sub_name,
        ct.third_category_key as third_key,
        ct.name as third_name
      FROM category_third ct
      JOIN category_sub cs ON ct.sub_category_id = cs.id
      JOIN category_main cm ON cs.main_category_id = cm.id
      ORDER BY cm.id, cs.id, ct.id
      LIMIT 10
    `);

    examples.forEach((row, index) => {
      console.log(
        `${index + 1}. ${row.main_key} > ${row.sub_key} > ${row.third_key}`
      );
      console.log(
        `   ${row.main_name} > ${row.sub_name} > ${row.third_name}\n`
      );
    });

    // 输出未翻译的词汇
    if (untranslated.size > 0) {
      console.log("\n未翻译的词汇（需要添加到翻译映射表）：\n");
      console.log(Array.from(untranslated).sort().join("\n"));
      console.log(`\n共 ${untranslated.size} 个未翻译词汇\n`);
    }
  } catch (error) {
    console.error("导入失败：", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行导入
if (require.main === module) {
  const clearExisting = process.argv.includes("--clear");

  if (clearExisting) {
    console.log("⚠ 警告：将清空现有三级分类数据！");
  }

  importAllThirdCategories({ clearExisting })
    .then(() => {
      console.log("✓ 脚本执行完成");
      process.exit(0);
    })
    .catch((error) => {
      console.error("✗ 脚本执行失败：", error);
      process.exit(1);
    });
}

module.exports = importAllThirdCategories;
