# Script de Pruebas Automatizadas - Back Wallet API

$BASE_URL = "http://localhost:3000"
$TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzYxNzM5NTE4LCJleHAiOjE3NjE4MjU5MTh9.MQF46UuF35Ej6OrVvHxRvl5s3ol3MpJmHURC2hF95cQ"

function Test-API {
    param([string]$Method, [string]$Endpoint, [string]$Desc, [object]$Body=$null)
    
    Write-Host "`n>>> $Desc" -ForegroundColor Cyan
    Write-Host "    $Method $Endpoint" -ForegroundColor Gray
    
    try {
        $headers = @{Authorization = "Bearer $TOKEN"}
        $params = @{
            Uri = "$BASE_URL$Endpoint"
            Method = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        $result = $response.Content | ConvertFrom-Json
        Write-Host "    [OK] Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "    Data: $($result | ConvertTo-Json -Compress -Depth 3)" -ForegroundColor Gray
        return $result
    }
    catch {
        Write-Host "    [ERROR] $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " BACK WALLET - SUITE DE PRUEBAS COMPLETO" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# SERVICIOS
Write-Host "`n=== SERVICIOS ===" -ForegroundColor Yellow
Test-API -Method "GET" -Endpoint "/servicios/proveedores" -Desc "Obtener proveedores"
Test-API -Method "GET" -Endpoint "/servicios" -Desc "Listar servicios"
Test-API -Method "POST" -Endpoint "/servicios/pagar-todos" -Desc "Pagar todos los servicios"

# TRANSPORTE
Write-Host "`n=== TRANSPORTE ===" -ForegroundColor Yellow
Test-API -Method "GET" -Endpoint "/transporte/empresas" -Desc "Obtener empresas de transporte"
Test-API -Method "GET" -Endpoint "/transporte/tarjetas" -Desc "Listar tarjetas vinculadas"

$tarjetaData = @{
    numero_tarjeta = "60612981$(Get-Random -Minimum 10000000 -Maximum 99999999)"
    empresa = "SUBE"
}
$tarjeta = Test-API -Method "POST" -Endpoint "/transporte/tarjetas" -Desc "Vincular tarjeta SUBE" -Body $tarjetaData

if ($tarjeta) {
    $recargaData = @{
        tarjeta_id = $tarjeta.tarjeta.id
        monto = 1000
    }
    Test-API -Method "POST" -Endpoint "/transporte/recargar" -Desc "Recargar tarjeta" -Body $recargaData
    Test-API -Method "GET" -Endpoint "/transporte/tarjetas" -Desc "Verificar saldo de tarjeta"
}

# CATEGORIAS
Write-Host "`n=== CATEGORIAS ===" -ForegroundColor Yellow
Test-API -Method "GET" -Endpoint "/categorias" -Desc "Listar categorias"

# SALDO Y TRANSFERENCIAS
Write-Host "`n=== SALDO ===" -ForegroundColor Yellow
Test-API -Method "GET" -Endpoint "/saldo" -Desc "Obtener saldo actual"

$urlActividades = "/actividades?page=1" + [char]38 + "limit=5"
Test-API -Method "GET" -Endpoint $urlActividades -Desc "Obtener actividades recientes"

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " PRUEBAS COMPLETADAS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "`nRevisa CAMBIOS_Y_TESTS.md para mas detalles" -ForegroundColor Gray
