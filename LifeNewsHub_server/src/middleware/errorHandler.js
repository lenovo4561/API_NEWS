/**
 * 错误处理中间件
 */

// 自定义错误类
class APIError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 错误处理
function notFoundHandler(req, res, next) {
  res.status(404).json({
    code: 404,
    message: `Route ${req.method} ${req.url} not found`,
    data: null,
  });
}

// 全局错误处理
function globalErrorHandler(err, req, res, next) {
  // 默认错误信息
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let code = err.code || statusCode;

  // 开发环境下显示详细错误
  const isDev = process.env.NODE_ENV === "development";

  console.error("❌ Error:", {
    message: err.message,
    statusCode,
    path: req.path,
    method: req.method,
    stack: isDev ? err.stack : undefined,
  });

  // 返回错误响应
  res.status(statusCode).json({
    code,
    message,
    data: null,
    ...(isDev && { stack: err.stack }),
  });
}

// 异步错误包装器
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  APIError,
  notFoundHandler,
  globalErrorHandler,
  asyncHandler,
};
