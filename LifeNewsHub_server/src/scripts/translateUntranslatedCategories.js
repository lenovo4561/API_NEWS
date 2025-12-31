const mysql = require("mysql2/promise");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

// 有道翻译函数
async function translate(text, from = "en", to = "zh-CHS") {
  try {
    const appId = process.env.YOUDAO_APP_ID;
    const appSecret = process.env.YOUDAO_APP_SECRET;
    
    if (!appId || !appSecret || appId === 'your_app_id') {
      // 如果没有配置有道API，使用Google翻译
      return await translateWithGoogle(text);
    }

    const salt = new Date().getTime();
    const curtime = Math.round(new Date().getTime() / 1000);
    const str = appId + truncate(text) + salt + curtime + appSecret;
    const sign = crypto.createHash("sha256").update(str).digest("hex");

    const response = await axios.post(
      "https://openapi.youdao.com/api",
      null,
      {
        params: {
          q: text,
          from: from,
          to: to,
          appKey: appId,
          salt: salt,
          sign: sign,
          signType: "v3",
          curtime: curtime,
        },
      }
    );

    if (response.data && response.data.translation && response.data.translation[0]) {
      return response.data.translation[0];
    }
    return text;
  } catch (error) {
    console.error(`翻译失败 "${text}":`, error.message);
    return text;
  }
}

// Google翻译备用函数
async function translateWithGoogle(text, targetLang = "zh-CN") {
  try {
    const response = await axios.get(
      "https://translate.googleapis.com/translate_a/single",
      {
        params: {
          client: "gtx",
          sl: "en",
          tl: targetLang,
          dt: "t",
          q: text,
        },
      }
    );

    if (response.data && response.data[0] && response.data[0][0]) {
      return response.data[0][0][0];
    }
    return text;
  } catch (error) {
    console.error(`Google翻译失败 "${text}":`, error.message);
    return text;
  }
}

// 截断函数，用于生成有道签名
function truncate(q) {
  const len = q.length;
  if (len <= 20) return q;
  return q.substring(0, 10) + len + q.substring(len - 10, len);
}

// 延迟函数
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function translateUntranslatedCategories() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("开始翻译未翻译的分类...\n");

    // 1. 翻译一级分类
    console.log("=== 翻译一级分类 ===");
    const [mainCategories] = await connection.execute(`
            SELECT id, name 
            FROM category_main 
            WHERE name REGEXP '[A-Z][a-z]+[A-Z]|^[A-Z][a-z]+( [A-Z][a-z]+)*$'
        `);

    console.log(`找到 ${mainCategories.length} 个未翻译的一级分类`);
    for (const cat of mainCategories) {
      const translated = await translate(cat.name);
      if (translated !== cat.name) {
        await connection.execute(
          "UPDATE category_main SET name = ? WHERE id = ?",
          [translated, cat.id]
        );
        console.log(`✓ [${cat.id}] ${cat.name} → ${translated}`);
      }
      await delay(100);
    }

    // 2. 翻译二级分类
    console.log("\n=== 翻译二级分类 ===");
    const [subCategories] = await connection.execute(`
            SELECT id, name 
            FROM category_sub 
            WHERE name REGEXP '[A-Z][a-z]+[A-Z]|^[A-Z][a-z]+( [A-Z][a-z]+)*$'
        `);

    console.log(`找到 ${subCategories.length} 个未翻译的二级分类`);
    let count = 0;
    for (const cat of subCategories) {
      const translated = await translate(cat.name);
      if (translated !== cat.name) {
        await connection.execute(
          "UPDATE category_sub SET name = ? WHERE id = ?",
          [translated, cat.id]
        );
        console.log(`✓ [${cat.id}] ${cat.name} → ${translated}`);
      }
      count++;
      if (count % 50 === 0) {
        console.log(`进度: ${count}/${subCategories.length}`);
      }
      await delay(100);
    }

    // 3. 翻译三级分类
    console.log("\n=== 翻译三级分类 ===");
    const [thirdCategories] = await connection.execute(`
            SELECT id, name 
            FROM category_third 
            WHERE name REGEXP '[A-Z][a-z]+[A-Z]|^[A-Z][a-z]+( [A-Z][a-z]+)*$'
        `);

    console.log(`找到 ${thirdCategories.length} 个未翻译的三级分类`);
    count = 0;
    for (const cat of thirdCategories) {
      const translated = await translate(cat.name);
      if (translated !== cat.name) {
        await connection.execute(
          "UPDATE category_third SET name = ? WHERE id = ?",
          [translated, cat.id]
        );
        console.log(`✓ [${cat.id}] ${cat.name} → ${translated}`);
      }
      count++;
      if (count % 100 === 0) {
        console.log(`进度: ${count}/${thirdCategories.length}`);
      }
      await delay(100);
    }

    console.log("\n✅ 所有分类翻译完成！");
  } catch (error) {
    console.error("错误:", error);
  } finally {
    if (connection) await connection.end();
  }
}

translateUntranslatedCategories();
