/**
 * 兼容层控制器
 * 为now项目提供兼容的接口格式
 */
const { query, queryOne } = require("../config/database");
const { getAllCategories, getCategoryById } = require("../config/categories");
const { APIError } = require("../middleware");

/**
 * 将文章内容转换为HTML数组格式（使用数据库字段）
 */
function convertContentToHtmlArray(article) {
  const htmlArray = [];

  // 添加标题
  if (article.title) {
    htmlArray.push(`<h1>${escapeHtml(article.title)}</h1>`);
  }

  // 添加图片
  if (article.image_url) {
    htmlArray.push(
      `<img src="${escapeHtml(article.image_url)}" alt="${escapeHtml(
        article.title || ""
      )}" class="article-image">`
    );
  }

  // 处理正文内容
  const bodyContent = article.content || "";
  if (bodyContent) {
    // 按段落分割
    const paragraphs = bodyContent.split(/\n\n+/);
    paragraphs.forEach((para) => {
      const trimmed = para.trim();
      if (trimmed) {
        // 检查是否是标题
        if (trimmed.match(/^#{1,6}\s+/)) {
          const level = trimmed.match(/^(#{1,6})/)[1].length;
          const text = trimmed.replace(/^#{1,6}\s+/, "");
          htmlArray.push(`<h${level}>${escapeHtml(text)}</h${level}>`);
        } else {
          htmlArray.push(`<p>${escapeHtml(trimmed)}</p>`);
        }
      }
    });
  }

  // 如果没有内容，添加默认内容
  if (htmlArray.length === 0) {
    htmlArray.push("<p>No content available.</p>");
  }

  return htmlArray;
}

/**
 * HTML转义
 */
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * GET /api/compatible/db.json
 * 返回now项目格式的文章列表（从数据库查询）
 */
async function getDbJson(req, res) {
  const lang = req.lang || "en";

  try {
    // 获取所有分类
    const categories = getAllCategories(lang);
    const categoryNames = categories.map((cat) => cat.name);

    // 从数据库查询文章列表
    const sql = `
      SELECT id, title, main_category_id, image_url, publish_time
      FROM info
      WHERE status = 1
      ORDER BY publish_time DESC
      LIMIT 100
    `;

    const dbArticles = await query(sql);

    // 转换为now项目格式
    const formattedArticles = dbArticles.map((article) => {
      return {
        id: String(article.id),
        title: article.title || "",
        type: String(article.main_category_id || ""),
        img: article.image_url || null,
        create_time: article.publish_time
          ? new Date(article.publish_time).getTime()
          : Date.now(),
      };
    });

    // 构建响应 - 第一个元素是分类信息，后续是文章
    const response = [{ info1: categoryNames }, ...formattedArticles];

    // 直接返回数组，不包装
    res.json(response);
  } catch (error) {
    console.error("Error in getDbJson:", error);
    // 返回空数据结构
    res.json([{ info1: [] }]);
  }
}

/**
 * GET /api/compatible/:id/data.json
 * 返回now项目格式的文章详情（从数据库查询）
 */
async function getArticleData(req, res) {
  const articleId = req.params.id;

  try {
    // 从数据库查询文章详情
    const sql = `
      SELECT id, title, content, main_category_id, image_url, 
             source, author, publish_time, url
      FROM info
      WHERE id = ? AND status = 1
    `;

    const article = await queryOne(sql, [articleId]);

    if (!article) {
      throw new APIError("Article not found", 404);
    }

    // 转换为now项目格式
    const nowArticle = {
      id: String(article.id),
      title: article.title || "",
      type: String(article.main_category_id || ""),
      img: article.image_url || null,
      create_time: article.publish_time
        ? new Date(article.publish_time).getTime()
        : Date.now(),
    };

    // 添加content字段（HTML数组）
    nowArticle.content = convertContentToHtmlArray(article);

    // 直接返回对象，不包装
    res.json(nowArticle);
  } catch (error) {
    console.error(`Error getting article ${articleId}:`, error);

    // 返回404或错误信息
    if (error instanceof APIError) {
      res.status(error.statusCode).json({
        error: error.message,
      });
    } else {
      res.status(500).json({
        error: "Failed to load article",
      });
    }
  }
}

/**
 * GET /api/compatible/category/:type
 * 按分类获取文章列表（从数据库查询）
 */
async function getCategoryArticles(req, res) {
  const categoryType = req.params.type;

  try {
    // 查找对应的分类key
    const categories = getAllCategories(req.lang || "en");
    const category = categories.find(
      (cat) => cat.name.toLowerCase() === categoryType.toLowerCase()
    );

    let categoryKey = "";
    if (category) {
      categoryKey = category.key;
    }

    // 从数据库查询该分类的文章
    const sql = `
      SELECT id, title, main_category_id, image_url, publish_time
      FROM info
      WHERE main_category_id = ? AND status = 1
      ORDER BY publish_time DESC
      LIMIT 50
    `;

    const dbArticles = await query(sql, [categoryKey]);

    // 转换为now项目格式
    const formattedArticles = dbArticles.map((article) => {
      return {
        id: String(article.id),
        title: article.title || "",
        type: String(article.main_category_id || ""),
        img: article.image_url || null,
        create_time: article.publish_time
          ? new Date(article.publish_time).getTime()
          : Date.now(),
      };
    });

    // 构建响应
    const response = [{ info1: [categoryType] }, ...formattedArticles];

    res.json(response);
  } catch (error) {
    console.error("Error in getCategoryArticles:", error);
    res.json([{ info1: [] }]);
  }
}

module.exports = {
  getDbJson,
  getArticleData,
  getCategoryArticles,
};
