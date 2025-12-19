// 配置文件
const CONFIG = {
  BASE_URL: "http://localhost:3000", // API基础URL，指向后端服务
  COUNTRY: "US", // 国家代码
  SERVER_NAME: "LifeNewsHub", // 服务器名称
  LOCALE: "en", // 默认语言
};

// 如果在浏览器环境中，可以从环境变量或localStorage读取
if (typeof window !== "undefined") {
  // 可以从URL参数或localStorage中读取配置
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("api_url")) {
    CONFIG.BASE_URL = urlParams.get("api_url");
  }
}
