/**
 * 新闻分类配置
 * 使用 Event Registry 的分类 URI
 * 文档: https://eventregistry.org/documentation
 */

// 预定义的新闻分类
const CATEGORIES = [
  {
    id: 1,
    name: "Business",
    name_zh: "商业",
    uri: "news/Business",
    icon: "💼",
  },
  {
    id: 2,
    name: "Technology",
    name_zh: "科技",
    uri: "news/Technology",
    icon: "💻",
  },
  {
    id: 3,
    name: "Entertainment",
    name_zh: "娱乐",
    uri: "news/Arts_and_Entertainment",
    icon: "🎬",
  },
  {
    id: 4,
    name: "Sports",
    name_zh: "体育",
    uri: "news/Sports",
    icon: "⚽",
  },
  {
    id: 5,
    name: "Health",
    name_zh: "健康",
    uri: "news/Health",
    icon: "🏥",
  },
  {
    id: 6,
    name: "Science",
    name_zh: "科学",
    uri: "news/Science",
    icon: "🔬",
  },
  {
    id: 7,
    name: "Politics",
    name_zh: "政治",
    uri: "news/Politics",
    icon: "🏛️",
  },
  {
    id: 8,
    name: "World",
    name_zh: "国际",
    uri: "news/Society",
    icon: "🌍",
  },
];

// 语言代码映射
const LANGUAGE_MAP = {
  en: "eng",
  zh: "zho",
  es: "spa",
  fr: "fra",
  de: "deu",
  ja: "jpn",
  ko: "kor",
  pt: "por",
  ru: "rus",
  ar: "ara",
};

/**
 * 获取所有分类
 * @param {string} lang - 语言代码
 * @returns {Array} 分类列表
 */
function getAllCategories(lang = "en") {
  return CATEGORIES.map((cat) => ({
    id: cat.id,
    name: lang === "zh" ? cat.name_zh : cat.name,
    uri: cat.uri,
    icon: cat.icon,
  }));
}

/**
 * 根据ID获取分类
 * @param {number|string} id - 分类ID
 * @returns {Object|null} 分类对象
 */
function getCategoryById(id) {
  return CATEGORIES.find((cat) => cat.id === parseInt(id)) || null;
}

/**
 * 获取 Event Registry 语言代码
 * @param {string} lang - 简短语言代码
 * @returns {string} Event Registry 语言代码
 */
function getEventRegistryLang(lang) {
  return LANGUAGE_MAP[lang] || "eng";
}

module.exports = {
  CATEGORIES,
  LANGUAGE_MAP,
  getAllCategories,
  getCategoryById,
  getEventRegistryLang,
};
