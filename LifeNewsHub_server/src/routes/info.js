const express = require("express");
const router = express.Router();
const infoController = require("../controllers/infoController");

// 获取信息列表
router.get("/", infoController.getAllInfo);

// 获取分类列表
router.get("/categories", infoController.getCategories);

// 获取信息详情
router.get("/:id", infoController.getInfoById);

// 创建信息
router.post("/", infoController.createInfo);

// 更新信息
router.put("/:id", infoController.updateInfo);

// 删除信息
router.delete("/:id", infoController.deleteInfo);

module.exports = router;
