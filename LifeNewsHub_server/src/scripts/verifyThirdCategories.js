/**
 * 验证三级分类的层级关系和数据完整性
 */

require("dotenv").config();
/**
































































































































































































































































































































































































- [DATABASE.md](DATABASE.md) - 数据库结构文档- [CATEGORY_API.md](CATEGORY_API.md) - 分类 API 文档- [THIRD_CATEGORIES.md](THIRD_CATEGORIES.md) - 三级分类详细说明## 相关文档5. **日志查看**: 导入过程会输出详细日志，注意查看错误信息4. **增量更新**: 脚本支持增量更新，不会重复插入已存在的记录3. **翻译质量**: 初次导入后检查翻译质量，必要时手动调整2. **检查依赖**: 确保三个表的外键关系正确1. **备份数据**: 执行导入前务必备份数据库## 注意事项A: 这是正常的，因为需要处理大量数据（约2000+三级分类）。通常需要1-2分钟。### Q: 脚本执行很慢？```mysql -u root -p information < backup_categories.sql```bashA: 使用备份的 SQL 文件：### Q: 如何恢复数据？A: 运行验证脚本 `verifyThirdCategories.js` 检查问题，查看是否有孤立记录。### Q: 导入后发现层级关系错误？A: 编辑 `importAllThirdCategoriesWithTranslation.js` 中的 `translationMap` 对象，添加英文-中文映射。### Q: 如何添加新的翻译？A: 这是正常的，脚本会跳过已存在的记录。如果需要完全重建，使用 `--clear` 参数。### Q: 导入时提示重复键错误？## 常见问题```ORDER BY COUNT(ct.id) DESC;GROUP BY cm.id, cm.nameLEFT JOIN category_third ct ON cs.id = ct.sub_category_idLEFT JOIN category_sub cs ON cm.id = cs.main_category_idFROM category_main cm  COUNT(ct.id) as 三级分类数量  cm.name as 一级分类,SELECT ```sql### 统计各一级分类的三级分类数量```WHERE ct.id = 1;JOIN category_main cm ON cs.main_category_id = cm.idJOIN category_sub cs ON ct.sub_category_id = cs.idFROM category_third ct  CONCAT(cm.name, ' > ', cs.name, ' > ', ct.name) as 中文路径  CONCAT(cm.category_key, '/', cs.sub_category_key, '/', ct.third_category_key) as 完整路径,SELECT ```sql### 查询三级分类的完整路径```ORDER BY cs.sort_order, ct.sort_order;WHERE cm.category_key = 'Health'JOIN category_main cm ON cs.main_category_id = cm.idJOIN category_sub cs ON ct.sub_category_id = cs.idFROM category_third ct  ct.third_category_key as 英文标识  ct.name as 三级分类,  cs.name as 二级分类,  cm.name as 一级分类,SELECT ```sql### 查询特定一级分类下的所有三级分类## 查询示例```    └── Graphic_Designers (平面设计师)    ├── Education (教育)└── Graphic_Design (平面设计)│   └── Virtual_Reality (虚拟现实)│   ├── Net_Art (网络艺术)├── Digital (数字艺术)│   └── Piercing (穿孔)│   ├── Tattoo (纹身)│   ├── Bodypainting (身体彩绘)│   ├── Articles (文章)├── Bodyart (人体彩绘)Arts (艺术)```### 示例 2: Arts 分类```    └── Pharmacology (药理学)    ├── Facilities (医疗设施)    ├── Surgery (外科)    ├── Medical_Specialties (医疗专科)└── Medicine (医学)Health (健康)```### 示例 1: Health 分类## 层级关系示例```);  FOREIGN KEY (`sub_category_id`) REFERENCES `category_sub` (`id`) ON DELETE CASCADE  UNIQUE KEY `uk_sub_third_key` (`sub_category_id`, `third_category_key`),  PRIMARY KEY (`id`),  `status` tinyint DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',  `sort_order` int DEFAULT 0 COMMENT '排序顺序',  `description` varchar(500) COMMENT '分类描述',  `name` varchar(100) NOT NULL COMMENT '第三级分类名称',  `sub_category_id` int NOT NULL COMMENT '所属子分类ID',  `third_category_key` varchar(50) COMMENT '第三级分类英文标识',  `id` int NOT NULL AUTO_INCREMENT,CREATE TABLE `category_third` (```sql### category_third (三级分类表)```);  FOREIGN KEY (`main_category_id`) REFERENCES `category_main` (`id`) ON DELETE CASCADE  UNIQUE KEY `uk_main_sub_key` (`main_category_id`, `sub_category_key`),  PRIMARY KEY (`id`),  `status` tinyint DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',  `sort_order` int DEFAULT 0 COMMENT '排序顺序',  `description` varchar(500) COMMENT '分类描述',  `name` varchar(100) NOT NULL COMMENT '子分类名称',  `main_category_id` int NOT NULL COMMENT '所属大分类ID',  `sub_category_key` varchar(50) COMMENT '子分类英文标识',  `id` int NOT NULL AUTO_INCREMENT,CREATE TABLE `category_sub` (```sql### category_sub (二级分类表)```);  PRIMARY KEY (`id`)  `status` tinyint DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',  `sort_order` int DEFAULT 0 COMMENT '排序顺序',  `description` varchar(500) COMMENT '分类描述',  `name` varchar(100) NOT NULL COMMENT '大分类名称',  `category_key` varchar(50) UNIQUE COMMENT '分类英文标识',  `id` int NOT NULL AUTO_INCREMENT,CREATE TABLE `category_main` (```sql### category_main (一级分类表)## 数据库表结构3. 重新运行导入脚本2. 在 `translationMap` 对象中添加新的翻译映射1. 编辑 `importAllThirdCategoriesWithTranslation.js`运行导入脚本后，会输出未翻译的词汇列表。如需补充翻译：### 步骤 5: 检查未翻译词汇```node src/scripts/verifyThirdCategories.js```bash### 步骤 4: 验证结果```node src/scripts/importAllThirdCategoriesWithTranslation.js --clear```bash**完全重建方式**:```node src/scripts/importAllThirdCategoriesWithTranslation.js```bash**推荐方式（增量更新）**:### 步骤 3: 执行导入```mysqldump -u root -p information category_main category_sub category_third > backup_categories.sql# 导出当前数据```bash### 步骤 2: 备份数据库（可选但推荐）   ```   npm install   cd LifeNewsHub_server   ```bash3. 确认已安装依赖：   ```   };     database: 'information'     password: 'your_password',     user: 'root',     host: 'localhost',   module.exports = {   // src/config/database.js   ```javascript2. 确认数据库配置正确：   ```   LifeNewsHub_server/src/categories_1766374315708.json   ```1. 确认 `categories_1766374315708.json` 文件在正确位置：### 步骤 1: 准备工作## 使用步骤```      中文：健康 > 医学 > 医疗专科      层级：Health > Medicine > Medical_Specialties   1. [ID: 1]6. 具体层级关系示例：     └─ 342 个三级分类     ├─ 25 个二级分类   Health (健康)5. 完整层级结构预览：   ✓ 三级分类 key 无重复   ✓ 二级分类 key 无重复   ✓ 一级分类 key 无重复4. 重复 Key 检查：   三级分类缺少 third_category_key：0   二级分类缺少 sub_category_key：0   一级分类缺少 category_key：03. Key 字段检查：   ✓ 所有三级分类都有对应的二级分类   ✓ 所有二级分类都有对应的一级分类2. 层级完整性检查：   三级分类（启用）：1856   二级分类（启用）：247   一级分类（启用）：151. 基本统计：============================================================验证三级分类数据============================================================```**输出示例**:7. 翻译完成度检查6. 具体示例展示5. 层级结构预览4. Key 字段唯一性3. Key 字段完整性2. 层级完整性（检查孤立记录）1. 基本统计（各级分类数量）**验证项目**:```node src/scripts/verifyThirdCategories.js```bash验证脚本，用于检查数据完整性和层级关系。### 3. verifyThirdCategories.js```============================================================  更新：85  新增：1523  JSON中总计：1856三级分类：  更新：32  新增：15  JSON中总计：247二级分类：  更新：2  新增：0  JSON中总计：15一级分类：============================================================导入完成！统计信息：============================================================       └─ 三级: Medical_Specialties (Medical Specialties -> 医疗专科) ✓    ├─ 二级: Medicine (Medicine -> 医学)    ✓ 一级分类已存在 (ID: 20)    中文: 健康    英文: Health[1] 处理一级分类: Health```**输出示例**:- 可选清空现有数据- 支持更新现有分类名称- 列出未翻译的词汇- 自动中文翻译（包含常用分类映射表）- 所有基础版功能**功能**:```node src/scripts/importAllThirdCategoriesWithTranslation.js --clear# 清空现有三级分类后导入node src/scripts/importAllThirdCategoriesWithTranslation.js# 正常导入（保留现有数据）```bash增强版导入脚本，包含中文翻译功能。### 2. importAllThirdCategoriesWithTranslation.js ⭐ 推荐- 显示统计信息- 建立层级关系- 创建/更新三层分类数据- 解析 JSON 文件**功能**:```node src/scripts/importAllThirdCategories.js```bash基础版导入脚本，不包含翻译功能。### 1. importAllThirdCategories.js## 可用脚本  - `dmoz/Health/Medicine/Medical Specialties` → `Medical Specialties` → `医疗专科`- **Name 字段**: 取 label 的最后一部分，下划线替换为空格，然后翻译为中文  - `dmoz/Health/Medicine/Medical_Specialties` → `Medical_Specialties`- **Key 字段**: 取 URI 的最后一部分### 字段提取规则   - `sub_category_id`: 关联二级分类   - `name`: 从 label 提取并翻译，如 `医疗专科`   - `third_category_key`: 从 URI 提取，如 `Medical_Specialties`3. **三级分类 (category_third)**   - `main_category_id`: 关联一级分类   - `name`: 中文名称，如 `医学`   - `sub_category_key`: 从 URI 提取，如 `Medicine`2. **二级分类 (category_sub)**   - `name`: 中文名称，如 `健康`   - `category_key`: 从 URI 提取，如 `Health`1. **一级分类 (category_main)**### 三层分类层级```}  ]    }      ]        }          ]            }              "wgt": 1              "label": "dmoz/Health/Medicine/Medical Specialties",              "uri": "dmoz/Health/Medicine/Medical_Specialties",            {          "children": [          "wgt": 1,          "label": "dmoz/Health/Medicine",          "uri": "dmoz/Health/Medicine",        {      "children": [      "wgt": 1,      "label": "dmoz/Health",      "uri": "dmoz/Health",    {  "results": [{```json### JSON 数据结构## 数据结构说明本指南说明如何根据 `categories_1766374315708.json` 文件重新整理 `category_third` 表的数据及层级依赖关系。## 概述 */

const mysql = require("mysql2/promise");
const config = require("../config/database");

async function verifyThirdCategories() {
  let connection;

  try {
    connection = await mysql.createConnection(config);
    console.log("数据库连接成功\n");

    console.log("=".repeat(60));
    console.log("验证三级分类数据");
    console.log("=".repeat(60) + "\n");

    // 1. 检查基本统计
    console.log("1. 基本统计：\n");

    const [mainCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM category_main WHERE status = 1"
    );
    console.log(`   一级分类（启用）：${mainCount[0].count}`);

    const [subCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM category_sub WHERE status = 1"
    );
    console.log(`   二级分类（启用）：${subCount[0].count}`);

    const [thirdCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM category_third WHERE status = 1"
    );
    console.log(`   三级分类（启用）：${thirdCount[0].count}\n`);

    // 2. 检查层级完整性
    console.log("2. 层级完整性检查：\n");

    // 检查孤立的二级分类
    const [orphanSub] = await connection.execute(`
      SELECT cs.id, cs.name, cs.main_category_id
      FROM category_sub cs
      LEFT JOIN category_main cm ON cs.main_category_id = cm.id
      WHERE cm.id IS NULL
    `);

    if (orphanSub.length > 0) {
      console.log(
        `   ✗ 发现 ${orphanSub.length} 个孤立的二级分类（没有对应的一级分类）：`
      );
      orphanSub.forEach((row) => {
        console.log(
          `     - ID: ${row.id}, 名称: ${row.name}, 主分类ID: ${row.main_category_id}`
        );
      });
    } else {
      console.log(`   ✓ 所有二级分类都有对应的一级分类`);
    }

    // 检查孤立的三级分类
    const [orphanThird] = await connection.execute(`
      SELECT ct.id, ct.name, ct.sub_category_id
      FROM category_third ct
      LEFT JOIN category_sub cs ON ct.sub_category_id = cs.id
      WHERE cs.id IS NULL
    `);

    if (orphanThird.length > 0) {
      console.log(
        `   ✗ 发现 ${orphanThird.length} 个孤立的三级分类（没有对应的二级分类）：`
      );
      orphanThird.forEach((row) => {
        console.log(
          `     - ID: ${row.id}, 名称: ${row.name}, 子分类ID: ${row.sub_category_id}`
        );
      });
    } else {
      console.log(`   ✓ 所有三级分类都有对应的二级分类`);
    }
    console.log();

    // 3. 检查 key 字段
    console.log("3. Key 字段检查：\n");

    const [mainNoKey] = await connection.execute(
      'SELECT COUNT(*) as count FROM category_main WHERE category_key IS NULL OR category_key = ""'
    );
    console.log(`   一级分类缺少 category_key：${mainNoKey[0].count}`);

    const [subNoKey] = await connection.execute(
      'SELECT COUNT(*) as count FROM category_sub WHERE sub_category_key IS NULL OR sub_category_key = ""'
    );
    console.log(`   二级分类缺少 sub_category_key：${subNoKey[0].count}`);

    const [thirdNoKey] = await connection.execute(
      'SELECT COUNT(*) as count FROM category_third WHERE third_category_key IS NULL OR third_category_key = ""'
    );
    console.log(`   三级分类缺少 third_category_key：${thirdNoKey[0].count}\n`);

    // 4. 检查重复的 key
    console.log("4. 重复 Key 检查：\n");

    const [dupMainKey] = await connection.execute(`
      SELECT category_key, COUNT(*) as count
      FROM category_main
      WHERE category_key IS NOT NULL
      GROUP BY category_key
      HAVING count > 1
    `);

    if (dupMainKey.length > 0) {
      console.log(`   ✗ 发现 ${dupMainKey.length} 个重复的一级分类 key：`);
      dupMainKey.forEach((row) => {
        console.log(`     - ${row.category_key}: ${row.count} 次`);
      });
    } else {
      console.log(`   ✓ 一级分类 key 无重复`);
    }

    const [dupSubKey] = await connection.execute(`
      SELECT main_category_id, sub_category_key, COUNT(*) as count
      FROM category_sub
      WHERE sub_category_key IS NOT NULL
      GROUP BY main_category_id, sub_category_key
      HAVING count > 1
    `);

    if (dupSubKey.length > 0) {
      console.log(`   ✗ 发现 ${dupSubKey.length} 个重复的二级分类 key：`);
      dupSubKey.forEach((row) => {
        console.log(
          `     - 主分类${row.main_category_id}, ${row.sub_category_key}: ${row.count} 次`
        );
      });
    } else {
      console.log(`   ✓ 二级分类 key 无重复`);
    }

    const [dupThirdKey] = await connection.execute(`
      SELECT sub_category_id, third_category_key, COUNT(*) as count
      FROM category_third
      WHERE third_category_key IS NOT NULL
      GROUP BY sub_category_id, third_category_key
      HAVING count > 1
    `);

    if (dupThirdKey.length > 0) {
      console.log(`   ✗ 发现 ${dupThirdKey.length} 个重复的三级分类 key：`);
      dupThirdKey.forEach((row) => {
        console.log(
          `     - 子分类${row.sub_category_id}, ${row.third_category_key}: ${row.count} 次`
        );
      });
    } else {
      console.log(`   ✓ 三级分类 key 无重复`);
    }
    console.log();

    // 5. 显示完整的层级结构（按一级分类分组）
    console.log("5. 完整层级结构预览：\n");

    const [hierarchy] = await connection.execute(`
      SELECT 
        cm.id as main_id,
        cm.category_key as main_key,
        cm.name as main_name,
        COUNT(DISTINCT cs.id) as sub_count,
        COUNT(ct.id) as third_count
      FROM category_main cm
      LEFT JOIN category_sub cs ON cm.id = cs.main_category_id
      LEFT JOIN category_third ct ON cs.id = ct.sub_category_id
      GROUP BY cm.id, cm.category_key, cm.name
      ORDER BY cm.sort_order, cm.id
    `);

    console.log("   一级分类及其子分类数量：\n");
    hierarchy.forEach((row) => {
      console.log(`   ${row.main_key} (${row.main_name})`);
      console.log(`     ├─ ${row.sub_count} 个二级分类`);
      console.log(`     └─ ${row.third_count} 个三级分类\n`);
    });

    // 6. 显示具体示例
    console.log("6. 具体层级关系示例：\n");

    const [samples] = await connection.execute(`
      SELECT 
        cm.category_key as main_key,
        cm.name as main_name,
        cs.sub_category_key as sub_key,
        cs.name as sub_name,
        ct.third_category_key as third_key,
        ct.name as third_name,
        ct.id as third_id
      FROM category_third ct
      JOIN category_sub cs ON ct.sub_category_id = cs.id
      JOIN category_main cm ON cs.main_category_id = cm.id
      WHERE cm.category_key = 'Health'
      ORDER BY ct.id
      LIMIT 10
    `);

    if (samples.length > 0) {
      console.log("   Health 分类示例：\n");
      samples.forEach((row, index) => {
        console.log(`   ${index + 1}. [ID: ${row.third_id}]`);
        console.log(
          `      层级：${row.main_key} > ${row.sub_key} > ${row.third_key}`
        );
        console.log(
          `      中文：${row.main_name} > ${row.sub_name} > ${row.third_name}\n`
        );
      });
    }

    // 7. 检查名称翻译情况
    console.log("7. 翻译完成度检查：\n");

    // 检查可能未翻译的三级分类（名称中包含下划线的）
    const [untranslated] = await connection.execute(`
      SELECT 
        ct.id,
        ct.third_category_key,
        ct.name,
        cs.name as sub_name,
        cm.name as main_name
      FROM category_third ct
      JOIN category_sub cs ON ct.sub_category_id = cs.id
      JOIN category_main cm ON cs.main_category_id = cm.id
      WHERE ct.name LIKE '%_%'
         OR ct.name REGEXP '[A-Z][a-z]+[A-Z]'
      LIMIT 20
    `);

    if (untranslated.length > 0) {
      console.log(`   发现可能未翻译的三级分类（前20个）：\n`);
      untranslated.forEach((row) => {
        console.log(
          `   - [${row.main_name} > ${row.sub_name}] ${row.name} (key: ${row.third_category_key})`
        );
      });
      console.log();
    } else {
      console.log(`   ✓ 所有三级分类名称格式正常\n`);
    }

    console.log("=".repeat(60));
    console.log("验证完成");
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("验证失败：", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行验证
if (require.main === module) {
  verifyThirdCategories()
    .then(() => {
      console.log("✓ 验证脚本执行完成");
      process.exit(0);
    })
    .catch((error) => {
      console.error("✗ 验证脚本执行失败：", error);
      process.exit(1);
    });
}

module.exports = verifyThirdCategories;
