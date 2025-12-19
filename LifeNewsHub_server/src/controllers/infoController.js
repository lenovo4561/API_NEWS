const { query, queryOne } = require("../config/database");

/**
 * 获取所有信息列表
 */
async function getAllInfo(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      main_category_id,
      sub_category_id,
      third_category_id,
      lang,
      status = 1,
    } = req.query;

    const offset = (page - 1) * limit;

    // 构建查询条件
    let whereClause = "WHERE i.status = ?";
    let countParams = [parseInt(status)];
    let listParams = [parseInt(status)];

    if (main_category_id) {
      whereClause += " AND i.main_category_id = ?";
      countParams.push(parseInt(main_category_id));
      listParams.push(parseInt(main_category_id));
    }

    if (sub_category_id) {
      whereClause += " AND i.sub_category_id = ?";
      countParams.push(parseInt(sub_category_id));
      listParams.push(parseInt(sub_category_id));
    }

    if (third_category_id) {
      whereClause += " AND i.third_category_id = ?";
      countParams.push(parseInt(third_category_id));
      listParams.push(parseInt(third_category_id));
    }

    if (lang) {
      whereClause += " AND i.lang = ?";
      countParams.push(lang);
      listParams.push(lang);
    }

    // 获取总数
    const countSQL = `SELECT COUNT(*) as total FROM info i ${whereClause}`;
    const countResult = await queryOne(countSQL, countParams);
    const total = countResult.total;

    // 获取列表（关联分类信息）
    const listSQL = `
      SELECT i.id, i.title, i.content, i.main_category_id, i.sub_category_id, i.third_category_id,
             i.source, i.author, i.publish_time, i.image_url, i.url, i.lang,
             i.status, i.created_at, i.updated_at,
             m.name as main_category_name,
             s.name as sub_category_name,
             t.name as third_category_name
      FROM info i
      LEFT JOIN category_main m ON i.main_category_id = m.id
      LEFT JOIN category_sub s ON i.sub_category_id = s.id
      LEFT JOIN category_third t ON i.third_category_id = t.id
      ${whereClause} 
      ORDER BY i.publish_time DESC, i.created_at DESC 
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    const list = await query(listSQL, listParams);

    res.success({
      list,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 根据ID获取信息详情
 */
async function getInfoById(req, res, next) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT i.id, i.title, i.content, i.main_category_id, i.sub_category_id, i.third_category_id,
             i.source, i.author, i.publish_time, i.image_url, i.url, i.lang,
             i.status, i.created_at, i.updated_at,
             m.name as main_category_name,
             s.name as sub_category_name,
             t.name as third_category_name
      FROM info i
      LEFT JOIN category_main m ON i.main_category_id = m.id
      LEFT JOIN category_sub s ON i.sub_category_id = s.id
      LEFT JOIN category_third t ON i.third_category_id = t.id
      WHERE i.id = ? AND i.status = 1
    `;

    const info = await queryOne(sql, [id]);

    if (!info) {
      return res.error("信息不存在", 404);
    }

    res.success(info);
  } catch (error) {
    next(error);
  }
}

/**
 * 创建新信息
 */
async function createInfo(req, res, next) {
  try {
    const {
      title,
      content,
      main_category_id,
      sub_category_id,
      third_category_id,
      source,
      author,
      publish_time,
      image_url,
      url,
      lang,
    } = req.body;

    if (!title) {
      return res.error("标题不能为空", 400);
    }

    const sql = `
      INSERT INTO info (title, content, main_category_id, sub_category_id, third_category_id, source, author, publish_time, image_url, url, lang) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      title,
      content || null,
      main_category_id || null,
      sub_category_id || null,
      third_category_id || null,
      source || null,
      author || null,
      publish_time || null,
      image_url || null,
      url || null,
      lang || "zh-CN",
    ]);

    res.success(
      {
        id: result.insertId,
        message: "创建成功",
      },
      201
    );
  } catch (error) {
    next(error);
  }
}

/**
 * 更新信息
 */
async function updateInfo(req, res, next) {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // 构建更新语句
    const fields = [];
    const values = [];

    const allowedFields = [
      "title",
      "content",
      "main_category_id",
      "sub_category_id",
      "third_category_id",
      "source",
      "author",
      "publish_time",
      "image_url",
      "url",
      "lang",
      "status",
    ];

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updateFields[field]);
      }
    }

    if (fields.length === 0) {
      return res.error("没有要更新的字段", 400);
    }

    values.push(id);

    const sql = `UPDATE info SET ${fields.join(", ")} WHERE id = ?`;
    const result = await query(sql, values);

    if (result.affectedRows === 0) {
      return res.error("信息不存在", 404);
    }

    res.success({ message: "更新成功" });
  } catch (error) {
    next(error);
  }
}

/**
 * 删除信息（软删除）
 */
async function deleteInfo(req, res, next) {
  try {
    const { id } = req.params;

    const sql = `UPDATE info SET status = 0 WHERE id = ?`;
    const result = await query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.error("信息不存在", 404);
    }

    res.success({ message: "删除成功" });
  } catch (error) {
    next(error);
  }
}

/**
 * 获取分类列表
 */
async function getCategories(req, res, next) {
  try {
    // 获取大分类统计
    const mainCategorySql = `
      SELECT m.id, m.name, COUNT(i.id) as count 
      FROM category_main m
      LEFT JOIN info i ON m.id = i.main_category_id AND i.status = 1
      WHERE m.status = 1
      GROUP BY m.id, m.name
      ORDER BY count DESC
    `;

    const mainCategories = await query(mainCategorySql);

    // 获取子分类统计
    const subCategorySql = `
      SELECT s.id, s.main_category_id, s.name, COUNT(i.id) as count,
             m.name as main_category_name
      FROM category_sub s
      LEFT JOIN category_main m ON s.main_category_id = m.id
      LEFT JOIN info i ON s.id = i.sub_category_id AND i.status = 1
      WHERE s.status = 1
      GROUP BY s.id, s.main_category_id, s.name, m.name
      ORDER BY s.main_category_id, count DESC
    `;

    const subCategories = await query(subCategorySql);

    res.success({
      main_categories: mainCategories,
      sub_categories: subCategories,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllInfo,
  getInfoById,
  createInfo,
  updateInfo,
  deleteInfo,
  getCategories,
};
