const mysql = require("mysql2/promise");
require("dotenv").config({
  path: require("path").join(__dirname, "..", "..", ".env"),
});

// 语言数据
const languages = [
  { name: "English", code: "eng" },
  { name: "Spanish", code: "spa" },
  { name: "Catalan", code: "cat" },
  { name: "Portuguese", code: "por" },
  { name: "German", code: "deu" },
  { name: "Slovene", code: "slv" },
  { name: "Italian", code: "ita" },
  { name: "Croatian", code: "hrv" },
  { name: "Serbian", code: "srp" },
  { name: "French", code: "fra" },
  { name: "Czech", code: "ces" },
  { name: "Slovak", code: "slk" },
  { name: "Basque", code: "eus" },
  { name: "Polish", code: "pol" },
  { name: "Hungarian", code: "hun" },
  { name: "Dutch", code: "nld" },
  { name: "Swedish", code: "swe" },
  { name: "Finnish", code: "fin" },
  { name: "Danish", code: "dan" },
  { name: "Greek", code: "ell" },
  { name: "Romanian", code: "ron" },
  { name: "Bulgarian", code: "bul" },
  { name: "Russian", code: "rus" },
  { name: "Arabic", code: "ara" },
  { name: "Turkish", code: "tur" },
  { name: "Indonesian", code: "ind" },
  { name: "Chinese", code: "zho" },
  { name: "Ukrainian", code: "ukr" },
  { name: "Persian", code: "fas" },
  { name: "Hindi", code: "hin" },
  { name: "Urdu", code: "urd" },
  { name: "Kannada", code: "kan" },
  { name: "Bengali", code: "ben" },
  { name: "Malayalam", code: "mal" },
  { name: "Marathi", code: "mar" },
  { name: "Tamil", code: "tam" },
  { name: "Panjabi", code: "pan" },
  { name: "Gujarati", code: "guj" },
];

// 初始化语言表
async function initLanguages() {
  let connection;

  try {
    // 连接到数据库
    console.log("Connecting to MySQL server...");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "Information",
    });
    console.log("✓ Connected to MySQL server");

    // 使用数据库
    await connection.query(`USE ${process.env.DB_NAME || "Information"}`);

    // 创建语言表
    console.log("\n=== Creating languages table ===");
    const createLanguagesSQL = `
      CREATE TABLE IF NOT EXISTS languages (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
        name VARCHAR(50) NOT NULL COMMENT '语言名称',
        code VARCHAR(10) NOT NULL COMMENT '语言代码(ISO 639-3)',
        status TINYINT DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
        sort_order INT DEFAULT 0 COMMENT '排序顺序',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        UNIQUE KEY uk_code (code),
        UNIQUE KEY uk_name (name),
        INDEX idx_status (status),
        INDEX idx_sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='语言表';
    `;
    await connection.query(createLanguagesSQL);
    console.log('✓ Table "languages" created or already exists');

    // 检查是否已有数据
    const [existingData] = await connection.query(
      "SELECT COUNT(*) as count FROM languages"
    );

    if (existingData[0].count === 0) {
      // 插入语言数据
      console.log("\n=== Inserting language data ===");
      for (let i = 0; i < languages.length; i++) {
        const lang = languages[i];
        const insertSQL = `
          INSERT INTO languages (name, code, status, sort_order)
          VALUES (?, ?, 1, ?)
        `;
        await connection.query(insertSQL, [lang.name, lang.code, i + 1]);
        console.log(`✓ Inserted: ${lang.name} (${lang.code})`);
      }
      console.log(`\n✓ Successfully inserted ${languages.length} languages`);
    } else {
      console.log(
        `\n✓ Language data already exists (${existingData[0].count} records)`
      );
    }

    // 显示所有语言
    console.log("\n=== Current languages in database ===");
    const [allLanguages] = await connection.query(
      "SELECT id, name, code, status, sort_order FROM languages ORDER BY sort_order"
    );
    console.table(allLanguages);

    console.log("\n✓ Language table initialization completed successfully!");
  } catch (error) {
    console.error("\n✗ Error initializing language table:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n✓ Database connection closed");
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initLanguages().then(() => {
    console.log("\n=== Script completed ===");
    process.exit(0);
  });
}

module.exports = { initLanguages };
