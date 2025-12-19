# LifeNewsHub 数据库集成快速指南

## ✅ 已完成的工作

### 1. 数据库配置

- ✅ 安装了 `mysql2` 数据库驱动
- ✅ 创建了数据库配置文件 `src/config/database.js`
- ✅ 在 `.env` 文件中添加了数据库连接配置

### 2. 数据库初始化

- ✅ 创建了数据库 **Information**
- ✅ 创建了三级分类表：**category_main**、**category_sub**、**category_third**
- ✅ 创建了数据表 **info**（包含三级分类字段）
- ✅ 插入了示例数据（11 个大分类，33 个子分类，15 个第三级分类）
- ✅ 测试通过 ✓

### 3. API 实现

- ✅ 创建了 `categoryController.js` 控制器（支持三级分类）
- ✅ 创建了 `infoController.js` 控制器（支持三级分类筛选）
- ✅ 创建了 `category.js` 路由（包含第三级分类路由）
- ✅ 创建了 `info.js` 路由
- ✅ 集成到主服务器 `server.js`

### 4. 可用的 API 接口

#### 基础 URL

```
http://localhost:3000/api
```

#### 分类接口

1. **GET /api/category/tree** - 获取完整分类树（包含三级）
2. **GET /api/category/main** - 获取大分类列表
3. **GET /api/category/sub** - 获取子分类列表
4. **GET /api/category/third** - 获取第三级分类列表
5. **POST /api/category/main** - 创建大分类
6. **POST /api/category/sub** - 创建子分类
7. **POST /api/category/third** - 创建第三级分类

#### 信息接口

1. **GET /api/info** - 获取信息列表（支持三级分类筛选）
2. **GET /api/info/:id** - 获取单条信息详情
3. **POST /api/info** - 创建新信息（支持三级分类）
4. **PUT /api/info/:id** - 更新信息
5. **DELETE /api/info/:id** - 删除信息（软删除）

## 🚀 快速开始

### 1. 确保数据库已初始化

```bash
npm run db:init
```

### 2. 启动服务器

```bash
# 开发模式（自动重启）
npm run dev

# 或生产模式
npm start
```

### 3. 测试 API

#### 使用 PowerShell 测试

```powershell
# 获取完整分类树（包含三级）
Invoke-RestMethod -Uri "http://localhost:3000/api/category/tree"

# 获取编程子分类下的第三级分类
Invoke-RestMethod -Uri "http://localhost:3000/api/category/third?sub_category_id=112"

# 按第三级分类筛选 info
Invoke-RestMethod -Uri "http://localhost:3000/api/info?third_category_id=1"

# 获取单条信息
Invoke-RestMethod -Uri "http://localhost:3000/api/info/1"

# 创建带三级分类的新信息
$body = @{
    title = "TypeScript 5.0 新特性"
    content = "TypeScript 5.0 带来了诸多改进"
    main_category_id = 18
    sub_category_id = 112
    third_category_id = 31
    source = "Tech News"
    author = "张三"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/info" -Method POST -Body $body -ContentType "application/json"

# 创建新的第三级分类
$categoryBody = @{
    sub_category_id = 112
    name = "Go语言"
    description = "Go编程语言"
    sort_order = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/category/third" -Method POST -Body $categoryBody -ContentType "application/json"
```

#### 使用 curl 测试

```bash
# 获取信息列表
curl http://localhost:3000/api/info

# 分页查询
curl "http://localhost:3000/api/info?page=1&limit=10"

# 按分类筛选
curl "http://localhost:3000/api/info?category=科技"

# 创建新信息
curl -X POST http://localhost:3000/api/info \
  -H "Content-Type: application/json" \
  -d '{"title":"新闻标题","content":"新闻内容"}'
```

## 📊 数据库表结构

### info 表

| 字段         | 类型         | 说明                 |
| ------------ | ------------ | -------------------- |
| id           | INT          | 主键 ID，自增        |
| title        | VARCHAR(500) | 标题（必填）         |
| content      | TEXT         | 内容                 |
| category     | VARCHAR(100) | 分类                 |
| source       | VARCHAR(200) | 来源                 |
| author       | VARCHAR(100) | 作者                 |
| publish_time | DATETIME     | 发布时间             |
| image_url    | VARCHAR(500) | 图片 URL             |
| url          | VARCHAR(500) | 原文链接             |
| status       | TINYINT      | 状态：1-正常，0-禁用 |
| created_at   | TIMESTAMP    | 创建时间             |
| updated_at   | TIMESTAMP    | 更新时间             |

## 📝 API 响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

### 错误响应

```json
{
  "code": 404,
  "message": "信息不存在",
  "data": null
}
```

## 🔧 代码示例

### 在代码中使用数据库

```javascript
const { query, queryOne } = require("./config/database");

// 查询多条记录
const list = await query("SELECT * FROM info WHERE status = ?", [1]);

// 查询单条记录
const info = await queryOne("SELECT * FROM info WHERE id = ?", [1]);

// 插入数据
const result = await query("INSERT INTO info (title, content) VALUES (?, ?)", [
  "标题",
  "内容",
]);
console.log("新记录ID:", result.insertId);

// 更新数据
await query("UPDATE info SET title = ? WHERE id = ?", ["新标题", 1]);

// 删除数据（软删除）
await query("UPDATE info SET status = 0 WHERE id = ?", [1]);
```

## 🎯 下一步建议

1. **添加更多字段验证**

   - 在控制器中添加输入验证
   - 使用验证中间件

2. **添加搜索功能**

   - 实现全文搜索
   - 支持模糊查询

3. **添加权限控制**

   - 实现用户认证
   - 添加访问权限检查

4. **性能优化**

   - 添加缓存机制
   - 优化查询语句
   - 添加索引

5. **日志记录**
   - 记录数据库操作日志
   - 监控慢查询

## 📚 更多信息

详细文档请查看：

- [DATABASE.md](./DATABASE.md) - 完整数据库文档
- [README.md](./README.md) - 项目说明

## ⚠️ 注意事项

1. 数据库密码等敏感信息已配置在 `.env` 文件中，请勿提交到版本控制
2. 删除操作是软删除（status=0），数据不会真正删除
3. 确保 MySQL 服务正在运行
4. 首次使用前必须运行 `npm run db:init` 初始化数据库
