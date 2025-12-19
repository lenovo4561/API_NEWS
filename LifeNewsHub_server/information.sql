/*
 Navicat Premium Dump SQL

 Source Server         : Information
 Source Server Type    : MySQL
 Source Server Version : 80044 (8.0.44)
 Source Host           : localhost:3306
 Source Schema         : information

 Target Server Type    : MySQL
 Target Server Version : 80044 (8.0.44)
 File Encoding         : 65001

 Date: 19/12/2025 18:08:43
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for category_main
-- ----------------------------
DROP TABLE IF EXISTS `category_main`;
CREATE TABLE `category_main`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `category_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '分类英文标识',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '大分类名称',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '分类描述',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序顺序',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_name`(`name` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_sort_order`(`sort_order` ASC) USING BTREE,
  UNIQUE INDEX `uk_category_key`(`category_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 71 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '大分类表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of category_main
-- ----------------------------
INSERT INTO `category_main` VALUES (16, 'Arts', '艺术', '艺术相关资讯', 1, 1, '2025-12-18 15:07:46', '2025-12-19 14:26:52');
INSERT INTO `category_main` VALUES (17, 'Business', '商业', '商业财经资讯', 2, 1, '2025-12-18 15:07:46', '2025-12-19 14:26:52');
INSERT INTO `category_main` VALUES (18, 'Computers', '计算机', '计算机技术资讯', 3, 1, '2025-12-18 15:07:46', '2025-12-19 14:26:52');
INSERT INTO `category_main` VALUES (19, 'Games', '游戏', '游戏娱乐资讯', 4, 1, '2025-12-18 15:07:46', '2025-12-19 14:26:52');
INSERT INTO `category_main` VALUES (20, 'Health', '健康', '健康养生资讯', 5, 1, '2025-12-18 15:07:46', '2025-12-19 14:26:52');
INSERT INTO `category_main` VALUES (21, 'Home', '家', '家居生活资讯', 6, 1, '2025-12-18 15:07:46', '2025-12-19 14:26:52');
INSERT INTO `category_main` VALUES (22, 'Science', '科学', '科学研究资讯', 8, 1, '2025-12-18 15:07:46', '2025-12-19 14:26:52');
INSERT INTO `category_main` VALUES (23, 'Shopping', '购物', '购物消费资讯', 9, 1, '2025-12-18 15:07:46', '2025-12-19 14:26:52');
INSERT INTO `category_main` VALUES (24, 'Society', '社会', '社会新闻资讯', 10, 1, '2025-12-18 15:07:46', '2025-12-19 14:26:52');
INSERT INTO `category_main` VALUES (25, 'Sports', '运动的', '运动体育资讯', 11, 1, '2025-12-18 15:07:46', '2025-12-19 14:26:52');
INSERT INTO `category_main` VALUES (38, 'Recreation', '娱乐', '娱乐八卦资讯', 7, 1, '2025-12-18 15:14:27', '2025-12-19 14:26:52');

-- ----------------------------
-- Table structure for category_sub
-- ----------------------------
DROP TABLE IF EXISTS `category_sub`;
CREATE TABLE `category_sub`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `sub_category_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '子分类英文标识',
  `main_category_id` int NOT NULL COMMENT '所属大分类ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '子分类名称',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '分类描述',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序顺序',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_main_sub`(`main_category_id` ASC, `name` ASC) USING BTREE,
  INDEX `idx_main_category`(`main_category_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_sort_order`(`sort_order` ASC) USING BTREE,
  UNIQUE INDEX `uk_main_sub_key`(`main_category_id` ASC, `sub_category_key` ASC) USING BTREE,
  CONSTRAINT `fk_main_category` FOREIGN KEY (`main_category_id`) REFERENCES `category_main` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1187 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '子分类表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of category_sub
-- ----------------------------
INSERT INTO `category_sub` VALUES (209, 'Bodyart', 16, '人体彩绘', '人体艺术彩绘', 5, 1, '2025-12-19 14:31:53', '2025-12-19 14:31:53');
INSERT INTO `category_sub` VALUES (216, 'Digital', 16, '数字艺术', '数字艺术创作', 12, 1, '2025-12-19 14:31:53', '2025-12-19 14:31:53');
INSERT INTO `category_sub` VALUES (220, 'Graphic_Design', 16, '平面设计', '平面艺术设计', 16, 1, '2025-12-19 14:31:53', '2025-12-19 14:31:53');
INSERT INTO `category_sub` VALUES (221, 'Humanities', 16, '人文科学', '人文艺术', 17, 1, '2025-12-19 14:31:53', '2025-12-19 14:31:53');
INSERT INTO `category_sub` VALUES (224, 'Magazines_and_Ezines', 16, '杂志和电子杂志', '艺术类杂志', 20, 1, '2025-12-19 14:31:53', '2025-12-19 14:31:53');
INSERT INTO `category_sub` VALUES (227, 'Online_Writing', 16, '在线写作', '在线创作', 23, 1, '2025-12-19 14:31:53', '2025-12-19 14:31:53');
INSERT INTO `category_sub` VALUES (229, 'Performing_Arts', 16, '表演艺术', '舞台表演艺术', 25, 1, '2025-12-19 14:31:53', '2025-12-19 14:31:53');
INSERT INTO `category_sub` VALUES (230, 'Periods_and_Movements', 16, '时期和运动', '艺术流派与运动', 26, 1, '2025-12-19 14:31:53', '2025-12-19 14:31:53');
INSERT INTO `category_sub` VALUES (235, 'Visual_Arts', 16, '视觉艺术', '视觉艺术创作', 31, 1, '2025-12-19 14:31:53', '2025-12-19 14:31:53');
INSERT INTO `category_sub` VALUES (236, 'Writers_Resources', 16, '作家资源', '作家创作资源', 32, 1, '2025-12-19 14:31:53', '2025-12-19 14:31:53');
INSERT INTO `category_sub` VALUES (817, 'Aerospace_and_Defense', 17, '航空航天与国防', '航空航天与国防 (Aerospace and Defense)', 1, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (818, 'Agriculture_and_Forestry', 17, '农业和林业', '农业和林业 (Agriculture and Forestry)', 2, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (819, 'Arts_and_Entertainment', 17, '艺术与娱乐', '艺术与娱乐 (Arts and Entertainment)', 3, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (820, 'Associations', 17, '协会', '协会 (Associations)', 4, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (821, 'Automotive', 17, '汽车', '汽车 (Automotive)', 5, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (822, 'Biotechnology_and_Pharmaceuticals', 17, '生物技术和制药', '生物技术和制药 (Biotechnology and Pharmaceuticals)', 6, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (823, 'Business_Services', 17, '商业服务', '商业服务 (Business Services)', 7, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (824, 'Business_and_Society', 17, '商业与社会', '商业与社会 (Business and Society)', 8, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (825, 'Chemicals', 17, '化学品', '化学品 (Chemicals)', 9, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (826, 'Construction_and_Maintenance', 17, '施工与维护', '施工与维护 (Construction and Maintenance)', 10, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (827, 'Consumer_Goods_and_Services', 17, '消费品和服务', '消费品和服务 (Consumer Goods and Services)', 11, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (828, 'Cooperatives', 17, '合作社', '合作社 (Cooperatives)', 12, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (829, 'Customer_Service', 17, '客户服务', '客户服务 (Customer Service)', 13, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (830, 'E_Commerce', 17, '电子商务', '电子商务 (E-Commerce)', 14, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (831, 'Education_and_Training', 17, '教育和培训', '教育和培训 (Education and Training)', 15, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (832, 'Electronics_and_Electrical', 17, '电子电气', '电子电气 (Electronics and Electrical)', 16, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (833, 'Employment', 17, '就业', '就业 (Employment)', 17, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (834, 'Energy', 17, '活力', '活力 (Energy)', 18, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (835, 'Environment', 17, '环境', '环境 (Environment)', 19, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (836, 'Financial_Services', 17, '金融服务', '金融服务 (Financial Services)', 20, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (837, 'Food_and_Related_Products', 17, '食品及相关产品', '食品及相关产品 (Food and Related Products)', 21, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (838, 'Healthcare', 17, '卫生保健', '卫生保健 (Healthcare)', 22, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (839, 'Hospitality', 17, '酒店业', '酒店业 (Hospitality)', 23, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (840, 'Human_Resources', 17, '人力资源', '人力资源 (Human Resources)', 24, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (841, 'Industrial_Goods_and_Services', 17, '工业品和服务', '工业品和服务 (Industrial Goods and Services)', 25, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (842, 'Information_Services', 17, '信息服务', '信息服务 (Information Services)', 26, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (843, 'Information_Technology', 17, '信息技术', '信息技术 (Information Technology)', 27, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (844, 'International_Business_and_Trade', 17, '国际商务与贸易', '国际商务与贸易 (International Business and Trade)', 28, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (845, 'Investing', 17, '投资', '投资 (Investing)', 29, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (846, 'Major_Companies', 17, '大公司', '大公司 (Major Companies)', 30, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (847, 'Management', 17, '管理', '管理 (Management)', 31, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (848, 'Marketing_and_Advertising', 17, '市场营销与广告', '市场营销与广告 (Marketing and Advertising)', 32, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (849, 'Materials', 17, '材料', '材料 (Materials)', 33, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (850, 'Mining_and_Drilling', 17, '采矿和钻探', '采矿和钻探 (Mining and Drilling)', 34, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (851, 'Opportunities', 17, '机会', '机会 (Opportunities)', 35, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (852, 'Publishing_and_Printing', 17, '出版和印刷', '出版和印刷 (Publishing and Printing)', 36, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (853, 'Real_Estate', 17, '房地产', '房地产 (Real Estate)', 37, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (854, 'Agents_and_Agencies', 17, '资源', '资源 (Agents and Agencies)', 38, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (855, 'Appraisal', 17, '零售贸易', '零售贸易 (Appraisal)', 39, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (856, 'Commercial', 17, '电信', '电信 (Commercial)', 41, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (857, 'Conferences', 17, '纺织品和非织造布', '纺织品和非织造布 (Conferences)', 42, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (858, 'Consulting', 17, '运输与物流', '运输与物流 (Consulting)', 43, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (859, 'Development', 17, '装甲车服务', '装甲车服务 (Development)', 44, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (860, 'Inspection', 17, '公共汽车', '公共汽车 (Inspection)', 47, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (861, 'Legal', 17, '汽车共享', '汽车共享 (Legal)', 48, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (862, 'Property_Management', 17, '咨询', '咨询 (Property Management)', 50, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (863, 'Residential', 17, '快递员和信使', '快递员和信使 (Residential)', 51, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (864, 'Undeveloped_or_Vacant', 17, '海关', '海关 (Undeveloped or Vacant)', 52, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (865, 'Resources', 17, '分销和物流', '分销和物流 (Resources)', 53, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (867, 'Small_Business', 17, '车队维护', '车队维护 (Small Business)', 55, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (868, 'Telecommunications', 17, '货运代理', '货运代理 (Telecommunications)', 56, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (869, 'Textiles_and_Nonwovens', 17, '海上', '海上 (Textiles and Nonwovens)', 57, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (870, 'Transportation_and_Logistics', 17, '市场', '市场 (Transportation and Logistics)', 58, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (871, 'Wholesale_Trade', 17, '搬家服务', '搬家服务 (Wholesale Trade)', 59, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (872, 'Artificial_Intelligence', 18, '人工智能', '人工智能 (Artificial Intelligence)', 1, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (873, 'Artificial_Life', 18, '人工生命', '人工生命 (Artificial Life)', 2, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (874, 'Bulletin_Board_Systems', 18, '公告板系统', '公告板系统 (Bulletin Board Systems)', 3, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (875, 'CAD_and_CAM', 18, '计算机辅助设计与计算机辅助制造', '计算机辅助设计与计算机辅助制造 (CAD and CAM)', 4, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (876, 'Companies', 18, '公司', '公司 (Companies)', 5, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (877, 'Computer_Science', 18, '计算机科学', '计算机科学 (Computer Science)', 6, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (878, 'Data_Communications', 18, '数据通信', '数据通信 (Data Communications)', 7, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (879, 'Data_Formats', 18, '数据格式', '数据格式 (Data Formats)', 8, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (880, 'Desktop_Publishing', 18, '桌面出版', '桌面出版 (Desktop Publishing)', 9, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (881, 'E_Books', 18, '电子书', '电子书 (E-Books)', 10, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (882, 'Education', 18, '教育', '教育 (Education)', 11, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (883, 'Emulators', 18, '模拟器', '模拟器 (Emulators)', 12, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (884, 'Ethics', 18, '伦理', '伦理 (Ethics)', 13, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (885, 'Graphics', 18, '图形', '图形 (Graphics)', 14, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (886, 'Hacking', 18, '黑客攻击', '黑客攻击 (Hacking)', 15, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (887, 'Hardware', 18, '硬件', '硬件 (Hardware)', 16, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (888, 'History', 18, '历史', '历史 (History)', 17, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (889, 'Home_Automation', 18, '智能家居系统', '智能家居系统 (Home Automation)', 18, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (890, 'Human_Computer_Interaction', 18, '人机交互', '人机交互 (Human-Computer Interaction)', 19, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (891, 'Internet', 18, '互联网', '互联网 (Internet)', 20, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (892, 'Intranet', 18, '内网', '内网 (Intranet)', 21, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (893, 'Mobile_Computing', 18, '移动计算', '移动计算 (Mobile Computing)', 22, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (894, 'Multimedia', 18, '多媒体', '多媒体 (Multimedia)', 23, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (895, 'Open_Source', 18, '开源', '开源 (Open Source)', 24, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (896, 'Organizations', 18, '组织', '组织 (Organizations)', 25, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (897, 'Parallel_Computing', 18, '并行计算', '并行计算 (Parallel Computing)', 26, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (898, 'Performance_and_Capacity', 18, '性能和容量', '性能和容量 (Performance and Capacity)', 27, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (899, 'Programming', 18, '编程', '编程 (Programming)', 28, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (900, 'Robotics', 18, '机器人技术', '机器人技术 (Robotics)', 29, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (901, 'Security', 18, '安全', '安全 (Security)', 30, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (902, 'Shopping', 18, '购物', '购物 (Shopping)', 31, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (903, 'Software', 18, '软件', '软件 (Software)', 32, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (904, 'Speech_Technology', 18, '语音技术', '语音技术 (Speech Technology)', 33, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (905, 'Supercomputing', 18, '超级计算', '超级计算 (Supercomputing)', 34, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (906, 'Systems', 18, '系统', '系统 (Systems)', 35, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (907, 'Acorn', 18, '虚拟现实', '虚拟现实 (Acorn)', 36, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (909, 'Amstrad', 18, 'Amstrad', 'Amstrad (Amstrad)', 38, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (910, 'Apple', 18, 'Apple', 'Apple (Apple)', 39, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (911, 'Atari', 18, 'Atari', 'Atari (Atari)', 40, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (912, 'Commodore', 18, 'Commodore', 'Commodore (Commodore)', 41, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (913, 'HP_3000', 18, 'HP 3000', 'HP 3000 (HP 3000)', 42, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (914, 'Handhelds', 18, 'Handhelds', 'Handhelds (Handhelds)', 43, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (915, 'MSX', 18, 'MSX', 'MSX (MSX)', 44, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (916, 'Oric', 18, 'Oric', 'Oric (Oric)', 45, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (917, 'RISC_OS', 18, 'RISC OS', 'RISC OS (RISC OS)', 46, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (918, 'Sinclair', 18, 'Sinclair', 'Sinclair (Sinclair)', 47, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (919, 'Tablet_PCs', 18, 'Tablet PCs', 'Tablet PCs (Tablet PCs)', 48, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (920, 'Virtual_Reality', 18, 'Virtual Reality', 'Virtual Reality (Virtual Reality)', 49, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (921, 'Card_Games', 19, '纸牌游戏', '纸牌游戏 (Card Games)', 1, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (922, 'Coin_Op', 19, '投币式', '投币式 (Coin-Op)', 2, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (923, 'Developers_and_Publishers', 19, '开发者和发行商', '开发者和发行商 (Developers and Publishers)', 3, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (924, 'Dice', 19, '骰子', '骰子 (Dice)', 4, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (925, 'Gambling', 19, '赌博', '赌博 (Gambling)', 5, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (926, 'Game_Studies', 19, '游戏研究', '游戏研究 (Game Studies)', 6, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (927, 'Hand_Games', 19, '手牌游戏', '手牌游戏 (Hand Games)', 7, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (928, 'Hand_Eye_Coordination', 19, '手眼协调能力', '手眼协调能力 (Hand-Eye Coordination)', 8, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (929, 'History', 19, '历史', '历史 (History)', 9, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (930, 'Miniatures', 19, '微缩模型', '微缩模型 (Miniatures)', 10, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (931, 'Online', 19, '在线的', '在线的 (Online)', 11, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (932, 'Paper_and_Pencil', 19, '纸和铅笔', '纸和铅笔 (Paper and Pencil)', 12, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (933, 'Party_Games', 19, '派对游戏', '派对游戏 (Party Games)', 13, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (934, 'Play_Groups', 19, '游戏小组', '游戏小组 (Play Groups)', 14, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (935, 'Play_By_Mail', 19, '邮寄游戏', '邮寄游戏 (Play-By-Mail)', 15, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (936, 'Puzzles', 19, '谜题', '谜题 (Puzzles)', 16, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (937, 'Resources', 19, '资源', '资源 (Resources)', 17, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (938, 'Roleplaying', 19, '杂志和电子杂志', '杂志和电子杂志 (Roleplaying)', 18, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (939, 'Tile_Games', 19, '角色扮演', '角色扮演 (Tile Games)', 19, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (940, 'Trading_Card_Games', 19, '方块游戏', '方块游戏 (Trading Card Games)', 20, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (941, 'Video_Games', 19, '集换式卡牌游戏', '集换式卡牌游戏 (Video Games)', 21, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (942, 'Aging', 20, '老化', '老化 (Aging)', 1, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (943, 'Alternative', 20, '选择', '选择 (Alternative)', 2, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (944, 'Animal', 20, '动物', '动物 (Animal)', 3, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (945, 'Beauty', 20, '美丽', '美丽 (Beauty)', 4, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (946, 'Child_Health', 20, '儿童健康', '儿童健康 (Child Health)', 5, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (947, 'Conditions_and_Diseases', 20, '病症和疾病', '病症和疾病 (Conditions and Diseases)', 6, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (948, 'Dentistry', 20, '牙科', '牙科 (Dentistry)', 7, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (949, 'Education', 20, '教育', '教育 (Education)', 8, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (950, 'Fitness', 20, '健康', '健康 (Fitness)', 9, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (951, 'Home_Health', 20, '家庭护理', '家庭护理 (Home Health)', 10, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (952, 'Medicine', 20, '药品', '药品 (Medicine)', 11, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (953, 'Mens_Health', 20, '男性健康', '男性健康 (Men\'s Health)', 12, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (954, 'Mental_Health', 20, '心理健康', '心理健康 (Mental Health)', 13, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (955, 'Nursing', 20, '护理', '护理 (Nursing)', 14, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (956, 'Nutrition', 20, '营养', '营养 (Nutrition)', 15, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (957, 'Occupational_Health_and_Safety', 20, '职业健康与安全', '职业健康与安全 (Occupational Health and Safety)', 16, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (958, 'Organizations', 20, '组织', '组织 (Organizations)', 17, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (959, 'Pharmacy', 20, '药店', '药店 (Pharmacy)', 18, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (960, 'Public_Health_and_Safety', 20, '公共卫生与安全', '公共卫生与安全 (Public Health and Safety)', 19, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (961, 'Reproductive_Health', 20, '生殖健康', '生殖健康 (Reproductive Health)', 20, 1, '2025-12-19 15:29:18', '2025-12-19 15:29:18');
INSERT INTO `category_sub` VALUES (962, 'Senior_Health', 20, '老年人健康', '老年人健康 (Senior Health)', 21, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (963, 'Senses', 20, '感官', '感官 (Senses)', 22, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (964, 'Services', 20, '服务', '服务 (Services)', 23, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (965, 'Specific_Substances', 20, '特定物质', '特定物质 (Specific Substances)', 24, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (966, 'Support_Groups', 20, '互助小组', '互助小组 (Support Groups)', 25, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (967, 'Teen_Health', 20, '青少年健康', '青少年健康 (Teen Health)', 26, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (968, 'Weight_Loss', 20, '减肥', '减肥 (Weight Loss)', 27, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (969, 'Womens_Health', 20, '文章', '文章 (Women\'s Health)', 28, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (970, 'Cooking', 21, '烹饪', '烹饪 (Cooking)', 1, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (971, 'Do_It_Yourself', 21, '自己动手', '自己动手 (Do-It-Yourself)', 2, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (972, 'Emergency_Preparation', 21, '应急准备', '应急准备 (Emergency Preparation)', 3, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (973, 'Entertaining', 21, '娱乐', '娱乐 (Entertaining)', 4, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (974, 'Family', 21, '家庭', '家庭 (Family)', 5, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (975, 'Home_Improvement', 21, '家居装修', '家居装修 (Home Improvement)', 6, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (976, 'Homemaking', 21, '家政', '家政 (Homemaking)', 7, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (977, 'Homeowners', 21, '房主', '房主 (Homeowners)', 8, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (978, 'Moving_and_Relocating', 21, '搬家和搬迁', '搬家和搬迁 (Moving and Relocating)', 9, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (979, 'Personal_Finance', 21, '个人理财', '个人理财 (Personal Finance)', 10, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (980, 'Personal_Organization', 21, '个人组织', '个人组织 (Personal Organization)', 11, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (981, 'Rural_Living', 21, '乡村生活', '乡村生活 (Rural Living)', 12, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (982, 'Urban_Living', 21, '城市生活', '城市生活 (Urban Living)', 13, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (983, 'Audio', 38, '声音的', '声音的 (Audio)', 1, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (984, 'Autos', 38, '汽车', '汽车 (Autos)', 2, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (985, 'Aviation', 38, '航空', '航空 (Aviation)', 3, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (986, 'Birding', 38, '观鸟', '观鸟 (Birding)', 4, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (987, 'Boating', 38, '划船', '划船 (Boating)', 5, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (988, 'Camps', 38, '营地', '营地 (Camps)', 6, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (989, 'Climbing', 38, '攀登', '攀登 (Climbing)', 7, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (990, 'Collecting', 38, '收集', '收集 (Collecting)', 8, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (991, 'Drugs', 38, '药物', '药物 (Drugs)', 9, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (992, 'Food', 38, '食物', '食物 (Food)', 10, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (993, 'Guns', 38, '枪支', '枪支 (Guns)', 11, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (994, 'Humor', 38, '幽默', '幽默 (Humor)', 12, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (995, 'Kites', 38, '风筝', '风筝 (Kites)', 13, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (996, 'Knives', 38, '刀具', '刀具 (Knives)', 14, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (997, 'Living_History', 38, '活历史', '活历史 (Living History)', 15, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (998, 'Locks', 38, '锁', '锁 (Locks)', 16, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (999, 'Models', 38, '模型', '模型 (Models)', 17, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1000, 'Motorcycles', 38, '摩托车', '摩托车 (Motorcycles)', 18, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1001, 'Nudism', 38, '裸体主义', '裸体主义 (Nudism)', 19, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1002, 'Outdoors', 38, '户外', '户外 (Outdoors)', 20, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1003, 'Parties', 38, '政党', '政党 (Parties)', 21, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1004, 'Pets', 38, '宠物', '宠物 (Pets)', 22, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1005, 'Picture_Ratings', 38, '图片评级', '图片评级 (Picture Ratings)', 23, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1006, 'Radio', 38, '收音机', '收音机 (Radio)', 24, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1007, 'Roads_and_Highways', 38, '道路和高速公路', '道路和高速公路 (Roads and Highways)', 25, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1008, 'Scouting', 38, '侦察', '侦察 (Scouting)', 26, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1009, 'Theme_Parks', 38, '主题公园', '主题公园 (Theme Parks)', 27, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1010, 'Amusement_Centers', 38, '烟草', '烟草 (Amusement Centers)', 28, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1011, 'Attractions', 38, '火车和铁路', '火车和铁路 (Attractions)', 29, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1012, 'Defunct', 38, '艺术与图形', '艺术与图形 (Defunct)', 30, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1013, 'Disney', 38, '缆车', '缆车 (Disney)', 31, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1014, 'Guides', 38, '手推车', '手推车 (Guides)', 32, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1015, 'Individual_Parks', 38, '历史', '历史 (Individual Parks)', 33, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1016, 'Legoland', 38, '微型', '微型 (Legoland)', 34, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1017, 'Paramount', 38, '新闻和杂志', '新闻和杂志 (Paramount)', 35, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1018, 'Six_Flags', 38, '组织', '组织 (Six Flags)', 36, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1019, 'Water_Parks', 38, '照片', '照片 (Water Parks)', 37, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1020, 'Tobacco', 38, '铁路迷和火车观察', '铁路迷和火车观察 (Tobacco)', 38, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1021, 'Trains_and_Railroads', 38, '旅行', '旅行 (Trains and Railroads)', 39, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1022, 'Travel', 38, '鞭子', '鞭子 (Travel)', 40, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1024, 'Academic_Departments', 22, '农业', '农业 (Academic Departments)', 1, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1025, 'Agriculture', 22, '异常现象与另类科学', '异常现象与另类科学 (Agriculture)', 2, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1026, 'Anomalies_and_Alternative_Science', 22, '天文学', '天文学 (Anomalies and Alternative Science)', 3, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1027, 'Astronomy', 22, '生物学', '生物学 (Astronomy)', 4, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1028, 'Biology', 22, '化学', '化学 (Biology)', 5, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1029, 'Chemistry', 22, '地球科学', '地球科学 (Chemistry)', 6, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1030, 'Earth_Sciences', 22, '教育资源', '教育资源 (Earth Sciences)', 7, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1031, 'Educational_Resources', 22, '就业', '就业 (Educational Resources)', 8, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1032, 'Employment', 22, '环境', '环境 (Employment)', 9, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1033, 'Environment', 22, '仪器和耗材', '仪器和耗材 (Environment)', 10, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1034, 'Instruments_and_Supplies', 22, '数学', '数学 (Instruments and Supplies)', 11, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1035, 'Math', 22, '方法与技术', '方法与技术 (Math)', 12, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1036, 'Methods_and_Techniques', 22, '组织', '组织 (Methods and Techniques)', 13, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1037, 'Organizations', 22, '物理', '物理 (Organizations)', 14, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1038, 'Physics', 22, '出版物', '出版物 (Physics)', 15, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1039, 'Publications', 22, '研究小组和中心', '研究小组和中心 (Publications)', 16, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1040, 'Research_Groups_and_Centers', 22, '科学与社会', '科学与社会 (Research Groups and Centers)', 17, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1041, 'Science_in_Society', 22, '社会科学', '社会科学 (Science in Society)', 18, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1042, 'Social_Sciences', 22, '学术部门', '学术部门 (Social Sciences)', 19, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1043, 'Software', 22, '人类学', '人类学 (Software)', 20, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1044, 'Technology', 22, '考古学', '考古学 (Technology)', 21, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1045, 'Antiques_and_Collectibles', 23, '拍卖', '拍卖 (Antiques and Collectibles)', 1, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1046, 'Auctions', 23, '孩子们', '孩子们 (Auctions)', 2, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1047, 'Children', 23, '分类广告', '分类广告 (Children)', 3, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1048, 'Classifieds', 23, '衣服', '衣服 (Classifieds)', 4, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1049, 'Clothing', 23, '消费电子产品', '消费电子产品 (Clothing)', 5, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1050, 'Consumer_Electronics', 23, '工艺', '工艺 (Consumer Electronics)', 6, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1051, 'Crafts', 23, '丧葬', '丧葬 (Crafts)', 7, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1052, 'Death_Care', 23, '娱乐', '娱乐 (Death Care)', 8, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1053, 'Entertainment', 23, '民族和区域', '民族和区域 (Entertainment)', 9, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1054, 'Ethnic_and_Regional', 23, '花朵', '花朵 (Ethnic and Regional)', 10, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1055, 'Flowers', 23, '食物', '食物 (Flowers)', 11, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1056, 'Food', 23, '百货', '百货 (Food)', 12, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1057, 'General_Merchandise', 23, '礼物', '礼物 (General Merchandise)', 13, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1058, 'Gifts', 23, '健康', '健康 (Gifts)', 14, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1059, 'Health', 23, '假期', '假期 (Health)', 15, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1060, 'Holidays', 23, '家居与园艺', '家居与园艺 (Holidays)', 16, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1061, 'Home_and_Garden', 23, '珠宝', '珠宝 (Home and Garden)', 17, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1062, 'Jewelry', 23, '音乐', '音乐 (Jewelry)', 18, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1063, 'Music', 23, '利基市场', '利基市场 (Music)', 19, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1064, 'Niche', 23, '办公用品', '办公用品 (Niche)', 20, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1065, 'Office_Products', 23, '宠物', '宠物 (Office Products)', 21, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1066, 'Pets', 23, '摄影', '摄影 (Pets)', 22, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1067, 'Photography', 23, '出版物', '出版物 (Photography)', 23, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1068, 'Publications', 23, '图书', '图书 (Publications)', 24, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1069, 'Recreation', 23, '日历', '日历 (Recreation)', 25, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1070, 'Sports', 23, '产品目录', '产品目录 (Sports)', 26, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1071, 'Tobacco', 23, '漫画', '漫画 (Tobacco)', 27, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1072, 'Tools', 23, '数字的', '数字的 (Tools)', 28, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1073, 'Toys_and_Games', 23, '杂志', '杂志 (Toys and Games)', 29, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1074, 'Travel', 23, '杂志和电子杂志', '杂志和电子杂志 (Travel)', 30, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1075, 'Vehicles', 23, '地图', '地图 (Vehicles)', 31, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1076, 'Aircraft', 23, '大学出版社', '大学出版社 (Aircraft)', 32, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1078, 'Motorcycles', 23, '运动的', '运动的 (Motorcycles)', 34, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1079, 'Parts_and_Accessories', 23, '烟草', '烟草 (Parts and Accessories)', 35, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1080, 'Trucks_Vans_and_Sport_Utility', 23, '工具', '工具 (Trucks, Vans, and Sport Utility)', 36, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1081, 'Watercraft', 23, '玩具和游戏', '玩具和游戏 (Watercraft)', 37, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1082, 'Visual_Arts', 23, '旅行', '旅行 (Visual Arts)', 38, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1083, 'Weddings', 23, '车辆', '车辆 (Weddings)', 39, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1084, 'Activism', 24, '建议', '建议 (Activism)', 1, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1085, 'Advice', 24, '犯罪', '犯罪 (Advice)', 2, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1086, 'Crime', 24, '死亡', '死亡 (Crime)', 3, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1087, 'Death', 24, '已禁用', '已禁用 (Death)', 4, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1088, 'Disabled', 24, '民俗学', '民俗学 (Disabled)', 5, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1089, 'Folklore', 24, '未来', '未来 (Folklore)', 6, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1090, 'Future', 24, '男同性恋、女同性恋和双性恋', '男同性恋、女同性恋和双性恋 (Future)', 7, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1091, 'Gay_Lesbian_and_Bisexual', 24, '家谱', '家谱 (Gay, Lesbian, and Bisexual)', 8, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1092, 'Genealogy', 24, '政府', '政府 (Genealogy)', 9, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1093, 'Government', 24, '历史', '历史 (Government)', 10, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1094, 'History', 24, '问题', '问题 (History)', 11, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1095, 'Issues', 24, '法律', '法律 (Issues)', 12, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1096, 'Law', 24, '生活方式选择', '生活方式选择 (Law)', 13, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1097, 'Lifestyle_Choices', 24, '军队', '军队 (Lifestyle Choices)', 14, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1098, 'Military', 24, '组织', '组织 (Military)', 15, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1099, 'Organizations', 24, '超自然现象', '超自然现象 (Organizations)', 16, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1100, 'Paranormal', 24, '慈善事业', '慈善事业 (Paranormal)', 17, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1101, 'Philanthropy', 24, '哲学', '哲学 (Philanthropy)', 18, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1102, 'Philosophy', 24, '政治', '政治 (Philosophy)', 19, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1103, 'Politics', 24, '人际关系', '人际关系 (Politics)', 20, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1104, 'Relationships', 24, '宗教与灵性', '宗教与灵性 (Relationships)', 21, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1105, 'Religion_and_Spirituality', 24, '性欲', '性欲 (Religion and Spirituality)', 22, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1106, 'Sexuality', 24, '亚文化', '亚文化 (Sexuality)', 23, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1107, 'Subcultures', 24, '互助小组', '互助小组 (Subcultures)', 24, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1108, 'Support_Groups', 24, '跨性别者', '跨性别者 (Support Groups)', 25, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1109, 'Transgendered', 24, '工作', '工作 (Transgendered)', 26, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1111, 'Adventure_Racing', 25, '冒险竞速', '冒险竞速 (Adventure Racing)', 1, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1112, 'Airsoft', 25, '气枪', '气枪 (Airsoft)', 2, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1113, 'Animal_Sports', 25, '动物运动', '动物运动 (Animal Sports)', 3, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1114, 'Archery', 25, '射箭', '射箭 (Archery)', 4, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1115, 'Badminton', 25, '羽毛球', '羽毛球 (Badminton)', 5, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1116, 'Baseball', 25, '棒球', '棒球 (Baseball)', 6, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1117, 'Basketball', 25, '篮球', '篮球 (Basketball)', 7, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1118, 'Bocce', 25, '地掷球', '地掷球 (Bocce)', 8, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1119, 'Boomerang', 25, '回旋镖', '回旋镖 (Boomerang)', 9, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1120, 'Bowling', 25, '保龄球', '保龄球 (Bowling)', 10, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1121, 'Boxing', 25, '拳击', '拳击 (Boxing)', 11, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1122, 'Cheerleading', 25, '啦啦队', '啦啦队 (Cheerleading)', 12, 1, '2025-12-19 15:29:19', '2025-12-19 15:29:19');
INSERT INTO `category_sub` VALUES (1123, 'College_and_University', 25, '学院和大学', '学院和大学 (College and University)', 13, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1124, 'Cricket', 25, '蟋蟀', '蟋蟀 (Cricket)', 14, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1125, 'Croquet', 25, '槌球', '槌球 (Croquet)', 15, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1126, 'Cue_Sports', 25, '台球运动', '台球运动 (Cue Sports)', 16, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1127, 'Cycling', 25, '骑自行车', '骑自行车 (Cycling)', 17, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1128, 'Darts', 25, '飞镖', '飞镖 (Darts)', 18, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1129, 'Disabled', 25, '已禁用', '已禁用 (Disabled)', 19, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1130, 'Equestrian', 25, '马术', '马术 (Equestrian)', 20, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1131, 'Extreme_Sports', 25, '极限运动', '极限运动 (Extreme Sports)', 21, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1132, 'Fencing', 25, '击剑', '击剑 (Fencing)', 22, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1133, 'Flying_Discs', 25, '飞盘', '飞盘 (Flying Discs)', 23, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1134, 'Footbag', 25, '踢毽子', '踢毽子 (Footbag)', 24, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1135, 'Football', 25, '足球', '足球 (Football)', 25, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1136, 'Gaelic', 25, '盖尔语', '盖尔语 (Gaelic)', 26, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1137, 'Goalball', 25, '盲人门球', '盲人门球 (Goalball)', 27, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1138, 'Golf', 25, '高尔夫球', '高尔夫球 (Golf)', 28, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1139, 'Greyhound_Racing', 25, '赛狗', '赛狗 (Greyhound Racing)', 29, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1140, 'Gymnastics', 25, '体操', '体操 (Gymnastics)', 30, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1141, 'Handball', 25, '手球', '手球 (Handball)', 31, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1142, 'Hockey', 25, '曲棍球', '曲棍球 (Hockey)', 32, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1143, 'Informal_Sports', 25, '非正式体育', '非正式体育 (Informal Sports)', 33, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1144, 'Jai_Alai', 25, '回力球', '回力球 (Jai Alai)', 34, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1145, 'Kabbadi', 25, '卡巴迪', '卡巴迪 (Kabbadi)', 35, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1146, 'Korfball', 25, '篮网球', '篮网球 (Korfball)', 36, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1147, 'Lacrosse', 25, '长曲棍球', '长曲棍球 (Lacrosse)', 37, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1148, 'Laser_Games', 25, '激光游戏', '激光游戏 (Laser Games)', 38, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1149, 'Lumberjack', 25, '伐木工', '伐木工 (Lumberjack)', 39, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1150, 'Martial_Arts', 25, '武术', '武术 (Martial Arts)', 40, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1151, 'Motorsports', 25, '赛车运动', '赛车运动 (Motorsports)', 41, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1152, 'Multi_Sports', 25, '多项运动', '多项运动 (Multi-Sports)', 42, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1153, 'Netball', 25, '无挡板篮球', '无挡板篮球 (Netball)', 43, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1154, 'Officiating', 25, '裁判', '裁判 (Officiating)', 44, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1155, 'Organizations', 25, '组织', '组织 (Organizations)', 45, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1156, 'Orienteering', 25, '定向越野', '定向越野 (Orienteering)', 46, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1157, 'Paddleball', 25, '桨球', '桨球 (Paddleball)', 47, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1158, 'Paintball', 25, '彩弹射击', '彩弹射击 (Paintball)', 48, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1159, 'Pespallo', 25, '佩萨帕洛', '佩萨帕洛 (PesÃ¤pallo)', 49, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1160, 'Petanque', 25, '法式滚球', '法式滚球 (Petanque)', 51, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1161, 'Racquetball', 25, '壁球', '壁球 (Racquetball)', 52, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1162, 'Rodeo', 25, '牛仔竞技', '牛仔竞技 (Rodeo)', 53, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1163, 'Rope_Skipping', 25, '跳绳', '跳绳 (Rope Skipping)', 54, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1164, 'Rounders', 25, '板球运动员', '板球运动员 (Rounders)', 55, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1165, 'Running', 25, '跑步', '跑步 (Running)', 56, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1166, 'Sepak_Takraw', 25, '藤球', '藤球 (Sepak Takraw)', 57, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1167, 'Skateboarding', 25, '滑板', '滑板 (Skateboarding)', 58, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1168, 'Skating', 25, '溜冰', '溜冰 (Skating)', 59, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1170, 'Softball', 25, '垒球', '垒球 (Softball)', 61, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1171, 'Software', 25, '软件', '软件 (Software)', 62, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1173, 'Strength_Sports', 25, '力量运动', '力量运动 (Strength Sports)', 64, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1174, 'Table_Tennis', 25, '乒乓球', '乒乓球 (Table Tennis)', 65, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1175, 'Tchoukball', 25, '巧克球', '巧克球 (Tchoukball)', 66, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1176, 'Team_Handball', 25, '团队手球', '团队手球 (Team Handball)', 67, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1177, 'Team_Spirit', 25, '团队精神', '团队精神 (Team Spirit)', 68, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1178, 'Tennis', 25, '网球', '网球 (Tennis)', 69, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1179, 'Track_and_Field', 25, '田径', '田径 (Track and Field)', 70, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1180, 'Volleyball', 25, '排球', '排球 (Volleyball)', 71, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1181, 'Walking', 25, '步行', '步行 (Walking)', 72, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1182, 'Water_Sports', 25, '水上运动', '水上运动 (Water Sports)', 73, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1183, 'Winter_Sports', 25, '冬季运动', '冬季运动 (Winter Sports)', 74, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1184, 'Women', 25, '女性', '女性 (Women)', 75, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1185, 'Wrestling', 25, '摔角', '摔角 (Wrestling)', 76, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');
INSERT INTO `category_sub` VALUES (1186, 'Youth_and_High_School', 25, '青少年和高中', '青少年和高中 (Youth and High School)', 77, 1, '2025-12-19 15:29:20', '2025-12-19 15:29:20');

-- ----------------------------
-- Table structure for category_third
-- ----------------------------
DROP TABLE IF EXISTS `category_third`;
CREATE TABLE `category_third`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `third_category_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '第三级分类英文标识',
  `sub_category_id` int NOT NULL COMMENT '所属子分类ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '第三级分类名称',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '分类描述',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序顺序',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_sub_third`(`sub_category_id` ASC, `name` ASC) USING BTREE,
  INDEX `idx_sub_category`(`sub_category_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_sort_order`(`sort_order` ASC) USING BTREE,
  UNIQUE INDEX `uk_sub_third_key`(`sub_category_id` ASC, `third_category_key` ASC) USING BTREE,
  CONSTRAINT `fk_sub_category` FOREIGN KEY (`sub_category_id`) REFERENCES `category_sub` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 148 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '第三级分类表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of category_third
-- ----------------------------
INSERT INTO `category_third` VALUES (47, 'Articles', 209, '文章', NULL, 1, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (48, 'Bodypainting', 209, '身体彩绘', NULL, 2, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (49, 'Games_and_Humor', 209, '游戏和幽默', NULL, 3, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (50, 'Image_Galleries', 209, '图片库', NULL, 4, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (51, 'Licensing_and_Regulations', 209, '许可和法规', NULL, 5, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (52, 'Magazines_and_E_zines', 209, '杂志和电子杂志', NULL, 6, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (53, 'Piercing', 209, '穿孔', NULL, 7, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (54, 'Schools_and_Instruction', 209, '学校和教学', NULL, 8, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (55, 'Studios', 209, '工作室', NULL, 9, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (56, 'Tattoo', 209, '纹身', NULL, 10, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (57, 'Evolutive', 216, '进化艺术', NULL, 1, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (58, 'Installations_and_Performances', 216, '装置和表演', NULL, 2, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (59, 'Magazines_and_E_zines', 216, '杂志和电子杂志', NULL, 3, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (60, 'Net_Art', 216, '网络艺术', NULL, 4, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (61, 'Virtual_Reality', 216, '虚拟现实', NULL, 5, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (62, 'Collectives', 220, '集体', NULL, 1, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (63, 'Education', 220, '教育', NULL, 2, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (64, 'Employment', 220, '就业', NULL, 3, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (65, 'Graphic_Designers', 220, '平面设计师', NULL, 4, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (66, 'History', 220, '历史', NULL, 5, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (67, 'Magazines_and_E_zines', 220, '杂志和电子杂志', NULL, 6, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (68, 'Organizations', 220, '组织', NULL, 7, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (69, 'Personal_Pages', 220, '个人页面', NULL, 8, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (70, 'Software', 220, '软件', NULL, 9, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (71, 'Typography', 220, '字体设计', NULL, 10, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (72, 'Great_Books_Indices', 221, '名著索引', NULL, 1, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (73, 'Literature_in_Art', 221, '艺术中的文学', NULL, 2, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (74, 'Scholarship_and_Technology', 221, '学术和技术', NULL, 3, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (75, 'Drama', 227, '戏剧', NULL, 1, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (76, 'E_zines', 227, '电子杂志', NULL, 2, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (77, 'Fiction', 227, '小说', NULL, 3, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (78, 'Journals', 227, '期刊', NULL, 4, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (79, 'Mixed_Genre', 227, '混合流派', NULL, 5, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (80, 'Non_Fiction', 227, '非小说', NULL, 6, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (81, 'Poetry', 227, '诗歌', NULL, 7, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (82, 'Acrobatics', 229, '杂技', NULL, 1, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (83, 'Acting', 229, '表演', NULL, 2, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (84, 'Busking_and_Street_Performing', 229, '街头表演', NULL, 3, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (85, 'Circus', 229, '马戏', NULL, 4, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (86, 'Comedy', 229, '喜剧', NULL, 5, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (87, 'Dance', 229, '舞蹈', NULL, 6, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (88, 'Education', 229, '教育', NULL, 7, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (89, 'Festivals', 229, '节日', NULL, 8, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (90, 'Hypnotism', 229, '催眠', NULL, 9, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (91, 'Magic', 229, '魔术', NULL, 10, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (92, 'Organizations', 229, '组织', NULL, 11, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (93, 'Performers', 229, '表演者', NULL, 12, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (94, 'Publications', 229, '出版物', NULL, 13, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (95, 'Puppetry', 229, '木偶戏', NULL, 14, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (96, 'Storytelling', 229, '讲故事', NULL, 15, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (97, 'Stunts', 229, '特技', NULL, 16, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (98, 'Theatre', 229, '戏剧', NULL, 17, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (99, 'Venues', 229, '场馆', NULL, 18, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (100, 'Art_Nouveau', 230, '新艺术运动', NULL, 1, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (101, 'Islamic', 230, '伊斯兰', NULL, 2, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (102, 'ASCII_Art', 235, 'ASCII艺术', NULL, 1, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (103, 'Assemblage_Art', 235, '拼贴艺术', NULL, 2, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (104, 'Calligraphy', 235, '书法', NULL, 3, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (105, 'Collage', 235, '拼贴画', NULL, 4, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (106, 'Collectives', 235, '集体', NULL, 5, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (107, 'Computer_Graphics', 235, '计算机图形', NULL, 6, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (108, 'Contests', 235, '比赛', NULL, 7, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (109, 'Drawing', 235, '绘画', NULL, 8, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (110, 'Education', 235, '教育', NULL, 9, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (111, 'Environment_and_Nature', 235, '环境和自然', NULL, 10, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (112, 'Galleries', 235, '画廊', NULL, 11, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (113, 'Installation_Art', 235, '装置艺术', NULL, 12, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (114, 'Magazines_and_E_zines', 235, '杂志和电子杂志', NULL, 13, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (115, 'Mail_Art_and_Artistamps', 235, '邮件艺术和艺术邮票', NULL, 14, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (116, 'Native_and_Tribal', 235, '原住民和部落', NULL, 15, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (117, 'Object_Based_Art', 235, '物体艺术', NULL, 16, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (118, 'Organizations', 235, '组织', NULL, 17, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (120, 'Performance_Art', 235, '行为艺术', NULL, 19, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (121, 'Printmaking', 235, '版画', NULL, 20, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (122, 'Private_Dealers', 235, '私人画商', NULL, 21, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (123, 'Public_Art', 235, '公共艺术', NULL, 22, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (124, 'Research', 235, '研究', NULL, 23, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (125, 'Reviews', 235, '评论', NULL, 24, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (126, 'Sculpture', 235, '雕塑', NULL, 25, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (127, 'Site_Specific_Art', 235, '场地特定艺术', NULL, 26, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (128, 'Thematic', 235, '主题', NULL, 27, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (129, 'Book_Writing', 236, '图书写作', NULL, 1, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (130, 'Childrens_Writing', 236, '儿童写作', NULL, 2, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (131, 'Contests', 236, '比赛', NULL, 3, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (132, 'Copy_Editing', 236, '文案编辑', NULL, 4, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (133, 'FAQs_Help_and_Tutorials', 236, '常见问题和教程', NULL, 5, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (134, 'Fiction', 236, '小说', NULL, 6, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (135, 'Freelancing', 236, '自由职业', NULL, 7, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (136, 'Non_Fiction', 236, '非小说', NULL, 8, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (137, 'Online_Communities', 236, '在线社区', NULL, 9, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (138, 'Organizations', 236, '组织', NULL, 10, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (139, 'Playwriting', 236, '剧本创作', NULL, 11, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (140, 'Poetry', 236, '诗歌', NULL, 12, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (141, 'Publishing', 236, '出版', NULL, 13, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (142, 'Research', 236, '研究', NULL, 14, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (143, 'Screenwriting', 236, '编剧', NULL, 15, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (144, 'Software', 236, '软件', NULL, 16, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (145, 'Style_Guides', 236, '风格指南', NULL, 17, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (146, 'Writing_Exercises', 236, '写作练习', NULL, 18, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');
INSERT INTO `category_third` VALUES (147, 'Young_Writers', 236, '青年作家', NULL, 19, 1, '2025-12-19 16:35:02', '2025-12-19 16:35:02');

-- ----------------------------
-- Table structure for info
-- ----------------------------
DROP TABLE IF EXISTS `info`;
CREATE TABLE `info`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `title` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '内容',
  `main_category_id` int NULL DEFAULT NULL COMMENT '大分类ID',
  `sub_category_id` int NULL DEFAULT NULL COMMENT '子分类ID',
  `third_category_id` int NULL DEFAULT NULL COMMENT '第三级分类ID',
  `source` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '来源',
  `author` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '作者',
  `publish_time` datetime NULL DEFAULT NULL COMMENT '发布时间',
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '图片URL',
  `url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '原文链接',
  `lang` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'zh-CN' COMMENT '语言: zh-CN, en-US, ja-JP等',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_main_category`(`main_category_id` ASC) USING BTREE,
  INDEX `idx_sub_category`(`sub_category_id` ASC) USING BTREE,
  INDEX `idx_third_category`(`third_category_id` ASC) USING BTREE,
  INDEX `idx_publish_time`(`publish_time` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_lang`(`lang` ASC) USING BTREE,
  CONSTRAINT `fk_info_main_category` FOREIGN KEY (`main_category_id`) REFERENCES `category_main` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_info_sub_category` FOREIGN KEY (`sub_category_id`) REFERENCES `category_sub` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_info_third_category` FOREIGN KEY (`third_category_id`) REFERENCES `category_third` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of info
-- ----------------------------
INSERT INTO `info` VALUES (1, '欢迎使用 LifeNewsHub', '这是一个示例新闻内容', 18, NULL, NULL, 'LifeNewsHub', '管理员', '2025-12-18 15:14:44', NULL, NULL, 'zh-CN', 1, '2025-12-18 15:14:44', '2025-12-18 15:14:44');
INSERT INTO `info` VALUES (2, '数据库初始化成功', '数据库和表已成功创建', 18, NULL, NULL, 'System', 'Admin', '2025-12-18 15:14:44', NULL, NULL, 'zh-TW', 1, '2025-12-18 15:14:44', '2025-12-18 15:41:34');
INSERT INTO `info` VALUES (3, 'TypeScript 5.0 ???', 'TypeScript 5.0 ????????', 18, NULL, NULL, 'Tech News', '??', NULL, NULL, NULL, 'zh-CN', 1, '2025-12-18 15:23:24', '2025-12-18 15:23:24');
INSERT INTO `info` VALUES (4, '欢迎使用 LifeNewsHub', '这是一个示例新闻内容', 18, NULL, NULL, 'LifeNewsHub', '管理员', '2025-12-18 15:39:28', NULL, NULL, 'zh-CN', 1, '2025-12-18 15:39:28', '2025-12-18 15:39:28');
INSERT INTO `info` VALUES (5, '数据库初始化成功', '数据库和表已成功创建', 18, NULL, NULL, 'System', 'Admin', '2025-12-18 15:39:28', NULL, NULL, 'zh-CN', 1, '2025-12-18 15:39:28', '2025-12-18 15:39:28');
INSERT INTO `info` VALUES (6, 'English Article Test', 'This is an English content', 18, NULL, NULL, NULL, 'Test User', NULL, NULL, NULL, 'en-US', 1, '2025-12-18 15:40:55', '2025-12-18 15:40:55');
INSERT INTO `info` VALUES (7, '日本語の記事', 'これは日本語のコンテンツです', 18, NULL, NULL, NULL, 'テストユーザー', NULL, NULL, NULL, 'ja-JP', 1, '2025-12-18 15:41:02', '2025-12-18 15:41:02');

-- ----------------------------
-- Table structure for languages
-- ----------------------------
DROP TABLE IF EXISTS `languages`;
CREATE TABLE `languages`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '语言名称',
  `code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '语言代码(ISO 639-3)',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序顺序',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_code`(`code` ASC) USING BTREE,
  UNIQUE INDEX `uk_name`(`name` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_sort_order`(`sort_order` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 39 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '语言表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of languages
-- ----------------------------
INSERT INTO `languages` VALUES (1, 'English', 'eng', 1, 1, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (2, 'Spanish', 'spa', 1, 2, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (3, 'Catalan', 'cat', 1, 3, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (4, 'Portuguese', 'por', 1, 4, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (5, 'German', 'deu', 1, 5, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (6, 'Slovene', 'slv', 1, 6, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (7, 'Italian', 'ita', 1, 7, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (8, 'Croatian', 'hrv', 1, 8, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (9, 'Serbian', 'srp', 1, 9, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (10, 'French', 'fra', 1, 10, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (11, 'Czech', 'ces', 1, 11, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (12, 'Slovak', 'slk', 1, 12, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (13, 'Basque', 'eus', 1, 13, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (14, 'Polish', 'pol', 1, 14, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (15, 'Hungarian', 'hun', 1, 15, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (16, 'Dutch', 'nld', 1, 16, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (17, 'Swedish', 'swe', 1, 17, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (18, 'Finnish', 'fin', 1, 18, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (19, 'Danish', 'dan', 1, 19, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (20, 'Greek', 'ell', 1, 20, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (21, 'Romanian', 'ron', 1, 21, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (22, 'Bulgarian', 'bul', 1, 22, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (23, 'Russian', 'rus', 1, 23, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (24, 'Arabic', 'ara', 1, 24, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (25, 'Turkish', 'tur', 1, 25, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (26, 'Indonesian', 'ind', 1, 26, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (27, 'Chinese', 'zho', 1, 27, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (28, 'Ukrainian', 'ukr', 1, 28, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (29, 'Persian', 'fas', 1, 29, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (30, 'Hindi', 'hin', 1, 30, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (31, 'Urdu', 'urd', 1, 31, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (32, 'Kannada', 'kan', 1, 32, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (33, 'Bengali', 'ben', 1, 33, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (34, 'Malayalam', 'mal', 1, 34, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (35, 'Marathi', 'mar', 1, 35, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (36, 'Tamil', 'tam', 1, 36, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (37, 'Panjabi', 'pan', 1, 37, '2025-12-19 14:18:34', '2025-12-19 14:18:34');
INSERT INTO `languages` VALUES (38, 'Gujarati', 'guj', 1, 38, '2025-12-19 14:18:34', '2025-12-19 14:18:34');

SET FOREIGN_KEY_CHECKS = 1;
