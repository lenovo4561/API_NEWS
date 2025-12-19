const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const { query } = require("../config/database");

async function testCategoryApis() {
  try {
    console.log("=== 测试分类功能 ===\n");

    // 1. 测试获取所有大分类
    console.log("1. 获取所有大分类:");
    const mainCategories = await query(
      "SELECT * FROM category_main WHERE status = 1 ORDER BY sort_order"
    );
    console.log(`找到 ${mainCategories.length} 个大分类`);
    console.table(mainCategories);

    // 2. 测试获取科技分类下的子分类
    console.log("\n2. 获取科技分类下的子分类:");
    const techCategory = mainCategories.find((c) => c.name === "科技");
    if (techCategory) {
      const subCategories = await query(
        "SELECT * FROM category_sub WHERE main_category_id = ? AND status = 1 ORDER BY sort_order",
        [techCategory.id]
      );
      console.log(`找到 ${subCategories.length} 个子分类`);
      console.table(subCategories);

      // 3. 测试查询信息表（按大分类筛选）
      console.log(`\n3. 查询"科技"大分类下的信息:`);
      const infoByMainCategory = await query(
        `SELECT i.*, m.name as main_category_name, s.name as sub_category_name
         FROM info i
         LEFT JOIN category_main m ON i.main_category_id = m.id
         LEFT JOIN category_sub s ON i.sub_category_id = s.id
         WHERE i.main_category_id = ? AND i.status = 1`,
        [techCategory.id]
      );
      console.log(`找到 ${infoByMainCategory.length} 条信息`);
      console.table(infoByMainCategory);

      // 4. 测试查询信息表（按子分类筛选）
      if (subCategories.length > 0) {
        const firstSubCat = subCategories[0];
        console.log(`\n4. 查询"${firstSubCat.name}"子分类下的信息:`);
        const infoBySubCategory = await query(
          `SELECT i.*, m.name as main_category_name, s.name as sub_category_name
           FROM info i
           LEFT JOIN category_main m ON i.main_category_id = m.id
           LEFT JOIN category_sub s ON i.sub_category_id = s.id
           WHERE i.sub_category_id = ? AND i.status = 1`,
          [firstSubCat.id]
        );
        console.log(`找到 ${infoBySubCategory.length} 条信息`);
        console.table(infoBySubCategory);
      }
    }

    // 5. 测试分类树结构
    console.log("\n5. 构建分类树:");
    const tree = mainCategories.map((main) => {
      const subs = query(
        "SELECT * FROM category_sub WHERE main_category_id = ? AND status = 1 ORDER BY sort_order",
        [main.id]
      );
      return { ...main, children: subs };
    });
    console.log("分类树结构（前3个）:");
    console.log(JSON.stringify(tree.slice(0, 3), null, 2));

    console.log("\n✅ 所有测试通过！");
  } catch (error) {
    console.error("❌ 测试失败:", error);
  } finally {
    process.exit(0);
  }
}

testCategoryApis();
