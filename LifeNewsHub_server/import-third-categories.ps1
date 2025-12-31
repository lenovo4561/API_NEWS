# 三级分类数据导入脚本
# 使用方法：
#   .\import-third-categories.ps1           # 增量导入
#   .\import-third-categories.ps1 -Clear    # 清空后导入
#   .\import-third-categories.ps1 -Verify   # 仅验证

param(
    [switch]$Clear,
    [switch]$Verify
)

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "三级分类数据导入工具" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
if (-not (Test-Path "src/scripts/importAllThirdCategoriesWithTranslation.js")) {
    Write-Host "错误：请在 LifeNewsHub_server 目录下运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查 JSON 文件是否存在
if (-not (Test-Path "src/categories_1766374315708.json")) {
    Write-Host "错误：找不到 src/categories_1766374315708.json 文件" -ForegroundColor Red
    exit 1
}

# 检查 node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "警告：未找到 node_modules，正在安装依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误：依赖安装失败" -ForegroundColor Red
        exit 1
    }
}

# 仅验证模式
if ($Verify) {
    Write-Host "运行验证脚本..." -ForegroundColor Green
    Write-Host ""
    node src/scripts/verifyThirdCategories.js
    exit $LASTEXITCODE
}

# 询问是否备份
Write-Host "建议在导入前备份数据库。" -ForegroundColor Yellow
$backup = Read-Host "是否现在备份? (y/n)"

if ($backup -eq "y" -or $backup -eq "Y") {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "backup_categories_$timestamp.sql"
    
    Write-Host "正在备份到 $backupFile ..." -ForegroundColor Green
    
    # 这里需要配置数据库信息
    $dbUser = Read-Host "数据库用户名 (默认: root)"
    if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "root" }
    
    $dbPass = Read-Host "数据库密码" -AsSecureString
    $dbPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPass)
    )
    
    $dbName = Read-Host "数据库名称 (默认: information)"
    if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "information" }
    
    try {
        $mysqldumpCmd = "mysqldump -u $dbUser -p$dbPassPlain $dbName category_main category_sub category_third > $backupFile"
        Invoke-Expression $mysqldumpCmd
        Write-Host "✓ 备份完成: $backupFile" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "警告：备份失败，但将继续执行导入" -ForegroundColor Yellow
        Write-Host ""
    }
}

# 执行导入
Write-Host "开始导入三级分类数据..." -ForegroundColor Green
Write-Host ""

if ($Clear) {
    Write-Host "警告：使用 --clear 参数，将清空现有三级分类数据！" -ForegroundColor Red
    $confirm = Read-Host "确认继续? (yes/no)"
    
    if ($confirm -ne "yes") {
        Write-Host "已取消" -ForegroundColor Yellow
        exit 0
    }
    
    node src/scripts/importAllThirdCategoriesWithTranslation.js --clear
} else {
    node src/scripts/importAllThirdCategoriesWithTranslation.js
}

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "错误：导入失败" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "导入完成！" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 询问是否运行验证
$verify = Read-Host "是否运行验证脚本? (y/n)"

if ($verify -eq "y" -or $verify -eq "Y") {
    Write-Host ""
    Write-Host "运行验证脚本..." -ForegroundColor Green
    Write-Host ""
    node src/scripts/verifyThirdCategories.js
}

Write-Host ""
Write-Host "✓ 所有操作完成" -ForegroundColor Green
