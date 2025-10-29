# Script para probar todas las rutas en producción
$baseUrl = "https://back-wallet-20.vercel.app"
$email = "testvercel@example.com"
$password = "test12345"

Write-Host "`n🧪 INICIANDO TESTS EN PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Contador de tests
$total = 0
$passed = 0
$failed = 0

function Test-Route {
    param($name, $method, $url, $body = $null, $needsAuth = $false, $expectedStatus = 200)
    
    $script:total++
    Write-Host "[$script:total] Testing: $name" -ForegroundColor Yellow
    
    try {
        $headers = @{"Content-Type" = "application/json"}
        if ($needsAuth -and $script:token) {
            $headers["Authorization"] = "Bearer $script:token"
        }
        
        $params = @{
            Uri = $url
            Method = $method
            Headers = $headers
            UseBasicParsing = $true
        }
        
        if ($body) {
            $params["Body"] = ($body | ConvertTo-Json)
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq $expectedStatus) {
            Write-Host "  ✅ PASS - Status: $($response.StatusCode)" -ForegroundColor Green
            $script:passed++
            return $true
        } else {
            Write-Host "  ❌ FAIL - Expected: $expectedStatus, Got: $($response.StatusCode)" -ForegroundColor Red
            $script:failed++
            return $false
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $expectedStatus) {
            Write-Host "  ✅ PASS - Status: $statusCode (expected)" -ForegroundColor Green
            $script:passed++
            return $true
        } else {
            Write-Host "  ❌ FAIL - Status: $statusCode, Error: $($_.Exception.Message)" -ForegroundColor Red
            $script:failed++
            return $false
        }
    }
}

# 1. Rutas públicas
Write-Host "`n📂 RUTAS PÚBLICAS`n" -ForegroundColor Magenta

Test-Route "Health Check" "GET" "$baseUrl/health"
Test-Route "Root Endpoint" "GET" "$baseUrl/"
Test-Route "Proveedores de Servicios" "GET" "$baseUrl/servicios/proveedores"

# 2. Autenticación
Write-Host "`n🔐 AUTENTICACIÓN`n" -ForegroundColor Magenta

# Login
try {
    $loginBody = @{ email = $email; password = $password }
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body ($loginBody | ConvertTo-Json) -ContentType "application/json" -UseBasicParsing
    $script:token = ($loginResponse.Content | ConvertFrom-Json).token
    Write-Host "[4] Testing: Login" -ForegroundColor Yellow
    Write-Host "  ✅ PASS - Token obtenido" -ForegroundColor Green
    $script:total++
    $script:passed++
} catch {
    Write-Host "[4] Testing: Login" -ForegroundColor Yellow
    Write-Host "  ❌ FAIL - No se pudo obtener token" -ForegroundColor Red
    $script:total++
    $script:failed++
}

# 3. Perfil de usuario
Write-Host "`n👤 PERFIL DE USUARIO`n" -ForegroundColor Magenta

Test-Route "Obtener Perfil" "GET" "$baseUrl/profile" -needsAuth $true
Test-Route "Obtener Saldo" "GET" "$baseUrl/saldo" -needsAuth $true

# 4. Transacciones
Write-Host "`n💰 TRANSACCIONES`n" -ForegroundColor Magenta

Test-Route "Obtener Transacciones" "GET" "$baseUrl/transacciones" -needsAuth $true
Test-Route "Obtener Gastos por Categoría" "GET" "$baseUrl/gastos/categoria" -needsAuth $true

# 5. Transferencias
Write-Host "`n🔄 TRANSFERENCIAS`n" -ForegroundColor Magenta

Test-Route "Buscar Usuario" "GET" "$baseUrl/buscar-usuario?query=test" -needsAuth $true
Test-Route "Obtener Actividades" "GET" "$baseUrl/actividades" -needsAuth $true

# 6. Servicios
Write-Host "`n🔌 SERVICIOS`n" -ForegroundColor Magenta

Test-Route "Obtener Servicios" "GET" "$baseUrl/servicios" -needsAuth $true

# 7. Categorías
Write-Host "`n📁 CATEGORÍAS`n" -ForegroundColor Magenta

Test-Route "Obtener Categorías" "GET" "$baseUrl/categorias" -needsAuth $true
$categoriaBody = @{ nombre = "Test Categoria"; tipo = "gasto"; icono = "test"; color = "#FF0000" }
Test-Route "Crear Categoría" "POST" "$baseUrl/categorias" -body $categoriaBody -needsAuth $true -expectedStatus 201

# 8. Tarjetas de transporte
Write-Host "`n🚌 TARJETAS DE TRANSPORTE`n" -ForegroundColor Magenta

Test-Route "Obtener Empresas de Transporte" "GET" "$baseUrl/tarjetas/empresas" -needsAuth $true
Test-Route "Obtener Tarjetas" "GET" "$baseUrl/tarjetas" -needsAuth $true
Test-Route "Obtener Tarjetas Desactivadas" "GET" "$baseUrl/tarjetas/desactivadas" -needsAuth $true
Test-Route "Obtener Estadísticas de Transporte" "GET" "$baseUrl/tarjetas/estadisticas" -needsAuth $true

# 9. Wallet
Write-Host "`n💳 WALLET`n" -ForegroundColor Magenta

Test-Route "Obtener Estado del Wallet" "GET" "$baseUrl/wallet/estado" -needsAuth $true

# Resumen
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "📊 RESUMEN DE TESTS" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan
Write-Host "Total de tests: $total" -ForegroundColor White
Write-Host "✅ Pasados: $passed" -ForegroundColor Green
Write-Host "❌ Fallidos: $failed" -ForegroundColor Red
$percentage = [math]::Round(($passed / $total) * 100, 2)
Write-Host "📈 Porcentaje de éxito: $percentage%`n" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "🎉 ¡TODOS LOS TESTS PASARON!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Algunos tests fallaron" -ForegroundColor Yellow
}
