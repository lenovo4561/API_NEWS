/**
 * 日志中间件
 */

// 日志颜色
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

// 请求日志中间件
function requestLogger(req, res, next) {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // 监听响应完成
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusColor =
      res.statusCode >= 500
        ? colors.red
        : res.statusCode >= 400
        ? colors.yellow
        : colors.green;

    console.log(
      `${colors.gray}[${timestamp}]${colors.reset} ` +
        `${colors.cyan}${req.method}${colors.reset} ` +
        `${req.url} ` +
        `${statusColor}${res.statusCode}${colors.reset} ` +
        `${colors.gray}${duration}ms${colors.reset}`
    );
  });

  next();
}

// 自定义日志方法
const logger = {
  info: (message, ...args) => {
    console.log(`${colors.cyan}ℹ ${colors.reset}${message}`, ...args);
  },
  success: (message, ...args) => {
    console.log(`${colors.green}✓ ${colors.reset}${message}`, ...args);
  },
  warning: (message, ...args) => {
    console.warn(`${colors.yellow}⚠ ${colors.reset}${message}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`${colors.red}✗ ${colors.reset}${message}`, ...args);
  },
};

module.exports = {
  requestLogger,
  logger,
};
