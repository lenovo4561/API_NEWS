# LifeNewsHub Server

基于 Node.js 和 Express 的新闻 API 服务，使用 Event Registry 作为数据源。

## ✨ 版本 2.0 更新

本版本采用 Express 框架进行了全面重构，提供更好的代码结构和开发体验：

- 🏗️ **MVC 架构** - 采用 Controller-Service-Route 分层架构
- 🛡️ **完善的中间件** - 错误处理、日志记录、参数验证、响应格式统一
- 🚀 **性能优化** - 内置缓存机制，减少 API 调用
- 📝 **更好的日志** - 彩色终端日志，便于调试
- 🔒 **错误处理** - 统一的错误处理和响应格式

## 功能特性

- 📰 获取新闻分类
- 🏠 获取首页数据（头条、最新、分类新闻）
- 📋 获取分类新闻列表（支持分页）
- 🔍 搜索新闻（关键词搜索）
- 📄 获取新闻详情
- 💾 文章 ID 缓存（60 分钟）
- 🌐 多语言支持

## 快速开始

### 1. 安装依赖

```bash
cd LifeNewsHub_server
npm install
```

### 2. 配置环境变量

编辑 `.env` 文件，设置你的 Event Registry API Key：

```env
EVENT_REGISTRY_API_KEY=你的API密钥
PORT=3000
NODE_ENV=development
CORS_ORIGINS=*
```

> 💡 从 [Event Registry](https://eventregistry.org) 注册获取 API Key

### 3. 启动服务

```bash
# 生产模式
npm start

# 开发模式（自动重启）
npm run dev
```

服务将在 http://localhost:3000 启动。

## 项目结构

```
LifeNewsHub_server/
├── .env                          # 环境变量配置
├── package.json                  # 项目配置
├── README.md                     # 说明文档
└── src/
    ├── server.js                 # 服务入口
    ├── config/
    │   └── categories.js         # 新闻分类配置
    ├── controllers/
    │   └── newsController.js     # 新闻控制器
    ├── middleware/
    │   ├── index.js              # 中间件导出
    │   ├── errorHandler.js       # 错误处理中间件
    │   ├── logger.js             # 日志中间件
    │   ├── validator.js          # 参数验证中间件
    │   └── response.js           # 响应处理中间件
    ├── routes/
    │   └── news.js               # 新闻路由
    ├── services/
    │   └── eventRegistry.js      # Event Registry API 服务
    └── utils/
        ├── index.js              # 工具函数导出
        ├── cache.js              # 缓存管理
        └── formatter.js          # 数据格式化
```

## API 接口

### 根路径

```
GET /
```

返回 API 基本信息和可用端点列表。

### 健康检查

```
GET /health
```

响应:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "ok",
    "environment": "development",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 123.456
  }
}
```

### 获取新闻分类

```
GET /api/news/resource
Headers:
  lang: en  (可选: en, zh, es, fr, de, ja, ko, pt, ru, ar)
```

响应:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "categories": [
      { "id": 1, "name": "Business", "uri": "news/Business", "icon": "💼" },
      { "id": 2, "name": "Technology", "uri": "news/Technology", "icon": "💻" }
    ]
  }
}
```

### 获取首页数据

```
GET /api/news/home?top_size=4
Headers:
  lang: en
Parameters:
  top_size: 头条新闻数量 (默认: 4)
```

响应:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "top_news": [...],      // 热门头条
    "latest_news": [...],   // 最新新闻
    "category_news": [...]  // 分类新闻
  }
}
```

### 获取文章 ID 列表

```
GET /api/news/article-ids?count=50&refresh=false
Headers:
  lang: en
Parameters:
  count: 返回数量 (默认: 50)
  refresh: 强制刷新缓存 (默认: false)
```

### 获取新闻列表

```
GET /api/news/list?category_id=1&page=1&page_size=10
Headers:
  lang: en
Parameters:
  category_id: 分类ID (可选)
  page: 页码 (默认: 1)
  page_size: 每页数量 (默认: 10, 最大: 100)
```

响应:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [...],
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "hasMore": true
  }
}
```

### 搜索新闻

```
GET /api/news/search?words=technology&page=1&page_size=10
Headers:
  lang: en
Parameters:
  words: 搜索关键词 (必填, 最大长度: 200)
  page: 页码 (默认: 1)
  page_size: 每页数量 (默认: 10, 最大: 100)
```

### 获取新闻详情

```
GET /api/news/detail?article_id=xxx
Headers:
  lang: en
Parameters:
  article_id: 文章ID (必填)
```

响应:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "xxx",
    "title": "Article Title",
    "body": "Full article content...",
    "image": "https://...",
    "source": "Source Name",
    "sourceUrl": "https://...",
    "author": "Author Name",
    "publishedAt": "2024-01-01T00:00:00Z",
    "category": "Technology",
    "lang": "eng",
    "concepts": ["AI", "Machine Learning"]
  }
}
```

## 错误响应格式

所有错误都返回统一格式：

```json
{
  "code": 400,
  "message": "Error message",
  "data": null
}
```

常见错误码：

- `400` - 请求参数错误
- `404` - 资源不存在
- `500` - 服务器内部错误

## 中间件说明

### 错误处理中间件

- `APIError` - 自定义错误类
- `notFoundHandler` - 404 错误处理
- `globalErrorHandler` - 全局错误处理
- `asyncHandler` - 异步错误包装器

### 日志中间件

- `requestLogger` - HTTP 请求日志（彩色输出）
- `logger` - 自定义日志工具（info, success, warning, error）

### 验证中间件

- `validatePagination` - 分页参数验证
- `validateArticleId` - 文章 ID 验证
- `validateSearchKeyword` - 搜索关键词验证
- `validateLanguage` - 语言参数验证

### 响应中间件

- `responseHandler` - 统一响应格式处理

## 缓存机制

项目内置文章 ID 缓存机制：

- 缓存时间：60 分钟
- 按语言分别缓存
- 支持强制刷新
- 自动过期清理

## Event Registry API

本服务使用以下 Event Registry API 端点：

- `POST /api/v1/article/getArticles` - 获取文章列表
- `POST /api/v1/article/getArticle` - 获取文章详情
- `POST /api/v1/article/getArticlesForTopicPage` - 获取主题页文章

详细文档: https://eventregistry.org/documentation

## 开发建议

1. 开发环境设置 `NODE_ENV=development` 以启用详细错误信息
2. 生产环境设置 `NODE_ENV=production` 以隐藏敏感信息
3. 使用 `npm run dev` 进行开发，支持热重载
4. 定期检查 Event Registry API 配额使用情况

## 技术栈

- **Node.js** - 运行时环境
- **Express** - Web 框架
- **node-fetch** - HTTP 客户端
- **dotenv** - 环境变量管理
- **cors** - 跨域资源共享

## 许可证

ISC
