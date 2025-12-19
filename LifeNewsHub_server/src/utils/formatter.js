/**
 * 数据格式化工具
 */

/**
 * 格式化文章数据为前端需要的格式
 * @param {Object} article - Event Registry 文章对象
 * @returns {Object} 格式化后的文章
 */
function formatArticle(article) {
  return {
    id: article.uri,
    title: article.title,
    summary: article.body ? article.body.substring(0, 200) + "..." : "",
    body: article.body || "",
    image: article.image || "",
    source: article.source?.title || "",
    sourceUrl: article.url || "",
    author:
      article.authors?.length > 0
        ? article.authors.map((a) => a.name).join(", ")
        : "",
    publishedAt: article.dateTime || article.date || "",
    category: article.categories?.[0]?.label || "",
    lang: article.lang || "eng",
  };
}

/**
 * 格式化文章详情
 * @param {Object} article - Event Registry 文章对象
 * @returns {Object} 格式化后的文章详情
 */
function formatArticleDetail(article) {
  return {
    ...formatArticle(article),
    concepts:
      article.concepts?.slice(0, 5).map((c) => c.label?.eng || c.label) || [],
    location: article.location || null,
    sentiment: article.sentiment || null,
  };
}

/**
 * 格式化分页数据
 * @param {Array} list - 数据列表
 * @param {number} page - 当前页码
 * @param {number} pageSize - 每页数量
 * @param {number} total - 总数
 * @returns {Object} 格式化后的分页数据
 */
function formatPagination(list, page, pageSize, total) {
  return {
    list,
    page,
    pageSize,
    total,
    hasMore: list.length === pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

module.exports = {
  formatArticle,
  formatArticleDetail,
  formatPagination,
};
