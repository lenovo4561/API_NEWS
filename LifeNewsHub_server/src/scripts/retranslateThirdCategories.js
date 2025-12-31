/**
 * 重新翻译 category_third 表中的所有分类名称
 * 
 * 功能：
 * 1. 从数据库读取所有 third_category_key
 * 2. 将下划线转为空格得到英文短语
 * 3. 使用翻译API翻译成中文
 * 4. 更新数据库中的 name 字段
 */

const mysql = require('mysql2/promise');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'information',
};

// 有道翻译配置
const YOUDAO_APP_ID = process.env.YOUDAO_APP_ID;
const YOUDAO_APP_SECRET = process.env.YOUDAO_APP_SECRET;

// 将 third_category_key 转换为英文短语
function keyToEnglish(key) {
  if (!key) return '';
  return key.replace(/_/g, ' ');
}

// 使用有道翻译API进行翻译
async function translateWithYoudao(text) {
  if (!YOUDAO_APP_ID || !YOUDAO_APP_SECRET || 
      YOUDAO_APP_ID === 'your_app_id' || YOUDAO_APP_SECRET === 'your_app_secret') {
    return null;
  }

  try {
    const salt = Date.now();
    const sign = crypto
      .createHash('md5')
      .update(YOUDAO_APP_ID + text + salt + YOUDAO_APP_SECRET)
      .digest('hex');

    const response = await axios.get('https://openapi.youdao.com/api', {
      params: {
        q: text,
        from: 'en',
        to: 'zh-CHS',
        appKey: YOUDAO_APP_ID,
        salt: salt,
        sign: sign,
      },
    });

    if (response.data.errorCode === '0' && response.data.translation) {
      return response.data.translation[0];
    }
  } catch (error) {
    console.error(`翻译失败 "${text}":`, error.message);
  }

  return null;
}

// 使用简单的内置翻译映射（作为备用）
const builtInTranslations = {
  // 常见体育类
  'clubs': '俱乐部',
  'organizations': '组织',
  'tournaments': '锦标赛',
  'teams': '团队',
  'races': '比赛',
  'schools': '学校',
  'coaching': '教练',
  'training': '训练',
  'competitions': '竞赛',
  'college and university': '大学',
  'high school': '高中',
  'software': '软件',
  'wheelchair': '轮椅',
  'instructors': '教练',
  'deaf': '聋人',
  
  // 体操相关
  'artistic': '艺术体操',
  'rhythmic': '艺术体操',
  'trampoline and tumbling': '蹦床和翻滚',
  
  // 保龄球相关
  'ten-pin': '十瓶保龄球',
  'candlepin': '烛瓶保龄球',
  'skittles': '九柱保龄球',
  
  // 冬季运动
  'curling': '冰壶',
  'skiing': '滑雪',
  'sledding': '雪橇',
  'ski joring': '滑雪牵引',
  'teleboarding': '滑雪板',
  
  // 击剑
  'classical': '古典击剑',
  
  // 力量运动
  'bodybuilding': '健美',
  'arm wrestling': '掰手腕',
  'grip': '握力',
  'olympic lifting': '奥林匹克举重',
  'strongman': '大力士',
  'tug-of-war': '拔河',
  
  // 动物运动
  'bullfighting': '斗牛',
  
  // 垒球
  'slowpitch': '慢投垒球',
  'fastpitch': '快投垒球',
  'modified pitch': '改良投垒球',
  
  // 壁球
  'squash': '壁球',
  
  // 团队精神
  'fight songs': '战歌',
  'mascots': '吉祥物',
  
  // 其他
  'design and construction': '设计与施工',
  
  // 常见词汇
  'diy': 'DIY',
  'do-it-yourself': 'DIY',
  'dvd': 'DVD',
  'djs': 'DJ',
  'autocad': 'AutoCAD',
  'datacad': 'DataCAD',
  'dsl': 'DSL',
  'amstrad': 'Amstrad',
  'atari': 'Atari',
  'commodore': 'Commodore',
  '3d': '3D',
};

// 获取翻译（优先使用内置映射，然后使用API）
async function getTranslation(englishPhrase) {
  const lowerPhrase = englishPhrase.toLowerCase().trim();
  
  // 1. 先查找内置翻译
  if (builtInTranslations[lowerPhrase]) {
    return builtInTranslations[lowerPhrase];
  }
  
  // 2. 尝试使用有道翻译
  const youdaoResult = await translateWithYoudao(englishPhrase);
  if (youdaoResult) {
    return youdaoResult;
  }
  
  // 3. 如果都失败，返回原文
  return englishPhrase;
}

async function retranslateCategories() {
  let connection;
  const stats = {
    total: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  };
  
  try {
    console.log('========================================');
    console.log('重新翻译三级分类名称');
    console.log('========================================\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 获取所有需要翻译的记录
    const [records] = await connection.execute(`
      SELECT 
        ct.id,
        ct.third_category_key,
        ct.name as current_name,
        cs.name as sub_name,
        cm.name as main_name
      FROM category_third ct
      LEFT JOIN category_sub cs ON ct.sub_category_id = cs.id
      LEFT JOIN category_main cm ON cs.main_category_id = cm.id
      WHERE ct.status = 1 AND ct.third_category_key IS NOT NULL
      ORDER BY cm.name, cs.name, ct.third_category_key
    `);
    
    stats.total = records.length;
    console.log(`找到 ${stats.total} 条需要处理的记录\n`);
    
    // 批量处理
    let processed = 0;
    const batchSize = 10;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      for (const record of batch) {
        const { id, third_category_key, current_name, sub_name, main_name } = record;
        
        try {
          // 转换为英文短语
          const englishPhrase = keyToEnglish(third_category_key);
          
          // 获取翻译
          const translation = await getTranslation(englishPhrase);
          
          // 检查是否需要更新
          if (translation === current_name) {
            stats.skipped++;
            processed++;
            if (processed % 100 === 0) {
              console.log(`进度: ${processed}/${stats.total} (${((processed/stats.total)*100).toFixed(1)}%)`);
            }
            continue;
          }
          
          // 更新数据库
          await connection.execute(
            'UPDATE category_third SET name = ? WHERE id = ?',
            [translation, id]
          );
          
          stats.updated++;
          processed++;
          
          console.log(`✓ [${processed}/${stats.total}] ${main_name} > ${sub_name}`);
          console.log(`  Key: ${third_category_key}`);
          console.log(`  原名称: ${current_name}`);
          console.log(`  新名称: ${translation}`);
          console.log('');
          
          // 每隔一段时间暂停，避免API限流
          if (i % 10 === 0 && i > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
        } catch (error) {
          console.error(`✗ 处理失败 [ID: ${id}]:`, error.message);
          stats.failed++;
          processed++;
        }
      }
    }
    
    console.log('\n========================================');
    console.log('翻译完成统计');
    console.log('========================================\n');
    console.log(`总记录数: ${stats.total}`);
    console.log(`已更新: ${stats.updated}`);
    console.log(`未变化: ${stats.skipped}`);
    console.log(`失败: ${stats.failed}\n`);
    
  } catch (error) {
    console.error('处理过程中发生错误:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 运行脚本
retranslateCategories();
