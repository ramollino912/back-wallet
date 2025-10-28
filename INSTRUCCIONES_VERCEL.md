# 🔧 INSTRUCCIONES PARA SOLUCIONAR PROBLEMAS DE VERCEL

## 📋 **PROBLEMAS IDENTIFICADOS**

1. **Error 500 en el servidor de Vercel**
2. **Error "Error loading dashboard" en Storage**
3. **Problemas de autenticación con GitHub**

## 🚀 **SOLUCIONES PASO A PASO**

### **PASO 1: CREAR TOKEN DE GITHUB**

1. Ve a [GitHub.com](https://github.com) e inicia sesión
2. Haz clic en tu foto de perfil (arriba a la derecha)
3. Ve a **Settings**
4. En el menú lateral, ve a **Developer settings**
5. Haz clic en **Personal access tokens**
6. Haz clic en **Tokens (classic)**
7. Haz clic en **Generate new token**
8. Selecciona **Generate new token (classic)**
9. Dale un nombre: `db-projecto-token`
10. Selecciona los permisos: `repo` (todos los permisos de repo)
11. Haz clic en **Generate token**
12. **Copia el token** (solo lo verás una vez)

### **PASO 2: CONFIGURAR GIT CON EL TOKEN**

Una vez que tengas el token, ejecuta estos comandos:

```bash
# Reemplaza [TU_TOKEN] con el token que copiaste
git remote set-url origin https://[TU_TOKEN]@github.com/UriZaltzman/db-projecto.git

# Hacer push de los cambios
git push
```

### **PASO 3: CONFIGURAR VARIABLES DE ENTORNO EN VERCEL**

1. Ve a [Vercel.com](https://vercel.com) e inicia sesión
2. Ve a tu proyecto `db-projecto`
3. Ve a **Settings** → **Environment Variables**
4. Agrega estas variables:

| Variable | Valor |
|----------|-------|
| `DB_HOST` | `ep-white-dust-a4ao0h56-pooler.us-east-1.aws.neon.tech` |
| `DB_USER` | `default` |
| `DB_PASSWORD` | `1U0hcQmxMuTz` |
| `DB_NAME` | `verceldb` |
| `DB_PORT` | `5432` |
| `JWT_SECRET` | `tu_super_secreto_jwt_muy_seguro_aqui_2024` |
| `GOOGLE_CLIENT_ID` | `tu_google_client_id_aqui` |
| `PORT` | `3000` |

5. Haz clic en **Save**

### **PASO 4: VERIFICAR BASE DE DATOS**

1. Ve a [Neon.tech](https://neon.tech) e inicia sesión
2. Verifica que tu base de datos `verceldb` esté activa
3. Si no está activa, actívala

### **PASO 5: REDEPLOY EN VERCEL**

1. En Vercel, ve a **Deployments**
2. Haz clic en **Redeploy** en el último deployment
3. Espera a que termine el deploy

## ✅ **VERIFICACIÓN**

Una vez completados todos los pasos:

1. **El servidor de Vercel** debería responder sin error 500
2. **El Storage dashboard** debería cargar correctamente
3. **Las APIs** deberían funcionar correctamente

## 🆘 **SI SIGUEN LOS PROBLEMAS**

Si después de estos pasos siguen los problemas:

1. **Verifica los logs** en Vercel (Deployments → Latest → Functions → View Function Logs)
2. **Verifica la conexión** a la base de datos
3. **Verifica las variables de entorno** están correctas

## 📞 **CONTACTO**

Si necesitas más ayuda, proporciona:
- Los logs de error de Vercel
- El estado de la base de datos en Neon
- Cualquier mensaje de error específico 