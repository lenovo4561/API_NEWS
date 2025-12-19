/**
 * 响应处理中间件
 */

// 统一成功响应格式
function successResponse(data = null, message = "success", code = 200) {
  return {
    code,
    message,
    data,
  };
}

// 响应中间件 - 将 successResponse 方法注入到 res 对象
function responseHandler(req, res, next) {
  // 添加成功响应方法
  res.success = function (data = null, message = "success", code = 200) {
    return res.json(successResponse(data, message, code));
  };

  next();
}

module.exports = {
  responseHandler,
  successResponse,
};
