// 首页逻辑

/**
 * 渲染首页内容
 * @param {Object} homeData - 首页数据
 */
function renderHomePage(homeData) {
  const { top = [], middle = [], bottom = [] } = homeData;

  // 渲染轮播文章
  const carouselContainer = document.getElementById("carouselPosts");
  if (carouselContainer && top.length > 0) {
    carouselContainer.innerHTML = top
      .map((item) => createNewsItem(item, "normal"))
      .join("");
  } else if (carouselContainer) {
    carouselContainer.innerHTML =
      '<div class="loading">No posts available</div>';
  }

  // 渲染精选文章
  const featuredContainer = document.getElementById("featuredPosts");
  if (featuredContainer && middle.length > 0) {
    // 前两篇作为大图展示
    const featuredHtml = middle
      .slice(0, 2)
      .map((item) => createNewsItem(item, "featured"))
      .join("");

    // 其余的作为普通列表
    const normalHtml = middle
      .slice(2)
      .map((item) => createNewsItem(item, "normal"))
      .join("");

    featuredContainer.innerHTML = `
      ${featuredHtml}
      ${normalHtml ? `<div class="news-list mt-3">${normalHtml}</div>` : ""}
    `;
  } else if (featuredContainer) {
    featuredContainer.innerHTML =
      '<div class="loading">No featured posts</div>';
  }

  // 渲染热门文章
  const popularContainer = document.getElementById("popularPosts");
  if (popularContainer && bottom.length > 0) {
    popularContainer.innerHTML = bottom
      .map((item) => createNewsItem(item, "normal"))
      .join("");
  } else if (popularContainer) {
    popularContainer.innerHTML = '<div class="loading">No popular posts</div>';
  }
}

/**
 * 设置"查看更多"按钮
 * @param {Array} categories - 分类列表
 */
function setupSeeMoreButton(categories) {
  const seeMoreBtn = document.getElementById("seeMoreBtn");
  if (seeMoreBtn && categories.length > 0) {
    const firstCategory = categories.sort((a, b) => a.sort - b.sort)[0];
    seeMoreBtn.href = `category.html?id=${
      firstCategory.id
    }&name=${encodeURIComponent(firstCategory.display_name)}`;
  }
}

/**
 * 加载首页数据
 */
async function loadHomePage() {
  const lang = getBrowserLang();

  try {
    // 并行加载分类和首页数据
    const [categories, homeData] = await Promise.all([
      getNewsCategories(lang),
      getHomeData(lang),
    ]);

    // 渲染分类
    renderCategories(categories);

    // 渲染首页内容
    renderHomePage(homeData);

    // 设置查看更多按钮
    setupSeeMoreButton(categories);
  } catch (error) {
    console.error("Failed to load home page:", error);

    // 显示错误信息
    const containers = ["carouselPosts", "featuredPosts", "popularPosts"];
    containers.forEach((id) => {
      const container = document.getElementById(id);
      if (container) {
        showError(container, "Failed to load content. Please try again later.");
      }
    });
  }
}

// 页面加载完成后加载数据
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadHomePage);
} else {
  loadHomePage();
}
