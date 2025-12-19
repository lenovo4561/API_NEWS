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

// 创建大分类
router.post("/main", categoryController.createMainCategory);

// 更新大分类
router.put("/main/:id", categoryController.updateMainCategory);

// 删除大分类
router.delete("/main/:id", categoryController.deleteMainCategory);

// ========== 子分类路由 ==========
// 获取子分类列表
router.get("/sub", categoryController.getSubCategories);

// 获取子分类详情
router.get("/sub/:id", categoryController.getSubCategoryById);

// 创建子分类
router.post("/sub", categoryController.createSubCategory);

// 更新子分类
router.put("/sub/:id", categoryController.updateSubCategory);

// 删除子分类
router.delete("/sub/:id", categoryController.deleteSubCategory);

// ========== 第三级分类路由 ==========
// 获取第三级分类列表
router.get("/third", categoryController.getThirdCategories);

// 获取第三级分类详情
router.get("/third/:id", categoryController.getThirdCategoryById);

// 创建第三级分类
router.post("/third", categoryController.createThirdCategory);

// 更新第三级分类
router.put("/third/:id", categoryController.updateThirdCategory);

// 删除第三级分类
router.delete("/third/:id", categoryController.deleteThirdCategory);

module.exports = router;
