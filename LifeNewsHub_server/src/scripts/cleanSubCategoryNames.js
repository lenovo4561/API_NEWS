const mysql = require("mysql2/promise");
require("dotenv").config({
  path: require("path").join(__dirname, "..", "..", ".env"),
});

/**
 * 清理 category_sub 表中包含特殊字符的记录
 */

async function cleanSubCategoryNames() {
  let connection;

  try {
    console.log("=== Cleaning category_sub table ===\n");

    // 连接到数据库
    console.log("Connecting to MySQL server...");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "Information",
    });
    console.log("✓ Connected to MySQL server\n");

    // 查找包含特殊字符的记录
    console.log("Searching for records with special characters...");
    const [problematicRecords] = await connection.query(`
      SELECT 
        cs.id,
        cs.sub_category_key,
        cs.name,
        cm.category_key as main_category_key,
        cm.name as main_category_name
      FROM category_sub cs
      JOIN category_main cm ON cs.main_category_id = cm.id
      WHERE cs.name LIKE '%\`%' 
         OR cs.name LIKE '%]%'
         OR cs.name LIKE '%,%'
         OR cs.name REGEXP '[^a-zA-Z0-9\u4e00-\u9fa5 _-]'
      ORDER BY cs.id
    `);

    if (problematicRecords.length === 0) {
      console.log("✓ No records with special characters found!\n");
      return;
    }

    console.log(
      `✗ Found ${problematicRecords.length} records with special characters:\n`
    );
    console.table(problematicRecords);

    // 修复每条记录
    console.log("\n=== Fixing records ===\n");
    let fixedCount = 0;

    for (const record of problematicRecords) {
      let cleanedName = record.name;

      // 移除反引号、逗号、方括号等特殊字符
      cleanedName = cleanedName
        .replace(/[`\[\],;]/g, "") // 移除特殊字符
        .trim(); // 移除首尾空格

      if (cleanedName !== record.name && cleanedName.length > 0) {
        const updateSQL = `
          UPDATE category_sub
          SET name = ?
          WHERE id = ?
        `;
        await connection.query(updateSQL, [cleanedName, record.id]);
        console.log(
          `✓ Fixed ID ${record.id}: "${record.name}" -> "${cleanedName}"`
        );
        fixedCount++;
      } else if (cleanedName.length === 0) {
        console.log(
          `⚠ Warning: ID ${record.id} "${record.name}" would become empty, skipping`
        );
      }
    }

    console.log(`\n✓ Fixed ${fixedCount} records`);

    // 显示修复后的统计
    console.log("\n=== Verification ===");
    const [stillProblematic] = await connection.query(`
      SELECT COUNT(*) as count
      FROM category_sub
      WHERE name LIKE '%\`%' 
         OR name LIKE '%]%'
         OR name LIKE '%,%'
    `);

    if (stillProblematic[0].count === 0) {
      console.log("✓ All special characters removed!\n");
    } else {
      console.log(
        `⚠ Still ${stillProblematic[0].count} records with special characters\n`
      );
    }

    // 显示最终统计
    console.log("=== Final Statistics ===");
    const [stats] = await connection.query(`
      SELECT 
        cm.category_key,
        cm.name as main_category,
        COUNT(cs.id) as sub_count
      FROM category_main cm
      LEFT JOIN category_sub cs ON cm.id = cs.main_category_id
      GROUP BY cm.id, cm.category_key, cm.name
      ORDER BY cm.category_key
    `);
    console.table(stats);

    console.log("\n✓ Cleaning completed successfully!");
  } catch (error) {
    console.error("\n✗ Error during cleaning:", error.message);
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
  cleanSubCategoryNames().then(() => {
    console.log("\n=== Cleaning script completed ===");
    process.exit(0);
  });
}

module.exports = { cleanSubCategoryNames };
