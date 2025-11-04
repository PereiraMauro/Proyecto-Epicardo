# Script de pruebas para el backend Epicardo
# Ejecutar desde PowerShell: .\test-endpoints.ps1

$baseUrl = "http://localhost:3000"

Write-Host "Testing Epicardo Backend API" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1. Testing /api/health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/health" -UseBasicParsing
    Write-Host "   OK Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
    Write-Host ""
}

# 2. Cotizaciones
Write-Host "2. Testing /api/cotizaciones..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/cotizaciones" -UseBasicParsing
    Write-Host "   OK Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   MercadoPago: $($data.mercadopago)" -ForegroundColor Gray
    Write-Host "   AstroPlay: $($data.astroplay)" -ForegroundColor Gray
    Write-Host "   Tarjeta Pesos: $($data.tarjeta_pesos)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
    Write-Host ""
}

# 3. Rates
Write-Host "3. Testing /api/rates..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/rates" -UseBasicParsing
    Write-Host "   OK Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Oficial: $($data.ars.oficial)" -ForegroundColor Gray
    Write-Host "   Blue: $($data.ars.blue)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
    Write-Host ""
}

# 4. Precio
Write-Host "4. Testing /api/precio/100..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/precio/100?tipo=tarjeta_pesos" -UseBasicParsing
    Write-Host "   OK Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Precio Final: $($data.total)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
    Write-Host ""
}

# 5. Refresh rates
Write-Host "5. Testing /api/rates/refresh (POST)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/rates/refresh" -Method POST -UseBasicParsing
    Write-Host "   OK Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Refresh exitoso: $($data.ok)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "Pruebas completadas!" -ForegroundColor Cyan
