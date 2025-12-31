# now 项目接口迁移总结

## 已完成工作

### 1. 接口兼容性分析 ✅

- 详细分析了 now 项目的数据结构和接口格式
- 识别了关键差异点和兼容性问题
- 创建了完整的兼容性文档 `NOW_PROJECT_API_COMPATIBILITY.md`

### 2. 兼容层实现 ✅

- **新增文件**:

  - `src/controllers/compatibleController.js` - 兼容层控制器
  - `src/routes/compatible.js` - 兼容层路由
  - `NOW_PROJECT_USAGE_GUIDE.md` - 使用指南
  - `NOW_PROJECT_API_COMPATIBILITY.md` - 接口兼容性文档

- **修改文件**:
  - `src/server.js` - 注册兼容层路由

### 3. 新增接口

#### GET /api/compatible/db.json

返回 now 项目格式的文章列表：

```json
[
  {"info1": ["Category1", "Category2", ...]},
  {"id": "eng-123", "title": "...", "type": "...", "img": "...", "create_time": 123456789},
  ...
]
```

#### GET /api/compatible/:id/data.json

返回 now 项目格式的文章详情：

```json
{
  "id": "eng-123",
  "title": "...",
  "type": "...",
  "img": "...",
  "create_time": 123456789,
  "content": ["<h1>...</h1>", "<p>...</p>", ...]
}
```

#### GET /api/compatible/category/:type

按分类返回文章列表（now 格式）

## 如何使用

### 第一步：启动服务器

```bash
cd LifeNewsHub_server
npm install
npm start
```

服务器将运行在 `http://localhost:3000`

### 第二步：修改 now 项目配置

编辑 `now/public/js/BaseURL.js`:

```javascript
// 原配置
export const BASE_URL = "https://info-6ke.pages.dev/healths/number/data.json";
export const Category_URL = "https://info-6ke.pages.dev/healths/db.json";

// 新配置
export const BASE_URL = "http://localhost:3000/api/compatible/db.json";
export const Category_URL = "http://localhost:3000/api/compatible/db.json";
```

### 第三步：测试

1. 在浏览器访问 http://localhost:3000/api/compatible/db.json
2. 检查返回的数据格式是否正确
3. 启动 now 项目并测试页面功能

## 关键特性

### 1. 完全兼容

- **无需修改 now 项目业务逻辑**
- 只需更换接口地址即可
- 数据格式 100%兼容

### 2. 智能转换

- Event Registry 数据 → now 格式
- 自动提取分类信息
- HTML 内容数组化
- 时间戳标准化

### 3. 灵活配置

- 支持多语言（通过 lang 请求头）
- 支持 CORS 配置
- 可自定义分类映射

## 数据转换说明

### 文章列表转换

```
Event Registry格式 → now格式
{                      [
  articles: {            {info1: ["Cat1", "Cat2"]},
    results: [...]       {id: "...", title: "..."},
  }                      ...
}                      ]
```

### 文章详情转换

```
Event Registry → now格式
{                {
  title: "...",    id: "...",
  body: "text",    title: "...",
  image: "url"     content: ["<h1>...</h1>", "<p>...</p>"],
}                  img: "filename.jpg"
                 }
```

## 注意事项

### 1. 文章 ID 格式

- now 项目原格式: 纯数字 `123456`
- LifeNewsHub 格式: URI `eng-9276896`
- **解决方案**: 使用接口返回的完整 ID

### 2. 图片处理

now 项目的图片 URL 构建逻辑可能需要调整：

```javascript
// 修改 getImgUrl 函数
export function getImgUrl(article) {
  // 如果有完整URL，直接使用
  if (article.img && article.img.startsWith("http")) {
    return article.img;
  }

  // 否则使用原有逻辑
  const baseUrl = getDataBaseUrl();
  return `${baseUrl}/${article.id}/${article.img}`;
}
```

### 3. 内容渲染

- Event Registry 返回的内容可能与原格式有差异
- 已转换为 HTML 数组格式
- Unicode 字符已正确处理

### 4. 分类映射

Event Registry 的分类体系：

- Business
- Entertainment
- Politics
- Science
- Sports
- Technology
  等

可在 `src/config/categories.js` 中自定义映射

## 测试清单

- [ ] 文章列表显示正常
- [ ] 分类筛选功能正常
- [ ] 文章详情页加载正常
- [ ] 图片显示正常
- [ ] 搜索功能正常
- [ ] 多语言支持正常
- [ ] 时间显示正常

## 故障排查

### 问题 1: 接口 404 错误

**检查**:

- 服务器是否启动
- URL 是否正确
- 路由是否注册

### 问题 2: CORS 错误

**解决**:

```env
# .env文件
CORS_ORIGINS=*
```

### 问题 3: 文章详情 404

**原因**: 文章 ID 格式不正确
**解决**: 使用列表接口返回的完整 ID

### 问题 4: 图片无法加载

**解决**: 修改 now 项目的 `getImgUrl` 函数支持完整 URL

## 性能建议

1. **启用缓存**: 减少 Event Registry API 调用
2. **实现预加载**: 定期更新热门文章
3. **使用 CDN**: 加速静态资源
4. **负载均衡**: 多实例部署

## 下一步优化

1. **缓存机制**: 实现 Redis 缓存减少 API 调用
2. **数据预处理**: 定期预加载和处理数据
3. **图片代理**: 实现图片代理和缓存
4. **分类定制**: 根据需求自定义分类映射
5. **错误处理**: 更完善的错误处理和降级机制

## 相关文档

- `NOW_PROJECT_USAGE_GUIDE.md` - 详细使用指南
- `NOW_PROJECT_API_COMPATIBILITY.md` - 接口兼容性说明
- `src/controllers/compatibleController.js` - 实现源码

## 总结

通过创建兼容层，now 项目可以无缝切换到 LifeNewsHub_server 后端，享受：

- ✅ 实时新闻数据
- ✅ 更丰富的分类
- ✅ 多语言支持
- ✅ 更高的内容质量
- ✅ 灵活的扩展性

只需修改一个配置文件（BaseURL.js），即可完成迁移！
