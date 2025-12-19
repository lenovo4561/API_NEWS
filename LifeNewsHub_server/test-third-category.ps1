# 三级分类系统测试脚本
# 演示如何使用三级分类 API

$baseUrl = "http://localhost:3000/api"

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "三级分类系统测试" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# 1. 获取完整分类树
Write-Host "1. 获取完整分类树（包含三级分类）" -ForegroundColor Yellow
Write-Host "-" * 60
try {
    $tree = Invoke-RestMethod -Uri "$baseUrl/category/tree" -Method Get
    Write-Host "✓ 成功获取分类树" -ForegroundColor Green
    Write-Host "  大分类数量: $($tree.data.Count)" -ForegroundColor Gray
    
    # 显示第一个大分类的结构
    if ($tree.data.Count -gt 0) {
        $firstMain = $tree.data[2]  # 第3个分类（计算机）
        Write-Host "  示例: $($firstMain.name)" -ForegroundColor Gray
        Write-Host "    子分类数量: $($firstMain.sub_categories.Count)" -ForegroundColor Gray
        if ($firstMain.sub_categories.Count -gt 0) {
            $firstSub = $firstMain.sub_categories[0]
            Write-Host "    示例子分类: $($firstSub.name)" -ForegroundColor Gray
            Write-Host "      第三级分类数量: $($firstSub.third_categories.Count)" -ForegroundColor Gray
            if ($firstSub.third_categories.Count -gt 0) {
                foreach ($third in $firstSub.third_categories) {
                    Write-Host "        - $($third.name)" -ForegroundColor Gray
                }
            }
        }
    }
} catch {
    Write-Host "✗ 失败: $_" -ForegroundColor Red
}
Write-Host ""

# 2. 获取第三级分类列表
Write-Host "2. 获取编程子分类下的第三级分类" -ForegroundColor Yellow
Write-Host "-" * 60
try {
    $thirds = Invoke-RestMethod -Uri "$baseUrl/category/third?sub_category_id=112" -Method Get
    Write-Host "✓ 成功获取第三级分类列表" -ForegroundColor Green
    Write-Host "  数量: $($thirds.data.Count)" -ForegroundColor Gray
    foreach ($category in $thirds.data) {
        Write-Host "    [$($category.id)] $($category.name) - $($category.description)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ 失败: $_" -ForegroundColor Red
}
Write-Host ""

# 3. 创建新的第三级分类
Write-Host "3. 创建新的第三级分类 (Rust)" -ForegroundColor Yellow
Write-Host "-" * 60
try {
    $newCategory = @{
        sub_category_id = 112
        name = "Rust"
        description = "Rust 编程语言"
        sort_order = 10
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "$baseUrl/category/third" -Method Post -Body $newCategory -ContentType "application/json"
    Write-Host "✓ 成功创建第三级分类" -ForegroundColor Green
    Write-Host "  ID: $($result.data.id)" -ForegroundColor Gray
    Write-Host "  名称: $($result.data.name)" -ForegroundColor Gray
    $rustId = $result.data.id
} catch {
    Write-Host "✗ 失败: $_" -ForegroundColor Red
    Write-Host "  (可能已存在)" -ForegroundColor Gray
}
Write-Host ""

# 4. 创建带三级分类的 info 记录
Write-Host "4. 创建包含第三级分类的 info 记录" -ForegroundColor Yellow
Write-Host "-" * 60
try {
    $newInfo = @{
        title = "Rust 1.70 版本发布"
        content = "Rust 1.70 带来了新的性能改进和特性"
        main_category_id = 18
        sub_category_id = 112
        third_category_id = 1
        source = "Rust Blog"
        author = "Rust Team"
        publish_time = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    } | ConvertTo-Json

    $infoResult = Invoke-RestMethod -Uri "$baseUrl/info" -Method Post -Body $newInfo -ContentType "application/json"
    Write-Host "✓ 成功创建 info 记录" -ForegroundColor Green
    Write-Host "  ID: $($infoResult.data.id)" -ForegroundColor Gray
    $newInfoId = $infoResult.data.id
} catch {
    Write-Host "✗ 失败: $_" -ForegroundColor Red
}
Write-Host ""

# 5. 按第三级分类筛选 info
Write-Host "5. 按第三级分类筛选 info 列表" -ForegroundColor Yellow
Write-Host "-" * 60
try {
    $infos = Invoke-RestMethod -Uri "$baseUrl/info?third_category_id=1" -Method Get
    Write-Host "✓ 成功获取 info 列表" -ForegroundColor Green
    Write-Host "  总数: $($infos.data.pagination.total)" -ForegroundColor Gray
    foreach ($info in $infos.data.list) {
        Write-Host "    [$($info.id)] $($info.title)" -ForegroundColor Gray
        $categoryPath = "$($info.main_category_name) > $($info.sub_category_name) > $($info.third_category_name)"
        Write-Host "      分类: $categoryPath" -ForegroundColor DarkGray
    }
} catch {
    Write-Host "✗ 失败: $_" -ForegroundColor Red
}
Write-Host ""

# 6. 获取 info 详情（含三级分类名称）
if ($newInfoId) {
    Write-Host "6. 获取 info 详情（含三级分类名称）" -ForegroundColor Yellow
    Write-Host "-" * 60
    try {
        $infoDetail = Invoke-RestMethod -Uri "$baseUrl/info/$newInfoId" -Method Get
        Write-Host "✓ 成功获取 info 详情" -ForegroundColor Green
        $data = $infoDetail.data
        Write-Host "  标题: $($data.title)" -ForegroundColor Gray
        Write-Host "  大分类: $($data.main_category_name) (ID: $($data.main_category_id))" -ForegroundColor Gray
        Write-Host "  子分类: $($data.sub_category_name) (ID: $($data.sub_category_id))" -ForegroundColor Gray
        Write-Host "  第三级: $($data.third_category_name) (ID: $($data.third_category_id))" -ForegroundColor Gray
        Write-Host "  作者: $($data.author)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ 失败: $_" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "测试完成！" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "提示: 查看完整 API 文档: CATEGORY_API.md" -ForegroundColor Yellow
