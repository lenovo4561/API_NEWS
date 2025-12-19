// 搜索页面逻辑

let currentPage = 1;
let currentKeywords = "";
let isLoading = false;
let hasMore = true;

/**
 * 渲染搜索结果
 * @param {Array} results - 搜索结果列表
 * @param {boolean} append - 是否追加到现有列表
 */
function renderSearchResults(results, append = false) {
  const container = document.getElementById("searchResults");
  const resultsSection = document.getElementById("resultsSection");
  const noResults = document.getElementById("noResults");

  if (!container) return;

  if (results.length === 0) {
    if (!append) {
      resultsSection.style.display = "none";
      noResults.style.display = "block";
    }
    hasMore = false;
    return;
  }

  resultsSection.style.display = "block";
  noResults.style.display = "none";

  const html = results.map((item) => createNewsItem(item, "normal")).join("");

  if (append) {
    container.insertAdjacentHTML("beforeend", html);
  } else {
    container.innerHTML = html;
  }

  // 更新结果标题
  const resultsTitle = document.getElementById("resultsTitle");
  if (resultsTitle) {
    const totalText = append
      ? ""
      : `Search Results for "${escapeHtml(currentKeywords)}"`;
    resultsTitle.textContent = totalText;
  }

  // 如果返回的数据少于10条，说明没有更多了
  if (results.length < 10) {
    hasMore = false;
  }
}

/**
 * 加载更多搜索结果
 */
async function loadMoreResults() {
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

    const results = await getSearch({
      words: currentKeywords,
      lang,
      page: currentPage,
    });

    renderSearchResults(results, true);

    if (loadMoreBtn) {
      if (hasMore) {
        loadMoreBtn.textContent = "Load More";
        loadMoreBtn.disabled = false;
      } else {
        loadMoreBtn.style.display = "none";
      }
    }
  } catch (error) {
    console.error("Failed to load more results:", error);
    if (loadMoreBtn) {
      loadMoreBtn.textContent = "Load More";
      loadMoreBtn.disabled = false;
    }
  } finally {
    isLoading = false;
  }
}

/**
 * 执行搜索
 * @param {string} keywords - 搜索关键词
 */
async function performSearch(keywords) {
  if (!keywords || !keywords.trim()) {
    return;
  }

  currentKeywords = keywords.trim();
  currentPage = 1;
  hasMore = true;

  const lang = getBrowserLang();
  const container = document.getElementById("searchResults");
  const resultsSection = document.getElementById("resultsSection");
  const noResults = document.getElementById("noResults");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  try {
    // 显示加载状态
    resultsSection.style.display = "block";
    noResults.style.display = "none";
    showLoading(container, "Searching...");
    loadMoreBtn.style.display = "none";

    // 执行搜索
    const results = await getSearch({
      words: currentKeywords,
      lang,
      page: currentPage,
    });

    // 渲染结果
    renderSearchResults(results);

    // 显示加载更多按钮
    if (hasMore && results.length > 0) {
      loadMoreBtn.style.display = "block";
    }

    // 更新URL
    setUrlParam("words", currentKeywords, true);
  } catch (error) {
    console.error("Search failed:", error);
    showError(container, "Search failed. Please try again.");
  }
}

/**
 * 初始化搜索页面
 */
function initSearchPage() {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  // 处理表单提交
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const keywords = searchInput.value.trim();
      if (keywords) {
        performSearch(keywords);
      }
    });
  }

  // 处理加载更多
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMoreResults);
  }

  // 检查URL参数，如果有搜索词则自动搜索
  const urlKeywords = getUrlParam("words");
  if (urlKeywords) {
    if (searchInput) {
      searchInput.value = decodeURIComponent(urlKeywords);
    }
    performSearch(urlKeywords);
  }
}

// 页面加载完成后初始化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSearchPage);
} else {
  initSearchPage();
}
