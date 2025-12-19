# Arts 三级分类数据导入完成

## 导入概述

已成功将 `data.js` 中的 Arts 大分类下的所有二级和三级分类数据导入到 `category_third` 表。

## 导入时间

2025 年 12 月 19 日

## 导入结果

### 统计数据

- **主分类**: Arts (艺术)
- **二级分类数**: 9 个
- **三级分类总数**: 100 个
- **成功导入**: 100 条
- **导入失败**: 1 条 (Painting - 重复记录)

### 各二级分类的三级分类数量

| 排名 | 二级分类   | 英文 Key              | 三级分类数量 |
| ---- | ---------- | --------------------- | ------------ |
| 1    | 视觉艺术   | Visual_Arts           | 26           |
| 2    | 作家资源   | Writers_Resources     | 19           |
| 3    | 表演艺术   | Performing_Arts       | 18           |
| 4    | 人体彩绘   | Bodyart               | 10           |
| 5    | 平面设计   | Graphic_Design        | 10           |
| 6    | 在线写作   | Online_Writing        | 7            |
| 7    | 数字艺术   | Digital               | 5            |
| 8    | 人文科学   | Humanities            | 3            |
| 9    | 时期和运动 | Periods_and_Movements | 2            |

## 数据结构

### category_third 表字段

- `id`: 主键 ID（自增）
- `third_category_key`: 三级分类英文标识（英文 Key）
- `sub_category_id`: 所属二级分类 ID
- `name`: 三级分类名称（中文）
- `description`: 分类描述
- `sort_order`: 排序顺序
- `status`: 状态（1-正常，0-禁用）
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 数据示例

```json
{
  "id": 1,
  "third_category_key": "Articles",
  "sub_category_id": 226,
  "name": "文章",
  "sort_order": 1,
  "status": 1
}
```

## 翻译映射

所有三级分类的 `third_category_key` 字段保存英文标识，`name` 字段保存对应的中文翻译。

### 翻译示例

| 英文 Key        | 中文名称   |
| --------------- | ---------- |
| Articles        | 文章       |
| Bodypainting    | 身体彩绘   |
| Games_and_Humor | 游戏和幽默 |
| Image_Galleries | 图片库     |
| ASCII_Art       | ASCII 艺术 |
| Calligraphy     | 书法       |
| Acrobatics      | 杂技       |
| Theatre         | 戏剧       |

## 导入脚本

### 主导入脚本

**文件路径**: `src/scripts/importArtsThirdCategories.js`

**功能**:

1. 从 data.js 读取 Arts 分类的数据结构
2. 将三级分类的英文名称作为 `third_category_key`
3. 将中文翻译作为 `name` 字段
4. 按顺序导入到 category_third 表
5. 自动跳过已存在的记录

**运行命令**:

```bash
node src/scripts/importArtsThirdCategories.js
```

### 验证脚本

**文件路径**:

- `src/scripts/verifyThirdCategories.js` - 查看前 30 条记录
- `src/scripts/showAllArtsThirdCategories.js` - 查看所有记录统计

**运行命令**:

```bash
node src/scripts/verifyThirdCategories.js
node src/scripts/showAllArtsThirdCategories.js
```

## 完整的三级分类列表

### 1. 人体彩绘 (Bodyart) - 10 个

- 文章 (Articles)
- 身体彩绘 (Bodypainting)
- 游戏和幽默 (Games_and_Humor)
- 图片库 (Image_Galleries)
- 许可和法规 (Licensing_and_Regulations)
- 杂志和电子杂志 (Magazines_and_E_zines)
- 穿孔 (Piercing)
- 学校和教学 (Schools_and_Instruction)
- 工作室 (Studios)
- 纹身 (Tattoo)

### 2. 人文科学 (Humanities) - 3 个

- 名著索引 (Great_Books_Indices)
- 艺术中的文学 (Literature_in_Art)
- 学术和技术 (Scholarship_and_Technology)

### 3. 作家资源 (Writers_Resources) - 19 个

- 图书写作 (Book_Writing)
- 儿童写作 (Childrens_Writing)
- 比赛 (Contests)
- 文案编辑 (Copy_Editing)
- 常见问题和教程 (FAQs_Help_and_Tutorials)
- 小说 (Fiction)
- 自由职业 (Freelancing)
- 非小说 (Non_Fiction)
- 在线社区 (Online_Communities)
- 组织 (Organizations)
- 剧本创作 (Playwriting)
- 诗歌 (Poetry)
- 出版 (Publishing)
- 研究 (Research)
- 编剧 (Screenwriting)
- 软件 (Software)
- 风格指南 (Style_Guides)
- 写作练习 (Writing_Exercises)
- 青年作家 (Young_Writers)

### 4. 在线写作 (Online_Writing) - 7 个

- 戏剧 (Drama)
- 电子杂志 (E_zines)
- 小说 (Fiction)
- 期刊 (Journals)
- 混合流派 (Mixed_Genre)
- 非小说 (Non_Fiction)
- 诗歌 (Poetry)

### 5. 平面设计 (Graphic_Design) - 10 个

- 集体 (Collectives)
- 教育 (Education)
- 就业 (Employment)
- 平面设计师 (Graphic_Designers)
- 历史 (History)
- 杂志和电子杂志 (Magazines_and_E_zines)
- 组织 (Organizations)
- 个人页面 (Personal_Pages)
- 软件 (Software)
- 字体设计 (Typography)

### 6. 数字艺术 (Digital) - 5 个

- 进化艺术 (Evolutive)
- 装置和表演 (Installations_and_Performances)
- 杂志和电子杂志 (Magazines_and_E_zines)
- 网络艺术 (Net_Art)
- 虚拟现实 (Virtual_Reality)

### 7. 时期和运动 (Periods_and_Movements) - 2 个

- 新艺术运动 (Art_Nouveau)
- 伊斯兰 (Islamic)

### 8. 表演艺术 (Performing_Arts) - 18 个

- 杂技 (Acrobatics)
- 表演 (Acting)
- 街头表演 (Busking_and_Street_Performing)
- 马戏 (Circus)
- 喜剧 (Comedy)
- 舞蹈 (Dance)
- 教育 (Education)
- 节日 (Festivals)
- 催眠 (Hypnotism)
- 魔术 (Magic)
- 组织 (Organizations)
- 表演者 (Performers)
- 出版物 (Publications)
- 木偶戏 (Puppetry)
- 讲故事 (Storytelling)
- 特技 (Stunts)
- 戏剧 (Theatre)
- 场馆 (Venues)

### 9. 视觉艺术 (Visual_Arts) - 26 个

- ASCII 艺术 (ASCII_Art)
- 拼贴艺术 (Assemblage_Art)
- 书法 (Calligraphy)
- 拼贴画 (Collage)
- 集体 (Collectives)
- 计算机图形 (Computer_Graphics)
- 比赛 (Contests)
- 绘画 (Drawing)
- 教育 (Education)
- 环境和自然 (Environment_and_Nature)
- 画廊 (Galleries)
- 装置艺术 (Installation_Art)
- 杂志和电子杂志 (Magazines_and_E_zines)
- 邮件艺术和艺术邮票 (Mail_Art_and_Artistamps)
- 原住民和部落 (Native_and_Tribal)
- 物体艺术 (Object_Based_Art)
- 组织 (Organizations)
- 行为艺术 (Performance_Art)
- 版画 (Printmaking)
- 私人画商 (Private_Dealers)
- 公共艺术 (Public_Art)
- 研究 (Research)
- 评论 (Reviews)
- 雕塑 (Sculpture)
- 场地特定艺术 (Site_Specific_Art)
- 主题 (Thematic)

## 数据查询示例

### 查询所有 Arts 分类的三级分类

```sql
SELECT
  ct.id,
  ct.third_category_key,
  ct.name,
  cs.name as sub_category_name,
  cs.sub_category_key
FROM category_third ct
JOIN category_sub cs ON ct.sub_category_id = cs.id
JOIN category_main cm ON cs.main_category_id = cm.id
WHERE cm.category_key = 'Arts'
ORDER BY cs.name, ct.sort_order;
```

### 根据 Key 查询特定三级分类

```sql
SELECT
  ct.*,
  cs.name as sub_category_name,
  cm.name as main_category_name
FROM category_third ct
JOIN category_sub cs ON ct.sub_category_id = cs.id
JOIN category_main cm ON cs.main_category_id = cm.id
WHERE cm.category_key = 'Arts'
  AND cs.sub_category_key = 'Visual_Arts'
  AND ct.third_category_key = 'ASCII_Art';
```

### 统计各二级分类的三级分类数量

```sql
SELECT
  cs.name as sub_category_name,
  cs.sub_category_key,
  COUNT(ct.id) as third_count
FROM category_sub cs
LEFT JOIN category_third ct ON cs.id = ct.sub_category_id
WHERE cs.main_category_id = 16
GROUP BY cs.id, cs.name, cs.sub_category_key
HAVING third_count > 0
ORDER BY third_count DESC;
```

## API 使用示例

### 获取三级分类列表

```javascript
// GET /api/category/Arts/Visual_Arts/thirds
{
  "success": true,
  "data": [
    {
      "id": 1,
      "third_category_key": "ASCII_Art",
      "name": "ASCII艺术",
      "sort_order": 1
    },
    // ...
  ],
  "meta": {
    "total": 26,
    "mainCategory": "Arts",
    "subCategory": "Visual_Arts"
  }
}
```

### 获取单个三级分类详情

```javascript
// GET /api/category/Arts/Visual_Arts/ASCII_Art
{
  "success": true,
  "data": {
    "id": 1,
    "third_category_key": "ASCII_Art",
    "name": "ASCII艺术",
    "sub_category_name": "视觉艺术",
    "main_category_name": "艺术"
  }
}
```

## 注意事项

1. **唯一性约束**: `third_category_key` 与 `sub_category_id` 组合构成唯一键
2. **命名规范**: Key 使用下划线分隔的英文（Snake_Case）
3. **排序顺序**: `sort_order` 字段保证了三级分类的显示顺序
4. **状态管理**: 所有导入的分类默认状态为 1（正常）

## 未导入的分类

以下二级分类在数据库中不存在，因此其三级分类未能导入：

- Animation (动画)
- Architecture (建筑)
- Art History (艺术史)
- Awards (奖项)
- Classical Studies (古典研究)
- Comics (漫画)
- Contests (比赛)
- Costumes (服装)
- Crafts (工艺品)
- Design (设计)
- Education (教育)
- Entertainment (娱乐)
- Genres (流派)
- Illustration (插画)
- Literature (文学)
- Magazines and E-zines (杂志和电子杂志)
- Movies (电影)
- Music (音乐)
- Organizations (组织)
- Photography (摄影)
- Radio (广播)
- Television (电视)
- Video (视频)

如需导入这些分类的三级分类，需要先在 `category_sub` 表中创建对应的二级分类记录。

## 相关文档

- [数据库文档](DATABASE.md)
- [三级分类 Key 文档](THIRD_CATEGORY_KEY.md)
- [分类 Key 迁移文档](CATEGORY_KEY_MIGRATION.md)
- [三级分类总结](THREE_LEVEL_CATEGORY_SUMMARY.md)

## 版本历史

- **v1.0** (2025-12-19): 首次导入 Arts 分类的 100 个三级分类数据
