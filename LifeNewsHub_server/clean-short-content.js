/**
 * 删除 info 表中 content 字段字符数小于 3000 的记录
 */

require("dotenv").config();
const { query } = require("./src/config/database");

async function cleanShortContent() {
  try {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  开始清理短内容文章");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // 1. 查询符合条件的记录数量
    console.log("→ 正在统计需要删除的记录...\n");

    const countSql = `
      SELECT COUNT(*) as count 
      FROM info 
      WHERE CHAR_LENGTH(content) < 3000
    `;

    const countResult = await query(countSql);
    const totalCount = countResult[0].count;

    if (totalCount === 0) {
      console.log("✓ 没有找到需要删除的记录（content < 3000 字符）");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      return;
    }

    console.log(`⚠ 找到 ${totalCount} 条记录需要删除\n`);

    // 2. 显示一些示例记录
    console.log("→ 示例记录（前5条）:\n");

    const sampleSql = `
      SELECT id, title, CHAR_LENGTH(content) as content_length 
      FROM info 
      WHERE CHAR_LENGTH(content) < 3000 
      LIMIT 5
    `;

    const samples = await query(sampleSql);
    samples.forEach((record, index) => {
      console.log(`  ${index + 1}. ID: ${record.id}`);
      console.log(`     标题: ${record.title.substring(0, 50)}...`);
      console.log(`     内容长度: ${record.content_length} 字符\n`);
    });

    // 3. 执行删除操作
    console.log("→ 开始删除记录...\n");

    const deleteSql = `
      DELETE FROM info 
      WHERE CHAR_LENGTH(content) < 3000
    `;

    const deleteResult = await query(deleteSql);
    const deletedCount = deleteResult.affectedRows;

    // 4. 显示结果
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  清理完成");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`  ✓ 成功删除: ${deletedCount} 条记录`);
    console.log(`  条件: content 字符数 < 3000`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("\n✗ 发生错误:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行清理
cleanShortContent();
