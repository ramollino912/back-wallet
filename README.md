# 🏦 Wallet TIC - Backend API

## 🎯 Estado del Proyecto

✅ **Todas las rutas funcionando: 100%**
- 🏠 **Desarrollo**: http://localhost:3000
- 🚀 **Producción**: https://back-wallet-20.vercel.app

## 📊 Test Results

| Ambiente | Rutas Testeadas | Exitosas | Tasa de Éxito |
|----------|----------------|----------|---------------|
| **Desarrollo** | 17 | 17 | 100% ✅ |
| **Producción (Vercel)** | 15 | 15 | 100% ✅ |

---

## � Quick Start

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/ramollino912/back-wallet.git
cd back-wallet

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones
npm run db:migrate

# Iniciar servidor de desarrollo
npm run dev
```

El servidor estará corriendo en `http://localhost:3000`

---

## 🔧 Stack Tecnológico

- **Runtime**: Node.js 22.14.0
- **Framework**: Express.js 4.20.0
- **ORM**: Sequelize 6.37.1
- **Base de Datos**: PostgreSQL (Neon)
- **Autenticación**: JWT (jsonwebtoken)
- **Deployment**: Vercel Serverless Functions

---

## 📋 Rutas Principales

### 🔐 Autenticación
- `POST /auth/registro` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `POST /auth/google` - Login con Google

### 👤 Usuario
- `GET /profile` 🔒 - Perfil del usuario
- `GET /saldo` 🔒 - Saldo actual
- `POST /saldo/recargar` 🔒 - Recargar saldo

### 💰 Transacciones
- `GET /transacciones` 🔒 - Historial de transacciones
- `GET /gastos/categoria` 🔒 - Gastos por categoría
- `POST /transferir` 🔒 - Transferir dinero

### 🔌 Servicios
- `GET /servicios/proveedores` - Listar proveedores
- `GET /servicios` 🔒 - Mis servicios
- `POST /servicios` 🔒 - Crear servicio
- `POST /servicios/:id/pagar` 🔒 - Pagar servicio

### 🚌 Transporte
- `GET /transporte/empresas` 🔒 - Empresas de transporte
- `GET /transporte/tarjetas` 🔒 - Mis tarjetas
- `POST /transporte/tarjetas` 🔒 - Registrar tarjeta
- `POST /transporte/tarjetas/:id/recargar` 🔒 - Recargar tarjeta

### 💳 Wallet
- `GET /wallet/estado` 🔒 - Estado del wallet

🔒 = Requiere autenticación (Bearer Token)

**Ver documentación completa**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## � Variables de Entorno

### Desarrollo (.env)
```env
# Base de Datos
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=wallet
DB_PORT=5432

# JWT
JWT_SECRET=tu_secreto_super_seguro

# Entorno
NODE_ENV=development
```

### Producción (Vercel)
```env
# Base de Datos (Neon PostgreSQL)
DB_HOST=ep-white-dust-a4ao0h56.us-east-1.aws.neon.tech
DB_USER=default
DB_PASSWORD=tu_password
DB_NAME=wallet
DB_PORT=5432
DATABASE_URL=postgresql://user:pass@host:5432/wallet?sslmode=require

# JWT
JWT_SECRET=tu_secreto_super_seguro_en_produccion

# Entorno
NODE_ENV=production
```

---

## 🧪 Testing

### Test en Desarrollo
```bash
# PowerShell
.\test-local-routes.ps1

# Manual
npm run dev
# En otra terminal:
curl http://localhost:3000/health
```

### Test en Producción
```bash
# PowerShell
.\test-production.ps1

# Manual
curl https://back-wallet-20.vercel.app/health
```

---

## 🗄️ Migraciones de Base de Datos

### Crear nueva migración
```bash
npx sequelize-cli migration:generate --name nombre-migracion
```

### Ejecutar migraciones
```bash
# Desarrollo
npm run db:migrate

# Producción
DATABASE_URL="tu_url_de_produccion" npx sequelize-cli db:migrate
```

### Migraciones Aplicadas
1. ✅ `20251029000001-create-usuarios.cjs`
2. ✅ `20251029000002-create-transacciones.cjs`
3. ✅ `20251029000003-create-servicios-tarjetas-categorias.cjs`
4. ⏭️ `20251029000004-cleanup-servicios.cjs` (deshabilitada)
5. ✅ `20251029000005-create-views.cjs`

---

## 🚀 Deploy a Vercel

### 1. Configurar Proyecto en Vercel

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Deploy
vercel
```

O conecta tu repositorio de GitHub directamente en [vercel.com](https://vercel.com)

### 2. Configurar Variables de Entorno

En el dashboard de Vercel, ve a **Settings → Environment Variables** y agrega:

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV`

### 3. Ejecutar Migraciones en Producción

```bash
DATABASE_URL="postgresql://user:pass@host:5432/wallet?sslmode=require" \
npx sequelize-cli db:migrate
```

### 4. Verificar Deployment

```bash
curl https://tu-proyecto.vercel.app/health
```

---

## 📁 Estructura del Proyecto

```
back-wallet/
├── config/
│   └── database.js          # Configuración de Sequelize
├── controllers/
│   ├── Categoria.js         # Lógica de categorías
│   ├── Registro.js          # Registro de usuarios
│   ├── Servicios.js         # Gestión de servicios
│   ├── Transferencia.js     # Transferencias entre usuarios
│   ├── Transporte.js        # Tarjetas de transporte
│   ├── Usuario.js           # Autenticación y perfil
│   └── wallet.js            # Estado del wallet
├── middlewares/
│   └── Usuario.middleware.js # Verificación de JWT
├── migrations/              # Migraciones de Sequelize
├── models/                  # Modelos de Sequelize
│   ├── Categoria.js
│   ├── Servicio.js
│   ├── TarjetaTransporte.js
│   ├── Transaccion.js
│   └── Usuario.js
├── test-local-routes.ps1    # Tests para desarrollo
├── test-production.ps1      # Tests para producción
├── index.js                 # Punto de entrada
├── vercel.json              # Configuración de Vercel
├── package.json
└── README.md
```

---

## 🐛 Troubleshooting

### Error: "Please install pg package manually"
**Solución**: El paquete `pg` debe estar en `dependencies`, no en `devDependencies`

```bash
npm install --save pg
```

### Error: "No hay token"
**Solución**: Incluir header de autenticación:
```
Authorization: Bearer tu_token_jwt
```

### Error 500 en /transacciones
**Solución**: Verificar que las relaciones en los modelos estén definidas correctamente

### Migraciones no se aplican
**Solución**: Verificar que `DATABASE_URL` esté configurado correctamente

---

## 📚 Documentación Adicional

- [📖 Documentación Completa de la API](./API_DOCUMENTATION.md)
- [🚀 Guía de Deployment en Vercel](./DEPLOYMENT_VERCEL.md)
- [📝 Variables de Entorno](./VERCEL_ENV_VARIABLES.md)

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Changelog

### v1.0.0 - 2025-10-29
- ✅ Migración completa a Sequelize
- ✅ 100% de rutas funcionando en desarrollo y producción
- ✅ Deployment exitoso en Vercel
- ✅ Documentación completa de la API
- ✅ Scripts de testing automatizados
- ✅ Sistema de autenticación JWT
- ✅ Gestión de wallet, servicios y transporte

---

## 📞 Contacto

- **Repositorio**: https://github.com/ramollino912/back-wallet
- **Producción**: https://back-wallet-20.vercel.app
- **Desarrollo**: http://localhost:3000

---

## 📄 Licencia

ISC

---

**Estado**: ✅ Producción Estable (100% funcional)  
**Última actualización**: 29 de Octubre, 2025
