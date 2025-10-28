#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URL base
BASE_URL="https://db-projecto.vercel.app"

echo -e "${BLUE}🧪 INICIANDO PRUEBAS COMPLETAS DE LA API${NC}"
echo "=================================================="
echo ""

# Función para probar endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${YELLOW}📋 Probando: $description${NC}"
    echo -e "${BLUE}Endpoint: $method $endpoint${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [[ $http_code -eq 200 ]] || [[ $http_code -eq 201 ]]; then
        echo -e "${GREEN}✅ Éxito ($http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ Error ($http_code)${NC}"
        echo "$body"
    fi
    echo ""
}

# 1. Pruebas básicas del servidor
echo -e "${BLUE}🔍 1. PRUEBAS BÁSICAS DEL SERVIDOR${NC}"
echo "----------------------------------------"

test_endpoint "GET" "/" "" "Servidor funcionando"
test_endpoint "GET" "/health" "" "Health check"
test_endpoint "GET" "/env-check" "" "Verificar variables de entorno"

# 2. Pruebas de autenticación
echo -e "${BLUE}🔐 2. PRUEBAS DE AUTENTICACIÓN${NC}"
echo "----------------------------------------"

# Datos de prueba para registro
REGISTER_DATA='{
    "nombre": "Usuario Test",
    "email": "test@example.com",
    "password": "password123",
    "telefono": "1234567890"
}'

test_endpoint "POST" "/auth/registro" "$REGISTER_DATA" "Registro de usuario"

# Datos de prueba para login
LOGIN_DATA='{
    "email": "test@example.com",
    "password": "password123"
}'

test_endpoint "POST" "/auth/login" "$LOGIN_DATA" "Login de usuario"

# 3. Pruebas de usuarios
echo -e "${BLUE}👤 3. PRUEBAS DE USUARIOS${NC}"
echo "----------------------------------------"

test_endpoint "GET" "/usuarios" "" "Obtener todos los usuarios"
test_endpoint "GET" "/usuarios/1" "" "Obtener usuario específico"

# 4. Pruebas de categorías
echo -e "${BLUE}📂 4. PRUEBAS DE CATEGORÍAS${NC}"
echo "----------------------------------------"

CATEGORIA_DATA='{
    "nombre": "Categoría Test",
    "descripcion": "Descripción de prueba"
}'

test_endpoint "POST" "/categorias" "$CATEGORIA_DATA" "Crear categoría"
test_endpoint "GET" "/categorias" "" "Obtener todas las categorías"
test_endpoint "GET" "/categorias/1" "" "Obtener categoría específica"

# 5. Pruebas de servicios
echo -e "${BLUE}🛠️ 5. PRUEBAS DE SERVICIOS${NC}"
echo "----------------------------------------"

SERVICIO_DATA='{
    "nombre": "Servicio Test",
    "descripcion": "Descripción del servicio",
    "precio": 100.50,
    "categoriaId": 1
}'

test_endpoint "POST" "/servicios" "$SERVICIO_DATA" "Crear servicio"
test_endpoint "GET" "/servicios" "" "Obtener todos los servicios"
test_endpoint "GET" "/servicios/1" "" "Obtener servicio específico"

# 6. Pruebas de transacciones
echo -e "${BLUE}💰 6. PRUEBAS DE TRANSACCIONES${NC}"
echo "----------------------------------------"

TRANSACCION_DATA='{
    "monto": 150.00,
    "tipo": "ingreso",
    "descripcion": "Transacción de prueba",
    "usuarioId": 1
}'

test_endpoint "POST" "/transacciones" "$TRANSACCION_DATA" "Crear transacción"
test_endpoint "GET" "/transacciones" "" "Obtener todas las transacciones"
test_endpoint "GET" "/transacciones/1" "" "Obtener transacción específica"

# 7. Pruebas de tarjetas de transporte
echo -e "${BLUE}🚌 7. PRUEBAS DE TARJETAS DE TRANSPORTE${NC}"
echo "----------------------------------------"

TARJETA_DATA='{
    "numero": "1234567890123456",
    "tipo": "bus",
    "saldo": 50.00,
    "usuarioId": 1
}'

test_endpoint "POST" "/tarjetas-transporte" "$TARJETA_DATA" "Crear tarjeta de transporte"
test_endpoint "GET" "/tarjetas-transporte" "" "Obtener todas las tarjetas"
test_endpoint "GET" "/tarjetas-transporte/1" "" "Obtener tarjeta específica"

# 8. Pruebas de transferencias
echo -e "${BLUE}💸 8. PRUEBAS DE TRANSFERENCIAS${NC}"
echo "----------------------------------------"

TRANSFERENCIA_DATA='{
    "monto": 25.00,
    "origenId": 1,
    "destinoId": 2,
    "descripcion": "Transferencia de prueba"
}'

test_endpoint "POST" "/transferencias" "$TRANSFERENCIA_DATA" "Crear transferencia"
test_endpoint "GET" "/transferencias" "" "Obtener todas las transferencias"
test_endpoint "GET" "/transferencias/1" "" "Obtener transferencia específica"

# 9. Pruebas de endpoints de debug
echo -e "${BLUE}🐛 9. PRUEBAS DE DEBUG${NC}"
echo "----------------------------------------"

test_endpoint "GET" "/test" "" "Endpoint de prueba"
test_endpoint "GET" "/debug" "" "Endpoint de debug"
test_endpoint "GET" "/env" "" "Variables de entorno"

echo -e "${GREEN}🎉 PRUEBAS COMPLETADAS${NC}"
echo "==================================================" 