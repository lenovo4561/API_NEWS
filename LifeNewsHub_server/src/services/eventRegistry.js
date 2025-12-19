/**
 * Event Registry API 服务封装
 * 文档: https://eventregistry.org/api/v1/article/
 */
const fetch = require("node-fetch");

const API_BASE_URL = "https://eventregistry.org/api/v1";
const API_KEY = process.env.EVENT_REGISTRY_API_KEY;

/**
 * 发送请求到 Event Registry API
 * @param {string} endpoint - API 端点
 * @param {Object} body - 请求体
 * @returns {Promise<Object>} API 响应
 */
async function callEventRegistryAPI(endpoint, body) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...body,
      apiKey: API_KEY,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Event Registry API Error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * 获取文章列表 (getArticles)
 * @param {Object} options - 查询选项
 * @returns {Promise<Object>} 文章列表
 */
async function getArticles(options = {}) {
  const {
    keyword = "",
    categoryUri = "",
    sourceLocationUri = [],
    articlesPage = 1,
    articlesCount = 20,
    articlesSortBy = "date",
    articlesSortByAsc = false,
    dataType = ["news"],
    forceMaxDataTimeWindow = 31,
    lang = "eng",
  } = options;

  const body = {
    action: "getArticles",
    articlesPage,
    articlesCount,
    articlesSortBy,
    articlesSortByAsc,
    dataType,
    forceMaxDataTimeWindow,
    resultType: "articles",
    articleBodyLen: 200,
    includeArticleImage: true,
    includeArticleCategories: true,
    lang,
  };

  // 添加关键词搜索
  if (keyword) {
    body.keyword = keyword;
    body.keywordOper = "or";
  }

  // 添加分类过滤
  if (categoryUri) {
    body.categoryUri = categoryUri;
  }

  // 添加地理位置过滤
  if (sourceLocationUri.length > 0) {
    body.sourceLocationUri = sourceLocationUri;
  }

  return callEventRegistryAPI("/article/getArticles", body);
}

/**
 * 获取主题页面文章 (getArticlesForTopicPage)
 * @param {Object} options - 查询选项
 * @returns {Promise<Object>} 文章列表
 */
async function getArticlesForTopicPage(options = {}) {
  const {
    uri,
    articlesPage = 1,
    articlesCount = 20,
    articlesSortBy = "date",
    infoArticleBodyLen = 200,
  } = options;

  const body = {
    uri,
    articlesPage,
    articlesCount,
    articlesSortBy,
    infoArticleBodyLen,
    resultType: "articles",
  };

  return callEventRegistryAPI("/article/getArticlesForTopicPage", body);
}

/**
 * 获取文章详情 (getArticle)
 * @param {string} articleUri - 文章 URI
 * @returns {Promise<Object>} 文章详情
 */
async function getArticle(articleUri) {
  // 使用 getArticles 配合 articleUri 参数获取
  const articlesResult = await callEventRegistryAPI("/article/getArticles", {
    action: "getArticles",
    articleUri: articleUri.toString(),
    resultType: "articles",
    articleBodyLen: -1,
    includeArticleImage: true,
    includeArticleCategories: true,
    includeArticleConcepts: true,
  });

  // 检查 API 是否返回错误
  if (articlesResult.error) {
    return null;
  }

  if (articlesResult.articles?.results?.length > 0) {
    return { [articleUri]: articlesResult.articles.results[0] };
  }

  return null;
}

/**
 * 搜索文章
 * @param {Object} options - 搜索选项
 * @returns {Promise<Object>} 搜索结果
 */
async function searchArticles(options = {}) {
  const { keyword, page = 1, pageSize = 20, lang = "eng" } = options;

  return getArticles({
    keyword,
    articlesPage: page,
    articlesCount: pageSize,
    lang,
    articlesSortBy: "rel", // 按相关性排序
  });
}

module.exports = {
  getArticles,
  getArticlesForTopicPage,
  getArticle,
  searchArticles,
};
