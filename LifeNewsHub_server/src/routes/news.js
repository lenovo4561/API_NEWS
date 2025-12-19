/**
 * 新闻 API 路由
 * 提供给前端 LifeNewsHub_new 使用的接口
 */
const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const {
  asyncHandler,
  validatePagination,
  validateArticleId,
  validateLanguage,
} = require("../middleware");

/**
 * GET /api/news/resource
 * 获取新闻资源（分类列表）
 */
router.get(
  "/resource",
  validateLanguage,
  asyncHandler(newsController.getResource)
);

/**
 * GET /api/news/home
 * 获取首页数据
 */
router.get("/home", validateLanguage, asyncHandler(newsController.getHome));

/**
 * GET /api/news/article-ids
 * 获取可用的文章ID列表（带缓存，60分钟失效）
 */
router.get(
  "/article-ids",
  validateLanguage,
  asyncHandler(newsController.getArticleIds)
);

/**
 * GET /api/news/list
 * 获取新闻列表（按分类）
 */
router.get(
  "/list",
  validateLanguage,
  validatePagination,
  asyncHandler(newsController.getList)
);

/**
 * GET /api/news/search
 * 搜索新闻
 */
router.get(
  "/search",
  validateLanguage,
  validatePagination,
  asyncHandler(newsController.searchNews)
);

/**
 * GET /api/news/detail
 * 获取新闻详情
 */
router.get(
  "/detail",
  validateLanguage,
  validateArticleId,
  asyncHandler(newsController.getDetail)
);

module.exports = router;
