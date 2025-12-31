# LifeNewsHub Server 兼容 now 项目使用指南

## 概述

LifeNewsHub_server 现已支持 now 项目的接口格式。通过 `/api/compatible` 路径提供的接口完全兼容 now 项目原有的数据结构，无需修改前端业务逻辑，只需替换接口地址即可。

## 快速开始

### 1. 启动 LifeNewsHub_server 服务

```bash
cd LifeNewsHub_server
npm install
npm start
```

服务将运行在 `http://localhost:3000`

### 2. 修改 now 项目配置

编辑 `now/public/js/BaseURL.js` 文件：

```javascript
// 修改前
export const BASE_URL = "https://info-6ke.pages.dev/healths/number/data.json";
export const IMG_BASE_URL =
  "https://info-6ke.pages.dev/healths/number/number.png";
export const Category_URL = "https://info-6ke.pages.dev/healths/db.json";

// 修改后
export const BASE_URL = "http://localhost:3000/api/compatible/db.json";
export const IMG_BASE_URL = "http://localhost:3000/api/compatible/";
export const Category_URL = "http://localhost:3000/api/compatible/db.json";
```

### 3. 测试接口

在浏览器中访问：

- http://localhost:3000/api/compatible/db.json - 查看文章列表
- http://localhost:3000/api/compatible/123456/data.json - 查看文章详情（需要替换实际 ID）

## 可用接口

### 1. 获取文章列表

**接口**: `GET /api/compatible/db.json`

**响应格式**:

```json
[
  {
    "info1": ["Category 1", "Category 2", "Category 3"]
  },
  {
    "id": "eng-123456",
    "title": "Article Title",
    "type": "Business",
    "img": "image.jpg",
    "create_time": 1704067200000
  },
  ...
]
```

**说明**:

- 第一个元素包含分类列表 (`info1`)
- 后续元素是文章对象
- 文章按发布时间倒序排列

### 2. 获取文章详情

**接口**: `GET /api/compatible/:id/data.json`

**示例**: `GET /api/compatible/eng-123456/data.json`

**响应格式**:

```json
{
  "id": "eng-123456",
  "title": "Article Title",
  "type": "Business",
  "img": "image.jpg",
  "create_time": 1704067200000,
  "content": [
    "<h1>Article Title</h1>",
    "<img src='...' alt='...' class='article-image'>",
    "<p>Paragraph 1...</p>",
    "<p>Paragraph 2...</p>"
  ]
}
```

**说明**:

- `content` 字段包含 HTML 格式的文章内容
- 内容已按段落分割成数组

### 3. 按分类获取文章

**接口**: `GET /api/compatible/category/:type`

**示例**: `GET /api/compatible/category/business`

**响应格式**:

```json
[
  {
    "info1": ["Business"]
  },
  {
    "id": "eng-123456",
    "title": "Business Article",
    "type": "Business",
    ...
  }
]
```

## 支持的查询参数

### 语言参数

所有接口都支持 `lang` 请求头来指定语言：

```javascript
fetch("http://localhost:3000/api/compatible/db.json", {
  headers: {
    lang: "en", // 支持: en, zh, es, fr, de, etc.
  },
});
```

## 数据字段说明

### 文章对象字段

| 字段        | 类型     | 说明                            |
| ----------- | -------- | ------------------------------- |
| id          | string   | 文章唯一标识符（如 eng-123456） |
| title       | string   | 文章标题                        |
| type        | string   | 文章分类                        |
| img         | string   | 图片文件名                      |
| create_time | number   | 创建时间戳（毫秒）              |
| content     | string[] | HTML 内容数组（仅详情接口）     |

## 与原 now 项目的差异

### 1. 文章 ID 格式

- **原 now 项目**: 纯数字 ID（如 `123456`）
- **LifeNewsHub_server**: Event Registry URI 格式（如 `eng-123456`）

**影响**: 需要使用完整的 URI 格式来请求文章详情

**解决方案**: 从列表接口获取的 `id` 字段可直接用于详情接口

### 2. 图片路径

- **原 now 项目**: 固定目录结构 `/{category}/{id}/{filename}`
- **LifeNewsHub_server**: Event Registry 提供的完整图片 URL

**影响**: 图片 URL 构建方式不同

**解决方案**: 使用接口返回的完整图片 URL，或修改 `getImgUrl` 函数

### 3. 数据来源

- **原 now 项目**: 静态 JSON 文件
- **LifeNewsHub_server**: 实时从 Event Registry API 获取

**优势**:

- 数据实时更新
- 支持更多分类
- 支持多语言
- 内容质量更高

## 调试技巧

### 1. 查看服务器日志

```bash
cd LifeNewsHub_server
npm start
```

所有请求都会在控制台输出日志

### 2. 测试接口响应

使用 curl 测试：

```bash
# 测试文章列表
curl http://localhost:3000/api/compatible/db.json

# 测试文章详情
curl http://localhost:3000/api/compatible/eng-9276896/data.json

# 测试特定分类
curl http://localhost:3000/api/compatible/category/business
```

### 3. 浏览器开发者工具

打开 now 项目页面，在 Network 标签中查看 API 请求和响应

## 常见问题

### Q1: 文章详情 404 错误

**原因**: 使用了不正确的文章 ID 格式

**解决方案**: 确保使用从列表接口返回的完整 ID（如 `eng-9276896`）

### Q2: 图片无法显示

**原因**: 图片 URL 构建方式不兼容

**解决方案**:

1. 检查 `getImgUrl` 函数
2. 使用 Event Registry 返回的完整图片 URL
3. 或者修改前端图片处理逻辑

### Q3: 分类名称不匹配

**原因**: Event Registry 的分类体系与原项目不同

**解决方案**:

1. 查看 `/api/compatible/db.json` 返回的 `info1` 字段
2. 使用返回的分类名称
3. 或者在 `src/config/categories.js` 中自定义分类映射

### Q4: CORS 错误

**原因**: 跨域请求被拒绝

**解决方案**:

1. 确保 `LifeNewsHub_server/.env` 中配置了 `CORS_ORIGINS=*`
2. 或者将 now 项目的域名添加到 `CORS_ORIGINS` 列表

## 生产环境部署

### 1. 配置环境变量

创建 `.env` 文件：

```env
NODE_ENV=production
PORT=3000
EVENT_REGISTRY_API_KEY=your_api_key_here
CORS_ORIGINS=https://your-now-project-domain.com
```

### 2. 启动服务

```bash
npm run start:prod
```

### 3. 使用反向代理

推荐使用 Nginx 作为反向代理：

```nginx
location /api/compatible/ {
    proxy_pass http://localhost:3000/api/compatible/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### 4. 修改 now 项目配置

```javascript
export const BASE_URL = "https://your-domain.com/api/compatible/db.json";
export const Category_URL = "https://your-domain.com/api/compatible/db.json";
```

## 性能优化建议

1. **启用缓存**: Event Registry API 有调用限制，建议实现缓存机制
2. **CDN 加速**: 对静态资源使用 CDN
3. **负载均衡**: 多实例部署提高可用性
4. **数据预加载**: 定期预加载热门文章

## 下一步

- 查看 `NOW_PROJECT_API_COMPATIBILITY.md` 了解详细的数据格式说明
- 查看 `src/controllers/compatibleController.js` 了解实现细节
- 根据需要自定义分类映射和数据格式转换

## 支持

如有问题，请查看：

- LifeNewsHub_server 项目文档
- Event Registry API 文档: https://eventregistry.org/documentation
