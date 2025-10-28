#!/bin/bash

BASE_URL="https://db-projecto.vercel.app"

echo "🧪 PROBANDO TODAS LAS APIS DE WALLET TIC"
echo "=========================================="

# 1. Prueba básica
echo "✅ 1. Prueba básica del servidor"
curl -s "$BASE_URL/"
echo -e "\n"

# 2. Verificar variables de entorno
echo "✅ 2. Verificar variables de entorno"
curl -s "$BASE_URL/env-check"
echo -e "\n"

# 3. Pruebas de autenticación
echo "✅ 3. Prueba de registro"
curl -X POST "$BASE_URL/auth/registro" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","nombre":"Test User"}' \
  -s
echo -e "\n"

echo "✅ 4. Prueba de login"
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}' \
  -s
echo -e "\n"

# 4. Pruebas de servicios (sin autenticación)
echo "✅ 5. Prueba obtener proveedores"
curl -s "$BASE_URL/servicios/proveedores"
echo -e "\n"

echo "✅ 6. Prueba obtener empresas de transporte"
curl -s "$BASE_URL/transporte/empresas"
echo -e "\n"

# 5. Pruebas que requieren autenticación (deberían dar error 401)
echo "✅ 7. Prueba obtener saldo (requiere auth)"
curl -s "$BASE_URL/saldo"
echo -e "\n"

echo "✅ 8. Prueba obtener transacciones (requiere auth)"
curl -s "$BASE_URL/transacciones"
echo -e "\n"

echo "✅ 9. Prueba obtener servicios (requiere auth)"
curl -s "$BASE_URL/servicios"
echo -e "\n"

echo "✅ 10. Prueba obtener tarjetas de transporte (requiere auth)"
curl -s "$BASE_URL/transporte/tarjetas"
echo -e "\n"

echo "✅ 11. Prueba obtener categorías (requiere auth)"
curl -s "$BASE_URL/categorias"
echo -e "\n"

echo "🎯 PRUEBAS COMPLETADAS"
echo "======================" 