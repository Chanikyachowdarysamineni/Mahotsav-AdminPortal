$uri = "http://localhost:5000/api/auth/login"
$body = @{
    email = "chanikyachowdary@gmail.com.com"
    password = "chani8877"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $body -Headers $headers
    Write-Host "✅ SUCCESS - Login worked!" -ForegroundColor Green
    Write-Host "Token: $($response.token.Substring(0, 50))..." -ForegroundColor Yellow
    Write-Host "User: $($response.user.name) - $($response.user.role)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}