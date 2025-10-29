# Wallet API - Backend

## 🚀 Deployment Status

Este proyecto está configurado y listo para deployment en **Vercel**.

### 📦 Archivos de Configuración

- ✅ `.vercelignore` - Excluye archivos innecesarios
- ✅ `vercel.json` - Configuración de rutas y funciones serverless
- ✅ `index.js` - Exporta la app para serverless
- ✅ `DEPLOYMENT_VERCEL.md` - Guía completa de deployment

### 🌐 URL de Producción

**Pendiente**: Configurar tras el primer deployment

### 🔧 Variables de Entorno Requeridas

```
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=5432
JWT_SECRET=
NODE_ENV=production
```

### 📚 Documentación

- [API Documentation](./API_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT_VERCEL.md)
- [Changes & Tests](./CAMBIOS_Y_TESTS.md)
- [Final Summary](./RESUMEN_FINAL.md)

### ⚡ Quick Start (Local)

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones
npm run db:migrate

# Iniciar servidor
npm run dev
```

### 🚀 Deploy to Vercel

Ver guía completa en [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md)

```bash
# 1. Push al repositorio
git push origin main

# 2. Configurar variables en Vercel Dashboard
# 3. Ejecutar migraciones en producción
# 4. Vercel desplegará automáticamente
```

---

**Versión**: 6.0.0  
**Framework**: Express.js + Sequelize  
**Database**: PostgreSQL (Neon)  
**Testing**: 95.2% success rate (20/21 tests)
