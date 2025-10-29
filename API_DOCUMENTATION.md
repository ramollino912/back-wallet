# 📘 DOCUMENTACIÓN COMPLETA - BACK WALLET API

## Información General

**Base URL**: `http://localhost:3000`  
**Versión**: 1.0.0  
**Base de Datos**: PostgreSQL (Neon)  
**Autenticación**: JWT Bearer Token  

---

## 🔐 AUTENTICACIÓN

Todas las rutas (excepto `/auth/login` y `/auth/registro`) requieren un token JWT en el header:
```
Authorization: Bearer <tu_token_aqui>
```

---

## 📋 ÍNDICE DE RUTAS

### [1. Autenticación](#1-autenticación-1)
- POST /auth/registro
- POST /auth/login

### [2. Gestión de Saldo](#2-gestión-de-saldo-1)
- GET /saldo
- POST /saldo/recargar

### [3. Transferencias](#3-transferencias-1)
- POST /transferir
- GET /buscar-usuario
- GET /actividades

### [4. Servicios](#4-servicios-1)
- GET /servicios/proveedores
- POST /servicios
- GET /servicios
- POST /servicios/:id/pagar
- POST /servicios/pagar-todos
- DELETE /servicios/:id

### [5. Transporte](#5-transporte-1)
- GET /transporte/empresas
- POST /transporte/tarjetas
- GET /transporte/tarjetas
- POST /transporte/recargar
- GET /transporte/tarjetas/:id/saldo
- DELETE /transporte/tarjetas/:id
- GET /transporte/tarjetas/desactivadas
- PUT /transporte/tarjetas/:id/reactivar
- GET /transporte/estadisticas

### [6. Categorías](#6-categorías-1)
- GET /categorias

---

## 1. AUTENTICACIÓN

### 1.1. Registrar Usuario

**Endpoint**: `POST /auth/registro`  
**Autenticación**: No requiere  
**Descripción**: Crea una nueva cuenta de usuario con CVU y alias generados automáticamente.

**Request Body**:
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@example.com",
  "password": "MiPassword123!",
  "telefono": "1123456789"
}
```

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "usuario": {
    "id": 3,
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan.perez@example.com",
    "cvu": "0000003100012345678901",
    "alias": "wallet.5234",
    "saldo": "0.00"
  }
}
```

**Ejemplo PowerShell**:
```powershell
$body = @{
    nombre = "Juan"
    apellido = "Pérez"
    email = "juan.perez@example.com"
    password = "MiPassword123!"
    telefono = "1123456789"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/auth/registro" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Ejemplo cURL**:
```bash
curl -X POST http://localhost:3000/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan.perez@example.com",
    "password": "MiPassword123!",
    "telefono": "1123456789"
  }'
```

---

### 1.2. Iniciar Sesión

**Endpoint**: `POST /auth/login`  
**Autenticación**: No requiere  
**Descripción**: Inicia sesión y devuelve un token JWT válido por 24 horas.

**Request Body**:
```json
{
  "email": "juan.perez@example.com",
  "password": "MiPassword123!"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 3,
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan.perez@example.com",
    "cvu": "0000003100012345678901",
    "alias": "wallet.5234"
  }
}
```

**Ejemplo PowerShell**:
```powershell
$body = @{
    email = "juan.perez@example.com"
    password = "MiPassword123!"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$data = $response.Content | ConvertFrom-Json
$token = $data.token
Write-Host "Token: $token"
```

---

## 2. GESTIÓN DE SALDO

### 2.1. Consultar Saldo

**Endpoint**: `GET /saldo`  
**Autenticación**: Requerida  
**Descripción**: Obtiene el saldo actual del usuario autenticado.

**Response Success (200)**:
```json
{
  "saldo": "15000.00"
}
```

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}

Invoke-WebRequest -Uri "http://localhost:3000/saldo" `
    -Method GET `
    -Headers $headers
```

**Ejemplo cURL**:
```bash
curl -X GET http://localhost:3000/saldo \
  -H "Authorization: Bearer tu_token_aqui"
```

---

### 2.2. Recargar Saldo

**Endpoint**: `POST /saldo/recargar`  
**Autenticación**: Requerida  
**Descripción**: Agrega dinero al saldo de la cuenta. Crea una transacción de tipo "recarga_saldo".

**Request Body**:
```json
{
  "monto": 5000
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Saldo recargado exitosamente",
  "saldoAnterior": 15000,
  "montoRecargado": 5000,
  "nuevoSaldo": 20000
}
```

**Validaciones**:
- ❌ Monto debe ser mayor a 0
- ❌ Monto debe ser un número válido

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}
$body = @{monto = 5000} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/saldo/recargar" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"
```

---

## 3. TRANSFERENCIAS

### 3.1. Transferir Dinero

**Endpoint**: `POST /transferir`  
**Autenticación**: Requerida  
**Descripción**: Transfiere dinero a otro usuario usando CVU o alias. La operación es atómica.

**Request Body**:
```json
{
  "destinatario": "wallet.5234",
  "monto": 1000,
  "descripcion": "Pago de cena"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Transferencia realizada exitosamente",
  "transaccion": {
    "id": 10,
    "monto": "1000.00",
    "descripcion": "Pago de cena",
    "destinatario": {
      "nombre": "Juan",
      "apellido": "Pérez",
      "alias": "wallet.5234"
    }
  },
  "saldoActual": 19000
}
```

**Validaciones**:
- ❌ Destinatario (CVU o alias) es requerido
- ❌ Monto debe ser mayor a 0
- ❌ Saldo insuficiente
- ❌ No puedes transferir a ti mismo
- ❌ Destinatario no existe

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}
$body = @{
    destinatario = "wallet.5234"
    monto = 1000
    descripcion = "Pago de cena"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/transferir" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"
```

---

### 3.2. Buscar Usuario

**Endpoint**: `GET /buscar-usuario?query={busqueda}`  
**Autenticación**: Requerida  
**Descripción**: Busca usuarios por nombre, apellido, email, CVU o alias.

**Query Parameters**:
- `query` (string, requerido): Texto a buscar (mínimo 3 caracteres)

**Response Success (200)**:
```json
{
  "success": true,
  "usuarios": [
    {
      "id": 3,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan.perez@example.com",
      "alias": "wallet.5234",
      "cvu": "0000003100012345678901"
    },
    {
      "id": 5,
      "nombre": "Juana",
      "apellido": "García",
      "email": "juana.garcia@example.com",
      "alias": "bank.9876",
      "cvu": "0000003100098765432109"
    }
  ]
}
```

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}
$query = [System.Web.HttpUtility]::UrlEncode("Juan")

Invoke-WebRequest -Uri "http://localhost:3000/buscar-usuario?query=$query" `
    -Method GET `
    -Headers $headers
```

---

### 3.3. Historial de Actividades

**Endpoint**: `GET /actividades?page={pagina}&limit={limite}`  
**Autenticación**: Requerida  
**Descripción**: Obtiene el historial de transacciones del usuario con paginación.

**Query Parameters**:
- `page` (number, opcional): Número de página (default: 1)
- `limit` (number, opcional): Resultados por página (default: 10, máx: 50)

**Response Success (200)**:
```json
{
  "success": true,
  "actividades": [
    {
      "id": 10,
      "tipo": "transferencia",
      "monto": "1000.00",
      "descripcion": "Pago de cena",
      "estado": "completada",
      "categoria": "transferencia",
      "esEnvio": true,
      "origen": {
        "id": 1,
        "nombre": "TestUser",
        "apellido": "Nuevo",
        "email": "test@example.com"
      },
      "destino": {
        "id": 3,
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "juan.perez@example.com"
      }
    },
    {
      "id": 9,
      "tipo": "recarga_saldo",
      "monto": "5000.00",
      "descripcion": "Recarga de saldo",
      "estado": "completada",
      "categoria": "recarga",
      "esEnvio": true,
      "origen": {...},
      "destino": null
    }
  ],
  "total": 25,
  "pagina": 1,
  "totalPaginas": 3
}
```

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}

Invoke-WebRequest -Uri "http://localhost:3000/actividades?page=1&limit=10" `
    -Method GET `
    -Headers $headers
```

---

## 4. SERVICIOS

### 4.1. Obtener Proveedores

**Endpoint**: `GET /servicios/proveedores`  
**Autenticación**: No requiere  
**Descripción**: Lista todos los proveedores disponibles por tipo de servicio.

**Response Success (200)**:
```json
{
  "luz": ["EDESUR", "EDENOR", "EDELAP", "EDES"],
  "agua": ["AYSA", "AGUAS CORDOBESAS", "AGUAS DEL VALLE"],
  "gas": ["METROGAS", "GAS NATURAL BAN", "GAS DEL ESTE"],
  "celular": ["CLARO", "MOVISTAR", "PERSONAL"]
}
```

**Ejemplo PowerShell**:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/servicios/proveedores" -Method GET
```

---

### 4.2. Crear Servicio

**Endpoint**: `POST /servicios`  
**Autenticación**: Requerida  
**Descripción**: Registra un nuevo servicio recurrente (luz, agua, gas o celular).

**Request Body**:
```json
{
  "nombre": "Luz Casa",
  "tipo": "luz",
  "proveedor": "EDENOR",
  "numero_servicio": "12345678",
  "monto_mensual": 3500,
  "fecha_vencimiento": "2025-11-15"
}
```

**Response Success (201)**:
```json
{
  "message": "Servicio creado exitosamente",
  "servicio": {
    "id": 7,
    "nombre": "Luz Casa",
    "tipo": "luz",
    "proveedor": "EDENOR",
    "numero_servicio": "12345678",
    "monto_mensual": "3500.00",
    "fecha_vencimiento": "2025-11-15T00:00:00.000Z",
    "estado": "pendiente",
    "activo": true,
    "usuarioid": 1
  }
}
```

**Validaciones**:
- ❌ Todos los campos son requeridos
- ❌ Tipo debe ser: luz, agua, gas o celular
- ❌ **Restricción especial**: Solo se permite **1 servicio celular activo** por usuario

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}
$body = @{
    nombre = "Luz Casa"
    tipo = "luz"
    proveedor = "EDENOR"
    numero_servicio = "12345678"
    monto_mensual = 3500
    fecha_vencimiento = "2025-11-15"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/servicios" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"
```

---

### 4.3. Listar Servicios

**Endpoint**: `GET /servicios`  
**Autenticación**: Requerida  
**Descripción**: Obtiene todos los servicios activos del usuario, ordenados por fecha de vencimiento.

**Response Success (200)**:
```json
[
  {
    "id": 7,
    "nombre": "Luz Casa",
    "tipo": "luz",
    "proveedor": "EDENOR",
    "numero_servicio": "12345678",
    "monto_mensual": "3500.00",
    "fecha_vencimiento": "2025-11-15T00:00:00.000Z",
    "estado": "pendiente",
    "activo": true,
    "usuarioid": 1
  },
  {
    "id": 8,
    "nombre": "Agua Depto",
    "tipo": "agua",
    "proveedor": "AYSA",
    "numero_servicio": "87654321",
    "monto_mensual": "1200.00",
    "fecha_vencimiento": "2025-11-20T00:00:00.000Z",
    "estado": "pendiente",
    "activo": true,
    "usuarioid": 1
  }
]
```

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}

Invoke-WebRequest -Uri "http://localhost:3000/servicios" `
    -Method GET `
    -Headers $headers
```

---

### 4.4. Pagar Servicio Individual

**Endpoint**: `POST /servicios/:id/pagar`  
**Autenticación**: Requerida  
**Descripción**: Paga un servicio específico. Descuenta el monto del saldo y crea una transacción.

**URL Parameters**:
- `id` (number): ID del servicio a pagar

**Response Success (200)**:
```json
{
  "message": "Servicio pagado exitosamente",
  "saldo_actual": 15500
}
```

**Validaciones**:
- ❌ Servicio no encontrado
- ❌ Servicio ya fue pagado
- ❌ Saldo insuficiente

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}
$servicioId = 7

Invoke-WebRequest -Uri "http://localhost:3000/servicios/$servicioId/pagar" `
    -Method POST `
    -Headers $headers
```

---

### 4.5. Pagar Todos los Servicios

**Endpoint**: `POST /servicios/pagar-todos`  
**Autenticación**: Requerida  
**Descripción**: Paga todos los servicios pendientes del usuario en una sola operación.

**Response Success (200)**:
```json
{
  "message": "Todos los servicios pagados exitosamente",
  "servicios_pagados": 3,
  "total_pagado": 6200,
  "saldo_actual": 9300
}
```

**Validaciones**:
- ❌ No hay servicios pendientes
- ❌ Saldo insuficiente para pagar todos

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}

Invoke-WebRequest -Uri "http://localhost:3000/servicios/pagar-todos" `
    -Method POST `
    -Headers $headers
```

---

### 4.6. Eliminar Servicio

**Endpoint**: `DELETE /servicios/:id`  
**Autenticación**: Requerida  
**Descripción**: Desactiva un servicio (no lo elimina, solo marca como inactivo).

**URL Parameters**:
- `id` (number): ID del servicio a eliminar

**Response Success (200)**:
```json
{
  "message": "Servicio eliminado exitosamente"
}
```

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}
$servicioId = 7

Invoke-WebRequest -Uri "http://localhost:3000/servicios/$servicioId" `
    -Method DELETE `
    -Headers $headers
```

---

## 5. TRANSPORTE

### 5.1. Obtener Empresas de Transporte

**Endpoint**: `GET /transporte/empresas`  
**Autenticación**: No requiere  
**Descripción**: Lista todas las empresas de transporte disponibles.

**Response Success (200)**:
```json
["SUBE", "DIPLOMATICO", "MOVE", "BONDICARD"]
```

**Ejemplo PowerShell**:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/transporte/empresas" -Method GET
```

---

### 5.2. Vincular Tarjeta de Transporte

**Endpoint**: `POST /transporte/tarjetas`  
**Autenticación**: Requerida  
**Descripción**: Registra una nueva tarjeta de transporte (SUBE, MOVE, etc.).

**Request Body**:
```json
{
  "numero_tarjeta": "6061298123456789",
  "empresa": "SUBE"
}
```

**Response Success (201)**:
```json
{
  "message": "Tarjeta registrada exitosamente",
  "tarjeta": {
    "id": 4,
    "numero_tarjeta": "6061298123456789",
    "empresa": "SUBE",
    "saldo": "0.00",
    "activo": true,
    "usuario_id": 1
  }
}
```

**Validaciones**:
- ❌ Número de tarjeta y empresa son requeridos
- ❌ Número de tarjeta duplicado

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}
$body = @{
    numero_tarjeta = "6061298123456789"
    empresa = "SUBE"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/transporte/tarjetas" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"
```

---

### 5.3. Listar Tarjetas Activas

**Endpoint**: `GET /transporte/tarjetas`  
**Autenticación**: Requerida  
**Descripción**: Obtiene todas las tarjetas de transporte activas del usuario.

**Response Success (200)**:
```json
[
  {
    "id": 4,
    "numero_tarjeta": "6061298123456789",
    "empresa": "SUBE",
    "saldo": "0.00",
    "activo": true,
    "usuario_id": 1
  },
  {
    "id": 5,
    "numero_tarjeta": "6061298987654321",
    "empresa": "MOVE",
    "saldo": "500.00",
    "activo": true,
    "usuario_id": 1
  }
]
```

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}

Invoke-WebRequest -Uri "http://localhost:3000/transporte/tarjetas" `
    -Method GET `
    -Headers $headers
```

---

### 5.4. Recargar Tarjeta

**Endpoint**: `POST /transporte/recargar`  
**Autenticación**: Requerida  
**Descripción**: Recarga saldo en una tarjeta de transporte. Descuenta del saldo del usuario.

**Request Body**:
```json
{
  "tarjeta_id": 4,
  "monto": 1000
}
```

**Response Success (200)**:
```json
{
  "message": "Tarjeta recargada exitosamente",
  "saldo_tarjeta": 1000,
  "saldo_usuario": 8300
}
```

**Validaciones**:
- ❌ ID de tarjeta es requerido
- ❌ Monto debe ser mayor a 0
- ❌ Tarjeta no encontrada
- ❌ Saldo insuficiente en cuenta

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}
$body = @{
    tarjeta_id = 4
    monto = 1000
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/transporte/recargar" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"
```

---

### 5.5. Consultar Saldo de Tarjeta

**Endpoint**: `GET /transporte/tarjetas/:id/saldo`  
**Autenticación**: Requerida  
**Descripción**: Obtiene el saldo actual de una tarjeta específica.

**URL Parameters**:
- `id` (number): ID de la tarjeta

**Response Success (200)**:
```json
{
  "saldo": "1000.00",
  "empresa": "SUBE",
  "numero_tarjeta": "6061298123456789"
}
```

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}
$tarjetaId = 4

Invoke-WebRequest -Uri "http://localhost:3000/transporte/tarjetas/$tarjetaId/saldo" `
    -Method GET `
    -Headers $headers
```

---

### 5.6. Eliminar Tarjeta

**Endpoint**: `DELETE /transporte/tarjetas/:id`  
**Autenticación**: Requerida  
**Descripción**: Desactiva una tarjeta de transporte (no la elimina físicamente).

**URL Parameters**:
- `id` (number): ID de la tarjeta

**Response Success (200)**:
```json
{
  "message": "Tarjeta eliminada exitosamente"
}
```

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}
$tarjetaId = 4

Invoke-WebRequest -Uri "http://localhost:3000/transporte/tarjetas/$tarjetaId" `
    -Method DELETE `
    -Headers $headers
```

---

### 5.7. Listar Tarjetas Desactivadas

**Endpoint**: `GET /transporte/tarjetas/desactivadas`  
**Autenticación**: Requerida  
**Descripción**: Obtiene todas las tarjetas desactivadas del usuario.

**Response Success (200)**:
```json
[
  {
    "id": 4,
    "numero_tarjeta": "6061298123456789",
    "empresa": "SUBE",
    "saldo": "500.00",
    "activo": false,
    "usuario_id": 1
  }
]
```

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}

Invoke-WebRequest -Uri "http://localhost:3000/transporte/tarjetas/desactivadas" `
    -Method GET `
    -Headers $headers
```

---

### 5.8. Reactivar Tarjeta

**Endpoint**: `PUT /transporte/tarjetas/:id/reactivar`  
**Autenticación**: Requerida  
**Descripción**: Reactiva una tarjeta previamente desactivada.

**URL Parameters**:
- `id` (number): ID de la tarjeta

**Response Success (200)**:
```json
{
  "message": "Tarjeta reactivada exitosamente",
  "tarjeta": {
    "id": 4,
    "numero_tarjeta": "6061298123456789",
    "empresa": "SUBE",
    "saldo": "500.00",
    "activo": true,
    "usuario_id": 1
  }
}
```

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}
$tarjetaId = 4

Invoke-WebRequest -Uri "http://localhost:3000/transporte/tarjetas/$tarjetaId/reactivar" `
    -Method PUT `
    -Headers $headers
```

---

### 5.9. Estadísticas de Transporte

**Endpoint**: `GET /transporte/estadisticas`  
**Autenticación**: Requerida  
**Descripción**: Obtiene estadísticas sobre las tarjetas del usuario.

**Response Success (200)**:
```json
{
  "total_tarjetas": 3,
  "total_saldo": 2500,
  "promedio_saldo": 833.33,
  "tarjetas_por_empresa": {
    "SUBE": 2,
    "MOVE": 1
  }
}
```

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}

Invoke-WebRequest -Uri "http://localhost:3000/transporte/estadisticas" `
    -Method GET `
    -Headers $headers
```

---

## 6. CATEGORÍAS

### 6.1. Listar Categorías

**Endpoint**: `GET /categorias`  
**Autenticación**: Requerida  
**Descripción**: Obtiene todas las categorías disponibles para clasificar transacciones.

**Response Success (200)**:
```json
[
  {
    "id": 1,
    "nombre": "Transferencia",
    "descripcion": "Transferencias entre usuarios",
    "color": "#007bff",
    "icono": "💸",
    "activo": true
  },
  {
    "id": 2,
    "nombre": "Recarga",
    "descripcion": "Recargas de saldo",
    "color": "#28a745",
    "icono": "💰",
    "activo": true
  },
  {
    "id": 3,
    "nombre": "Luz",
    "descripcion": "Pagos de servicios de electricidad",
    "color": "#ffc107",
    "icono": "⚡",
    "activo": true
  },
  {
    "id": 4,
    "nombre": "Agua",
    "descripcion": "Pagos de servicios de agua",
    "color": "#17a2b8",
    "icono": "💧",
    "activo": true
  },
  {
    "id": 5,
    "nombre": "Gas",
    "descripcion": "Pagos de servicios de gas",
    "color": "#fd7e14",
    "icono": "🔥",
    "activo": true
  },
  {
    "id": 6,
    "nombre": "Celular",
    "descripcion": "Pagos de servicios de telefonía móvil",
    "color": "#6f42c1",
    "icono": "📱",
    "activo": true
  },
  {
    "id": 7,
    "nombre": "Transporte",
    "descripcion": "Recargas de tarjetas de transporte",
    "color": "#20c997",
    "icono": "🚌",
    "activo": true
  },
  {
    "id": 8,
    "nombre": "Entretenimiento",
    "descripcion": "Gastos en entretenimiento",
    "color": "#e83e8c",
    "icono": "🎮",
    "activo": true
  },
  {
    "id": 9,
    "nombre": "Comida",
    "descripcion": "Gastos en alimentación",
    "color": "#fd7e14",
    "icono": "🍔",
    "activo": true
  },
  {
    "id": 10,
    "nombre": "Salud",
    "descripcion": "Gastos en salud",
    "color": "#dc3545",
    "icono": "🏥",
    "activo": true
  }
]
```

**Ejemplo PowerShell**:
```powershell
$headers = @{Authorization = "Bearer $token"}

Invoke-WebRequest -Uri "http://localhost:3000/categorias" `
    -Method GET `
    -Headers $headers
```

---

## 📊 CÓDIGOS DE RESPUESTA HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| **200** | OK | Solicitud exitosa |
| **201** | Created | Recurso creado exitosamente |
| **400** | Bad Request | Datos inválidos o faltantes |
| **401** | Unauthorized | Token inválido o expirado |
| **404** | Not Found | Recurso no encontrado |
| **500** | Internal Server Error | Error del servidor |

---

## 🔒 SEGURIDAD

### Token JWT
- **Duración**: 24 horas desde la emisión
- **Header**: `Authorization: Bearer <token>`
- **Payload**: Contiene el ID del usuario
- **Secreto**: Definido en variable de entorno `JWT_SECRET`

### Validaciones Comunes
- ✅ Email válido
- ✅ Contraseña mínima (recomendado 8 caracteres)
- ✅ Montos numéricos y positivos
- ✅ CVU formato: 22 dígitos
- ✅ Alias formato: palabra.número

---

## 🧪 TESTING

### Script de Pruebas Rápido
```powershell
# Ejecutar tests rápidos
.\test-quick.ps1
```

### Script de Pruebas Completo
```powershell
# Ejecutar suite completa (21 tests)
.\test-all-routes.ps1
```

### Verificar Estructura de BD
```powershell
# Ver columnas de una tabla
node check-table.js
```

---

## 🛠️ CONFIGURACIÓN LOCAL

### Variables de Entorno (.env)
```env
DB_HOST=ep-white-dust-a4ao0h56.us-east-1.aws.neon.tech
DB_USER=default
DB_PASSWORD=tu_password
DB_NAME=wallet
DB_PORT=5432
JWT_SECRET=tu_secreto_seguro
PORT=3000
NODE_ENV=development
```

### Iniciar Servidor
```bash
npm run dev
```

### Ejecutar Migraciones
```bash
npx sequelize-cli db:migrate
```

---

## 📞 SOPORTE

**Repositorio**: https://github.com/ramollino912/back-wallet  
**Documentación Completa**: Ver `CAMBIOS_Y_TESTS.md` y `RESUMEN_FINAL.md`  
**Scripts de Prueba**: `test-quick.ps1` y `test-all-routes.ps1`

---

**Versión del documento**: 1.0  
**Última actualización**: 29 de Octubre 2025
