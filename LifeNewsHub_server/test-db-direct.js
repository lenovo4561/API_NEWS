require("dotenv").config();
const { query } = require("./src/config/database");

async function testDatabase() {
  try {
    console.log("\n=== 测试数据库查询 ===\n");

    // 测试1: 总记录数
    const countSql = `SELECT COUNT(*) as total FROM info`;
    const countResult = await query(countSql);
    console.log(`✓ 数据库总记录数: ${countResult[0].total}`);

    // 测试2: 各种status的分布
    const statusSql = `SELECT status, COUNT(*) as count FROM info GROUP BY status`;
    const statusResults = await query(statusSql);
    console.log("\n✓ Status分布:");
    statusResults.forEach((row) => {
      console.log(`  ${row.status || "(NULL)"}: ${row.count}条`);
    });

    // 测试3: status='published'的记录
    const publishedSql = `SELECT COUNT(*) as total FROM info WHERE status = 'published'`;
    const publishedResult = await query(publishedSql);
    console.log(`\n✓ status='published'的记录: ${publishedResult[0].total}条`);

    // 测试4: 查看表结构
    const structureSql = `DESCRIBE info`;
    const structureResults = await query(structureSql);
    console.log("\n✓ info表结构:");
    structureResults.forEach((row) => {
      console.log(`  ${row.Field} (${row.Type})`);
    });

    // 测试5: 前5条记录（使用正确的字段名）
    const dataSql = `SELECT id, title, status FROM info ORDER BY id DESC LIMIT 5`;
    const dataResults = await query(dataSql);
    console.log("\n✓ 最新5条记录:");
    dataResults.forEach((row) => {
      console.log(`\n  ID: ${row.id}`);
      console.log(`  Title: ${row.title.substring(0, 50)}...`);
      console.log(`  Status: ${row.status}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    process.exit(1);
  }
}

testDatabase();
