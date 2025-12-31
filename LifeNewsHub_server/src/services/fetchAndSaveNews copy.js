/**
 * 命令行脚本：从 Event Registry API 获取新闻并写入 info 表
 * 使用方法：
 *   node src/services/fetchAndSaveNews.js --category=18 --lang=eng --count=10
 *   node src/services/fetchAndSaveNews.js --keyword="technology" --count=20
 *   node src/services/fetchAndSaveNews.js --help
 *
 * # 使用文章流 API 获取最近 300 分钟的动漫文章
 *   node src/services/fetchAndSaveNews.js --uri="dmoz/Arts/Animation/Anime" --stream=true --mins=300
 *
 * # 获取最近 60 分钟的科技文章
 *   node src/services/fetchAndSaveNews.js --keyword="technology" --stream=true --mins=60
 *
 * # 不使用文章流（默认标准 API）
 *   node src/services/fetchAndSaveNews.js --uri="dmoz/Arts/Animation/Anime" --count=100
 *
 * # 跳过重复文章 (isDuplicate 参数会放入 query.$filter 中)
 *   node src/services/fetchAndSaveNews.js --uri="dmoz/Arts/Animation/Anime" --stream=true --mins=300 --dup=skipDuplicates
 */

require("dotenv").config();
const eventRegistry = require("./eventRegistry");
const { query, queryOne } = require("../config/database");

/**
 * 解析命令行参数
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    keyword: "",
    categoryUri: "",
    lang: "eng",
    count: 10,
    mainCategoryId: null,
    subCategoryId: null,
    thirdCategoryId: null,
    isDuplicate: "skipDuplicates",
    hasDuplicate: null,
    dataType: ["news", "pr", "blog"],
    useStream: false,
    recentMins: 300,
    help: false,
  };

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    const [key, value] = arg.split("=");
    const cleanKey = key.replace(/^--/, "");

    switch (cleanKey) {
      case "keyword":
      case "k":
        options.keyword = value || "";
        break;
      case "categoryUri":
      case "uri":
        options.categoryUri = value || "";
        break;
      case "lang":
      case "l":
        options.lang = value || "eng";
        break;
      case "count":
      case "c":
        options.count = parseInt(value) || 10;
        break;
      case "mainCategory":
      case "mc":
        options.mainCategoryId = parseInt(value) || null;
        break;
      case "subCategory":
      case "sc":
        options.subCategoryId = parseInt(value) || null;
        break;
      case "thirdCategory":
      case "tc":
        options.thirdCategoryId = parseInt(value) || null;
        break;
      case "isDuplicate":
      case "dup":
        options.isDuplicate = value || "skipDuplicates";
        break;
      case "hasDuplicate":
      case "hasdup":
        options.hasDuplicate = value || null;
        break;
      case "dataType":
      case "type":
        // 支持逗号分隔的多个类型，如: news,pr,blog
        options.dataType = value
          ? value.split(",").map((t) => t.trim())
          : ["news", "pr", "blog"];
        break;
      case "useStream":
      case "stream":
        options.useStream = value === "true" || value === "1";
        break;
      case "recentMins":
      case "mins":
        options.recentMins = parseInt(value) || 300;
        break;
    }
  }

  return options;
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  新闻数据采集脚本
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

使用方法:
  node src/services/fetchAndSaveNews.js [参数]

参数列表:
  --keyword, -k          关键词搜索
  --categoryUri, --uri   分类URI (Event Registry)
  --lang, -l             语言代码 (默认: eng)
  --count, -c            获取数量 (默认: 10)
  --mainCategory, --mc   主分类ID
  --subCategory, --sc    子分类ID
  --thirdCategory, --tc  三级分类ID
  --isDuplicate, --dup   去重策略 (默认: skipDuplicates)
  --hasDuplicate, --hasdup 重复过滤 (默认: 不设置)
  --dataType, --type     数据类型，逗号分隔 (默认: news,pr,blog)
  --useStream, --stream  使用文章流API (默认: false)
  --recentMins, --mins   获取最近几分钟的文章 (默认: 300)
  --help, -h             显示帮助信息

示例:
  # 获取10条英文科技新闻
  node src/services/fetchAndSaveNews.js --keyword="technology" --count=10

  # 获取20条中文新闻并指定分类
  node src/services/fetchAndSaveNews.js --lang=zho --count=20 --mc=18

  # 通过分类URI获取新闻（自动匹配分类ID）
  node src/services/fetchAndSaveNews.js --uri="dmoz/Arts/Animation/Anime" --count=15

  # 分类URI格式：dmoz/一级分类/二级分类/三级分类
  # 示例：
  #   dmoz/Arts                    - 只指定一级分类
  #   dmoz/Arts/Animation          - 指定一、二级分类
  #   dmoz/Arts/Animation/Anime    - 指定完整三级分类

  # 使用文章流API获取最近300分钟的文章
  node src/services/fetchAndSaveNews.js --uri="dmoz/Arts/Animation/Anime" --stream=true --mins=300

注意事项:
  - 需要在 .env 文件中配置 EVENT_REGISTRY_API_KEY
  - 数据库连接信息也需在 .env 中配置
  - 语言代码使用 ISO 639-3 标准 (eng, zho, spa等)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

/**
 * 从 categoryUri 解析分类层级并查找对应的分类ID
 * @param {string} categoryUri - 如 "dmoz/Arts/Animation/Anime"
 * @returns {Promise<Object>} - { mainCategoryId, subCategoryId, thirdCategoryId }
 */
async function parseCategoryFromUri(categoryUri) {
  if (!categoryUri) {
    return { mainCategoryId: null, subCategoryId: null, thirdCategoryId: null };
  }

  // 移除 "dmoz/" 前缀并分割路径
  const cleanUri = categoryUri.replace(/^dmoz\//i, "");
  const parts = cleanUri.split("/");

  if (parts.length === 0) {
    return { mainCategoryId: null, subCategoryId: null, thirdCategoryId: null };
  }

  const result = {
    mainCategoryId: null,
    subCategoryId: null,
    thirdCategoryId: null,
    mainCategoryKey: parts[0] || null,
    subCategoryKey: parts[1] || null,
    thirdCategoryKey: parts[2] || null,
  };

  try {
    // 查找一级分类
    if (parts[0]) {
      const mainSql =
        "SELECT id FROM category_main WHERE category_key = ? LIMIT 1";
      const mainResult = await queryOne(mainSql, [parts[0]]);
      if (mainResult) {
        result.mainCategoryId = mainResult.id;
      }
    }

    // 查找二级分类（需要关联一级分类）
    if (parts[1] && result.mainCategoryId) {
      const subSql = `
        SELECT id FROM category_sub 
        WHERE sub_category_key = ? AND main_category_id = ? 
        LIMIT 1
      `;
      const subResult = await queryOne(subSql, [
        parts[1],
        result.mainCategoryId,
      ]);
      if (subResult) {
        result.subCategoryId = subResult.id;
      }
    }

    // 查找三级分类（需要关联二级分类）
    if (parts[2] && result.subCategoryId) {
      const thirdSql = `
        SELECT id FROM category_third 
        WHERE third_category_key = ? AND sub_category_id = ? 
        LIMIT 1
      `;
      const thirdResult = await queryOne(thirdSql, [
        parts[2],
        result.subCategoryId,
      ]);
      if (thirdResult) {
        result.thirdCategoryId = thirdResult.id;
      }
    }

    return result;
  } catch (error) {
    console.error("解析分类URI时出错:", error.message);
    return { mainCategoryId: null, subCategoryId: null, thirdCategoryId: null };
  }
}

/**
 * 检查文章是否已存在（通过URL）
 */
async function checkArticleExists(url) {
  if (!url) return false;

  const sql = "SELECT id FROM info WHERE url = ? LIMIT 1";
  const result = await queryOne(sql, [url]);
  return !!result;
}

/**
 * 获取语言映射（Event Registry lang code -> 数据库 lang code）
 */
function mapLanguageCode(erLangCode) {
  const langMap = {
    eng: "en-US",
    zho: "zh-CN",
    spa: "es-ES",
    fra: "fr-FR",
    deu: "de-DE",
    jpn: "ja-JP",
    kor: "ko-KR",
    rus: "ru-RU",
    ara: "ar-SA",
    por: "pt-PT",
    ita: "it-IT",
    nld: "nl-NL",
    pol: "pl-PL",
    tur: "tr-TR",
    vie: "vi-VN",
    tha: "th-TH",
    ind: "id-ID",
    cat: "ca-ES",
  };

  return langMap[erLangCode] || erLangCode;
}

/**
 * 格式化文章数据为 info 表格式
 */
function formatArticleForDB(article, options) {
  const {
    title = "",
    body = "",
    source = {},
    authors = [],
    dateTimePub = "",
    image = "",
    url = "",
    lang = "eng",
  } = article;

  return {
    title: title || "Untitled",
    content: body || "",
    main_category_id: options.mainCategoryId,
    sub_category_id: options.subCategoryId,
    third_category_id: options.thirdCategoryId,
    source: source?.title || source?.uri || "Unknown",
    author: authors && authors.length > 0 ? authors[0]?.name : null,
    publish_time: dateTimePub ? new Date(dateTimePub) : new Date(),
    image_url: image || null,
    url: url || null,
    lang: lang,
    status: 1,
  };
}

/**
 * 批量插入文章到数据库
 */
async function saveArticlesToDB(articles, options) {
  if (!articles || articles.length === 0) {
    console.log("⚠ 没有文章需要保存");
    return { success: 0, skipped: 0, failed: 0 };
  }

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const article of articles) {
    try {
      // 检查是否已存在
      if (article.url && (await checkArticleExists(article.url))) {
        console.log(`⊙ 跳过已存在: ${article.title?.substring(0, 50)}...`);
        skipped++;
        continue;
      }

      // 格式化数据
      const data = formatArticleForDB(article, options);

      // 插入数据库
      const sql = `
        INSERT INTO info (
          title, content, main_category_id, sub_category_id, third_category_id,
          source, author, publish_time, image_url, url, lang, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        data.title,
        data.content,
        data.main_category_id,
        data.sub_category_id,
        data.third_category_id,
        data.source,
        data.author,
        data.publish_time,
        data.image_url,
        data.url,
        data.lang,
        data.status,
      ];

      await query(sql, params);
      console.log(`✓ 成功保存: ${data.title.substring(0, 50)}...`);
      success++;
    } catch (error) {
      console.error(
        `✗ 保存失败: ${article.title?.substring(0, 50)}...`,
        error.message
      );
      failed++;
    }
  }

  return { success, skipped, failed };
}

/**
 * 主函数
 */
async function main() {
  const options = parseArgs();

  // 显示帮助
  if (options.help) {
    showHelp();
    process.exit(0);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  开始获取新闻数据");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 如果提供了 categoryUri，自动解析分类ID
  if (options.categoryUri && !options.mainCategoryId) {
    console.log("→ 正在解析分类URI...\n");
    const categoryIds = await parseCategoryFromUri(options.categoryUri);

    if (
      categoryIds.mainCategoryId ||
      categoryIds.subCategoryId ||
      categoryIds.thirdCategoryId
    ) {
      options.mainCategoryId = categoryIds.mainCategoryId;
      options.subCategoryId = categoryIds.subCategoryId;
      options.thirdCategoryId = categoryIds.thirdCategoryId;

      console.log("✓ 分类解析成功:");
      if (categoryIds.mainCategoryKey) {
        console.log(
          `  一级分类: ${categoryIds.mainCategoryKey} (ID: ${
            categoryIds.mainCategoryId || "未找到"
          })`
        );
      }
      if (categoryIds.subCategoryKey) {
        console.log(
          `  二级分类: ${categoryIds.subCategoryKey} (ID: ${
            categoryIds.subCategoryId || "未找到"
          })`
        );
      }
      if (categoryIds.thirdCategoryKey) {
        console.log(
          `  三级分类: ${categoryIds.thirdCategoryKey} (ID: ${
            categoryIds.thirdCategoryId || "未找到"
          })`
        );
      }
      console.log("");
    } else {
      console.log("⚠ 警告: 无法从URI中找到匹配的分类\n");
    }
  }

  // 显示配置
  console.log("配置参数:");
  console.log(`  关键词: ${options.keyword || "(无)"}`);
  console.log(`  分类URI: ${options.categoryUri || "(无)"}`);
  console.log(`  语言: ${options.lang}`);
  console.log(`  数量: ${options.count}`);
  console.log(
    `  主分类ID: ${
      options.mainCategoryId !== null ? options.mainCategoryId : "(无)"
    }`
  );
  console.log(
    `  子分类ID: ${
      options.subCategoryId !== null ? options.subCategoryId : "(无)"
    }`
  );
  console.log(
    `  三级分类ID: ${
      options.thirdCategoryId !== null ? options.thirdCategoryId : "(无)"
    }`
  );
  console.log(`  使用文章流API: ${options.useStream ? "是" : "否"}`);
  if (options.useStream) {
    console.log(`  获取最近: ${options.recentMins} 分钟的文章`);
  }
  console.log("");

  // 检查 API Key
  if (!process.env.EVENT_REGISTRY_API_KEY) {
    console.error("✗ 错误: 未设置 EVENT_REGISTRY_API_KEY 环境变量");
    console.error("  请在 .env 文件中配置 API Key\n");
    process.exit(1);
  }

  try {
    console.log("→ 正在从 Event Registry API 获取数据...\n");

    let response;
    let articles;

    // 根据参数选择使用哪个 API
    if (options.useStream) {
      // 使用文章流 API
      const apiParams = {
        categoryUri: options.categoryUri,
        keyword: options.keyword,
        recentActivityArticlesUpdatesAfterMinsAgo: options.recentMins,
        isDuplicate: options.isDuplicate,
        hasDuplicate: options.hasDuplicate,
        dataType: options.dataType,
      };

      console.log("API 请求参数:");
      console.log(`  分类URI: ${apiParams.categoryUri || "(无)"}`);
      console.log(`  关键词: ${apiParams.keyword || "(无)"}`);
      console.log(
        `  时间范围: 最近 ${apiParams.recentActivityArticlesUpdatesAfterMinsAgo} 分钟`
      );
      console.log(`  数据类型: ${JSON.stringify(apiParams.dataType)}`);
      console.log(
        `  去重设置: isDuplicate=${apiParams.isDuplicate}, hasDuplicate=${apiParams.hasDuplicate}`
      );
      console.log("");

      response = await eventRegistry.getMinuteStreamArticles(apiParams);

      // 文章流 API 返回的数据结构: recentActivityArticles.activity[]
      if (
        !response ||
        !response.recentActivityArticles ||
        !response.recentActivityArticles.activity
      ) {
        console.error("✗ API 返回数据格式错误");
        console.error("响应:", JSON.stringify(response, null, 2));
        process.exit(1);
      }

      articles = response.recentActivityArticles.activity || [];
    } else {
      // 使用标准文章获取 API
      response = await eventRegistry.getArticles({
        keyword: options.keyword,
        categoryUri: options.categoryUri,
        lang: options.lang,
        articlesCount: options.count,
        articlesSortBy: "date",
        articlesSortByAsc: false,
        isDuplicate: options.isDuplicate,
        hasDuplicate: options.hasDuplicate,
      });

      // 检查响应
      if (!response || !response.articles || !response.articles.results) {
        console.error("✗ API 返回数据格式错误");
        console.error("响应:", JSON.stringify(response, null, 2));
        process.exit(1);
      }

      articles = response.articles.results;
    }
    console.log(`✓ 成功获取 ${articles.length} 篇文章\n`);

    if (articles.length === 0) {
      console.log("⚠ 没有找到符合条件的文章\n");
      process.exit(0);
    }

    // 检查API返回的数据中是否有重复标题
    console.log("→ 检查API返回数据中的重复情况...\n");
    const titleMap = new Map();
    const urlMap = new Map();
    let duplicateTitles = 0;
    let duplicateUrls = 0;

    articles.forEach((article, index) => {
      const title = article.title || "";
      const url = article.url || "";

      // 检查标题重复
      if (title) {
        if (titleMap.has(title)) {
          duplicateTitles++;
          console.log(`⚠ 发现重复标题 [${duplicateTitles}]:`);
          console.log(`   第一次出现: 索引 ${titleMap.get(title)}`);
          console.log(`   重复出现: 索引 ${index}`);
          console.log(`   标题: ${title.substring(0, 80)}...`);
          console.log("");
        } else {
          titleMap.set(title, index);
        }
      }

      // 检查URL重复
      if (url) {
        if (urlMap.has(url)) {
          duplicateUrls++;
          console.log(`⚠ 发现重复URL [${duplicateUrls}]:`);
          console.log(`   第一次出现: 索引 ${urlMap.get(url)}`);
          console.log(`   重复出现: 索引 ${index}`);
          console.log(`   URL: ${url}`);
          console.log("");
        } else {
          urlMap.set(url, index);
        }
      }
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  API返回数据重复检测结果");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`  总文章数: ${articles.length}`);
    console.log(`  唯一标题数: ${titleMap.size}`);
    console.log(`  重复标题数: ${duplicateTitles}`);
    console.log(`  唯一URL数: ${urlMap.size}`);
    console.log(`  重复URL数: ${duplicateUrls}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // 保存到数据库
    console.log("→ 开始保存到数据库...\n");
    const result = await saveArticlesToDB(articles, options);

    // 显示统计
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  完成统计");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`  ✓ 成功保存: ${result.success} 篇`);
    console.log(`  ⊙ 跳过重复: ${result.skipped} 篇`);
    console.log(`  ✗ 保存失败: ${result.failed} 篇`);
    console.log(`  总计获取: ${articles.length} 篇`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("\n✗ 发生错误:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = {
  main,
  formatArticleForDB,
  saveArticlesToDB,
  parseCategoryFromUri,
};
