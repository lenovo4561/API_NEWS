/**
 * 中间件导出
 */
const { requestLogger, logger } = require("./logger");
const {
  APIError,
  notFoundHandler,
  globalErrorHandler,
  asyncHandler,
} = require("./errorHandler");
const {
  validatePagination,
  validateArticleId,
  validateSearchKeyword,
  validateLanguage,
} = require("./validator");
const { responseHandler, successResponse } = require("./response");

module.exports = {
  // 日志
  requestLogger,
  logger,

  // 错误处理
  APIError,
  notFoundHandler,
  globalErrorHandler,
  asyncHandler,

  // 验证
  validatePagination,
  validateArticleId,
  validateSearchKeyword,
  validateLanguage,

  // 响应
  responseHandler,
  successResponse,
};
