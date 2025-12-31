const { query } = require("./src/config/database");

async function testImageUrls() {
  try {
    // 先检查总记录数
    const countSql = `SELECT COUNT(*) as total FROM info`;
    const countResult = await query(countSql);
    console.log(`\n数据库总记录数: ${countResult[0].total}`);

    // 检查published状态的记录数
    const publishedCountSql = `SELECT COUNT(*) as total FROM info WHERE status = 'published'`;
    const publishedCount = await query(publishedCountSql);
    console.log(`status='published'的记录数: ${publishedCount[0].total}`);

    // 检查所有可能的status值
    const statusSql = `SELECT DISTINCT status, COUNT(*) as count FROM info GROUP BY status`;
    const statusResults = await query(statusSql);
    console.log("\n各种status的分布:");
    statusResults.forEach((row) => {
      console.log(`  status='${row.status}': ${row.count}条`);
    });

    // 查询前5条记录（不限制status）
    const sql = `
      SELECT id, title, image_url, status, category_key
      FROM info 
      LIMIT 5
    `;

    const results = await query(sql);

    console.log("\n=== 前5条记录 ===\n");
    results.forEach((row) => {
      console.log(`ID: ${row.id}`);
      console.log(`Title: ${row.title.substring(0, 50)}...`);
      console.log(`Image URL: ${row.image_url || "(NULL)"}`);
      console.log(`Status: ${row.status}`);
      console.log(`Category: ${row.category_key}`);
      console.log("");
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testImageUrls();
