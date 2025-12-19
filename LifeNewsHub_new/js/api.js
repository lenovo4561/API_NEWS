// API 请求函数

/**
 * 基础请求函数
 * @param {string} url - API路径
 * @param {string} lang - 语言代码
 * @returns {Promise<any>} 响应数据
 */
async function fetcher(url, lang) {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}${url}`, {
      headers: {
        lang: lang,
        country: CONFIG.COUNTRY || "",
        "site-name": CONFIG.SERVER_NAME ? CONFIG.SERVER_NAME.split(".")[0] : "",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

/**
 * 格式化文章数据为前端组件需要的格式
 * @param {Object} article - API返回的文章对象
 * @returns {Object} 格式化后的文章
 */
function formatArticleForUI(article) {
  return {
    id: article.id,
    title: article.title,
    summary: article.summary || "",
    content: article.body || "",
    image: article.image || "",
    author: article.author || "",
    published_at: article.publishedAt || "",
    source_title: article.source || "",
    origin_url: article.sourceUrl || "",
    category: article.category || "",
    display_name: article.title,
  };
}

/**
 * 获取新闻分类
 * @param {string} lang - 语言代码
 * @returns {Promise<Array>} 分类列表
 */
async function getNewsCategories(lang) {
  try {
    const data = await fetcher("/api/news/resource", lang);
    const categories = data.data?.categories || [];
    // 格式化分类数据
    return categories.map((cat, index) => ({
      id: cat.id,
      name: cat.name,
      display_name: cat.name,
      icon: cat.icon,
      uri: cat.uri,
      sort: index,
    }));
  } catch (error) {
    console.error("Failed to get categories:", error);
    return [];
  }
}

/**
 * 获取首页数据
 * @param {string} lang - 语言代码
 * @returns {Promise<Object>} 首页数据
 */
async function getHomeData(lang) {
  try {
    const data = await fetcher("/api/news/home?top_size=4", lang);
    const homeData = data.data || {};

    // 转换为前端期望的格式
    return {
      top: (homeData.top_news || []).map(formatArticleForUI),
      middle: (homeData.latest_news || []).map(formatArticleForUI),
      bottom: (homeData.category_news || []).flatMap((catNews) =>
        (catNews.articles || []).map(formatArticleForUI)
      ),
    };
  } catch (error) {
    console.error("Failed to get home data:", error);
    return { top: [], middle: [], bottom: [] };
  }
}

/**
 * 获取新闻列表
 * @param {Object} params - 参数对象
 * @param {string|number} params.id - 分类ID
 * @param {string} params.lang - 语言代码
 * @param {number} params.page - 页码
 * @returns {Promise<Array>} 新闻列表
 */
async function getNewsList({ id, lang, page = 1 }) {
  try {
    const data = await fetcher(
      `/api/news/list?category_id=${id}&page=${page}&page_size=10`,
      lang
    );
    const listData = data.data || {};
    return (listData.list || []).map(formatArticleForUI);
  } catch (error) {
    console.error("Failed to get news list:", error);
    return [];
  }
}

/**
 * 搜索新闻
 * @param {Object} params - 参数对象
 * @param {string} params.words - 搜索关键词
 * @param {string} params.lang - 语言代码
 * @param {number} params.page - 页码
 * @returns {Promise<Array>} 搜索结果
 */
async function getSearch({ words, lang, page = 1 }) {
  try {
    const data = await fetcher(
      `/api/news/search?words=${encodeURIComponent(
        words
      )}&page=${page}&page_size=10`,
      lang
    );
    const searchData = data.data || {};
    return (searchData.list || []).map(formatArticleForUI);
  } catch (error) {
    console.error("Failed to search:", error);
    return [];
  }
}

/**
 * 获取可用的文章ID列表
 * @param {string} lang - 语言代码
 * @param {number} count - 获取数量
 * @returns {Promise<Array>} 文章ID列表
 */
async function getArticleIds(lang, count = 50) {
  try {
    const data = await fetcher(`/api/news/article-ids?count=${count}`, lang);
    return data.data?.ids || [];
  } catch (error) {
    console.error("Failed to get article ids:", error);
    return [];
  }
}

/**
 * 获取新闻详情
 * @param {string|number} id - 文章ID
 * @param {string} lang - 语言代码
 * @returns {Promise<Object>} 新闻详情
 */
async function getNewsDetail(id, lang) {
  try {
    const data = await fetcher(`/api/news/detail?article_id=${id}`, lang);
    const article = data.data || {};

    // 转换为前端期望的格式
    return {
      article: {
        id: article.id,
        title: article.title || "",
        content: article.body || "",
        summary: article.summary || "",
        image: article.image || "",
        author: article.author || "",
        published_at: article.publishedAt || "",
        source_title: article.source || "",
        origin_url: article.sourceUrl || "",
        category: article.category || "",
      },
      next_article_id: null,
      last_article_id: null,
    };
  } catch (error) {
    console.error("Failed to get news detail:", error);
    return { article: null };
  }
}
