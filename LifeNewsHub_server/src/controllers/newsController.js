/**
 * 新闻控制器
 * 处理新闻相关的业务逻辑
 */
const eventRegistry = require("../services/eventRegistry");
const {
  getAllCategories,
  getCategoryById,
  getEventRegistryLang,
} = require("../config/categories");
const { articleIdsCache } = require("../utils/cache");
const { formatArticle } = require("../utils/formatter");
const { APIError } = require("../middleware");

/**
 * 获取新闻资源（分类列表）
 */
async function getResource(req, res) {
  const lang = req.lang || "en";
  const categories = getAllCategories(lang);

  res.success({
    categories,
  });
}

/**
 * 获取首页数据
 */
async function getHome(req, res) {
  const lang = req.lang || "en";
  const erLang = getEventRegistryLang(lang);
  const topSize = parseInt(req.query.top_size) || 4;

  // 获取热门新闻（头条）
  const topNewsResult = await eventRegistry.getArticles({
    articlesCount: topSize,
    articlesSortBy: "socialScore", // 按社交热度排序
    lang: erLang,
  });

  // 获取最新新闻
  const latestNewsResult = await eventRegistry.getArticles({
    articlesCount: 10,
    articlesSortBy: "date",
    lang: erLang,
  });

  // 获取各分类的新闻
  const categories = getAllCategories(lang);
  const categoryNewsPromises = categories.slice(0, 4).map(async (cat) => {
    const result = await eventRegistry.getArticles({
      categoryUri: cat.uri,
      articlesCount: 5,
      articlesSortBy: "date",
      lang: erLang,
    });
    return {
      category: cat,
      articles: (result.articles?.results || []).map(formatArticle),
    };
  });

  const categoryNews = await Promise.all(categoryNewsPromises);

  res.success({
    top_news: (topNewsResult.articles?.results || []).map(formatArticle),
    latest_news: (latestNewsResult.articles?.results || []).map(formatArticle),
    category_news: categoryNews,
  });
}

/**
 * 获取文章ID列表（带缓存）
 */
async function getArticleIds(req, res) {
  const lang = req.lang || "en";
  const erLang = getEventRegistryLang(lang);
  const count = parseInt(req.query.count) || 50;
  const forceRefresh = req.query.refresh === "true";

  // 检查缓存（如果不是强制刷新）
  if (!forceRefresh) {
    const cachedIds = articleIdsCache.get(erLang);
    if (cachedIds) {
      return res.success({
        ids: cachedIds.slice(0, count),
        total: Math.min(cachedIds.length, count),
        cached: true,
      });
    }
  }

  // 获取最新的文章列表
  const result = await eventRegistry.getArticles({
    articlesCount: Math.max(count, 100), // 至少获取100条用于缓存
    articlesSortBy: "date",
    lang: erLang,
  });

  // 只返回文章ID列表
  const articleIds = (result.articles?.results || []).map(
    (article) => article.uri
  );

  // 缓存结果
  articleIdsCache.set(erLang, articleIds);

  res.success({
    ids: articleIds.slice(0, count),
    total: Math.min(articleIds.length, count),
    cached: false,
  });
}

/**
 * 获取新闻列表（按分类）
 */
async function getList(req, res) {
  const lang = req.lang || "en";
  const erLang = getEventRegistryLang(lang);
  const categoryId = req.query.category_id;
  const { page, pageSize } = req.pagination;

  let categoryUri = "";
  if (categoryId) {
    const category = getCategoryById(categoryId);
    if (category) {
      categoryUri = category.uri;
    }
  }

  const result = await eventRegistry.getArticles({
    categoryUri,
    articlesPage: page,
    articlesCount: pageSize,
    articlesSortBy: "date",
    lang: erLang,
  });

  const articles = (result.articles?.results || []).map(formatArticle);

  res.success({
    list: articles,
    page,
    pageSize,
    total: result.articles?.totalResults || 0,
    hasMore: articles.length === pageSize,
  });
}

/**
 * 搜索新闻
 */
async function searchNews(req, res) {
  const lang = req.lang || "en";
  const erLang = getEventRegistryLang(lang);
  const words = req.query.words || "";
  const { page, pageSize } = req.pagination;

  if (!words) {
    return res.success({
      list: [],
      page,
      pageSize,
      total: 0,
      hasMore: false,
    });
  }

  const result = await eventRegistry.searchArticles({
    keyword: words,
    page,
    pageSize,
    lang: erLang,
  });

  const articles = (result.articles?.results || []).map(formatArticle);

  res.success({
    list: articles,
    page,
    pageSize,
    total: result.articles?.totalResults || 0,
    hasMore: articles.length === pageSize,
  });
}

/**
 * 获取新闻详情
 */
async function getDetail(req, res) {
  const articleId = req.articleId || req.query.article_id;

  const result = await eventRegistry.getArticle(articleId);

  if (!result || Object.keys(result).length === 0) {
    throw new APIError("Article not found or no longer available", 404);
  }

  // getArticle 返回的数据结构是 { articleUri: { ... } }
  const articleData = result[articleId] || result;

  const article = {
    id: articleData.uri || articleId,
    title: articleData.title || "",
    body: articleData.body || "",
    image: articleData.image || "",
    source: articleData.source?.title || "",
    sourceUrl: articleData.url || "",
    author:
      articleData.authors?.length > 0
        ? articleData.authors.map((a) => a.name).join(", ")
        : "",
    publishedAt: articleData.dateTime || articleData.date || "",
    category: articleData.categories?.[0]?.label || "",
    lang: articleData.lang || "eng",
    concepts:
      articleData.concepts?.slice(0, 5).map((c) => c.label?.eng || c.label) ||
      [],
  };

  res.success(article);
}

module.exports = {
  getResource,
  getHome,
  getArticleIds,
  getList,
  searchNews,
  getDetail,
};
