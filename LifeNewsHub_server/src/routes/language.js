const express = require("express");
const router = express.Router();
const { query, queryOne } = require("../config/database");
const { successResponse, errorResponse } = require("../middleware/response");

/**
 * @route   GET /api/languages
 * @desc    获取所有启用的语言列表
 * @access  Public
 * @query   status - 可选，筛选状态（1-启用，0-禁用）
 */
router.get("/", async (req, res, next) => {
  try {
    const { status } = req.query;

    let sql = `
      SELECT id, name, code, status, sort_order 
      FROM languages 
    `;

    const params = [];

    // 如果指定了状态，添加状态筛选
    if (status !== undefined) {
      sql += " WHERE status = ?";
      params.push(parseInt(status));
    } else {
      // 默认只返回启用的语言
      sql += " WHERE status = 1";
    }

    sql += " ORDER BY sort_order";

    const languages = await query(sql, params);

    res.json(
      successResponse(languages, {
        total: languages.length,
        message: "Successfully fetched languages",
      })
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/languages/:code
 * @desc    根据语言代码获取语言信息
 * @access  Public
 * @param   code - 语言代码（ISO 639-3）
 */
router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;

    const sql = `
      SELECT id, name, code, status, sort_order, created_at, updated_at
      FROM languages 
      WHERE code = ?
    `;

    const language = await queryOne(sql, [code]);

    if (!language) {
      return res.status(404).json(
        errorResponse("Language not found", {
          code: code,
        })
      );
    }

    res.json(successResponse(language));
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/languages/id/:id
 * @desc    根据语言ID获取语言信息
 * @access  Public
 * @param   id - 语言ID
 */
router.get("/id/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT id, name, code, status, sort_order, created_at, updated_at
      FROM languages 
      WHERE id = ?
    `;

    const language = await queryOne(sql, [id]);

    if (!language) {
      return res.status(404).json(
        errorResponse("Language not found", {
          id: id,
        })
      );
    }

    res.json(successResponse(language));
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/languages/stats
 * @desc    获取语言统计信息
 * @access  Public
 */
router.get("/stats/summary", async (req, res, next) => {
  try {
    const statsSQL = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as enabled,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as disabled
      FROM languages
    `;

    const stats = await queryOne(statsSQL);

    res.json(
      successResponse(stats, {
        message: "Successfully fetched language statistics",
      })
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
