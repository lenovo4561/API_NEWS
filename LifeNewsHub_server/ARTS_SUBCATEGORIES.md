# 艺术类二级分类文档

## 更新概述

为"艺术"（Arts）大分类添加了 32 个二级分类，并为 `category_sub` 表添加了 `sub_category_key` 字段。

## 更新时间

2025 年 12 月 19 日

## 表结构更新

### category_sub 表新增字段

- **字段名**: `sub_category_key`
- **位置**: 在 `id` 字段之后
- **类型**: `VARCHAR(50)`
- **说明**: 子分类英文标识
- **约束**: UNIQUE KEY (与 main_category_id 组合)

## 艺术类二级分类列表

共 32 个子分类，所属大分类：**艺术 (Arts)**

| ID  | sub_category_key      | 中文名称       | 描述           |
| --- | --------------------- | -------------- | -------------- |
| 205 | Animation             | 动画片         | 动画艺术       |
| 206 | Architecture          | 建筑学         | 建筑设计与艺术 |
| 207 | Art_History           | 艺术史         | 艺术历史研究   |
| 208 | Awards                | 奖项           | 艺术类奖项     |
| 209 | Bodyart               | 人体彩绘       | 人体艺术彩绘   |
| 210 | Classical_Studies     | 古典学         | 古典艺术研究   |
| 211 | Comics                | 漫画           | 漫画艺术       |
| 212 | Contests              | 竞赛           | 艺术竞赛       |
| 213 | Costumes              | 服装           | 服装设计艺术   |
| 214 | Crafts                | 工艺           | 工艺美术       |
| 215 | Design                | 设计           | 艺术设计       |
| 216 | Digital               | 数字艺术       | 数字艺术创作   |
| 217 | Education             | 教育           | 艺术教育       |
| 218 | Entertainment         | 娱乐           | 娱乐艺术       |
| 219 | Genres                | 类型           | 艺术类型       |
| 220 | Graphic_Design        | 平面设计       | 平面艺术设计   |
| 221 | Humanities            | 人文科学       | 人文艺术       |
| 222 | Illustration          | 插图           | 插画艺术       |
| 223 | Literature            | 文学           | 文学艺术       |
| 224 | Magazines_and_Ezines  | 杂志和电子杂志 | 艺术类杂志     |
| 225 | Movies                | 电影           | 电影艺术       |
| 226 | Music                 | 音乐           | 音乐艺术       |
| 227 | Online_Writing        | 在线写作       | 在线创作       |
| 228 | Organizations         | 组织           | 艺术组织       |
| 229 | Performing_Arts       | 表演艺术       | 舞台表演艺术   |
| 230 | Periods_and_Movements | 时期和运动     | 艺术流派与运动 |
| 231 | Photography           | 摄影           | 摄影艺术       |
| 232 | Radio                 | 广播           | 广播艺术       |
| 233 | Television            | 电视           | 电视艺术       |
| 234 | Video                 | 视频           | 视频艺术       |
| 235 | Visual_Arts           | 视觉艺术       | 视觉艺术创作   |
| 236 | Writers_Resources     | 作家资源       | 作家创作资源   |

## 更新后的表结构

```sql
CREATE TABLE category_sub (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  sub_category_key VARCHAR(50) COMMENT '子分类英文标识',
  main_category_id INT NOT NULL COMMENT '所属大分类ID',
  name VARCHAR(100) NOT NULL COMMENT '子分类名称',
  description VARCHAR(500) COMMENT '分类描述',
  sort_order INT DEFAULT 0 COMMENT '排序顺序',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_main_category (main_category_id),
  INDEX idx_status (status),
  INDEX idx_sort_order (sort_order),
  UNIQUE KEY uk_main_sub (main_category_id, name),
  UNIQUE KEY uk_main_sub_key (main_category_id, sub_category_key),
  CONSTRAINT fk_main_category FOREIGN KEY (main_category_id)
    REFERENCES category_main(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='子分类表';
```

## 使用场景

### 1. URL 路由设计

```javascript
// 使用分类 key 创建层级 URL
// 例如: /category/Arts/Music 或 /category/Arts/Photography
app.get("/category/:categoryKey/:subKey", async (req, res) => {
  const { categoryKey, subKey } = req.params;

  // 查询分类和子分类
  const sql = `
    SELECT cs.*, cm.name as main_category_name
    FROM category_sub cs
    JOIN category_main cm ON cs.main_category_id = cm.id
    WHERE cm.category_key = ? AND cs.sub_category_key = ?
  `;

  const result = await queryOne(sql, [categoryKey, subKey]);
  // ...
});
```

### 2. API 查询示例

```javascript
// 获取艺术类下的音乐子分类
const sql = `
  SELECT cs.*
  FROM category_sub cs
  JOIN category_main cm ON cs.main_category_id = cm.id
  WHERE cm.category_key = 'Arts' 
    AND cs.sub_category_key = 'Music'
    AND cs.status = 1
`;
const musicCategory = await queryOne(sql);
```

### 3. 获取某大分类下的所有子分类

```javascript
// 获取艺术类的所有子分类
const sql = `
  SELECT cs.id, cs.sub_category_key, cs.name, cs.description
  FROM category_sub cs
  JOIN category_main cm ON cs.main_category_id = cm.id
  WHERE cm.category_key = 'Arts' 
    AND cs.status = 1
  ORDER BY cs.sort_order
`;
const artsSubCategories = await query(sql);
```

### 4. 前端分类导航

```javascript
// React 示例：艺术分类导航
const ArtsNavigation = () => {
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    fetch("/api/category/Arts/subcategories")
      .then((res) => res.json())
      .then((data) => setSubCategories(data));
  }, []);

  return (
    <nav>
      <h2>艺术分类</h2>
      <ul>
        {subCategories.map((sub) => (
          <li key={sub.id}>
            <Link to={`/category/Arts/${sub.sub_category_key}`}>
              {sub.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
```

## API 路由建议

### 添加到 categoryController.js

```javascript
/**
 * 获取指定大分类下的所有子分类
 */
async function getSubCategoriesByMainKey(req, res, next) {
  try {
    const { categoryKey } = req.params;

    const sql = `
      SELECT cs.id, cs.sub_category_key, cs.name, 
             cs.description, cs.sort_order
      FROM category_sub cs
      JOIN category_main cm ON cs.main_category_id = cm.id
      WHERE cm.category_key = ? 
        AND cs.status = 1
      ORDER BY cs.sort_order
    `;

    const subCategories = await query(sql, [categoryKey]);

    res.json({
      success: true,
      data: subCategories,
      meta: {
        total: subCategories.length,
        mainCategory: categoryKey,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 根据 category_key 和 sub_category_key 获取子分类详情
 */
async function getSubCategoryByKeys(req, res, next) {
  try {
    const { categoryKey, subKey } = req.params;

    const sql = `
      SELECT cs.*, cm.name as main_category_name, 
             cm.category_key as main_category_key
      FROM category_sub cs
      JOIN category_main cm ON cs.main_category_id = cm.id
      WHERE cm.category_key = ? 
        AND cs.sub_category_key = ?
    `;

    const subCategory = await queryOne(sql, [categoryKey, subKey]);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub-category not found",
      });
    }

    res.json({
      success: true,
      data: subCategory,
    });
  } catch (error) {
    next(error);
  }
}
```

### 添加到 routes/category.js

```javascript
// 获取指定大分类的所有子分类
router.get("/:categoryKey/subcategories", getSubCategoriesByMainKey);

// 获取指定子分类详情
router.get("/:categoryKey/sub/:subKey", getSubCategoryByKeys);
```

## 数据迁移

### 运行脚本

如果数据库已存在但没有艺术类子分类：

```bash
npm run db:add-arts-subs
```

### 脚本功能

1. ✅ 检查并添加 `sub_category_key` 字段
2. ✅ 为 `sub_category_key` 添加唯一索引
3. ✅ 查找"艺术"大分类
4. ✅ 插入 32 个艺术类子分类
5. ✅ 显示插入结果和统计信息

### 对于新数据库

运行完整初始化后，再运行艺术子分类脚本：

```bash
npm run db:init
npm run db:add-arts-subs
```

## 分类命名规范

### sub_category_key 规范

- 使用 **PascalCase** 或 **Snake_Case** 格式
- 多个单词使用下划线连接
- 保持简洁且具有描述性
- 避免使用空格和特殊字符

**示例**：

- ✅ `Animation`, `Art_History`, `Graphic_Design`
- ✅ `Magazines_and_Ezines`, `Writers_Resources`
- ❌ `art history`, `graphic-design`, `magazines & e-zines`

## 数据完整性

### 唯一性约束

- `sub_category_key` 与 `main_category_id` 组合构成唯一键
- 同一大分类下不能有重复的 `sub_category_key`
- 不同大分类下可以有相同的 `sub_category_key`

### 外键约束

- `main_category_id` 外键关联到 `category_main.id`
- 级联删除：删除大分类时，相关子分类自动删除
- 级联更新：更新大分类 ID 时，子分类自动更新

## 扩展建议

### 为其他大分类添加子分类

可以参照艺术类的脚本，为其他大分类（商业、计算机、游戏等）也添加相应的子分类：

```javascript
// 示例：商业类子分类
const BUSINESS_SUB_CATEGORIES = [
  { key: "Finance", name: "金融", description: "金融服务" },
  { key: "Marketing", name: "营销", description: "市场营销" },
  { key: "Management", name: "管理", description: "企业管理" },
  // ...
];
```

### 第三级分类扩展

可以为重要的子分类继续添加第三级分类，例如：

- 音乐 (Music) → 古典音乐、流行音乐、摇滚音乐等
- 电影 (Movies) → 动作片、喜剧片、科幻片等
- 文学 (Literature) → 小说、诗歌、散文等

## 性能优化

### 索引使用

- `sub_category_key` 已包含在唯一索引中，查询性能良好
- 通过 `main_category_id` 查询时使用了索引
- 建议在实际使用中监控慢查询并适当添加复合索引

### 缓存策略

由于分类数据相对稳定，建议：

1. 在应用层缓存分类数据
2. 设置较长的缓存过期时间（如 1 小时）
3. 在分类数据更新时主动清除缓存

## 相关文件

1. **脚本文件**: `src/scripts/addArtsSubCategories.js`
2. **数据库初始化**: `src/scripts/initDatabase.js`
3. **分类控制器**: `src/controllers/categoryController.js`
4. **分类路由**: `src/routes/category.js`
5. **分类配置**: `src/config/categories.js`

## 测试建议

### SQL 测试查询

```sql
-- 查看艺术类所有子分类
SELECT cs.id, cs.sub_category_key, cs.name, cs.sort_order
FROM category_sub cs
JOIN category_main cm ON cs.main_category_id = cm.id
WHERE cm.category_key = 'Arts'
ORDER BY cs.sort_order;

-- 统计各大分类的子分类数量
SELECT cm.category_key, cm.name, COUNT(cs.id) as sub_count
FROM category_main cm
LEFT JOIN category_sub cs ON cm.id = cs.main_category_id
GROUP BY cm.id, cm.category_key, cm.name
ORDER BY sub_count DESC;

-- 查找特定子分类
SELECT cs.*, cm.name as main_category
FROM category_sub cs
JOIN category_main cm ON cs.main_category_id = cm.id
WHERE cs.sub_category_key = 'Music';
```

### API 测试

```bash
# 获取艺术类所有子分类
curl http://localhost:3000/api/category/Arts/subcategories

# 获取音乐子分类详情
curl http://localhost:3000/api/category/Arts/sub/Music

# 获取摄影子分类详情
curl http://localhost:3000/api/category/Arts/sub/Photography
```

## 参考资源

- [数据库文档](DATABASE.md)
- [分类 Key 迁移文档](CATEGORY_KEY_MIGRATION.md)
- [分类 API 文档](CATEGORY_API.md)
- [三级分类总结](THREE_LEVEL_CATEGORY_SUMMARY.md)
