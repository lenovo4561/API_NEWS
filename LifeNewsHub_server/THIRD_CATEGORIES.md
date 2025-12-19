# 三级分类数据解析

## 概述

从 `data.js` 文件中解析出的 HTML 三级分类结构，生成了标准的 JSON 格式数据。

## 数据结构

```
Arts (一级分类/主分类)
├── Animation (二级分类)
│   ├── Anime (三级分类)
│   ├── Artists (三级分类)
│   ├── Awards (三级分类)
│   ├── Cartoons (三级分类)
│   ├── Collectibles (三级分类)
│   ├── Contests (三级分类)
│   ├── Experimental (三级分类)
│   ├── Festivals (三级分类)
│   ├── Magazines and E-zines (三级分类)
│   ├── Movies (三级分类)
│   ├── Organizations (三级分类)
│   ├── Production (三级分类)
│   ├── Stop-Motion (三级分类)
│   ├── Training (三级分类)
│   ├── Voice Actors (三级分类)
│   ├── Web (三级分类)
│   └── Writers (三级分类)
├── Architecture (二级分类)
│   ├── Archives (三级分类)
│   ├── Associations (三级分类)
│   ├── Building Types (三级分类)
│   ├── Education (三级分类)
│   ├── Experimental (三级分类)
│   ├── Famous Names (三级分类)
│   ├── History (三级分类)
│   ├── Landscape (三级分类)
│   └── Preservation (三级分类)
├── Art History (二级分类，无三级)
├── Awards (二级分类，无三级)
├── Bodyart (二级分类，无三级)
└── ... 其他 56 个二级分类
```

## 统计信息

- **主分类**: 1 个 (Arts)
- **二级分类**: 58 个
- **有三级分类的二级分类**: 2 个 (Animation, Architecture)
- **三级分类总数**: 26 个
  - Animation: 17 个三级分类
  - Architecture: 9 个三级分类

## 生成的文件

### 1. thirdCategories.json

标准 JSON 格式，包含完整的分类树结构：

```json
{
  "name": "Arts",
  "key": "Arts",
  "subCategories": [
    {
      "name": "Animation",
      "key": "Animation",
      "thirdCategories": [
        {
          "name": "Anime",
          "key": "Anime"
        },
        ...
      ]
    },
    ...
  ]
}
```

### 2. thirdCategories.js

Node.js 模块格式，可直接在项目中使用：

```javascript
const thirdCategories = require("./thirdCategories");

// 访问数据
console.log(thirdCategories.name); // "Arts"
console.log(thirdCategories.subCategories[0].name); // "Animation"
console.log(thirdCategories.subCategories[0].thirdCategories[0].name); // "Anime"
```

## 字段说明

每个分类对象包含以下字段：

- **name**: 分类的显示名称（原始英文名）
- **key**: 分类的键值（用于 URL、数据库等，采用 Snake_Case 格式）
- **subCategories** / **thirdCategories**: 子分类数组

## 使用方法

### 重新生成数据

```bash
npm run parse:thirds
```

### 在代码中使用

```javascript
// 方式 1: 使用 JSON 文件
const categories = require("./thirdCategories.json");

// 方式 2: 使用 JS 模块
const categories = require("./thirdCategories");

// 遍历所有二级分类
categories.subCategories.forEach((sub) => {
  console.log(`二级分类: ${sub.name}`);

  // 遍历三级分类（如果有）
  sub.thirdCategories.forEach((third) => {
    console.log(`  三级分类: ${third.name}`);
  });
});

// 查找特定分类
const animation = categories.subCategories.find((s) => s.key === "Animation");
console.log(`Animation 有 ${animation.thirdCategories.length} 个三级分类`);
```

## 注意事项

1. 当前 data.js 文件只包含 **Arts** 主分类的数据
2. 其他主分类（Business、Computers、Games 等）在原始 HTML 中显示为空（只有 `<!---->`）
3. key 值自动生成，规则：
   - 移除特殊字符
   - 空格替换为下划线
   - 连字符替换为下划线
   - 移除首尾下划线
   - 示例: `"Magazines and E-zines"` → `"Magazines_and_E_zines"`

## 解析脚本位置

- 脚本路径: `src/scripts/parseThirdCategories.js`
- 源数据: `data.js` (HTML 格式)
- 输出: `thirdCategories.json` 和 `thirdCategories.js`
