const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const { query, queryOne } = require("../config/database");

async function testQueries() {
  try {
    console.log("Testing database queries...\n");

    // 测试1: 查询所有记录
    console.log("1. Testing SELECT all:");
    const allRecords = await query("SELECT * FROM info");
    console.log(`Found ${allRecords.length} records`);
    console.log(allRecords);

    // 测试2: 带参数查询
    console.log("\n2. Testing SELECT with parameters:");
    const recordsWithStatus = await query(
      "SELECT * FROM info WHERE status = ?",
      [1]
    );
    console.log(`Found ${recordsWithStatus.length} records with status=1`);

    // 测试3: 测试分页查询
    console.log("\n3. Testing paginated query:");
    const limit = 10;
    const offset = 0;
    const paginatedRecords = await query(
      `SELECT * FROM info WHERE status = ? ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      [1]
    );
    console.log(`Found ${paginatedRecords.length} records in page 1`);

    // 测试4: 测试 COUNT
    console.log("\n4. Testing COUNT:");
    const countResult = await queryOne(
      "SELECT COUNT(*) as total FROM info WHERE status = ?",
      [1]
    );
    console.log(`Total count: ${countResult.total}`);

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    process.exit(0);
  }
}

testQueries();
