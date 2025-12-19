# 数据库配置和使用指南

## 数据库信息

- **数据库名称**: Information
- **表名称**: info
- **数据库类型**: MySQL
- **字符集**: utf8mb4

## 数据库配置

数据库连接配置在 `.env` 文件中：

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=13249709366
DB_NAME=Information
```

## 初始化数据库

首次使用前需要初始化数据库和表：

```bash
npm run db:init
```

这个命令会：

1. 创建 `Information` 数据库（如果不存在）
2. 创建 `info` 表
3. 插入示例数据

## 表结构

`info` 表包含以下字段：

| 字段名       | 类型         | 说明                 | 索引    |
| ------------ | ------------ | -------------------- | ------- |
| id           | INT          | 主键 ID，自增        | PRIMARY |
| title        | VARCHAR(500) | 标题，必填           | -       |
| content      | TEXT         | 内容                 | -       |
| category     | VARCHAR(100) | 分类                 | INDEX   |
| source       | VARCHAR(200) | 来源                 | -       |
| author       | VARCHAR(100) | 作者                 | -       |
| publish_time | DATETIME     | 发布时间             | INDEX   |
| image_url    | VARCHAR(500) | 图片 URL             | -       |
| url          | VARCHAR(500) | 原文链接             | -       |
| status       | TINYINT      | 状态：1-正常，0-禁用 | INDEX   |
| created_at   | TIMESTAMP    | 创建时间             | INDEX   |
| updated_at   | TIMESTAMP    | 更新时间             | -       |

## API 接口

### 基础路径

```
http://localhost:3000/api/info
```

### 接口列表

#### 1. 获取信息列表

```
GET /api/info
```

查询参数：

- `page` - 页码，默认 1
- `limit` - 每页数量，默认 10
- `category` - 分类筛选（可选）
- `status` - 状态筛选，默认 1

示例：

```bash
# 获取第一页数据
curl http://localhost:3000/api/info?page=1&limit=10

# 按分类筛选
curl http://localhost:3000/api/info?category=科技
```

响应：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "标题",
        "content": "内容",
        "category": "分类",
        ...
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

#### 2. 获取信息详情

```
GET /api/info/:id
```

示例：

```bash
curl http://localhost:3000/api/info/1
```

#### 3. 创建信息

```
POST /api/info
```

请求体：

```json
{
  "title": "新闻标题",
  "content": "新闻内容",
  "category": "科技",
  "source": "来源",
  "author": "作者",
  "publish_time": "2025-12-18 12:00:00",
  "image_url": "https://example.com/image.jpg",
  "url": "https://example.com/article"
}
```

示例：

```bash
curl -X POST http://localhost:3000/api/info \
  -H "Content-Type: application/json" \
  -d '{"title":"测试新闻","content":"这是测试内容"}'
```

#### 4. 更新信息

```
PUT /api/info/:id
```

请求体（只需要包含要更新的字段）：

```json
{
  "title": "更新后的标题",
  "status": 1
}
```

示例：

```bash
curl -X PUT http://localhost:3000/api/info/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"更新后的标题"}'
```

#### 5. 删除信息（软删除）

```
DELETE /api/info/:id
```

示例：

```bash
curl -X DELETE http://localhost:3000/api/info/1
```

#### 6. 获取分类列表

```
GET /api/info/categories
```

示例：

```bash
curl http://localhost:3000/api/info/categories
```

响应：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "category": "科技",
      "count": 15
    },
    {
      "category": "娱乐",
      "count": 10
    }
  ]
}
```

## 数据库模块使用

在代码中使用数据库：

```javascript
const { query, queryOne } = require("./config/database");

// 执行查询
const results = await query("SELECT * FROM info WHERE status = ?", [1]);

// 获取单条记录
const info = await queryOne("SELECT * FROM info WHERE id = ?", [1]);
```

## 启动服务器

```bash
# 开发模式（带自动重启）
npm run dev

# 生产模式
npm start
```

服务器启动后会自动测试数据库连接。

## 注意事项

1. 确保 MySQL 服务已启动
2. 确保数据库用户有足够的权限
3. 首次使用前必须运行 `npm run db:init` 初始化数据库
4. 数据库密码等敏感信息应该妥善保管，不要提交到版本控制系统
5. 删除操作是软删除（status 设为 0），数据不会真正删除

## 故障排查

### 连接失败

- 检查 MySQL 服务是否运行
- 检查 `.env` 文件中的配置是否正确
- 检查用户名和密码是否正确

### 表不存在

- 运行 `npm run db:init` 初始化数据库和表

### 权限错误

- 确保数据库用户有 CREATE、SELECT、INSERT、UPDATE、DELETE 权限
