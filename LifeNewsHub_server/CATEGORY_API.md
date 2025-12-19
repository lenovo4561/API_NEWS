# LifeNewsHub 分类系统 API 文档

## 概述

已成功创建三级分类表和更新了 info 表：

### 数据库表结构

#### 1. category_main (大分类表)

| 字段        | 类型         | 说明                 |
| ----------- | ------------ | -------------------- |
| id          | INT          | 主键 ID              |
| name        | VARCHAR(100) | 分类名称（唯一）     |
| description | VARCHAR(500) | 分类描述             |
| sort_order  | INT          | 排序顺序             |
| status      | TINYINT      | 状态：1-正常，0-禁用 |
| created_at  | TIMESTAMP    | 创建时间             |
| updated_at  | TIMESTAMP    | 更新时间             |

**示例数据：** 艺术、商业、计算机、游戏、健康、家、娱乐、科学、购物、社会、运动的

#### 2. category_sub (子分类表)

| 字段             | 类型         | 说明                  |
| ---------------- | ------------ | --------------------- |
| id               | INT          | 主键 ID               |
| main_category_id | INT          | 所属大分类 ID（外键） |
| name             | VARCHAR(100) | 子分类名称            |
| description      | VARCHAR(500) | 分类描述              |
| sort_order       | INT          | 排序顺序              |
| status           | TINYINT      | 状态：1-正常，0-禁用  |
| created_at       | TIMESTAMP    | 创建时间              |
| updated_at       | TIMESTAMP    | 更新时间              |

**示例数据：**

- 计算机 → 编程、硬件、软件
- 游戏 → 电子游戏、手机游戏、桌游
- 等等（每个大分类下有 3 个子分类）

#### 3. category_third (第三级分类表)

| 字段            | 类型         | 说明                  |
| --------------- | ------------ | --------------------- |
| id              | INT          | 主键 ID               |
| sub_category_id | INT          | 所属子分类 ID（外键） |
| name            | VARCHAR(100) | 第三级分类名称        |
| description     | VARCHAR(500) | 分类描述              |
| sort_order      | INT          | 排序顺序              |
| status          | TINYINT      | 状态：1-正常，0-禁用  |
| created_at      | TIMESTAMP    | 创建时间              |
| updated_at      | TIMESTAMP    | 更新时间              |

**示例数据：**

- 编程 → JavaScript、Python、Java
- 硬件 → CPU、显卡、内存
- 电子游戏 → 王者荣耀、和平精英、原神
- 等等

#### 4. info (信息表 - 已更新)

**新增字段：**

- `main_category_id` (INT) - 大分类 ID（外键）
- `sub_category_id` (INT) - 子分类 ID（外键）
- `third_category_id` (INT) - 第三级分类 ID（外键）

**移除字段：**

- `category` (VARCHAR) - 已被新的分类字段替代

## API 接口

### 基础 URL

```
http://localhost:3000/api/category
```

---

## 📊 分类树接口

### 1. 获取完整分类树

获取所有大分类及其下的所有子分类（树形结构）

```http
GET /api/category/tree
```

**查询参数：**

- `status` (可选) - 状态筛选，默认 1（正常）

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 3,
      "name": "计算机",
      "description": "计算机相关资讯",
      "sort_order": 3,
      "status": 1,
      "created_at": "2025-12-18T06:42:41.000Z",
      "updated_at": "2025-12-18T06:42:41.000Z",
      "sub_categories": [
        {
          "id": 1,
          "main_category_id": 3,
          "name": "编程",
          "description": "编程相关内容",
          "sort_order": 1,
          "status": 1,
          "created_at": "2025-12-18T06:42:41.000Z",
          "updated_at": "2025-12-18T06:42:41.000Z",
          "third_categories": [
            {
              "id": 1,
              "sub_category_id": 1,
              "name": "JavaScript",
              "description": "JavaScript 编程语言",
              "sort_order": 1,
              "status": 1,
              "created_at": "2025-12-18T06:42:41.000Z",
              "updated_at": "2025-12-18T06:42:41.000Z"
            },
            {
              "id": 2,
              "sub_category_id": 1,
              "name": "Python",
              "description": "Python 编程语言",
              "sort_order": 2,
              "status": 1,
              "created_at": "2025-12-18T06:42:41.000Z",
              "updated_at": "2025-12-18T06:42:41.000Z"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 📁 大分类接口

### 2. 获取大分类列表

```http
GET /api/category/main
```

**查询参数：**

- `status` (可选) - 状态筛选，默认 1

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "科技",
        "description": "科技类新闻和资讯",
        "sort_order": 1,
        "status": 1,
        "created_at": "2025-12-18T06:42:41.000Z",
        "updated_at": "2025-12-18T06:42:41.000Z"
      }
    ],
    "total": 5
  }
}
```

### 3. 获取大分类详情

```http
GET /api/category/main/:id
```

**路径参数：**

- `id` (必填) - 大分类 ID

### 4. 创建大分类

```http
POST /api/category/main
```

**请求体：**

```json
{
  "name": "教育",
  "description": "教育培训资讯",
  "sort_order": 6
}
```

### 5. 更新大分类

```http
PUT /api/category/main/:id
```

**请求体：**

```json
{
  "name": "科技资讯",
  "description": "更新后的描述",
  "sort_order": 1,
  "status": 1
}
```

### 6. 删除大分类

```http
DELETE /api/category/main/:id
```

**注意：** 软删除，不会真正删除数据。如果大分类下有子分类，则无法删除。

---

## 📂 子分类接口

### 7. 获取子分类列表

```http
GET /api/category/sub
```

**查询参数：**

- `main_category_id` (可选) - 大分类 ID 筛选
- `status` (可选) - 状态筛选，默认 1

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "main_category_id": 1,
        "name": "软件",
        "description": "软件应用和开发",
        "sort_order": 1,
        "status": 1,
        "created_at": "2025-12-18T06:42:41.000Z",
        "updated_at": "2025-12-18T06:42:41.000Z",
        "main_category_name": "科技"
      }
    ],
    "total": 13
  }
}
```

### 8. 获取子分类详情

```http
GET /api/category/sub/:id
```

### 9. 创建子分类

```http
POST /api/category/sub
```

**请求体：**

```json
{
  "main_category_id": 1,
  "name": "人工智能",
  "description": "AI和机器学习",
  "sort_order": 5
}
```

### 10. 更新子分类

```http
PUT /api/category/sub/:id
```

**请求体：**

```json
{
  "name": "AI技术",
  "description": "人工智能技术",
  "sort_order": 5,
  "status": 1
}
```

### 11. 删除子分类

```http
DELETE /api/category/sub/:id
```

**注意：** 软删除，不会真正删除数据。

---

## � 第三级分类接口

### 12. 获取第三级分类列表

```http
GET /api/category/third
```

**查询参数：**

- `sub_category_id` (可选) - 子分类 ID 筛选
- `status` (可选) - 状态筛选，默认 1

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "sub_category_id": 1,
      "name": "JavaScript",
      "description": "JavaScript 编程语言",
      "sort_order": 1,
      "status": 1,
      "sub_category_name": "编程",
      "main_category_id": 3,
      "main_category_name": "计算机",
      "created_at": "2025-12-18T06:42:41.000Z",
      "updated_at": "2025-12-18T06:42:41.000Z"
    }
  ]
}
```

### 13. 获取第三级分类详情

```http
GET /api/category/third/:id
```

### 14. 创建第三级分类

```http
POST /api/category/third
```

**请求体：**

```json
{
  "sub_category_id": 1,
  "name": "TypeScript",
  "description": "TypeScript 编程语言",
  "sort_order": 4
}
```

**必填字段：** `sub_category_id`、`name`

### 15. 更新第三级分类

```http
PUT /api/category/third/:id
```

**请求体：**

```json
{
  "name": "TypeScript 进阶",
  "description": "TypeScript 高级编程",
  "sort_order": 5,
  "status": 1
}
```

### 16. 删除第三级分类

```http
DELETE /api/category/third/:id
```

**注意：** 如果有关联的 info 记录，删除会失败。

---

## �📰 信息接口（已更新）

### 17. 获取信息列表（支持分类筛选）

```http
GET /api/info
```

**查询参数：**

- `page` (可选) - 页码，默认 1
- `limit` (可选) - 每页数量，默认 10
- `main_category_id` (可选) - 大分类 ID 筛选
- `sub_category_id` (可选) - 子分类 ID 筛选
- `third_category_id` (可选) - 第三级分类 ID 筛选
- `status` (可选) - 状态筛选，默认 1

**示例：**

```bash
# 获取计算机类信息
GET /api/info?main_category_id=3

# 获取编程子类信息
GET /api/info?sub_category_id=1

# 获取 JavaScript 第三级分类信息
GET /api/info?third_category_id=1

# 同时筛选三级分类
GET /api/info?main_category_id=3&sub_category_id=1&third_category_id=1&page=1&limit=10
```

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "欢迎使用 LifeNewsHub",
        "content": "这是一个示例新闻内容",
        "main_category_id": 1,
        "sub_category_id": 1,
        "main_category_name": "科技",
        "sub_category_name": "软件",
        "source": "LifeNewsHub",
        "author": "管理员",
        "publish_time": "2025-12-18T06:44:13.000Z",
        "image_url": null,
        "url": null,
        "status": 1,
        "created_at": "2025-12-18T06:44:13.000Z",
        "updated_at": "2025-12-18T06:44:13.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

### 13. 获取信息详情

```http
GET /api/info/:id
```

**响应包含分类名称：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "欢迎使用 LifeNewsHub",
    "main_category_id": 3,
    "sub_category_id": 1,
    "third_category_id": 1,
    "main_category_name": "计算机",
    "sub_category_name": "编程",
    "third_category_name": "JavaScript",
    ...
  }
}
```

### 19. 创建信息

```http
POST /api/info
```

**请求体：**

```json
{
  "title": "新闻标题",
  "content": "新闻内容",
  "main_category_id": 3,
  "sub_category_id": 1,
  "third_category_id": 1,
  "source": "来源",
  "author": "作者",
  "publish_time": "2025-12-18 12:00:00",
  "image_url": "https://example.com/image.jpg",
  "url": "https://example.com/article"
}
```

### 20. 更新信息

```http
PUT /api/info/:id
```

**请求体（可以只包含要更新的字段）：**

```json
{
  "title": "更新后的标题",
  "main_category_id": 3,
  "sub_category_id": 2,
  "third_category_id": 4
}
```

### 16. 获取分类统计

```http
GET /api/info/categories
```

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "main_categories": [
      {
        "id": 1,
        "name": "科技",
        "count": 2
      }
    ],
    "sub_categories": [
      {
        "id": 1,
        "main_category_id": 1,
        "name": "软件",
        "count": 2,
        "main_category_name": "科技"
      }
    ]
  }
}
```

---

## 🧪 测试示例

### PowerShell 测试

```powershell
# 1. 获取分类树
Invoke-RestMethod -Uri "http://localhost:3000/api/category/tree"

# 2. 获取大分类列表
Invoke-RestMethod -Uri "http://localhost:3000/api/category/main"

# 3. 获取科技下的子分类
Invoke-RestMethod -Uri "http://localhost:3000/api/category/sub?main_category_id=1"

# 4. 获取科技类信息
Invoke-RestMethod -Uri "http://localhost:3000/api/info?main_category_id=1"

# 5. 创建新的大分类
$body = @{
    name = "教育"
    description = "教育培训资讯"
    sort_order = 6
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/category/main" -Method POST -Body $body -ContentType "application/json"

# 6. 创建新的子分类
$body = @{
    main_category_id = 1
    name = "人工智能"
    description = "AI和机器学习"
    sort_order = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/category/sub" -Method POST -Body $body -ContentType "application/json"

# 7. 创建信息（关联到分类）
$body = @{
    title = "AI 技术突破"
    content = "人工智能领域取得重大突破"
    main_category_id = 1
    sub_category_id = 1
    source = "科技日报"
    author = "张三"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/info" -Method POST -Body $body -ContentType "application/json"
```

### curl 测试

```bash
# 获取分类树
curl http://localhost:3000/api/category/tree

# 获取大分类列表
curl http://localhost:3000/api/category/main

# 按子分类查询信息
curl "http://localhost:3000/api/info?sub_category_id=1"

# 创建大分类
curl -X POST http://localhost:3000/api/category/main \
  -H "Content-Type: application/json" \
  -d '{"name":"教育","description":"教育培训资讯","sort_order":6}'
```

---

## 📋 数据关系说明

### 表关系

```
category_main (大分类)
    ↓ 1对多
category_sub (子分类)
    ↓ 1对多
category_third (第三级分类)
    ↓ 多对1
info (信息表)
```

### 外键约束

- `category_sub.main_category_id` → `category_main.id` (级联删除)
- `category_third.sub_category_id` → `category_sub.id` (级联删除)
- `info.main_category_id` → `category_main.id` (SET NULL)
- `info.sub_category_id` → `category_sub.id` (SET NULL)
- `info.third_category_id` → `category_third.id` (SET NULL)

### 业务规则

1. 删除大分类前，必须先删除或禁用其下的所有子分类和第三级分类
2. 删除子分类前，必须先删除或禁用其下的所有第三级分类
3. 删除/禁用分类时，关联的信息不会被删除，只是分类 ID 会被设为 NULL
4. 创建子分类时，必须指定有效的大分类 ID
5. 创建第三级分类时，必须指定有效的子分类 ID
6. 分类名称在各自的范围内必须唯一（大分类名称全局唯一，子分类在同一大分类下唯一，第三级分类在同一子分类下唯一）

---

## 🎯 使用建议

1. **首次使用前运行初始化：**

   ```bash
   npm run db:init
   ```

2. **启动服务器：**

   ```bash
   npm start  # 或 npm run dev
   ```

3. **推荐的使用流程：**

   - 先获取分类树了解所有分类
   - 根据分类 ID 筛选信息
   - 创建信息时关联对应的分类

4. **性能优化建议：**
   - 分类数据变化较少，可以考虑缓存分类树
   - 查询信息时使用索引字段（main_category_id, sub_category_id）

---

## ⚠️ 注意事项

1. 所有删除操作都是软删除（status=0）
2. 外键约束确保数据完整性
3. 分类名称区分大小写
4. 排序字段 sort_order 用于控制显示顺序

---

更多信息请查看：

- [DATABASE.md](./DATABASE.md) - 完整数据库文档
- [QUICKSTART.md](./QUICKSTART.md) - 快速开始指南
