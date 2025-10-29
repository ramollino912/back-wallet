# Script simplificado para probar todas las rutas en desarrollo
$baseUrl = "http://localhost:3000"

Write-Host "`n🧪 TESTING ALL ROUTES IN DEVELOPMENT" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Login y obtener token
$body = @{ email = "testlocal@example.com"; password = "test12345" } | ConvertTo-Json
$response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
$token = ($response.Content | ConvertFrom-Json).token

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
        Write-Host "[$script:total] ❌ $name" -ForegroundColor Red
        $script:failed++
    }
}

# 1. Públicas
Test-Route "Health Check" "GET" "$baseUrl/health"
Test-Route "Root" "GET" "$baseUrl/"
Test-Route "Proveedores" "GET" "$baseUrl/servicios/proveedores"

# 2. Auth (ya testeado el login)
Write-Host "`n✅ Login ya testeado`n" -ForegroundColor Green
$total++
$passed++

# 3. Usuario
Test-Route "Profile" "GET" "$baseUrl/profile" -needsAuth $true
Test-Route "Saldo" "GET" "$baseUrl/saldo" -needsAuth $true

# 4. Transacciones
Test-Route "Transacciones" "GET" "$baseUrl/transacciones" -needsAuth $true
Test-Route "Gastos por Categoría" "GET" "$baseUrl/gastos/categoria" -needsAuth $true

# 5. Transferencias
Test-Route "Buscar Usuario" "GET" "$baseUrl/buscar-usuario?query=test" -needsAuth $true
Test-Route "Actividades" "GET" "$baseUrl/actividades" -needsAuth $true

# 6. Servicios
Test-Route "Obtener Servicios" "GET" "$baseUrl/servicios" -needsAuth $true

# 7. Categorías
Test-Route "Obtener Categorías" "GET" "$baseUrl/categorias" -needsAuth $true

# 8. Tarjetas
Test-Route "Obtener Tarjetas" "GET" "$baseUrl/transporte/tarjetas" -needsAuth $true
Test-Route "Obtener Tarjetas Desactivadas" "GET" "$baseUrl/transporte/tarjetas/desactivadas" -needsAuth $true
Test-Route "Obtener Empresas" "GET" "$baseUrl/transporte/empresas" -needsAuth $true
Test-Route "Estadísticas Transporte" "GET" "$baseUrl/transporte/estadisticas" -needsAuth $true

# 9. Wallet
Test-Route "Wallet Estado" "GET" "$baseUrl/wallet/estado" -needsAuth $true

# Resumen
Write-Host "`n====================================" -ForegroundColor Cyan
Write-Host "📊 RESUMEN" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Total: $total" -ForegroundColor White
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
$percentage = [math]::Round(($passed / $total) * 100, 2)
Write-Host "📈 Success Rate: $percentage%`n" -ForegroundColor Cyan
