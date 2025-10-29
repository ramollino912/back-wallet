# Script para probar todas las rutas en producción (Vercel)
$baseUrl = "https://back-wallet-20.vercel.app"

Write-Host "`n🚀 TESTING ALL ROUTES IN PRODUCTION (VERCEL)" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Login y obtener token
$body = @{ email = "testvercel@example.com"; password = "test12345" } | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    $token = ($response.Content | ConvertFrom-Json).token
    Write-Host "✅ Token obtenido`n" -ForegroundColor Green
} catch {
    Write-Host "❌ No se pudo obtener token. Abortando tests.`n" -ForegroundColor Red
    exit
}

$passed = 0
$failed = 0
$total = 0

function Test-Route($name, $method, $url, $body = $null, $needsAuth = $false) {
    $script:total++
    try {
        $params = @{
            Uri = $url
            Method = $method
            UseBasicParsing = $true
        }
        
        if ($needsAuth) {
            $params["Headers"] = @{Authorization = "Bearer $script:token"}
        }
        
        if ($body) {
            $params["Body"] = ($body | ConvertTo-Json)
            $params["ContentType"] = "application/json"
        }
        
        $r = Invoke-WebRequest @params
        Write-Host "[$script:total] ✅ $name" -ForegroundColor Green
        $script:passed++
    } catch {
        Write-Host "[$script:total] ❌ $name - $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
    }
}

# 1. Públicas
Test-Route "Health Check" "GET" "$baseUrl/health"
Test-Route "Root" "GET" "$baseUrl/"
Test-Route "Proveedores" "GET" "$baseUrl/servicios/proveedores"

# 2. Usuario
Test-Route "Profile" "GET" "$baseUrl/profile" -needsAuth $true
Test-Route "Saldo" "GET" "$baseUrl/saldo" -needsAuth $true

# 3. Transacciones
Test-Route "Transacciones" "GET" "$baseUrl/transacciones" -needsAuth $true
Test-Route "Gastos por Categoría" "GET" "$baseUrl/gastos/categoria" -needsAuth $true

# 4. Transferencias
Test-Route "Buscar Usuario" "GET" "$baseUrl/buscar-usuario?query=test" -needsAuth $true
Test-Route "Actividades" "GET" "$baseUrl/actividades" -needsAuth $true

# 5. Servicios
Test-Route "Obtener Servicios" "GET" "$baseUrl/servicios" -needsAuth $true

# 6. Categorías
Test-Route "Obtener Categorías" "GET" "$baseUrl/categorias" -needsAuth $true

# 7. Tarjetas
Test-Route "Obtener Tarjetas" "GET" "$baseUrl/transporte/tarjetas" -needsAuth $true
Test-Route "Obtener Tarjetas Desactivadas" "GET" "$baseUrl/transporte/tarjetas/desactivadas" -needsAuth $true
Test-Route "Obtener Empresas" "GET" "$baseUrl/transporte/empresas" -needsAuth $true
Test-Route "Estadísticas Transporte" "GET" "$baseUrl/transporte/estadisticas" -needsAuth $true

# 8. Wallet
Test-Route "Wallet Estado" "GET" "$baseUrl/wallet/estado" -needsAuth $true

# Resumen
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "📊 RESUMEN FINAL - PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Total: $total" -ForegroundColor White
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
$percentage = [math]::Round(($passed / $total) * 100, 2)
Write-Host "📈 Success Rate: $percentage%`n" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "🎉 ¡TODOS LOS TESTS PASARON EN PRODUCCIÓN!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Algunos tests fallaron en producción" -ForegroundColor Yellow
}
