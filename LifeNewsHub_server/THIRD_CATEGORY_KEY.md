# Category Third Key 字段更新

## 更新概述

为 `category_third` 表添加了 `third_category_key` 字段，用于存储第三级分类的英文标识符。

## 更新时间

2025 年 12 月 19 日

## 字段详情

### 新增字段：`third_category_key`

- **位置**: 在 `id` 字段之后
- **类型**: `VARCHAR(50)`
- **说明**: 第三级分类英文标识
- **约束**: UNIQUE KEY（与 sub_category_id 组合）
- **可空**: YES（允许为空）

## 更新后的表结构

```sql
CREATE TABLE category_third (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  third_category_key VARCHAR(50) COMMENT '第三级分类英文标识',
  sub_category_id INT NOT NULL COMMENT '所属子分类ID',
  name VARCHAR(100) NOT NULL COMMENT '第三级分类名称',
  description VARCHAR(500) COMMENT '分类描述',
  sort_order INT DEFAULT 0 COMMENT '排序顺序',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_sub_category (sub_category_id),
  INDEX idx_status (status),
  INDEX idx_sort_order (sort_order),
  UNIQUE KEY uk_sub_third (sub_category_id, name),
  UNIQUE KEY uk_sub_third_key (sub_category_id, third_category_key),
  CONSTRAINT fk_sub_category FOREIGN KEY (sub_category_id)
    REFERENCES category_sub(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='第三级分类表';
```

## 使用场景

### 1. 完整的三级分类 URL

```javascript
// 创建完整的三级分类 URL
// 例如: /category/Arts/Music/Jazz
app.get("/category/:mainKey/:subKey/:thirdKey", async (req, res) => {
  const { mainKey, subKey, thirdKey } = req.params;

  const sql = `
    SELECT ct.*, cs.name as sub_name, cm.name as main_name
    FROM category_third ct
    JOIN category_sub cs ON ct.sub_category_id = cs.id
    JOIN category_main cm ON cs.main_category_id = cm.id
    WHERE cm.category_key = ? 
      AND cs.sub_category_key = ?
      AND ct.third_category_key = ?
  `;

  const category = await queryOne(sql, [mainKey, subKey, thirdKey]);
  // ...
});
```

### 2. 根据 Key 查询第三级分类

```javascript
// 查询特定的第三级分类
const sql = `
  SELECT ct.*
  FROM category_third ct
  JOIN category_sub cs ON ct.sub_category_id = cs.id
  WHERE cs.sub_category_key = 'Music' 
    AND ct.third_category_key = 'Jazz'
    AND ct.status = 1
`;
const jazzCategory = await queryOne(sql);
```

### 3. 获取子分类下的所有第三级分类

```javascript
// 获取音乐子分类下的所有第三级分类
const sql = `
  SELECT ct.id, ct.third_category_key, ct.name, ct.description
  FROM category_third ct
  JOIN category_sub cs ON ct.sub_category_id = cs.id
  WHERE cs.sub_category_key = 'Music' 
    AND ct.status = 1
  ORDER BY ct.sort_order
`;
const musicThirdCategories = await query(sql);
```

## 数据迁移

### 运行迁移脚本

```bash
npm run db:add-third-key
```

### 脚本功能

1. ✅ 检查并添加 `third_category_key` 字段
2. ✅ 为 `third_category_key` 添加唯一索引（与 sub_category_id 组合）
3. ✅ 为现有数据自动生成 third_category_key（如果有）
4. ✅ 显示更新结果和统计信息

### 添加第三级分类时指定 Key

在插入新的第三级分类时，建议手动指定 `third_category_key`：

```javascript
const insertSQL = `
  INSERT INTO category_third 
  (sub_category_id, third_category_key, name, description, sort_order, status)
  VALUES (?, ?, ?, ?, ?, 1)
`;

// 示例：为音乐子分类添加爵士乐第三级分类
await query(insertSQL, [
  musicSubCategoryId,
  "Jazz",
  "爵士乐",
  "爵士音乐风格",
  1,
]);
```

## 完整的三级分类体系

现在所有三级表都支持英文 key 标识：

| 表名           | Key 字段           | 说明                               |
| -------------- | ------------------ | ---------------------------------- |
| category_main  | category_key       | 大分类英文标识 (如 Arts, Business) |
| category_sub   | sub_category_key   | 子分类英文标识 (如 Music, Movies)  |
| category_third | third_category_key | 第三级分类英文标识 (如 Jazz, Rock) |

### 完整 URL 示例

```
/category/Arts/Music/Jazz           → 艺术 > 音乐 > 爵士乐
/category/Arts/Music/Classical      → 艺术 > 音乐 > 古典音乐
/category/Arts/Movies/Action        → 艺术 > 电影 > 动作片
/category/Business/Finance/Banking  → 商业 > 金融 > 银行业
```

## 命名规范

### third_category_key 规范

- 使用 **PascalCase** 或 **Snake_Case** 格式
- 保持简洁且具有描述性
- 避免使用空格和特殊字符
- 在同一子分类下保持唯一性

**示例**：

- ✅ `Jazz`, `Classical`, `Rock`, `Hip_Hop`
- ✅ `Action_Movies`, `Comedy_Movies`, `Sci_Fi`
- ❌ `jazz music`, `action-movies`, `sci fi movies`

## 数据完整性

### 唯一性约束

- `third_category_key` 与 `sub_category_id` 组合构成唯一键
- 同一子分类下不能有重复的 `third_category_key`
- 不同子分类下可以有相同的 `third_category_key`

### 外键约束

- `sub_category_id` 外键关联到 `category_sub.id`
- 级联删除：删除子分类时，相关第三级分类自动删除
- 级联更新：更新子分类 ID 时，第三级分类自动更新

## API 路由建议

### 添加到 categoryController.js

```javascript
/**
 * 获取第三级分类详情（通过 key）
 */
async function getThirdCategoryByKeys(req, res, next) {
  try {
    const { mainKey, subKey, thirdKey } = req.params;

    const sql = `
      SELECT 
        ct.*,
        cs.name as sub_category_name,
        cs.sub_category_key,
        cm.name as main_category_name,
        cm.category_key
      FROM category_third ct
      JOIN category_sub cs ON ct.sub_category_id = cs.id
      JOIN category_main cm ON cs.main_category_id = cm.id
      WHERE cm.category_key = ? 
        AND cs.sub_category_key = ?
        AND ct.third_category_key = ?
    `;

    const category = await queryOne(sql, [mainKey, subKey, thirdKey]);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Third-level category not found",
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

/**
 * 获取子分类下的所有第三级分类
 */
async function getThirdCategoriesBySubKey(req, res, next) {
  try {
    const { mainKey, subKey } = req.params;

    const sql = `
      SELECT ct.id, ct.third_category_key, ct.name, 
             ct.description, ct.sort_order
      FROM category_third ct
      JOIN category_sub cs ON ct.sub_category_id = cs.id
      JOIN category_main cm ON cs.main_category_id = cm.id
      WHERE cm.category_key = ? 
        AND cs.sub_category_key = ?
        AND ct.status = 1
      ORDER BY ct.sort_order
    `;

    const categories = await query(sql, [mainKey, subKey]);

    res.json({
      success: true,
      data: categories,
      meta: {
        total: categories.length,
        mainCategory: mainKey,
        subCategory: subKey,
      },
    });
  } catch (error) {
    next(error);
  }
}
```

### 添加到 routes/category.js

```javascript
// 获取第三级分类详情
router.get("/:mainKey/sub/:subKey/third/:thirdKey", getThirdCategoryByKeys);

// 获取子分类下的所有第三级分类
router.get("/:mainKey/sub/:subKey/thirds", getThirdCategoriesBySubKey);
```

## 测试示例

### SQL 查询测试

```sql
-- 查看所有第三级分类
SELECT ct.id, ct.third_category_key, ct.name,
       cs.sub_category_key, cm.category_key
FROM category_third ct
JOIN category_sub cs ON ct.sub_category_id = cs.id
JOIN category_main cm ON cs.main_category_id = cm.id
ORDER BY cm.category_key, cs.sub_category_key, ct.sort_order;

-- 统计各子分类的第三级分类数量
SELECT
  cm.category_key,
  cs.sub_category_key,
  cs.name as sub_name,
  COUNT(ct.id) as third_count
FROM category_sub cs
LEFT JOIN category_third ct ON cs.id = ct.sub_category_id
JOIN category_main cm ON cs.main_category_id = cm.id
GROUP BY cm.category_key, cs.id, cs.sub_category_key, cs.name
HAVING third_count > 0
ORDER BY third_count DESC;
```

## 相关文档

- [Category Key 迁移文档](CATEGORY_KEY_MIGRATION.md)
- [艺术类二级分类文档](ARTS_SUBCATEGORIES.md)
- [数据库文档](DATABASE.md)
- [三级分类总结](THREE_LEVEL_CATEGORY_SUMMARY.md)
