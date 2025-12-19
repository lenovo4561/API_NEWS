# 语言 API 使用指南

## 概述

语言 API 提供了访问系统支持的所有语言信息的接口，包括语言名称、ISO 639-3 代码等。

## 基础信息

- **基础路径**: `/api/languages`
- **响应格式**: JSON
- **字符编码**: UTF-8

## API 端点

### 1. 获取所有语言列表

获取所有启用的语言列表。

**请求**

```
GET /api/languages
```

**查询参数**

| 参数   | 类型   | 必填 | 说明                                                   |
| ------ | ------ | ---- | ------------------------------------------------------ |
| status | number | 否   | 语言状态：1-启用，0-禁用。不传此参数默认返回启用的语言 |

**示例请求**

```bash
# 获取所有启用的语言（默认）
curl http://localhost:3000/api/languages

# 获取所有语言（包括禁用的）
curl http://localhost:3000/api/languages?status=

# 只获取禁用的语言
curl http://localhost:3000/api/languages?status=0
```

**成功响应**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "English",
      "code": "eng",
      "status": 1,
      "sort_order": 1
    },
    {
      "id": 2,
      "name": "Spanish",
      "code": "spa",
      "status": 1,
      "sort_order": 2
    },
    {
      "id": 27,
      "name": "Chinese",
      "code": "zho",
      "status": 1,
      "sort_order": 27
    }
    // ... 更多语言
  ],
  "meta": {
    "total": 38,
    "message": "Successfully fetched languages"
  }
}
```

### 2. 根据语言代码获取语言

根据 ISO 639-3 语言代码获取单个语言的详细信息。

**请求**

```
GET /api/languages/:code
```

**路径参数**

| 参数 | 类型   | 必填 | 说明                                   |
| ---- | ------ | ---- | -------------------------------------- |
| code | string | 是   | ISO 639-3 语言代码（如 eng, spa, zho） |

**示例请求**

```bash
# 获取英语信息
curl http://localhost:3000/api/languages/eng

# 获取中文信息
curl http://localhost:3000/api/languages/zho

# 获取西班牙语信息
curl http://localhost:3000/api/languages/spa
```

**成功响应**

```json
{
  "success": true,
  "data": {
    "id": 27,
    "name": "Chinese",
    "code": "zho",
    "status": 1,
    "sort_order": 27,
    "created_at": "2025-12-19T08:30:15.000Z",
    "updated_at": "2025-12-19T08:30:15.000Z"
  }
}
```

**错误响应**

```json
{
  "success": false,
  "message": "Language not found",
  "meta": {
    "code": "xyz"
  }
}
```

### 3. 根据语言 ID 获取语言

根据语言 ID 获取单个语言的详细信息。

**请求**

```
GET /api/languages/id/:id
```

**路径参数**

| 参数 | 类型   | 必填 | 说明    |
| ---- | ------ | ---- | ------- |
| id   | number | 是   | 语言 ID |

**示例请求**

```bash
# 获取ID为1的语言（英语）
curl http://localhost:3000/api/languages/id/1

# 获取ID为27的语言（中文）
curl http://localhost:3000/api/languages/id/27
```

**成功响应**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "English",
    "code": "eng",
    "status": 1,
    "sort_order": 1,
    "created_at": "2025-12-19T08:30:15.000Z",
    "updated_at": "2025-12-19T08:30:15.000Z"
  }
}
```

**错误响应**

```json
{
  "success": false,
  "message": "Language not found",
  "meta": {
    "id": "999"
  }
}
```

### 4. 获取语言统计信息

获取语言表的统计数据。

**请求**

```
GET /api/languages/stats/summary
```

**示例请求**

```bash
curl http://localhost:3000/api/languages/stats/summary
```

**成功响应**

```json
{
  "success": true,
  "data": {
    "total": 38,
    "enabled": 38,
    "disabled": 0
  },
  "meta": {
    "message": "Successfully fetched language statistics"
  }
}
```

## 使用场景示例

### 场景 1: 前端语言选择器

在前端创建语言选择下拉菜单：

```javascript
// 获取所有启用的语言
fetch("http://localhost:3000/api/languages")
  .then((response) => response.json())
  .then((result) => {
    if (result.success) {
      const languages = result.data;
      // 渲染语言选择器
      const select = document.getElementById("language-select");
      languages.forEach((lang) => {
        const option = document.createElement("option");
        option.value = lang.code;
        option.textContent = lang.name;
        select.appendChild(option);
      });
    }
  });
```

### 场景 2: 验证语言代码

在处理用户输入的语言代码时验证其有效性：

```javascript
async function validateLanguageCode(code) {
  try {
    const response = await fetch(`http://localhost:3000/api/languages/${code}`);
    const result = await response.json();
    return result.success;
  } catch (error) {
    return false;
  }
}

// 使用
const isValid = await validateLanguageCode("eng"); // true
const isInvalid = await validateLanguageCode("xyz"); // false
```

### 场景 3: 获取语言显示名称

根据语言代码获取其显示名称：

```javascript
async function getLanguageName(code) {
  try {
    const response = await fetch(`http://localhost:3000/api/languages/${code}`);
    const result = await response.json();
    return result.success ? result.data.name : "Unknown";
  } catch (error) {
    return "Unknown";
  }
}

// 使用
const name = await getLanguageName("zho"); // "Chinese"
```

### 场景 4: React 组件示例

```jsx
import React, { useState, useEffect } from "react";

function LanguageSelector() {
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState("eng");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/languages");
      const result = await response.json();
      if (result.success) {
        setLanguages(result.data);
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading languages...</div>;

  return (
    <div>
      <select
        value={selectedLang}
        onChange={(e) => setSelectedLang(e.target.value)}
      >
        {languages.map((lang) => (
          <option key={lang.id} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelector;
```

### 场景 5: Vue 组件示例

```vue
<template>
  <div>
    <select v-model="selectedLang" @change="onLanguageChange">
      <option v-for="lang in languages" :key="lang.id" :value="lang.code">
        {{ lang.name }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  data() {
    return {
      languages: [],
      selectedLang: "eng",
    };
  },
  mounted() {
    this.fetchLanguages();
  },
  methods: {
    async fetchLanguages() {
      try {
        const response = await fetch("http://localhost:3000/api/languages");
        const result = await response.json();
        if (result.success) {
          this.languages = result.data;
        }
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    },
    onLanguageChange() {
      this.$emit("language-changed", this.selectedLang);
    },
  },
};
</script>
```

## 响应字段说明

### Language 对象

| 字段       | 类型   | 说明                      |
| ---------- | ------ | ------------------------- |
| id         | number | 语言唯一标识 ID           |
| name       | string | 语言名称（英文）          |
| code       | string | ISO 639-3 语言代码        |
| status     | number | 状态：1-启用，0-禁用      |
| sort_order | number | 排序顺序                  |
| created_at | string | 创建时间（ISO 8601 格式） |
| updated_at | string | 更新时间（ISO 8601 格式） |

## 支持的语言代码

以下是系统支持的所有 ISO 639-3 语言代码：

| 代码 | 语言       | 代码 | 语言       |
| ---- | ---------- | ---- | ---------- |
| eng  | English    | ron  | Romanian   |
| spa  | Spanish    | bul  | Bulgarian  |
| cat  | Catalan    | rus  | Russian    |
| por  | Portuguese | ara  | Arabic     |
| deu  | German     | tur  | Turkish    |
| slv  | Slovene    | ind  | Indonesian |
| ita  | Italian    | zho  | Chinese    |
| hrv  | Croatian   | ukr  | Ukrainian  |
| srp  | Serbian    | fas  | Persian    |
| fra  | French     | hin  | Hindi      |
| ces  | Czech      | urd  | Urdu       |
| slk  | Slovak     | kan  | Kannada    |
| eus  | Basque     | ben  | Bengali    |
| pol  | Polish     | mal  | Malayalam  |
| hun  | Hungarian  | mar  | Marathi    |
| nld  | Dutch      | tam  | Tamil      |
| swe  | Swedish    | pan  | Panjabi    |
| fin  | Finnish    | guj  | Gujarati   |
| dan  | Danish     | -    | -          |
| ell  | Greek      | -    | -          |

## 错误处理

所有 API 端点都遵循统一的错误响应格式：

```json
{
  "success": false,
  "message": "错误描述信息",
  "error": {
    "code": "ERROR_CODE",
    "details": "详细错误信息"
  }
}
```

### 常见错误码

| HTTP 状态码 | 说明                     |
| ----------- | ------------------------ |
| 200         | 成功                     |
| 404         | 资源不存在（语言未找到） |
| 500         | 服务器内部错误           |

## 性能建议

1. **缓存语言列表**: 语言数据变化不频繁，建议在客户端缓存
2. **使用语言代码**: 在 API 交互中优先使用语言代码而非 ID
3. **批量请求**: 如需多个语言信息，使用列表接口而非多次单个请求

## 测试示例

### 使用 curl 测试

```bash
# 测试获取所有语言
curl http://localhost:3000/api/languages

# 测试获取特定语言
curl http://localhost:3000/api/languages/eng

# 测试获取统计信息
curl http://localhost:3000/api/languages/stats/summary
```

### 使用 Postman

1. 创建新的 GET 请求
2. 输入 URL: `http://localhost:3000/api/languages`
3. 点击 Send
4. 查看响应数据

## 相关文档

- [语言表文档](LANGUAGES.md)
- [数据库文档](DATABASE.md)
- [API 总览](README.md)
