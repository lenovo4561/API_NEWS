# LifeNewsHub - 纯 JS/HTML 版本

这是 LifeNewsHub 的纯 JavaScript 和 HTML 重构版本，无需任何框架依赖。

## 项目结构

```
LifeNewsHub_new/
├── index.html              # 主页
├── category.html           # 分类页面
├── news-detail.html        # 新闻详情页
├── search.html             # 搜索页面
├── privacy-policy.html     # 隐私政策
├── terms.html              # 使用条款
├── css/
│   └── style.css          # 全局样式
├── js/
│   ├── api.js             # API请求函数
│   ├── utils.js           # 工具函数
│   ├── components.js      # 公共组件
│   ├── home.js            # 主页逻辑
│   ├── category.js        # 分类页逻辑
│   ├── news-detail.js     # 详情页逻辑
│   └── search.js          # 搜索页逻辑
└── public/
    ├── ads.txt
    └── collect.js

```

## 功能特性

- ✅ 响应式设计，支持移动端和桌面端
- ✅ 新闻列表展示（首页、分类页）
- ✅ 新闻详情页
- ✅ 搜索功能
- ✅ 分类导航
- ✅ 图片懒加载
- ✅ 日期格式化

## 使用方法

1. 配置环境变量（在 js/api.js 中）
2. 使用 Web 服务器打开 index.html
3. 或者直接双击 index.html 在浏览器中打开

## 技术栈

- 纯 HTML5
- 纯 CSS3
- 纯 JavaScript (ES6+)
- 无任何第三方依赖
