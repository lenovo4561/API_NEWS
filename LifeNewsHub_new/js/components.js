// 公共组件

/**
 * 创建新闻项组件
 * @param {Object} data - 新闻数据
 * @param {string} type - 新闻项类型 (normal, featured)
 * @returns {string} HTML字符串
 */
function createNewsItem(data, type = "normal") {
  const { id, title, author, image, published_at, source_title } = data;

  if (type === "featured") {
    return `
      <a href="news-detail.html?id=${id}" class="featured-item">
        <img 
          src="${image || ""}" 
          alt="${escapeHtml(title)}" 
          class="featured-item-image"
          loading="lazy"
        >
        <div class="featured-item-overlay">
          <h3 class="featured-item-title">${escapeHtml(title)}</h3>
          <div class="featured-item-meta">
            ${author ? `By ${escapeHtml(author)} • ` : ""}
            ${formatDate(published_at)}
          </div>
        </div>
      </a>
    `;
  }

  return `
    <a href="news-detail.html?id=${id}" class="news-item">
      <div class="news-item-content">
        <h3 class="news-item-title">${escapeHtml(title)}</h3>
        <div class="news-item-meta">
          ${author ? `<span>By ${escapeHtml(author)}</span>` : ""}
          <span>${formatDate(published_at)}</span>
        </div>
        ${
          source_title
            ? `<div class="news-item-meta"><span>From ${escapeHtml(
                source_title
              )}</span></div>`
            : ""
        }
      </div>
      <img 
        src="${image || ""}" 
        alt="${escapeHtml(title)}" 
        class="news-item-image"
        loading="lazy"
        onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22124%22 height=%2270%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22124%22 height=%2270%22/%3E%3C/svg%3E'"
      >
    </a>
  `;
}

/**
 * 渲染分类导航
 * @param {Array} categories - 分类列表
 * @param {string} activeCategoryId - 激活的分类ID
 */
function renderCategories(categories, activeCategoryId = null) {
  const container = document.querySelector(".categories-container");
  if (!container) return;

  container.innerHTML = categories
    .sort((a, b) => a.sort - b.sort)
    .map((category) => {
      const isActive = activeCategoryId === category.id ? "active" : "";
      return `
        <a 
          href="category.html?id=${category.id}&name=${encodeURIComponent(
        category.display_name
      )}" 
          class="category-item ${isActive}"
        >
          ${escapeHtml(category.display_name)}
        </a>
      `;
    })
    .join("");
}

/**
 * 初始化搜索表单
 */
function initSearchForm() {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const words = searchInput.value.trim();
      if (words) {
        window.location.href = `search.html?words=${encodeURIComponent(words)}`;
      }
    });
  }

  // 移动端搜索按钮
  const mobileSearchBtn = document.getElementById("mobileSearchBtn");
  if (mobileSearchBtn) {
    mobileSearchBtn.addEventListener("click", () => {
      window.location.href = "search.html";
    });
  }
}

/**
 * 初始化回到顶部按钮
 */
function initBackToTop() {
  const backToTopBtn = document.getElementById("backToTop");
  if (!backToTopBtn) return;

  // 滚动时显示/隐藏按钮
  const handleScroll = throttle(() => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("show");
    } else {
      backToTopBtn.classList.remove("show");
    }
  }, 200);

  window.addEventListener("scroll", handleScroll);

  // 点击回到顶部
  backToTopBtn.addEventListener("click", () => {
    scrollToTop(true);
  });
}

/**
 * 初始化公共功能
 */
function initCommon() {
  initSearchForm();
  initBackToTop();

  // 获取并渲染分类
  const lang = getBrowserLang();
  getNewsCategories(lang).then((categories) => {
    const currentCategoryId = getUrlParam("id");
    renderCategories(categories, currentCategoryId);
  });
}

// 页面加载完成后初始化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCommon);
} else {
  initCommon();
}
