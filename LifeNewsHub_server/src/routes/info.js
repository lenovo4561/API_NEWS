const express = require("express");
const router = express.Router();
const infoController = require("../controllers/infoController");

// 获取信息列表
router.get("/", infoController.getAllInfo);

// 获取分类列表
router.get("/categories", infoController.getCategories);

// 获取信息详情
router.get("/:id", infoController.getInfoById);

module.exports = router;
