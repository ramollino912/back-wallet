# Test Completo de Todas las Rutas - Back Wallet API
# Ejecutar: .\test-all-routes.ps1

$BASE_URL = "http://localhost:3000"
$TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzYxNzM5NTE4LCJleHAiOjE3NjE4MjU5MTh9.MQF46UuF35Ej6OrVvHxRvl5s3ol3MpJmHURC2hF95cQ"

$totalTests = 0
$passedTests = 0
$failedTests = 0

function Test-Route {
    param([string]$Method, [string]$Endpoint, [string]$Name, [object]$Body=$null, [bool]$ExpectError=$false)
    
    $global:totalTests++
    $testNum = "{0:D2}" -f $global:totalTests
    
    try {
        $headers = @{Authorization = "Bearer $TOKEN"}
        $params = @{Uri = "$BASE_URL$Endpoint"; Method = $Method; Headers = $headers}
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        
        if ($ExpectError) {
            Write-Host "[$testNum] FAIL - $Name (esperaba error pero tuvo exito)" -ForegroundColor Red
            $global:failedTests++
        } else {
            Write-Host "[$testNum] PASS - $Name" -ForegroundColor Green
            $global:passedTests++
        }
        return $response.Content | ConvertFrom-Json
    }
    catch {
        if ($ExpectError) {
            Write-Host "[$testNum] PASS - $Name (error esperado)" -ForegroundColor Green
            $global:passedTests++
        } else {
            Write-Host "[$testNum] FAIL - $Name : $($_.Exception.Message)" -ForegroundColor Red
            $global:failedTests++
        }
        return $null
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST COMPLETO DE TODAS LAS RUTAS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# AUTH
Write-Host "--- AUTENTICACION ---" -ForegroundColor Yellow
Test-Route "POST" "/auth/login" "Login" @{email="testnuevo3@example.com"; password="password123"}

# SALDO
Write-Host "`n--- GESTION DE SALDO ---" -ForegroundColor Yellow
$saldo = Test-Route "GET" "/saldo" "Obtener saldo"
Test-Route "POST" "/saldo/recargar" "Recargar saldo" @{monto=5000}
Test-Route "GET" "/saldo" "Verificar saldo recargado"

# TRANSFERENCIAS
Write-Host "`n--- TRANSFERENCIAS ---" -ForegroundColor Yellow
$busquedaUrl = "/buscar-usuario?query=test"
Test-Route "GET" $busquedaUrl "Buscar usuarios"
$actUrl = "/actividades?page=1" + [char]38 + "limit=10"
Test-Route "GET" $actUrl "Obtener actividades"

# SERVICIOS
Write-Host "`n--- SERVICIOS ---" -ForegroundColor Yellow
Test-Route "GET" "/servicios/proveedores" "Obtener proveedores"
Test-Route "GET" "/servicios" "Listar servicios"

$servicioAgua = @{
    nombre = "Agua Test"
    tipo = "agua"
    proveedor = "AYSA"
    numero_servicio = "99887766"
    monto_mensual = 1500
    fecha_vencimiento = "2025-12-01"
}
$nuevoServicio = Test-Route "POST" "/servicios" "Crear servicio agua" $servicioAgua

if ($nuevoServicio -and $nuevoServicio.servicio) {
    $servicioId = $nuevoServicio.servicio.id
    Test-Route "POST" "/servicios/$servicioId/pagar" "Pagar servicio agua"
}

Test-Route "POST" "/servicios/pagar-todos" "Pagar todos servicios" -ExpectError $true
Test-Route "GET" "/servicios" "Listar servicios despues de pagos"

# TRANSPORTE
Write-Host "`n--- TRANSPORTE ---" -ForegroundColor Yellow
Test-Route "GET" "/transporte/empresas" "Obtener empresas transporte"
Test-Route "GET" "/transporte/tarjetas" "Listar tarjetas"

$tarjetaData = @{
    numero_tarjeta = "60612981$(Get-Random -Min 10000000 -Max 99999999)"
    empresa = "MOVE"
}
$tarjeta = Test-Route "POST" "/transporte/tarjetas" "Vincular tarjeta MOVE" $tarjetaData

if ($tarjeta -and $tarjeta.tarjeta) {
    $tarjetaId = $tarjeta.tarjeta.id
    $recargaData = @{tarjeta_id = $tarjetaId; monto = 500}
    Test-Route "POST" "/transporte/recargar" "Recargar tarjeta" $recargaData
    Test-Route "GET" "/transporte/tarjetas/$tarjetaId/saldo" "Obtener saldo tarjeta"
    Test-Route "DELETE" "/transporte/tarjetas/$tarjetaId" "Eliminar tarjeta"
}

Test-Route "GET" "/transporte/tarjetas/desactivadas" "Listar tarjetas desactivadas"
Test-Route "GET" "/transporte/estadisticas" "Obtener estadisticas transporte"

# CATEGORIAS
Write-Host "`n--- CATEGORIAS ---" -ForegroundColor Yellow
Test-Route "GET" "/categorias" "Listar categorias"

# RESUMEN
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total:   $totalTests tests" -ForegroundColor White
Write-Host "Pasados: $passedTests tests" -ForegroundColor Green
Write-Host "Fallidos: $failedTests tests" -ForegroundColor Red

if ($totalTests -gt 0) {
    $percentage = [math]::Round(($passedTests / $totalTests) * 100, 1)
    Write-Host "`nTasa de exito: $percentage%" -ForegroundColor $(if($percentage -ge 90){"Green"}elseif($percentage -ge 70){"Yellow"}else{"Red"})
}
Write-Host "`nRevisa CAMBIOS_Y_TESTS.md para detalles completos`n" -ForegroundColor Gray
