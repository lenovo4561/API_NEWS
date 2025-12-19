// 新闻详情页逻辑

// 缓存文章ID列表
let cachedArticleIds = [];
let currentArticleIndex = -1;

/**
 * 获取并缓存文章ID列表
 * @param {string} lang - 语言代码
 * @returns {Promise<Array>} 文章ID列表
 */
async function fetchArticleIds(lang) {
  if (cachedArticleIds.length > 0) {
    return cachedArticleIds;
  }
  cachedArticleIds = await getArticleIds(lang, 50);
  return cachedArticleIds;
}

/**
 * 从列表中获取随机文章ID
 * @param {Array} ids - ID列表
 * @param {string} excludeId - 排除的ID
 * @returns {string|null} 随机ID
 */
function getRandomArticleId(ids, excludeId = null) {
  const filteredIds = excludeId ? ids.filter((id) => id !== excludeId) : ids;
  if (filteredIds.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * filteredIds.length);
  return filteredIds[randomIndex];
}

/**
 * 渲染文章详情
 * @param {Object} data - 文章数据
 */
function renderArticleDetail(data) {
  const { article, next_article_id, last_article_id } = data;

  if (!article || !article.title) {
    showError(document.getElementById("articleDetail"), "Article not found.");
    return;
  }

  const {
    title,
    author,
    published_at,
    source_title,
    image,
    content,
    summary,
    origin_url,
  } = article;

  // 设置页面标题
  document.title = `${title} - Life News Hub`;

  // 渲染文章内容
  const container = document.getElementById("articleDetail");
  if (container) {
    container.innerHTML = `
      <div class="article-header">
        <h1 class="article-title">${escapeHtml(title)}</h1>
        <div class="article-meta">
          ${author ? `<span>By ${escapeHtml(author)}</span>` : ""}
          <span>${formatDate(published_at)}</span>
          ${source_title ? `<span>From ${escapeHtml(source_title)}</span>` : ""}
        </div>
      </div>

      ${
        image
          ? `<img src="${image}" alt="${escapeHtml(
              title
            )}" class="article-image" loading="lazy">`
          : ""
      }

      ${
        summary
          ? `<div class="article-summary"><strong>Summary:</strong> ${escapeHtml(
              summary
            )}</div>`
          : ""
      }

      <div class="article-content">
        ${content || "<p>Content not available.</p>"}
      </div>

      ${
        origin_url
          ? `
        <div class="article-source">
          <strong>Source:</strong> 
          <a href="${origin_url}" target="_blank" rel="noopener noreferrer">
            Read original article
          </a>
        </div>
      `
          : ""
      }
    `;
  }

  // 设置上一篇/下一篇导航
  setupNavigation(article.id, next_article_id, last_article_id);
}

/**
 * 设置上一篇/下一篇导航
 * @param {string} currentId - 当前文章ID
 * @param {string} nextId - 下一篇ID
 * @param {string} prevId - 上一篇ID
 */
function setupNavigation(currentId, nextId, prevId) {
  const prevBtn = document.getElementById("prevArticle");
  const nextBtn = document.getElementById("nextArticle");

  // 从缓存的ID列表中获取上一篇/下一篇
  if (cachedArticleIds.length > 0) {
    currentArticleIndex = cachedArticleIds.indexOf(currentId);

    // 上一篇：列表中的前一个，如果是第一个则取最后一个
    if (prevBtn) {
      const prevIndex =
        currentArticleIndex > 0
          ? currentArticleIndex - 1
          : cachedArticleIds.length - 1;
      const prevArticleId = cachedArticleIds[prevIndex];
      if (prevArticleId && prevArticleId !== currentId) {
        prevBtn.href = `news-detail.html?id=${prevArticleId}`;
        prevBtn.style.display = "flex";
      }
    }

    // 下一篇：列表中的后一个，如果是最后一个则取第一个
    if (nextBtn) {
      const nextIndex =
        currentArticleIndex < cachedArticleIds.length - 1
          ? currentArticleIndex + 1
          : 0;
      const nextArticleId = cachedArticleIds[nextIndex];
      if (nextArticleId && nextArticleId !== currentId) {
        nextBtn.href = `news-detail.html?id=${nextArticleId}`;
        nextBtn.style.display = "flex";
      }
    }
  } else {
    // 如果没有缓存，使用传入的ID
    if (prevBtn && prevId) {
      prevBtn.href = `news-detail.html?id=${prevId}`;
      prevBtn.style.display = "flex";
    }
    if (nextBtn && nextId) {
      nextBtn.href = `news-detail.html?id=${nextId}`;
      nextBtn.style.display = "flex";
    }
  }
}

/**
 * 加载文章详情
 */
async function loadArticleDetail() {
  let articleId = getUrlParam("id");
  const lang = getBrowserLang();

  try {
    showLoading(document.getElementById("articleDetail"), "Loading article...");

    // 先获取文章ID列表
    await fetchArticleIds(lang);

    // 如果没有指定文章ID，或ID为'random'，则随机选择一个
    if (!articleId || articleId === "random") {
      if (cachedArticleIds.length > 0) {
        articleId = getRandomArticleId(cachedArticleIds);
        // 更新URL但不刷新页面
        window.history.replaceState({}, "", `news-detail.html?id=${articleId}`);
      } else {
        showError(
          document.getElementById("articleDetail"),
          "No articles available."
        );
        return;
      }
    }

    const data = await getNewsDetail(articleId, lang);
    renderArticleDetail(data);
  } catch (error) {
    console.error("Failed to load article:", error);
    showError(
      document.getElementById("articleDetail"),
      "Failed to load article. Please try again later."
    );
  }
}

// 页面加载完成后加载数据
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadArticleDetail);
} else {
  loadArticleDetail();
}
