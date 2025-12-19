/**
 * 工具函数导出
 */
const { articleIdsCache, ArticleIdsCache } = require("./cache");
const {
  formatArticle,
  formatArticleDetail,
  formatPagination,
} = require("./formatter");

module.exports = {
  // 缓存
  articleIdsCache,
  ArticleIdsCache,

  // 格式化
  formatArticle,
  formatArticleDetail,
  formatPagination,
};
