# 🚀 GUÍA COMPLETA DE DEPLOYMENT EN VERCEL

## 📋 Pre-requisitos

✅ Cuenta en Vercel (https://vercel.com)  
✅ Cuenta en GitHub con el repositorio subido  
✅ Base de datos PostgreSQL en Neon (ya configurada)  
✅ Proyecto preparado con los archivos necesarios  

---

## 🔧 PASO 1: PREPARAR EL PROYECTO

### 1.1. Archivos Necesarios (Ya creados)

✅ **`.vercelignore`** - Excluye archivos innecesarios del deployment  
✅ **`vercel.json`** - Configuración de Vercel con rutas y funciones  
✅ **`package.json`** - Script `vercel-build` configurado  
✅ **`index.js`** - Exporta `app` como default para serverless  

### 1.2. Verificar que todo esté en el repositorio

```bash
git status
git add .
git commit -m "Preparado para deployment en Vercel"
git push origin main
```

---

## 🌐 PASO 2: CONFIGURAR VERCEL

### 2.1. Crear Proyecto en Vercel

1. Ve a https://vercel.com/dashboard
2. Click en **"Add New..."** → **"Project"**
3. Importa tu repositorio de GitHub: **`ramollino912/back-wallet`**
4. Selecciona el repositorio y click en **"Import"**

### 2.2. Configurar el Proyecto

**Framework Preset**: `Other`  
**Root Directory**: `./` (por defecto)  
**Build Command**: `npm run vercel-build` (o dejarlo vacío)  
**Output Directory**: `./` (por defecto)  
**Install Command**: `npm install`  

---

## 🔐 PASO 3: CONFIGURAR VARIABLES DE ENTORNO

### 3.1. En Vercel Dashboard

1. En tu proyecto, ve a **Settings** → **Environment Variables**
2. Agrega las siguientes variables una por una:

| Variable | Valor | Ambiente |
|----------|-------|----------|
| `DB_HOST` | `ep-white-dust-a4ao0h56.us-east-1.aws.neon.tech` | Production, Preview, Development |
| `DB_USER` | `default` | Production, Preview, Development |
| `DB_PASSWORD` | `tu_password_neon` | Production, Preview, Development |
| `DB_NAME` | `wallet` | Production, Preview, Development |
| `DB_PORT` | `5432` | Production, Preview, Development |
| `JWT_SECRET` | `tu_secreto_jwt_seguro_aqui` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

### 3.2. Obtener Credenciales de Neon

Si no tienes las credenciales a mano:

1. Ve a https://console.neon.tech
2. Selecciona tu proyecto `wallet`
3. En **Dashboard** → **Connection Details**
4. Copia el **Host**, **Database**, **User** y **Password**

---

## 📊 PASO 4: EJECUTAR MIGRACIONES EN PRODUCCIÓN

### 4.1. Desde tu computadora local

```powershell
# Configurar DATABASE_URL para producción
$env:DATABASE_URL="postgresql://default:PASSWORD@ep-white-dust-a4ao0h56.us-east-1.aws.neon.tech:5432/wallet?sslmode=require"

# Ejecutar migraciones
npx sequelize-cli db:migrate
```

### 4.2. Verificar que las tablas existan

```powershell
node check-table.js
```

**Tablas esperadas**:
- ✅ usuarios
- ✅ transacciones
- ✅ servicios
- ✅ tarjetas_transporte
- ✅ categorias

---

## 🚀 PASO 5: DEPLOYAR EL PROYECTO

### 5.1. Deployment Automático

Una vez configuradas las variables de entorno:

1. Click en **"Deploy"** en Vercel
2. Vercel construirá y desplegará automáticamente
3. Espera 1-2 minutos para que complete el deployment

### 5.2. Verificar el Deployment

Cuando termine, verás:
- ✅ **Status**: Ready
- 🌐 **URL**: `https://tu-proyecto.vercel.app`

---

## ✅ PASO 6: PROBAR LA API EN PRODUCCIÓN

### 6.1. Probar Ruta Principal

```powershell
Invoke-WebRequest -Uri "https://tu-proyecto.vercel.app/" -Method GET
```

**Respuesta esperada**:
```json
{
  "message": "🚀 WALLET TIC SERVER - WITH SEQUELIZE - 2025-10-29T...",
  "timestamp": "2025-10-29T...",
  "version": "6.0.0",
  "status": "ACTIVE",
  "database": "ENABLED",
  "environment": "production"
}
```

### 6.2. Probar Health Check

```powershell
Invoke-WebRequest -Uri "https://tu-proyecto.vercel.app/health" -Method GET
```

### 6.3. Probar Registro de Usuario

```powershell
$body = @{
    nombre = "Usuario"
    apellido = "Producción"
    email = "prod@example.com"
    password = "Test123!"
    telefono = "1234567890"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://tu-proyecto.vercel.app/auth/registro" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### 6.4. Probar Login

```powershell
$body = @{
    email = "prod@example.com"
    password = "Test123!"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://tu-proyecto.vercel.app/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$data = $response.Content | ConvertFrom-Json
$token = $data.token
Write-Host "Token: $token"
```

---

## 🔄 PASO 7: ACTUALIZAR EL PROYECTO

### 7.1. Deployment Automático con Git

Cada vez que hagas `git push` a la rama `main`, Vercel desplegará automáticamente:

```bash
git add .
git commit -m "Actualización de la API"
git push origin main
```

### 7.2. Deployment Manual

Desde la línea de comandos con Vercel CLI:

```powershell
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deployar
vercel --prod
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Module not found"

**Solución**: Verifica que todas las dependencias estén en `package.json` bajo `dependencies` (no `devDependencies`).

```bash
npm install --save sequelize pg pg-hstore
```

### Error: "Connection timeout"

**Solución**: Verifica las variables de entorno en Vercel. Asegúrate de que `DB_HOST`, `DB_USER`, `DB_PASSWORD` sean correctas.

### Error: "Table does not exist"

**Solución**: Ejecuta las migraciones manualmente:

```powershell
$env:DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
npx sequelize-cli db:migrate
```

### Error: "Serverless Function timeout"

**Solución**: Aumenta el `maxDuration` en `vercel.json`:

```json
{
  "functions": {
    "index.js": {
      "maxDuration": 30
    }
  }
}
```

**Nota**: Planes gratuitos tienen límite de 10 segundos.

---

## 📊 MONITOREO Y LOGS

### Ver Logs en Tiempo Real

1. Ve a tu proyecto en Vercel Dashboard
2. Click en **"Deployments"**
3. Click en el deployment actual
4. Ve a la pestaña **"Functions"** → **"Logs"**

### Ver Analytics

1. En tu proyecto, ve a **"Analytics"**
2. Revisa:
   - Requests por segundo
   - Errores 4xx y 5xx
   - Latencia de respuesta
   - Consumo de bandwidth

---

## 🔒 SEGURIDAD EN PRODUCCIÓN

### Recomendaciones

✅ **JWT_SECRET**: Usa un secreto fuerte (mínimo 32 caracteres)  
✅ **CORS**: Configura orígenes específicos en producción  
✅ **Rate Limiting**: Considera agregar rate limiting  
✅ **HTTPS**: Vercel incluye HTTPS automáticamente  
✅ **Environment Variables**: Nunca subas `.env` al repositorio  

### Configurar CORS para Frontend Específico

En `index.js`, cambia:

```javascript
// Desarrollo
app.use(cors());

// Producción
app.use(cors({
  origin: ['https://tu-frontend.vercel.app'],
  credentials: true
}));
```

---

## 📝 CHECKLIST FINAL

Antes de deployar, verifica:

- [ ] ✅ Todas las variables de entorno configuradas en Vercel
- [ ] ✅ Migraciones ejecutadas en la base de datos de producción
- [ ] ✅ `.vercelignore` creado para excluir archivos innecesarios
- [ ] ✅ `vercel.json` configurado correctamente
- [ ] ✅ `index.js` exporta `app` como default
- [ ] ✅ Repositorio en GitHub actualizado
- [ ] ✅ Credenciales de Neon válidas
- [ ] ✅ JWT_SECRET seguro configurado

---

## 🎯 PRÓXIMOS PASOS

Una vez deployado exitosamente:

1. **Configurar dominio personalizado** (opcional)
   - En Vercel Dashboard → Settings → Domains
   - Agrega tu dominio y configura DNS

2. **Conectar frontend**
   - Actualiza la BASE_URL en tu frontend
   - Usa: `https://tu-proyecto.vercel.app`

3. **Monitorear logs**
   - Revisa logs regularmente
   - Configura alertas en Vercel

4. **Documentar API pública**
   - Actualiza `API_DOCUMENTATION.md` con URL de producción
   - Considera usar Swagger/OpenAPI

---

## 📞 RECURSOS ÚTILES

- 📖 **Documentación Vercel**: https://vercel.com/docs
- 🐘 **Neon Docs**: https://neon.tech/docs
- 🔧 **Sequelize Docs**: https://sequelize.org/docs
- 💬 **Vercel Support**: https://vercel.com/support

---

## 🚀 COMANDO RÁPIDO DE DEPLOYMENT

```powershell
# 1. Asegurar que todo está commiteado
git status
git add .
git commit -m "Ready for Vercel deployment"
git push origin main

# 2. Ejecutar migraciones en producción
$env:DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
npx sequelize-cli db:migrate

# 3. Vercel desplegará automáticamente al detectar el push
# O usar Vercel CLI:
vercel --prod
```

---

**Última actualización**: 29 de Octubre 2025  
**Versión**: 1.0  
**Status**: ✅ Listo para deployment
