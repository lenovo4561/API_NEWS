# now 项目接口兼容性文档

## 项目概述

now 项目是一个静态网站，使用 JSON 文件作为数据源。本文档描述 now 项目期望的数据格式，以便 LifeNewsHub_server 服务端提供兼容的接口。

## now 项目的数据架构

### 1. 主数据文件 (db.json)

**URL 格式**: `https://domain.com/category/db.json`

**数据结构**:

```json
[
  {
    "info1": ["Category 1", "Category 2", "Category 3", ...]
  },
  {
    "id": "123456",
    "title": "Article Title",
    "type": "Category Name",
    "img": "1.png",
    "create_time": 1704067200000
  },
  {
    "id": "123457",
    "title": "Another Article",
    ...
  }
]
```

**说明**:

- 第一个元素是元数据对象，包含 `info1` 数组，定义分类顺序
- 后续元素都是文章对象
- 所有文章和元数据在一个数组中

### 2. 文章详情文件 (data.json)

**URL 格式**: `https://domain.com/category/{id}/data.json`

**数据结构**:

```json
{
  "id": "123456",
  "title": "Article Title",
  "type": "Category Name",
  "img": "1.png",
  "create_time": 1704067200000,
  "content": [
    "<h2>Heading</h2>",
    "<p>Paragraph content...</p>",
    "<img src='...' alt='...'>"
  ]
}
```

**说明**:

- `content` 是 HTML 字符串数组
- 每个数组元素是一个 HTML 片段
- 文本内容可能包含 Unicode 转义序列（如 `\u0026`）

### 3. 文章对象字段说明

| 字段        | 类型     | 必需 | 说明                      |
| ----------- | -------- | ---- | ------------------------- |
| id          | string   | ✓    | 文章唯一标识符            |
| title       | string   | ✓    | 文章标题                  |
| type        | string   | ✓    | 文章分类/类别             |
| img         | string   | ✓    | 图片文件名（相对路径）    |
| create_time | number   | ✓    | 创建时间戳（毫秒）        |
| content     | string[] | △    | HTML 内容数组（仅详情页） |

### 4. 图片 URL 规则

**规则**: `https://domain.com/category/{id}/{img}`

**示例**:

- 文章 ID: `123456`
- img 字段: `1.png`
- 完整 URL: `https://domain.com/category/123456/1.png`

如果 img 字段为空，默认使用 `1.png`

## LifeNewsHub_server 需要适配的接口

### 方案 1: 创建兼容层接口（推荐）

创建新的路由 `/api/compatible/` 来模拟 now 项目的数据格式：

#### 1. GET /api/compatible/db.json

返回格式与 now 项目的 db.json 完全一致

#### 2. GET /api/compatible/:id/data.json

返回单篇文章的详情，格式与 now 项目一致

### 方案 2: 修改现有接口

修改 `/api/news/` 下的接口，使其同时支持两种响应格式：

- 通过请求头判断：`Accept: application/json` vs `Accept: application/vnd.now.v1+json`
- 通过查询参数：`?format=now`

## 关键差异对比

| 特性     | now 项目                 | LifeNewsHub_server             |
| -------- | ------------------------ | ------------------------------ |
| 响应包装 | 无包装，直接返回数据     | 有包装 `{code, message, data}` |
| 文章列表 | 数组，第一个元素是元数据 | 对象 `{list, total, page}`     |
| 分类信息 | 字符串数组               | 对象数组 `{id, name, uri}`     |
| 文章内容 | HTML 字符串数组          | 可能是纯文本                   |
| 时间格式 | 毫秒时间戳               | ISO 字符串或时间戳             |
| 图片路径 | 相对路径文件名           | 完整 URL                       |

## 实现建议

### 1. 创建兼容适配器

```javascript
// src/controllers/compatibleController.js
function adaptToNowFormat(articles, categoryOrder) {
  return [
    { info1: categoryOrder },
    ...articles.map((article) => ({
      id: article.id || article.uri,
      title: article.title,
      type: article.category,
      img: extractImageFilename(article.image),
      create_time: new Date(article.dateTime).getTime(),
    })),
  ];
}
```

### 2. 内容转换器

```javascript
function convertContentToHtmlArray(content) {
  // 将文章内容转换为HTML字符串数组
  if (typeof content === "string") {
    return content.split("\n\n").map((p) => `<p>${p}</p>`);
  }
  return ["<p>No content</p>"];
}
```

### 3. 图片处理

```javascript
function extractImageFilename(imageUrl) {
  if (!imageUrl) return "1.png";
  return imageUrl.split("/").pop() || "1.png";
}
```

## 测试计划

1. **数据格式测试**

   - 验证 db.json 返回的数组结构
   - 验证第一个元素包含 info1
   - 验证文章对象字段完整性

2. **详情页测试**

   - 验证 data.json 的单文章对象格式
   - 验证 content 字段是 HTML 数组
   - 验证 Unicode 解码正确性

3. **图片路径测试**

   - 验证图片 URL 构建正确
   - 验证默认图片 fallback

4. **分类测试**
   - 验证分类顺序与 info1 一致
   - 验证 type 字段正确映射

## 迁移步骤

1. 在 LifeNewsHub_server 中创建 `/api/compatible` 路由
2. 实现数据格式转换函数
3. 修改 now 项目的 BaseURL.js，指向新接口
4. 本地测试接口兼容性
5. 部署并验证生产环境

## 配置示例

修改 now 项目的 `BaseURL.js`:

```javascript
// 原来
export const BASE_URL = "https://info-6ke.pages.dev/healths/number/data.json";
export const Category_URL = "https://info-6ke.pages.dev/healths/db.json";

// 修改后
export const BASE_URL = "http://localhost:3000/api/compatible/data.json";
export const Category_URL = "http://localhost:3000/api/compatible/db.json";
```
