const { query, queryOne } = require("../config/database");

/**
 * 获取所有大分类
 */
async function getMainCategories(req, res, next) {
  try {
    const { status = 1 } = req.query;

    const sql = `
      SELECT id, name, description, sort_order, status, created_at, updated_at 
      FROM category_main 
      WHERE status = ? 
      ORDER BY sort_order ASC, id ASC
    `;

    const categories = await query(sql, [parseInt(status)]);

    res.success({
      list: categories,
      total: categories.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 根据ID获取大分类详情
 */
async function getMainCategoryById(req, res, next) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT id, name, description, sort_order, status, created_at, updated_at 
      FROM category_main 
      WHERE id = ?
    `;

    const category = await queryOne(sql, [id]);

    if (!category) {
      return res.error("分类不存在", 404);
    }

    res.success(category);
  } catch (error) {
    next(error);
  }
}

/**
 * 创建大分类
 */
async function createMainCategory(req, res, next) {
  try {
    const { name, description, sort_order = 0 } = req.body;

    if (!name) {
      return res.error("分类名称不能为空", 400);
    }

    // 检查名称是否已存在
    const existing = await queryOne(
      "SELECT id FROM category_main WHERE name = ?",
      [name]
    );

    if (existing) {
      return res.error("分类名称已存在", 400);
    }

    const sql = `
      INSERT INTO category_main (name, description, sort_order) 
      VALUES (?, ?, ?)
    `;

    const result = await query(sql, [name, description || null, sort_order]);

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
 * 更新大分类
 */
async function updateMainCategory(req, res, next) {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const fields = [];
    const values = [];

    const allowedFields = ["name", "description", "sort_order", "status"];

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        // 如果更新 name，检查是否重复
        if (field === "name") {
          const existing = await queryOne(
            "SELECT id FROM category_main WHERE name = ? AND id != ?",
            [updateFields[field], id]
          );
          if (existing) {
            return res.error("分类名称已存在", 400);
          }
        }
        fields.push(`${field} = ?`);
        values.push(updateFields[field]);
      }
    }

    if (fields.length === 0) {
      return res.error("没有要更新的字段", 400);
    }

    values.push(id);

    const sql = `UPDATE category_main SET ${fields.join(", ")} WHERE id = ?`;
    const result = await query(sql, values);

    if (result.affectedRows === 0) {
      return res.error("分类不存在", 404);
    }

    res.success({ message: "更新成功" });
  } catch (error) {
    next(error);
  }
}

/**
 * 删除大分类（软删除）
 */
async function deleteMainCategory(req, res, next) {
  try {
    const { id } = req.params;

    // 检查是否有子分类
    const subCategories = await queryOne(
      "SELECT COUNT(*) as count FROM category_sub WHERE main_category_id = ? AND status = 1",
      [id]
    );

    if (subCategories.count > 0) {
      return res.error("该分类下还有子分类，无法删除", 400);
    }

    const sql = `UPDATE category_main SET status = 0 WHERE id = ?`;
    const result = await query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.error("分类不存在", 404);
    }

    res.success({ message: "删除成功" });
  } catch (error) {
    next(error);
  }
}

/**
 * 获取子分类列表
 */
async function getSubCategories(req, res, next) {
  try {
    const { main_category_id, status = 1 } = req.query;

    let sql = `
      SELECT s.id, s.main_category_id, s.name, s.description, 
             s.sort_order, s.status, s.created_at, s.updated_at,
             m.name as main_category_name
      FROM category_sub s
      LEFT JOIN category_main m ON s.main_category_id = m.id
      WHERE s.status = ?
    `;
    const params = [parseInt(status)];

    if (main_category_id) {
      sql += " AND s.main_category_id = ?";
      params.push(parseInt(main_category_id));
    }

    sql += " ORDER BY s.main_category_id ASC, s.sort_order ASC, s.id ASC";

    const categories = await query(sql, params);

    res.success({
      list: categories,
      total: categories.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 根据ID获取子分类详情
 */
async function getSubCategoryById(req, res, next) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT s.id, s.main_category_id, s.name, s.description, 
             s.sort_order, s.status, s.created_at, s.updated_at,
             m.name as main_category_name
      FROM category_sub s
      LEFT JOIN category_main m ON s.main_category_id = m.id
      WHERE s.id = ?
    `;

    const category = await queryOne(sql, [id]);

    if (!category) {
      return res.error("子分类不存在", 404);
    }

    res.success(category);
  } catch (error) {
    next(error);
  }
}

/**
 * 创建子分类
 */
async function createSubCategory(req, res, next) {
  try {
    const { main_category_id, name, description, sort_order = 0 } = req.body;

    if (!main_category_id || !name) {
      return res.error("大分类ID和子分类名称不能为空", 400);
    }

    // 检查大分类是否存在
    const mainCategory = await queryOne(
      "SELECT id FROM category_main WHERE id = ? AND status = 1",
      [main_category_id]
    );

    if (!mainCategory) {
      return res.error("大分类不存在或已禁用", 400);
    }

    // 检查同一大分类下名称是否已存在
    const existing = await queryOne(
      "SELECT id FROM category_sub WHERE main_category_id = ? AND name = ?",
      [main_category_id, name]
    );

    if (existing) {
      return res.error("该大分类下已存在同名子分类", 400);
    }

    const sql = `
      INSERT INTO category_sub (main_category_id, name, description, sort_order) 
      VALUES (?, ?, ?, ?)
    `;

    const result = await query(sql, [
      main_category_id,
      name,
      description || null,
      sort_order,
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
 * 更新子分类
 */
async function updateSubCategory(req, res, next) {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const fields = [];
    const values = [];

    const allowedFields = [
      "main_category_id",
      "name",
      "description",
      "sort_order",
      "status",
    ];

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        // 如果更新 main_category_id，检查大分类是否存在
        if (field === "main_category_id") {
          const mainCategory = await queryOne(
            "SELECT id FROM category_main WHERE id = ? AND status = 1",
            [updateFields[field]]
          );
          if (!mainCategory) {
            return res.error("大分类不存在或已禁用", 400);
          }
        }

        // 如果更新 name 或 main_category_id，检查是否重复
        if (field === "name" || field === "main_category_id") {
          const currentCategory = await queryOne(
            "SELECT main_category_id, name FROM category_sub WHERE id = ?",
            [id]
          );
          const checkMainId =
            updateFields.main_category_id || currentCategory.main_category_id;
          const checkName = updateFields.name || currentCategory.name;

          const existing = await queryOne(
            "SELECT id FROM category_sub WHERE main_category_id = ? AND name = ? AND id != ?",
            [checkMainId, checkName, id]
          );
          if (existing) {
            return res.error("该大分类下已存在同名子分类", 400);
          }
        }

        fields.push(`${field} = ?`);
        values.push(updateFields[field]);
      }
    }

    if (fields.length === 0) {
      return res.error("没有要更新的字段", 400);
    }

    values.push(id);

    const sql = `UPDATE category_sub SET ${fields.join(", ")} WHERE id = ?`;
    const result = await query(sql, values);

    if (result.affectedRows === 0) {
      return res.error("子分类不存在", 404);
    }

    res.success({ message: "更新成功" });
  } catch (error) {
    next(error);
  }
}

/**
 * 删除子分类（软删除）
 */
async function deleteSubCategory(req, res, next) {
  try {
    const { id } = req.params;

    const sql = `UPDATE category_sub SET status = 0 WHERE id = ?`;
    const result = await query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.error("子分类不存在", 404);
    }

    res.success({ message: "删除成功" });
  } catch (error) {
    next(error);
  }
}

/**
 * 获取分类树（大分类及其下的所有子分类和第三级分类）
 */
async function getCategoryTree(req, res, next) {
  try {
    const { status = 1 } = req.query;

    // 获取所有大分类
    const mainCategories = await query(
      `SELECT id, name, description, sort_order, status, created_at, updated_at 
       FROM category_main 
       WHERE status = ? 
       ORDER BY sort_order ASC, id ASC`,
      [parseInt(status)]
    );

    // 获取所有子分类
    const subCategories = await query(
      `SELECT id, main_category_id, name, description, sort_order, status, created_at, updated_at 
       FROM category_sub 
       WHERE status = ? 
       ORDER BY sort_order ASC, id ASC`,
      [parseInt(status)]
    );

    // 获取所有第三级分类
    const thirdCategories = await query(
      `SELECT id, sub_category_id, name, description, sort_order, status, created_at, updated_at 
       FROM category_third 
       WHERE status = ? 
       ORDER BY sort_order ASC, id ASC`,
      [parseInt(status)]
    );

    // 构建树形结构
    const tree = mainCategories.map((main) => {
      const subs = subCategories.filter(
        (sub) => sub.main_category_id === main.id
      );

      return {
        ...main,
        sub_categories: subs.map((sub) => ({
          ...sub,
          third_categories: thirdCategories.filter(
            (third) => third.sub_category_id === sub.id
          ),
        })),
      };
    });

    res.success(tree);
  } catch (error) {
    next(error);
  }
}

// ==================== 第三级分类 ====================

// 获取所有第三级分类
async function getThirdCategories(req, res, next) {
  try {
    const { sub_category_id, status = 1 } = req.query;

    let sql = `
      SELECT tc.id, tc.sub_category_id, tc.name, tc.description, tc.sort_order, tc.status, 
             tc.created_at, tc.updated_at, sc.name AS sub_category_name, sc.main_category_id,
             mc.name AS main_category_name
      FROM category_third tc
      LEFT JOIN category_sub sc ON tc.sub_category_id = sc.id
      LEFT JOIN category_main mc ON sc.main_category_id = mc.id
      WHERE tc.status = ?
    `;
    const params = [parseInt(status)];

    if (sub_category_id) {
      sql += " AND tc.sub_category_id = ?";
      params.push(parseInt(sub_category_id));
    }

    sql += " ORDER BY tc.sort_order ASC, tc.id ASC";

    const categories = await query(sql, params);
    res.success(categories);
  } catch (error) {
    next(error);
  }
}

// 获取单个第三级分类
async function getThirdCategoryById(req, res, next) {
  try {
    const { id } = req.params;

    const category = await queryOne(
      `SELECT tc.*, sc.name AS sub_category_name, sc.main_category_id,
              mc.name AS main_category_name
       FROM category_third tc
       LEFT JOIN category_sub sc ON tc.sub_category_id = sc.id
       LEFT JOIN category_main mc ON sc.main_category_id = mc.id
       WHERE tc.id = ?`,
      [id]
    );

    if (!category) {
      return res.error("第三级分类不存在", 404);
    }

    res.success(category);
  } catch (error) {
    next(error);
  }
}

// 创建第三级分类
async function createThirdCategory(req, res, next) {
  try {
    const {
      sub_category_id,
      name,
      description = "",
      sort_order = 0,
    } = req.body;

    // 验证必填字段
    if (!sub_category_id || !name) {
      return res.error("子分类ID和名称不能为空", 400);
    }

    // 验证子分类是否存在
    const subCategory = await queryOne(
      "SELECT id FROM category_sub WHERE id = ?",
      [sub_category_id]
    );

    if (!subCategory) {
      return res.error("父级子分类不存在", 404);
    }

    // 检查名称是否重复
    const existing = await queryOne(
      "SELECT id FROM category_third WHERE sub_category_id = ? AND name = ?",
      [sub_category_id, name]
    );

    if (existing) {
      return res.error("该子分类下已存在同名的第三级分类", 400);
    }

    const result = await query(
      `INSERT INTO category_third (sub_category_id, name, description, sort_order) 
       VALUES (?, ?, ?, ?)`,
      [sub_category_id, name, description, sort_order]
    );

    res.success(
      {
        id: result.insertId,
        sub_category_id,
        name,
        description,
        sort_order,
      },
      "创建成功",
      201
    );
  } catch (error) {
    next(error);
  }
}

// 更新第三级分类
async function updateThirdCategory(req, res, next) {
  try {
    const { id } = req.params;
    const allowedFields = [
      "name",
      "description",
      "sort_order",
      "status",
      "sub_category_id",
    ];
    const updates = {};

    // 只保留允许更新的字段
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.error("没有需要更新的字段", 400);
    }

    // 检查第三级分类是否存在
    const category = await queryOne(
      "SELECT id FROM category_third WHERE id = ?",
      [id]
    );
    if (!category) {
      return res.error("第三级分类不存在", 404);
    }

    // 如果更新了 sub_category_id，验证其存在性
    if (updates.sub_category_id) {
      const subCategory = await queryOne(
        "SELECT id FROM category_sub WHERE id = ?",
        [updates.sub_category_id]
      );
      if (!subCategory) {
        return res.error("父级子分类不存在", 404);
      }
    }

    // 如果更新了名称，检查是否重复
    if (updates.name) {
      const subCategoryId =
        updates.sub_category_id ||
        (
          await queryOne(
            "SELECT sub_category_id FROM category_third WHERE id = ?",
            [id]
          )
        ).sub_category_id;

      const existing = await queryOne(
        "SELECT id FROM category_third WHERE sub_category_id = ? AND name = ? AND id != ?",
        [subCategoryId, updates.name, id]
      );

      if (existing) {
        return res.error("该子分类下已存在同名的第三级分类", 400);
      }
    }

    const setClause = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = [...Object.values(updates), id];

    await query(`UPDATE category_third SET ${setClause} WHERE id = ?`, values);

    res.success({ id, ...updates }, "更新成功");
  } catch (error) {
    next(error);
  }
}

// 删除第三级分类
async function deleteThirdCategory(req, res, next) {
  try {
    const { id } = req.params;

    const category = await queryOne(
      "SELECT id FROM category_third WHERE id = ?",
      [id]
    );
    if (!category) {
      return res.error("第三级分类不存在", 404);
    }

    // 检查是否有关联的info记录
    const infoCount = await queryOne(
      "SELECT COUNT(*) as count FROM info WHERE third_category_id = ?",
      [id]
    );

    if (infoCount.count > 0) {
      return res.error(
        `该第三级分类下还有 ${infoCount.count} 条信息，无法删除`,
        400
      );
    }

    await query("DELETE FROM category_third WHERE id = ?", [id]);
    res.success(null, "删除成功");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  // 大分类
  getMainCategories,
  getMainCategoryById,
  createMainCategory,
  updateMainCategory,
  deleteMainCategory,
  // 子分类
  getSubCategories,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  // 第三级分类
  getThirdCategories,
  getThirdCategoryById,
  createThirdCategory,
  updateThirdCategory,
  deleteThirdCategory,
  // 分类树
  getCategoryTree,
};
