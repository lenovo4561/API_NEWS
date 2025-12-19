const mysql = require("mysql2/promise");
require("dotenv").config({
  path: require("path").join(__dirname, "..", "..", ".env"),
});

async function deleteInvalidRecords() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "Information",
    });

    console.log("Finding records with special characters...");
    const [rows] = await connection.query(
      `SELECT id, sub_category_key, name, main_category_id 
       FROM category_sub 
       WHERE CHAR_LENGTH(name) <= 3 
         AND name REGEXP '[^a-zA-Z0-9\\u4e00-\\u9fa5]'`
    );
    console.table(rows);

    if (rows.length > 0) {
      console.log("\nDeleting invalid records...");
      const ids = rows.map((r) => r.id);
      const [result] = await connection.query(
        `DELETE FROM category_sub WHERE id IN (?)`,
        [ids]
      );
      console.log(`✓ Deleted ${result.affectedRows} invalid records`);
    } else {
      console.log("\n✓ No invalid records found");
    }

    // 验证
    console.log("\nVerifying...");
    const [remaining] = await connection.query(
      `SELECT COUNT(*) as count FROM category_sub`
    );
    console.log(`✓ Total remaining records: ${remaining[0].count}`);

    await connection.end();
  } catch (error) {
    console.error("Error:", error.message);
    if (connection) await connection.end();
  }
}

deleteInvalidRecords();
