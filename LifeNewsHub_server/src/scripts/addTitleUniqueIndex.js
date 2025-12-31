/**
 * 迁移脚本：为 info 表的 title 字段添加唯一索引
 *
 * 功能：
 * 1. 检查是否已存在标题唯一索引
 * 2. 清理重复标题（保留最早的记录）
 * 3. 添加唯一索引防止后续插入重复标题
 *
 * 使用方法：
 *   node src/scripts/addTitleUniqueIndex.js
 */

require("dotenv").config();
const mysql = require("mysql2/promise");

async function addTitleUniqueIndex() {
  let connection;

  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "Information",
    });

    console.log("✓ 数据库连接成功\n");

    // 1. 检查唯一索引是否已存在
    console.log("=== 检查标题唯一索引 ===");
    const [indexes] = await connection.query(
      "SHOW INDEX FROM info WHERE Column_name = 'title' AND Non_unique = 0"
    );

    if (indexes.length > 0) {
      console.log("⚠ 标题唯一索引已存在，无需重复添加");
      console.log(`  索引名称: ${indexes[0].Key_name}`);

      // 显示当前表状态
      const [countResult] = await connection.query(
        "SELECT COUNT(*) as total FROM info"
      );
      console.log(`\n当前 info 表共有 ${countResult[0].total} 条记录\n`);

      await connection.end();
      return;
    }

    console.log("✓ 未检测到标题唯一索引，准备添加...\n");

    // 2. 检查是否存在重复标题
    console.log("=== 检查重复标题 ===");
    const [duplicates] = await connection.query(`
      SELECT title, COUNT(*) as count, GROUP_CONCAT(id ORDER BY id) as ids
      FROM info
      GROUP BY title
      HAVING count > 1
      ORDER BY count DESC
      LIMIT 10
    `);

    if (duplicates.length > 0) {
      console.log(`⚠ 发现 ${duplicates.length} 个重复标题，显示前 10 条：\n`);
      duplicates.forEach((dup, index) => {
        const title =
          dup.title.length > 60
            ? dup.title.substring(0, 60) + "..."
            : dup.title;
        console.log(`${index + 1}. "${title}"`);
        console.log(`   重复次数: ${dup.count}, ID列表: ${dup.ids}`);
      });

      // 询问是否清理重复数据
      console.log("\n=== 清理重复标题 ===");
      console.log("将保留每个标题最早的记录（最小ID），删除其他重复记录...");

      // 获取所有重复标题的总数
      const [totalDuplicates] = await connection.query(`
        SELECT SUM(count - 1) as total_to_delete
        FROM (
          SELECT COUNT(*) as count
          FROM info
          GROUP BY title
          HAVING count > 1
        ) as duplicates
      `);

      const toDeleteCount = totalDuplicates[0].total_to_delete || 0;
      console.log(`需要删除的重复记录数: ${toDeleteCount}`);

      if (toDeleteCount > 0) {
        // 删除重复记录（保留最小ID）
        const deleteSQL = `
          DELETE i1 FROM info i1
          INNER JOIN info i2 
          WHERE i1.title = i2.title 
          AND i1.id > i2.id
        `;

        const [deleteResult] = await connection.query(deleteSQL);
        console.log(`✓ 已删除 ${deleteResult.affectedRows} 条重复记录\n`);
      }
    } else {
      console.log("✓ 未发现重复标题\n");
    }

    // 3. 添加唯一索引
    console.log("=== 添加标题唯一索引 ===");
    await connection.query(`
      ALTER TABLE info 
      ADD UNIQUE INDEX uk_title (title)
    `);

    console.log("✓ 标题唯一索引添加成功");
    console.log("  索引名称: uk_title");
    console.log("  索引字段: title");

    // 4. 显示最终状态
    console.log("\n=== 最终状态 ===");
    const [finalCount] = await connection.query(
      "SELECT COUNT(*) as total FROM info"
    );
    console.log(`info 表共有 ${finalCount[0].total} 条记录`);

    const [indexInfo] = await connection.query(`
      SHOW INDEX FROM info WHERE Column_name = 'title'
    `);
    console.log(`title 字段索引数: ${indexInfo.length}`);
    indexInfo.forEach((idx) => {
      console.log(
        `  - ${idx.Key_name} (${idx.Non_unique === 0 ? "唯一" : "非唯一"})`
      );
    });

    console.log("\n✓ 迁移完成！");
    console.log("\n说明：");
    console.log("- 数据库将自动拒绝插入重复标题的记录");
    console.log("- 建议在代码中使用 INSERT IGNORE 或处理唯一索引冲突");
  } catch (error) {
    console.error("\n✗ 迁移失败:", error.message);

    if (error.code === "ER_DUP_ENTRY") {
      console.error("\n提示：发现重复数据，请先清理重复标题后再添加唯一索引");
    }

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n✓ 数据库连接已关闭");
    }
  }
}

// 执行迁移
addTitleUniqueIndex();
