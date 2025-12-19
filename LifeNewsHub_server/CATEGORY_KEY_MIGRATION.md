# Category Key 字段迁移文档

## 更新概述

为 `category_main` 表添加了 `category_key` 字段，用于存储分类的英文标识符。

## 更新时间

2025 年 12 月 19 日

## 字段详情

### 新增字段：`category_key`

- **位置**: 在 `id` 字段之后
- **类型**: `VARCHAR(50)`
- **说明**: 分类英文标识
- **约束**: UNIQUE KEY（唯一键）
- **可空**: YES（允许为空）

## 分类映射表

| ID  | category_key | name   | 说明       |
| --- | ------------ | ------ | ---------- |
| 16  | Arts         | 艺术   | 艺术相关   |
| 17  | Business     | 商业   | 商业财经   |
| 18  | Computers    | 计算机 | 计算机技术 |
| 19  | Games        | 游戏   | 游戏娱乐   |
| 20  | Health       | 健康   | 健康养生   |
| 21  | Home         | 家     | 家居生活   |
| 22  | Science      | 科学   | 科学研究   |
| 23  | Shopping     | 购物   | 购物消费   |
| 24  | Society      | 社会   | 社会新闻   |
| 25  | Sports       | 运动的 | 运动体育   |
| 38  | Recreation   | 娱乐   | 娱乐八卦   |

## 更新后的表结构

```sql
CREATE TABLE category_main (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  category_key VARCHAR(50) COMMENT '分类英文标识',
  name VARCHAR(100) NOT NULL COMMENT '大分类名称',
  description VARCHAR(500) COMMENT '分类描述',
  sort_order INT DEFAULT 0 COMMENT '排序顺序',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_name (name),
  UNIQUE KEY uk_category_key (category_key),
  INDEX idx_status (status),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='大分类表';
```

## 使用场景

### 1. URL 友好的路由

```javascript
// 使用 category_key 创建 SEO 友好的 URL
// 例如: /news/Business 而不是 /news/17
app.get("/news/:categoryKey", async (req, res) => {
  const { categoryKey } = req.params;
  const category = await getCategoryByKey(categoryKey);
  // ...
});
```

### 2. API 查询优化

```javascript
// 通过 category_key 查询，比数字 ID 更具可读性
const sql = `
  SELECT * FROM category_main 
  WHERE category_key = ?
`;
const result = await query(sql, ["Business"]);
```

### 3. 国际化支持

```javascript
// 可以基于 category_key 进行多语言映射
const categoryTranslations = {
  Business: {
    en: "Business",
    zh: "商业",
    es: "Negocios",
    fr: "Affaires",
  },
  // ...
};
```

### 4. 前端路由配置

```javascript
// React Router 示例
const routes = [
  { path: "/category/Arts", component: Arts },
  { path: "/category/Business", component: Business },
  { path: "/category/Computers", component: Computers },
  // ...
];
```

## API 使用示例

### 根据 category_key 查询分类

```javascript
// 在 categoryController.js 中
async function getCategoryByKey(req, res, next) {
  try {
    const { key } = req.params;

    const sql = `
      SELECT id, category_key, name, description, sort_order, status
      FROM category_main
      WHERE category_key = ? AND status = 1
    `;

    const category = await queryOne(sql, [key]);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
}
```

### API 路由示例

```javascript
// 在 routes/category.js 中
router.get("/key/:key", getCategoryByKey);
```

### 前端调用示例

```javascript
// 获取商业分类信息
const response = await fetch("http://localhost:3000/api/category/key/Business");
const result = await response.json();

if (result.success) {
  console.log(result.data);
  // {
  //   id: 17,
  //   category_key: 'Business',
  //   name: '商业',
  //   description: '商业财经资讯',
  //   sort_order: 2,
  //   status: 1
  // }
}
```

## 迁移脚本

### 运行迁移

如果数据库已经存在但没有 `category_key` 字段，运行以下命令：

```bash
npm run db:add-category-key
```

### 脚本功能

迁移脚本 (`src/scripts/addCategoryKey.js`) 会执行以下操作：

1. ✅ 检查 `category_key` 字段是否已存在
2. ✅ 如果不存在，在 `id` 后添加该字段
3. ✅ 为 `category_key` 添加唯一索引
4. ✅ 根据分类名称更新对应的 `category_key` 值
5. ✅ 显示更新后的数据

### 对于新数据库

如果是全新初始化数据库，`category_key` 字段会在创建表时自动包含：

```bash
npm run db:init
```

## 数据完整性

### 唯一性约束

- `category_key` 字段设置了唯一索引，确保不会有重复的英文标识
- 插入新分类时必须提供唯一的 `category_key` 值

### 建议的命名规范

- 使用 **PascalCase** 格式（首字母大写）
- 单词之间不使用空格或特殊字符
- 保持简洁且具有描述性
- 遵循英文命名习惯

**示例**：

- ✅ `Business`, `Technology`, `Entertainment`
- ❌ `business`, `tech-news`, `arts_and_entertainment`

## 向后兼容性

- ✅ 现有的 API 不受影响，仍然可以使用 ID 查询
- ✅ `category_key` 字段允许为空，不会破坏现有数据
- ✅ 可以同时支持 ID 和 category_key 两种查询方式

## 相关文件

1. **迁移脚本**: `src/scripts/addCategoryKey.js`
2. **数据库初始化**: `src/scripts/initDatabase.js`
3. **分类控制器**: `src/controllers/categoryController.js`
4. **分类路由**: `src/routes/category.js`

## 注意事项

1. **唯一性**: 确保 `category_key` 在表中是唯一的
2. **大小写敏感**: 在某些数据库配置中可能区分大小写
3. **URL 编码**: 如果 category_key 包含特殊字符，需要在 URL 中正确编码
4. **索引性能**: `category_key` 已添加唯一索引，查询性能良好

## 未来扩展

可以考虑为子分类 (`category_sub`) 和第三级分类 (`category_third`) 也添加类似的 key 字段：

```sql
-- 为 category_sub 添加 sub_category_key
ALTER TABLE category_sub
ADD COLUMN sub_category_key VARCHAR(50) COMMENT '子分类英文标识'
AFTER id;

-- 为 category_third 添加 third_category_key
ALTER TABLE category_third
ADD COLUMN third_category_key VARCHAR(50) COMMENT '第三级分类英文标识'
AFTER id;
```

## 参考资源

- [数据库文档](DATABASE.md)
- [分类 API 文档](CATEGORY_API.md)
- [快速开始指南](QUICKSTART.md)
