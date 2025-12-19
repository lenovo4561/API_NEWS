/**
 * 参数验证中间件
 */
const { APIError } = require("./errorHandler");

// 验证分页参数
function validatePagination(req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 10;

  if (page < 1) {
    throw new APIError("Page must be greater than 0", 400);
  }

  if (pageSize < 1 || pageSize > 100) {
    throw new APIError("Page size must be between 1 and 100", 400);
  }

  req.pagination = { page, pageSize };
  next();
}

// 验证文章ID
function validateArticleId(req, res, next) {
  const articleId = req.query.article_id || req.params.id;

  if (!articleId) {
    throw new APIError("article_id is required", 400);
  }

  req.articleId = articleId;
  next();
}

// 验证搜索关键词
function validateSearchKeyword(req, res, next) {
  const words = req.query.words || req.query.q || "";

  if (!words.trim()) {
    throw new APIError("Search keyword is required", 400);
  }

  if (words.length > 200) {
    throw new APIError("Search keyword is too long (max 200 characters)", 400);
  }

  req.searchKeyword = words.trim();
  next();
}

// 验证语言参数
function validateLanguage(req, res, next) {
  const validLanguages = [
    "en",
    "zh",
    "es",
    "fr",
    "de",
    "ja",
    "ko",
    "pt",
    "ru",
    "ar",
  ];
  const lang = req.headers["lang"] || req.query.lang || "en";

  if (!validLanguages.includes(lang)) {
    throw new APIError(
      `Invalid language. Supported languages: ${validLanguages.join(", ")}`,
      400
    );
  }

  req.lang = lang;
  next();
}

module.exports = {
  validatePagination,
  validateArticleId,
  validateSearchKeyword,
  validateLanguage,
};
