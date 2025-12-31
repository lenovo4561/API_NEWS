/**
 * 兼容层路由
 * 为now项目提供兼容的API格式
 */
const express = require("express");
const router = express.Router();
const compatibleController = require("../controllers/compatibleController");
const { asyncHandler, validateLanguage } = require("../middleware");

/**
 * GET /api/compatible/db.json
 * 获取所有文章列表（now项目格式）
 * 返回格式：[{info1: [...]}, {...article1}, {...article2}, ...]
 */
router.get(
  "/db.json",
  validateLanguage,
  asyncHandler(compatibleController.getDbJson)
);

/**
 * GET /api/compatible/:id/data.json
 * 获取单篇文章详情（now项目格式）
 * 返回格式：{id, title, type, img, create_time, content: [...]}
 */
router.get(
  "/:id/data.json",
  validateLanguage,
  asyncHandler(compatibleController.getArticleData)
);

/**
 * GET /api/compatible/category/:type
 * 按分类获取文章列表（now项目格式）
 * 返回格式：[{info1: [type]}, {...article1}, {...article2}, ...]
 */
router.get(
  "/category/:type",
  validateLanguage,
  asyncHandler(compatibleController.getCategoryArticles)
);

module.exports = router;
