const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// ========== 分类树 ==========
// 获取完整分类树
router.get("/tree", categoryController.getCategoryTree);

// ========== 大分类路由 ==========
// 获取大分类列表
router.get("/main", categoryController.getMainCategories);

// 获取大分类详情
router.get("/main/:id", categoryController.getMainCategoryById);

// ========== 子分类路由 ==========
// 获取子分类列表
router.get("/sub", categoryController.getSubCategories);

// 获取子分类详情
router.get("/sub/:id", categoryController.getSubCategoryById);

// ========== 第三级分类路由 ==========
// 获取第三级分类列表
router.get("/third", categoryController.getThirdCategories);

// 获取第三级分类详情
router.get("/third/:id", categoryController.getThirdCategoryById);

module.exports = router;
