/**
 * 缓存管理工具
 */

/**
 * 文章ID缓存
 */
class ArticleIdsCache {
  constructor() {
    this.data = {}; // { lang: { ids: [], timestamp: Date } }
    this.ttl = 60 * 60 * 1000; // 60分钟缓存时间（毫秒）
  }

  /**
   * 获取缓存
   * @param {string} lang - 语言代码
   * @returns {Array|null} 缓存的ID列表或null
   */
  get(lang) {
    const cached = this.data[lang];
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      console.log(`[Cache] Article IDs cache hit for lang: ${lang}`);
      return cached.ids;
    }
    return null;
  }

  /**
   * 设置缓存
   * @param {string} lang - 语言代码
   * @param {Array} ids - 文章ID列表
   */
  set(lang, ids) {
    this.data[lang] = {
      ids,
      timestamp: Date.now(),
    };
    console.log(
      `[Cache] Article IDs cached for lang: ${lang}, count: ${ids.length}`
    );
  }

  /**
   * 清除缓存
   * @param {string} lang - 语言代码（可选，不传则清除所有）
   */
  clear(lang) {
    if (lang) {
      delete this.data[lang];
      console.log(`[Cache] Article IDs cache cleared for lang: ${lang}`);
    } else {
      this.data = {};
      console.log(`[Cache] All article IDs cache cleared`);
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      languages: Object.keys(this.data),
      count: Object.keys(this.data).length,
      details: Object.entries(this.data).map(([lang, cache]) => ({
        lang,
        idsCount: cache.ids.length,
        age: Date.now() - cache.timestamp,
        expiresIn: this.ttl - (Date.now() - cache.timestamp),
      })),
    };
  }
}

// 导出单例
const articleIdsCache = new ArticleIdsCache();

module.exports = {
  ArticleIdsCache,
  articleIdsCache,
};
