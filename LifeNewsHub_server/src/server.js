const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const express = require("express");
const cors = require("cors");
const newsRoutes = require("./routes/news");
const infoRoutes = require("./routes/info");
const categoryRoutes = require("./routes/category");
const languageRoutes = require("./routes/language");
const { testConnection } = require("./config/database");
const {
  requestLogger,
  responseHandler,
  notFoundHandler,
  globalErrorHandler,
  logger,
} = require("./middleware");

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// CORS 配置
const corsOrigins = process.env.CORS_ORIGINS;
const corsOptions = {
  origin:
    corsOrigins === "*" ? "*" : corsOrigins?.split(",").map((s) => s.trim()),
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "lang", "country", "site-name"],
};

// 中间件
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // 请求日志
app.use(responseHandler); // 响应处理

// API 路由
app.use("/api/news", newsRoutes);
app.use("/api/info", infoRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/languages", languageRoutes);

// 健康检查
app.get("/health", (req, res) => {
  res.success({
    status: "ok",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 根路径
app.get("/", (req, res) => {
  res.success({
    name: "LifeNewsHub Server",
    version: "2.0.0",
    description: "News API using Event Registry",
    endpoints: {
      health: "/health",
      api: "/api/news",
      info: "/api/info",
      category: "/api/category",
      languages: "/api/languages",
      categoryTree: "/api/category/tree",
      mainCategory: "/api/category/main",
      subCategory: "/api/category/sub",
      resource: "/api/news/resource",
      home: "/api/news/home",
      list: "/api/news/list",
      search: "/api/news/search",
      detail: "/api/news/detail",
      articleIds: "/api/news/article-ids",
    },
  });
});

// 404 处理
app.use(notFoundHandler);

// 错误处理中间件
app.use(globalErrorHandler);

// 启动服务器
app.listen(PORT, async () => {
  logger.success(`LifeNewsHub Server is running on http://localhost:${PORT}`);
  logger.info(`Environment: ${NODE_ENV}`);
  logger.info(`API Base URL: http://localhost:${PORT}/api/news`);
  logger.info(`Health Check: http://localhost:${PORT}/health`);

  // 测试数据库连接
  logger.info("Testing database connection...");
  await testConnection();
});
