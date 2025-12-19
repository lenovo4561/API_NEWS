// 分类页面逻辑

let currentPage = 1;
let currentCategoryId = null;
let isLoading = false;
let hasMore = true;

/**
 * 渲染新闻列表
 * @param {Array} newsList - 新闻列表
 * @param {boolean} append - 是否追加到现有列表
 */
function renderNewsList(newsList, append = false) {
  const container = document.getElementById("newsList");
  if (!container) return;

  if (newsList.length === 0) {
    if (!append) {
      container.innerHTML = '<div class="loading">No news available</div>';
    }
    hasMore = false;
    return;
  }

  const html = newsList.map((item) => createNewsItem(item, "normal")).join("");

  if (append) {
    container.insertAdjacentHTML("beforeend", html);
  } else {
    container.innerHTML = html;
  }

  // 如果返回的数据少于10条，说明没有更多了
  if (newsList.length < 10) {
    hasMore = false;
  }
}

/**
 * 加载更多新闻
 */
async function loadMore() {
  if (isLoading || !hasMore) return;

  isLoading = true;
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    loadMoreBtn.textContent = "Loading...";
    loadMoreBtn.disabled = true;
  }

  try {
    const lang = getBrowserLang();
    currentPage++;

    const newsList = await getNewsList({
      id: currentCategoryId,
      lang,
      page: currentPage,
    });

    renderNewsList(newsList, true);

    if (loadMoreBtn) {
      if (hasMore) {
        loadMoreBtn.textContent = "Load More";
        loadMoreBtn.disabled = false;
      } else {
        loadMoreBtn.style.display = "none";
      }
    }
  } catch (error) {
    console.error("Failed to load more:", error);
    if (loadMoreBtn) {
      loadMoreBtn.textContent = "Load More";
      loadMoreBtn.disabled = false;
    }
  } finally {
    isLoading = false;
  }
}

/**
 * 加载分类页面
 */
async function loadCategoryPage() {
  // 获取分类ID和名称
  currentCategoryId = getUrlParam("id");
  const categoryName = getUrlParam("name");

  if (!currentCategoryId) {
    window.location.href = "index.html";
    return;
  }

  // 设置页面标题
  const titleElement = document.getElementById("categoryTitle");
  if (titleElement && categoryName) {
    titleElement.textContent = decodeURIComponent(categoryName);
    document.title = `${decodeURIComponent(categoryName)} - Life News Hub`;
  }

  const lang = getBrowserLang();

  try {
    showLoading(document.getElementById("newsList"));

    // 加载分类新闻
    const newsList = await getNewsList({
      id: currentCategoryId,
      lang,
      page: currentPage,
    });

    renderNewsList(newsList);

    // 显示加载更多按钮
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if (loadMoreBtn && hasMore) {
      loadMoreBtn.style.display = "block";
      loadMoreBtn.addEventListener("click", loadMore);
    }
  } catch (error) {
    console.error("Failed to load category page:", error);
    showError(
      document.getElementById("newsList"),
      "Failed to load news. Please try again later."
    );
  }
}

// 页面加载完成后加载数据
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadCategoryPage);
} else {
  loadCategoryPage();
}
