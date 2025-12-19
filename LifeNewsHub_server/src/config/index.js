// 数据库相关模块的统一导出
const database = require("./database");

module.exports = {
  ...database,
};
