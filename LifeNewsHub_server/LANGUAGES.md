# 语言表 (Languages Table) 文档

## 概述

语言表用于存储系统支持的所有语言信息，包括语言名称和对应的 ISO 639-3 标准语言代码。

## 表结构

### 表名：`languages`

| 字段名     | 类型        | 说明                              | 约束                                                  |
| ---------- | ----------- | --------------------------------- | ----------------------------------------------------- |
| id         | INT         | 主键 ID，自增                     | PRIMARY KEY                                           |
| name       | VARCHAR(50) | 语言名称（如 English, Chinese）   | NOT NULL, UNIQUE                                      |
| code       | VARCHAR(10) | ISO 639-3 语言代码（如 eng, zho） | NOT NULL, UNIQUE                                      |
| status     | TINYINT     | 状态：1-启用，0-禁用              | DEFAULT 1                                             |
| sort_order | INT         | 排序顺序                          | DEFAULT 0                                             |
| created_at | TIMESTAMP   | 创建时间                          | DEFAULT CURRENT_TIMESTAMP                             |
| updated_at | TIMESTAMP   | 更新时间                          | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

### 索引

- PRIMARY KEY: `id`
- UNIQUE KEY: `uk_code` (code)
- UNIQUE KEY: `uk_name` (name)
- INDEX: `idx_status` (status)
- INDEX: `idx_sort_order` (sort_order)

## 支持的语言列表

| 语言名称   | 语言代码 | 语言名称   | 语言代码 |
| ---------- | -------- | ---------- | -------- |
| English    | eng      | Romanian   | ron      |
| Spanish    | spa      | Bulgarian  | bul      |
| Catalan    | cat      | Russian    | rus      |
| Portuguese | por      | Arabic     | ara      |
| German     | deu      | Turkish    | tur      |
| Slovene    | slv      | Indonesian | ind      |
| Italian    | ita      | Chinese    | zho      |
| Croatian   | hrv      | Ukrainian  | ukr      |
| Serbian    | srp      | Persian    | fas      |
| French     | fra      | Hindi      | hin      |
| Czech      | ces      | Urdu       | urd      |
| Slovak     | slk      | Kannada    | kan      |
| Basque     | eus      | Bengali    | ben      |
| Polish     | pol      | Malayalam  | mal      |
| Hungarian  | hun      | Marathi    | mar      |
| Dutch      | nld      | Tamil      | tam      |
| Swedish    | swe      | Panjabi    | pan      |
| Finnish    | fin      | Gujarati   | guj      |
| Danish     | dan      | -          | -        |
| Greek      | ell      | -          | -        |

**总计：38 种语言**

## 初始化语言表

### 使用 npm 命令

```bash
npm run db:init-languages
```

### 直接运行脚本

```bash
node src/scripts/initLanguages.js
```

### 脚本功能

初始化脚本会执行以下操作：

1. 创建 `languages` 表（如果不存在）
2. 检查表中是否已有数据
3. 如果表为空，插入所有 38 种语言数据
4. 显示数据库中所有语言的列表

## 使用示例

### 1. 查询所有启用的语言

```javascript
const { query } = require("../config/database");

async function getActiveLanguages() {
  const sql = `
    SELECT id, name, code, sort_order 
    FROM languages 
    WHERE status = 1 
    ORDER BY sort_order
  `;
  return await query(sql);
}
```

### 2. 根据语言代码查询

```javascript
async function getLanguageByCode(code) {
  const sql = `
    SELECT id, name, code 
    FROM languages 
    WHERE code = ? AND status = 1
  `;
  return await queryOne(sql, [code]);
}
```

### 3. 禁用某个语言

```javascript
async function disableLanguage(languageId) {
  const sql = `
    UPDATE languages 
    SET status = 0 
    WHERE id = ?
  `;
  return await query(sql, [languageId]);
}
```

### 4. 更新语言排序

```javascript
async function updateLanguageOrder(languageId, newOrder) {
  const sql = `
    UPDATE languages 
    SET sort_order = ? 
    WHERE id = ?
  `;
  return await query(sql, [newOrder, languageId]);
}
```

## API 路由示例

可以创建以下 API 端点来访问语言数据：

```javascript
// 在 src/routes/language.js 中
const express = require("express");
const router = express.Router();
const { query } = require("../config/database");

// 获取所有启用的语言
router.get("/languages", async (req, res) => {
  try {
    const sql = `
      SELECT id, name, code, sort_order 
      FROM languages 
      WHERE status = 1 
      ORDER BY sort_order
    `;
    const languages = await query(sql);
    res.json({
      success: true,
      data: languages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch languages",
      error: error.message,
    });
  }
});

module.exports = router;
```

## 与其他表的关联

语言表可以与其他表建立关联，例如：

### 1. 新闻表关联

```sql
-- 在 info 表中添加语言字段
ALTER TABLE info
ADD COLUMN language_id INT COMMENT '语言ID',
ADD CONSTRAINT fk_info_language
  FOREIGN KEY (language_id)
  REFERENCES languages(id);
```

### 2. 多语言内容表

```sql
-- 创建新闻多语言内容表
CREATE TABLE info_translations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  info_id INT NOT NULL,
  language_id INT NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (info_id) REFERENCES info(id) ON DELETE CASCADE,
  FOREIGN KEY (language_id) REFERENCES languages(id),
  UNIQUE KEY uk_info_lang (info_id, language_id)
);
```

## 语言代码标准

表中使用的语言代码遵循 **ISO 639-3** 标准（三字母代码）。

### 常见语言代码参考

- **eng**: English（英语）
- **zho**: Chinese（中文）
- **spa**: Spanish（西班牙语）
- **fra**: French（法语）
- **deu**: German（德语）
- **ara**: Arabic（阿拉伯语）
- **rus**: Russian（俄语）
- **hin**: Hindi（印地语）

### 相关标准

- ISO 639-1: 两字母代码（如 en, zh, es）
- ISO 639-2: 三字母代码（bibliographic/terminologic）
- ISO 639-3: 三字母代码（本表使用的标准）

## 维护建议

1. **添加新语言**：
   - 确保语言代码符合 ISO 639-3 标准
   - 设置合适的 sort_order 值
2. **删除语言**：
   - 建议使用软删除（设置 status = 0）而不是物理删除
   - 检查是否有其他表引用该语言
3. **排序管理**：
   - sort_order 值建议使用 10 的倍数（如 10, 20, 30），便于后续插入
   - 定期检查和调整排序以保持合理的顺序

## 注意事项

1. 语言代码（code）和语言名称（name）都设置了唯一约束，不能重复
2. 默认所有语言状态为启用（status = 1）
3. 创建时间和更新时间会自动维护
4. 建议在禁用语言前检查是否有相关数据依赖

## 扩展功能

可以根据需要扩展以下字段：

- `native_name`: 语言的本地名称（如 "中文"、"Español"）
- `iso_639_1`: 两字母代码
- `iso_639_2`: 三字母代码（T/B 类型）
- `direction`: 文字方向（ltr/rtl）
- `is_rtl`: 是否从右到左书写
- `flag_icon`: 国旗图标 URL
- `locale`: 地区代码（如 en-US, zh-CN）
