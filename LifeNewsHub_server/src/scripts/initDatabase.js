const mysql = require("mysql2/promise");
require("dotenv").config({
  path: require("path").join(__dirname, "..", "..", ".env"),
});

// 数据库初始化脚本
async function initDatabase() {
  let connection;

  try {
    // 1. 首先连接到 MySQL（不指定数据库）
    console.log("Connecting to MySQL server...");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });
    console.log("✓ Connected to MySQL server");

    // 2. 创建数据库（如果不存在）
    console.log("\nCreating database...");
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS Information CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log('✓ Database "Information" created or already exists');

    // 3. 使用该数据库
    await connection.query("USE Information");
    console.log('✓ Using database "Information"');

    // 4. 创建大分类表
    console.log("\n=== Creating category_main table ===");
    const createMainCategorySQL = `
      CREATE TABLE IF NOT EXISTS category_main (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
        category_key VARCHAR(50) COMMENT '分类英文标识',
        name VARCHAR(100) NOT NULL COMMENT '大分类名称',
        description VARCHAR(500) COMMENT '分类描述',
        sort_order INT DEFAULT 0 COMMENT '排序顺序',
        status TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        UNIQUE KEY uk_name (name),
        UNIQUE KEY uk_category_key (category_key),
        INDEX idx_status (status),
        INDEX idx_sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='大分类表';
    `;
    await connection.query(createMainCategorySQL);
    console.log('✓ Table "category_main" created or already exists');

    // 5. 创建子分类表
    console.log("\n=== Creating category_sub table ===");
    const createSubCategorySQL = `
      CREATE TABLE IF NOT EXISTS category_sub (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
        sub_category_key VARCHAR(50) COMMENT '子分类英文标识',
        main_category_id INT NOT NULL COMMENT '所属大分类ID',
        name VARCHAR(100) NOT NULL COMMENT '子分类名称',
        description VARCHAR(500) COMMENT '分类描述',
        sort_order INT DEFAULT 0 COMMENT '排序顺序',
        status TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_main_category (main_category_id),
        INDEX idx_status (status),
        INDEX idx_sort_order (sort_order),
        UNIQUE KEY uk_main_sub (main_category_id, name),
        UNIQUE KEY uk_main_sub_key (main_category_id, sub_category_key),
        CONSTRAINT fk_main_category FOREIGN KEY (main_category_id) 
          REFERENCES category_main(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='子分类表';
    `;
    await connection.query(createSubCategorySQL);
    console.log('✓ Table "category_sub" created or already exists');

    // 6. 创建第三级分类表
    console.log("\n=== Creating category_third table ===");
    const createThirdCategorySQL = `
      CREATE TABLE IF NOT EXISTS category_third (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
        third_category_key VARCHAR(50) COMMENT '第三级分类英文标识',
        sub_category_id INT NOT NULL COMMENT '所属子分类ID',
        name VARCHAR(100) NOT NULL COMMENT '第三级分类名称',
        description VARCHAR(500) COMMENT '分类描述',
        sort_order INT DEFAULT 0 COMMENT '排序顺序',
        status TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_sub_category (sub_category_id),
        INDEX idx_status (status),
        INDEX idx_sort_order (sort_order),
        UNIQUE KEY uk_sub_third (sub_category_id, name),
        UNIQUE KEY uk_sub_third_key (sub_category_id, third_category_key),
        CONSTRAINT fk_sub_category FOREIGN KEY (sub_category_id) 
          REFERENCES category_sub(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='第三级分类表';
    `;
    await connection.query(createThirdCategorySQL);
    console.log('✓ Table "category_third" created or already exists');

    // 7. 创建/修改 info 表
    console.log("\n=== Creating/Updating info table ===");

    // 检查 info 表是否存在旧结构（有 category 字段）
    const [tables] = await connection.query("SHOW TABLES LIKE 'info'");
    if (tables.length > 0) {
      const [columns] = await connection.query(
        "SHOW COLUMNS FROM info LIKE 'category'"
      );
      if (columns.length > 0) {
        console.log("⚠ Detected old table structure, dropping table...");
        await connection.query("DROP TABLE IF EXISTS info");
        console.log("✓ Old info table dropped");
      }
    }

    const createInfoTableSQL = `
      CREATE TABLE IF NOT EXISTS info (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
        title VARCHAR(500) NOT NULL COMMENT '标题',
        content TEXT COMMENT '内容',
        main_category_id INT COMMENT '大分类ID',
        sub_category_id INT COMMENT '子分类ID',
        third_category_id INT COMMENT '第三级分类ID',
        source VARCHAR(200) COMMENT '来源',
        author VARCHAR(100) COMMENT '作者',
        publish_time DATETIME COMMENT '发布时间',
        image_url VARCHAR(500) COMMENT '图片URL',
        url VARCHAR(500) COMMENT '原文链接',
        lang VARCHAR(10) DEFAULT 'zh-CN' COMMENT '语言: zh-CN, en-US, ja-JP等',
        status TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_main_category (main_category_id),
        INDEX idx_sub_category (sub_category_id),
        INDEX idx_third_category (third_category_id),
        INDEX idx_publish_time (publish_time),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_lang (lang),
        CONSTRAINT fk_info_main_category FOREIGN KEY (main_category_id) 
          REFERENCES category_main(id) ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT fk_info_sub_category FOREIGN KEY (sub_category_id) 
          REFERENCES category_sub(id) ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT fk_info_third_category FOREIGN KEY (third_category_id) 
          REFERENCES category_third(id) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='信息表';
    `;
    await connection.query(createInfoTableSQL);
    console.log('✓ Table "info" created or already exists');

    // 7. 插入示例分类数据
    console.log("\n=== Inserting sample category data ===");

    // 插入大分类
    const insertMainCategorySQL = `
      INSERT INTO category_main (category_key, name, description, sort_order, status) 
      VALUES 
        ('Arts', '艺术', '艺术相关资讯', 1, 1),
        ('Business', '商业', '商业财经资讯', 2, 1),
        ('Computers', '计算机', '计算机技术资讯', 3, 1),
        ('Games', '游戏', '游戏娱乐资讯', 4, 1),
        ('Health', '健康', '健康养生资讯', 5, 1),
        ('Home', '家', '家居生活资讯', 6, 1),
        ('Recreation', '娱乐', '娱乐八卦资讯', 7, 1),
        ('Science', '科学', '科学研究资讯', 8, 1),
        ('Shopping', '购物', '购物消费资讯', 9, 1),
        ('Society', '社会', '社会新闻资讯', 10, 1),
        ('Sports', '运动的', '运动体育资讯', 11, 1)
      ON DUPLICATE KEY UPDATE name=name
    `;
    await connection.query(insertMainCategorySQL);
    console.log("✓ Main categories inserted");

    // 获取大分类ID
    const [mainCategories] = await connection.query(
      "SELECT id, name FROM category_main"
    );
    const categoryMap = {};
    mainCategories.forEach((cat) => {
      categoryMap[cat.name] = cat.id;
    });

    // 插入子分类
    const insertSubCategorySQL = `
      INSERT INTO category_sub (main_category_id, name, description, sort_order, status) 
      VALUES 
        (${categoryMap["艺术"]}, '绘画', '绘画艺术', 1, 1),
        (${categoryMap["艺术"]}, '音乐', '音乐艺术', 2, 1),
        (${categoryMap["艺术"]}, '舞蹈', '舞蹈艺术', 3, 1),
        (${categoryMap["商业"]}, '金融', '金融资讯', 1, 1),
        (${categoryMap["商业"]}, '投资', '投资理财', 2, 1),
        (${categoryMap["商业"]}, '创业', '创业资讯', 3, 1),
        (${categoryMap["计算机"]}, '编程', '编程开发', 1, 1),
        (${categoryMap["计算机"]}, '硬件', '硬件技术', 2, 1),
        (${categoryMap["计算机"]}, '网络', '网络技术', 3, 1),
        (${categoryMap["游戏"]}, '手游', '手机游戏', 1, 1),
        (${categoryMap["游戏"]}, '端游', '电脑游戏', 2, 1),
        (${categoryMap["游戏"]}, '主机', '主机游戏', 3, 1),
        (${categoryMap["健康"]}, '养生', '养生保健', 1, 1),
        (${categoryMap["健康"]}, '医疗', '医疗健康', 2, 1),
        (${categoryMap["健康"]}, '健身', '健身运动', 3, 1),
        (${categoryMap["家"]}, '装修', '家居装修', 1, 1),
        (${categoryMap["家"]}, '家电', '家用电器', 2, 1),
        (${categoryMap["家"]}, '家具', '家具用品', 3, 1),
        (${categoryMap["娱乐"]}, '电影', '电影资讯', 1, 1),
        (${categoryMap["娱乐"]}, '综艺', '综艺节目', 2, 1),
        (${categoryMap["娱乐"]}, '明星', '明星八卦', 3, 1),
        (${categoryMap["科学"]}, '物理', '物理科学', 1, 1),
        (${categoryMap["科学"]}, '化学', '化学科学', 2, 1),
        (${categoryMap["科学"]}, '生物', '生物科学', 3, 1),
        (${categoryMap["购物"]}, '电商', '电商购物', 1, 1),
        (${categoryMap["购物"]}, '优惠', '优惠折扣', 2, 1),
        (${categoryMap["购物"]}, '海淘', '海外购物', 3, 1),
        (${categoryMap["社会"]}, '民生', '民生新闻', 1, 1),
        (${categoryMap["社会"]}, '法制', '法制新闻', 2, 1),
        (${categoryMap["社会"]}, '教育', '教育资讯', 3, 1),
        (${categoryMap["运动的"]}, '足球', '足球运动', 1, 1),
        (${categoryMap["运动的"]}, '篮球', '篮球运动', 2, 1),
        (${categoryMap["运动的"]}, '跑步', '跑步健身', 3, 1)
      ON DUPLICATE KEY UPDATE name=name
    `;
    await connection.query(insertSubCategorySQL);
    console.log("✓ Sub categories inserted");

    // 获取子分类ID映射
    const [subCategories] = await connection.query(
      "SELECT id, name FROM category_sub"
    );
    const subCategoryMap = {};
    subCategories.forEach((cat) => {
      subCategoryMap[cat.name] = cat.id;
    });

    // 插入第三级分类
    console.log("\n=== Inserting third level categories ===");
    const insertThirdCategorySQL = `
      INSERT INTO category_third (sub_category_id, name, description, sort_order, status) 
      VALUES 
        (${subCategoryMap["编程"]}, 'JavaScript', 'JavaScript开发', 1, 1),
        (${subCategoryMap["编程"]}, 'Python', 'Python开发', 2, 1),
        (${subCategoryMap["编程"]}, 'Java', 'Java开发', 3, 1),
        (${subCategoryMap["硬件"]}, 'CPU', 'CPU处理器', 1, 1),
        (${subCategoryMap["硬件"]}, '显卡', '显卡GPU', 2, 1),
        (${subCategoryMap["硬件"]}, '内存', '内存条', 3, 1),
        (${subCategoryMap["手游"]}, '王者荣耀', '王者荣耀游戏', 1, 1),
        (${subCategoryMap["手游"]}, '和平精英', '和平精英游戏', 2, 1),
        (${subCategoryMap["手游"]}, '原神', '原神游戏', 3, 1),
        (${subCategoryMap["电影"]}, '动作片', '动作电影', 1, 1),
        (${subCategoryMap["电影"]}, '喜剧片', '喜剧电影', 2, 1),
        (${subCategoryMap["电影"]}, '科幻片', '科幻电影', 3, 1),
        (${subCategoryMap["足球"]}, '中超', '中超联赛', 1, 1),
        (${subCategoryMap["足球"]}, '英超', '英超联赛', 2, 1),
        (${subCategoryMap["足球"]}, '西甲', '西甲联赛', 3, 1)
      ON DUPLICATE KEY UPDATE name=name
    `;
    await connection.query(insertThirdCategorySQL);
    console.log("✓ Third level categories inserted");

    // 8. 插入示例信息数据
    console.log("\n=== Inserting sample info data ===");
    const [subCategoryRows] = await connection.query(
      `SELECT id FROM category_sub WHERE name = '编程' LIMIT 1`
    );
    const subCategoryId = subCategoryRows[0]?.id || null;

    const [thirdCategoryRows] = await connection.query(
      `SELECT id FROM category_third WHERE name = 'JavaScript' LIMIT 1`
    );
    const thirdCategoryId = thirdCategoryRows[0]?.id || null;

    const insertInfoSQL = `
      INSERT INTO info (title, content, main_category_id, sub_category_id, third_category_id, source, author, publish_time, status) 
      VALUES 
        ('欢迎使用 LifeNewsHub', '这是一个示例新闻内容', ${categoryMap["计算机"]}, ${subCategoryId}, ${thirdCategoryId}, 'LifeNewsHub', '管理员', NOW(), 1),
        ('数据库初始化成功', '数据库和表已成功创建', ${categoryMap["计算机"]}, ${subCategoryId}, ${thirdCategoryId}, 'System', 'Admin', NOW(), 1)
      ON DUPLICATE KEY UPDATE id=id
    `;
    await connection.query(insertInfoSQL);
    console.log("✓ Sample info data inserted");

    // 9. 显示表结构
    console.log("\n=== Table Structures ===");

    console.log("\n>>> category_main:");
    const [mainCols] = await connection.query("DESCRIBE category_main");
    console.table(mainCols);

    console.log("\n>>> category_sub:");
    const [subCols] = await connection.query("DESCRIBE category_sub");
    console.table(subCols);

    console.log("\n>>> category_third:");
    const [thirdCols] = await connection.query("DESCRIBE category_third");
    console.table(thirdCols);

    console.log("\n>>> info:");
    const [infoCols] = await connection.query("DESCRIBE info");
    console.table(infoCols);

    // 10. 验证数据
    console.log("\n=== Data Summary ===");
    const [mainCount] = await connection.query(
      "SELECT COUNT(*) as count FROM category_main"
    );
    console.log(`✓ category_main records: ${mainCount[0].count}`);

    const [subCount] = await connection.query(
      "SELECT COUNT(*) as count FROM category_sub"
    );
    console.log(`✓ category_sub records: ${subCount[0].count}`);

    const [thirdCount] = await connection.query(
      "SELECT COUNT(*) as count FROM category_third"
    );
    console.log(`✓ category_third records: ${thirdCount[0].count}`);

    const [infoCount] = await connection.query(
      "SELECT COUNT(*) as count FROM info"
    );
    console.log(`✓ info records: ${infoCount[0].count}`);

    console.log("\n✅ Database initialization completed successfully!");
    console.log("\nDatabase: Information");
    console.log("Tables: category_main, category_sub, category_third, info");
    console.log("Status: Ready to use");
  } catch (error) {
    console.error("❌ Error during database initialization:", error.message);
    console.error("Error details:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n✓ Connection closed");
    }
  }
}

// 运行初始化
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log("\nYou can now start the server with: npm start");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to initialize database:", error);
      process.exit(1);
    });
}

module.exports = { initDatabase };
