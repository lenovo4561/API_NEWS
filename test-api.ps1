$data = Invoke-RestMethod -Uri "http://localhost:3000/api/compatible/db.json"

Write-Host "=== Category Info ===" -ForegroundColor Green
$data[0].info1 | ForEach-Object { Write-Host "- $_" }

Write-Host "`n=== First 3 Articles ===" -ForegroundColor Green
$data[1..3] | ForEach-Object {
    Write-Host "`nID: $($_.id)"
    Write-Host "Title: $($_.title)"
    Write-Host "Type: $($_.type)"
    Write-Host "Image: $($_.img)"
    Write-Host "Time: $($_.create_time)"
}

Write-Host "`n=== Total Articles: $($data.Count - 1) ===" -ForegroundColor Yellow
