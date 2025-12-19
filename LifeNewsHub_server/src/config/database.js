const mysql = require("mysql2/promise");

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "Information",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✓ Database connection successful");
    connection.release();
    return true;
  } catch (error) {
    console.error("✗ Database connection failed:", error.message);
    return false;
  }
}

// 执行查询
async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// 获取单条记录
async function queryOne(sql, params = []) {
  const results = await query(sql, params);
  return results[0] || null;
}

// 关闭连接池
async function closePool() {
  await pool.end();
  console.log("Database pool closed");
}

module.exports = {
  pool,
  query,
  queryOne,
  testConnection,
  closePool,
};
