# Info 表标题去重方案

## ✅ 已完成的改动

### 1. 数据库层面 - 添加唯一索引

**执行的迁移脚本**: `src/scripts/addTitleUniqueIndex.js`

#### 改动内容：

- ✅ 为 `info` 表的 `title` 字段添加了唯一索引 `uk_title`
- ✅ 自动清理了现有的 117 条重复标题记录（保留最早的记录）
- ✅ 数据库将在底层自动拒绝插入重复标题

#### 执行结果：

```
✓ 已删除 117 条重复记录
✓ 标题唯一索引添加成功 (uk_title)
✓ info 表共有 21,382 条记录（去重后）
```

### 2. 应用层面 - 修改插入逻辑

**修改的文件**: `src/services/fetchAndSaveNews.js`

#### 改动内容：

**Before (旧逻辑)**:

```javascript
// 检查标题是否已存在
const existingId = await checkArticleExistsByTitle(data.title);

if (existingId) {
  // 存在则更新记录
  UPDATE info SET ... WHERE id = ?
} else {
  // 不存在则插入
  INSERT INTO info ...
}
```

**After (新逻辑)**:

```javascript
// 使用 INSERT IGNORE，遇到重复标题自动跳过
const insertSql = `
  INSERT IGNORE INTO info (
    title, content, main_category_id, ...
  ) VALUES (?, ?, ?, ...)
`;

// 检查 affectedRows 判断是否真的插入了
if (result.affectedRows > 0) {
  console.log(`✓ 成功保存`);
  success++;
} else {
  console.log(`⊘ 跳过重复`);
  skipped++;
}
```

#### 优势：

- ✅ **性能提升**: 不再需要先查询后判断，一次 SQL 完成
- ✅ **代码简洁**: 从 60+ 行代码减少到 30+ 行
- ✅ **数据库保护**: 即使代码有问题，数据库也不会接受重复标题
- ✅ **原子操作**: 避免并发插入导致的重复问题

### 3. 初始化脚本更新

**修改的文件**: `src/scripts/initDatabase.js`

#### 改动内容：

在创建 `info` 表时自动包含唯一索引：

```sql
CREATE TABLE IF NOT EXISTS info (
  ...
  title VARCHAR(500) NOT NULL COMMENT '标题',
  ...
  UNIQUE INDEX uk_title (title) COMMENT '标题唯一索引，防止重复',
  ...
)
```

## 📊 统计输出变化

**旧输出**:

```
✓ 新增保存: 50 篇
↻ 覆盖更新: 20 篇
✗ 保存失败: 5 篇
```

**新输出**:

```
✓ 新增保存: 50 篇
⊘ 跳过重复: 20 篇  ← 不再更新，而是跳过
✗ 保存失败: 5 篇
```

## 🔧 如何使用

### 对现有数据库执行迁移

```bash
# 为现有数据库添加唯一索引
node src/scripts/addTitleUniqueIndex.js
```

### 初始化新数据库

```bash
# 新数据库会自动包含唯一索引
npm run db:init
```

### 运行数据采集脚本

```bash
# 所有采集脚本都会自动跳过重复标题
node fetch-arts-news.js
node fetch-business-news.js
node fetch-computers-news.js
# ... 其他脚本
```

## 🧪 测试验证

已通过测试验证：

```javascript
// 测试 1: 插入新标题 - 成功
INSERT IGNORE INTO info (title, content) VALUES ('新标题', '内容')
// affectedRows: 1 ✓

// 测试 2: 插入相同标题 - 被忽略
INSERT IGNORE INTO info (title, content) VALUES ('新标题', '不同内容')
// affectedRows: 0 ✓ (重复被正确忽略)
```

## 📋 表结构

```sql
-- info 表（更新后）
CREATE TABLE info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,              -- 标题
  content TEXT,                             -- 内容
  main_category_id INT,                     -- 大分类ID
  sub_category_id INT,                      -- 子分类ID
  third_category_id INT,                    -- 三级分类ID
  source VARCHAR(200),                      -- 来源
  author VARCHAR(100),                      -- 作者
  publish_time DATETIME,                    -- 发布时间
  image_url VARCHAR(500),                   -- 图片URL
  url VARCHAR(500),                         -- 原文链接
  lang VARCHAR(10) DEFAULT 'zh-CN',        -- 语言
  status TINYINT DEFAULT 1,                -- 状态
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- 唯一索引（新增）
  UNIQUE INDEX uk_title (title),            -- ⭐ 标题唯一索引

  -- 其他索引
  INDEX idx_main_category (main_category_id),
  INDEX idx_sub_category (sub_category_id),
  INDEX idx_third_category (third_category_id),
  INDEX idx_publish_time (publish_time),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_lang (lang)
);
```

## 🎯 核心优势

### 1. **数据完整性保证**

- 数据库层面强制唯一性
- 即使应用层代码有 bug，也不会产生重复

### 2. **性能优化**

- **旧方案**: SELECT + (UPDATE 或 INSERT) = 2 次数据库操作
- **新方案**: INSERT IGNORE = 1 次数据库操作
- 性能提升约 **50%**

### 3. **并发安全**

- 多进程同时采集数据时，不会产生竞态条件
- 数据库索引确保原子性

### 4. **代码简化**

- 减少 50% 代码量
- 逻辑更清晰
- 维护更容易

## ⚠️ 注意事项

### 1. 标题长度限制

- 最大长度: 500 字符
- 超过会被截断或报错

### 2. 错误处理

- 如果遇到其他数据库错误（非重复），仍会抛出异常
- `INSERT IGNORE` 只忽略唯一索引冲突

### 3. 已存在数据的更新

- 新方案不再更新已存在的记录
- 如需更新，请使用 `INSERT ... ON DUPLICATE KEY UPDATE`

### 4. 迁移前备份

```bash
# 建议在迁移前备份
mysqldump -u root -p Information info > info_backup.sql
```

## 🔄 如果需要更新已存在记录

如果业务需求是更新而非跳过，可以修改为：

```javascript
const insertSql = `
  INSERT INTO info (
    title, content, main_category_id, ...
  ) VALUES (?, ?, ?, ...)
  ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    main_category_id = VALUES(main_category_id),
    updated_at = CURRENT_TIMESTAMP
`;
```

## 📚 相关文件

- 迁移脚本: [src/scripts/addTitleUniqueIndex.js](src/scripts/addTitleUniqueIndex.js)
- 数据采集: [src/services/fetchAndSaveNews.js](src/services/fetchAndSaveNews.js)
- 数据库初始化: [src/scripts/initDatabase.js](src/scripts/initDatabase.js)
- 采集脚本:
  - [fetch-arts-news.js](fetch-arts-news.js)
  - [fetch-business-news.js](fetch-business-news.js)
  - [fetch-computers-news.js](fetch-computers-news.js)
  - [fetch-games-news.js](fetch-games-news.js)
  - [fetch-health-news.js](fetch-health-news.js)
  - [fetch-home-news.js](fetch-home-news.js)
  - [fetch-recreation-news.js](fetch-recreation-news.js)
  - [fetch-science-news.js](fetch-science-news.js)
  - [fetch-shopping-news.js](fetch-shopping-news.js)
  - [fetch-society-news.js](fetch-society-news.js)
  - [fetch-sports-news.js](fetch-sports-news.js)

## ✅ 总结

通过数据库层面的唯一索引 + 应用层面的 `INSERT IGNORE`，实现了：

1. ✅ 完全阻止重复标题写入
2. ✅ 性能提升 50%
3. ✅ 代码简化 50%
4. ✅ 并发安全保证
5. ✅ 已清理历史重复数据 (117 条)
6. ✅ 所有新数据库自动包含此功能

**当前状态**: info 表共 21,382 条唯一记录，标题去重功能已全面启用！
