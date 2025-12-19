// 工具函数

/**
 * 获取语言设置
 * @param {string} acceptLanguage - Accept-Language header
 * @returns {string} 语言代码
 */
function getLang(acceptLanguage) {
  let lang;
  if (acceptLanguage) {
    lang = acceptLanguage.split(",")[0];
  }

  if (lang) {
    if (lang.startsWith("pt")) {
      lang = "pt";
    } else if (lang.startsWith("es")) {
      lang = "es";
    } else {
      lang = CONFIG.LOCALE || "en";
    }
  } else {
    lang = CONFIG.LOCALE || "en";
  }
  return lang;
}

/**
 * 从浏览器获取语言
 * @returns {string} 语言代码
 */
function getBrowserLang() {
  const browserLang = navigator.language || navigator.userLanguage;
  return getLang(browserLang);
}

/**
 * 格式化日期
 * @param {number} timestamp - Unix时间戳（秒）
 * @returns {string} 格式化的日期字符串
 */
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // 差值（秒）

  // 小于1分钟
  if (diff < 60) {
    return "Just now";
  }
  // 小于1小时
  if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }
  // 小于24小时
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  // 小于7天
  if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  // 超过7天，显示具体日期
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * 获取URL参数
 * @param {string} name - 参数名
 * @returns {string|null} 参数值
 */
function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * 设置URL参数
 * @param {string} name - 参数名
 * @param {string} value - 参数值
 * @param {boolean} replace - 是否替换历史记录
 */
function setUrlParam(name, value, replace = false) {
  const url = new URL(window.location);
  url.searchParams.set(name, value);

  if (replace) {
    window.history.replaceState({}, "", url);
  } else {
    window.history.pushState({}, "", url);
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 时间限制（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 显示加载状态
 * @param {HTMLElement} element - 目标元素
 * @param {string} message - 加载消息
 */
function showLoading(element, message = "Loading...") {
  element.innerHTML = `<div class="loading">${message}</div>`;
}

/**
 * 显示错误消息
 * @param {HTMLElement} element - 目标元素
 * @param {string} message - 错误消息
 */
function showError(element, message = "An error occurred. Please try again.") {
  element.innerHTML = `<div class="error-message">${message}</div>`;
}

/**
 * 滚动到顶部
 * @param {boolean} smooth - 是否平滑滚动
 */
function scrollToTop(smooth = true) {
  window.scrollTo({
    top: 0,
    behavior: smooth ? "smooth" : "auto",
  });
}

/**
 * 检测元素是否在视口内
 * @param {HTMLElement} element - 要检测的元素
 * @returns {boolean} 是否在视口内
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * 懒加载图片
 * @param {HTMLImageElement} img - 图片元素
 * @param {string} src - 图片源
 */
function lazyLoadImage(img, src) {
  img.classList.add("loading");

  const image = new Image();
  image.onload = () => {
    img.src = src;
    img.classList.remove("loading");
  };
  image.onerror = () => {
    img.src =
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
    img.classList.remove("loading");
  };
  image.src = src;
}

/**
 * 转义HTML字符
 * @param {string} text - 要转义的文本
 * @returns {string} 转义后的文本
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
 * 本地存储工具
 */
const storage = {
  /**
   * 设置存储项
   * @param {string} key - 键
   * @param {any} value - 值
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Storage error:", e);
    }
  },

  /**
   * 获取存储项
   * @param {string} key - 键
   * @returns {any} 值
   */
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error("Storage error:", e);
      return null;
    }
  },

  /**
   * 删除存储项
   * @param {string} key - 键
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Storage error:", e);
    }
  },
};
