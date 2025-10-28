# 🔧 CONFIGURAR VERCEL - SOLUCIONAR ERROR 500

## 🚨 **PROBLEMA ACTUAL**
Vercel está devolviendo error 500 porque las variables de entorno no están configuradas.

## ✅ **SOLUCIÓN PASO A PASO**

### **PASO 1: Ir a Vercel Dashboard**
1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta
3. Ve a tu proyecto `db-projecto`

### **PASO 2: Configurar Variables de Entorno**
1. En tu proyecto, ve a **Settings**
2. Haz clic en **Environment Variables**
3. Agrega estas variables **UNA POR UNA**:

#### **Variable 1:**
- **Name**: `DB_HOST`
- **Value**: `ep-white-dust-a4ao0h56-pooler.us-east-1.aws.neon.tech`
- **Environment**: `Production`, `Preview`, `Development`
- Haz clic en **Save**

#### **Variable 2:**
- **Name**: `DB_USER`
- **Value**: `default`
- **Environment**: `Production`, `Preview`, `Development`
- Haz clic en **Save**

#### **Variable 3:**
- **Name**: `DB_PASSWORD`
- **Value**: `1U0hcQmxMuTz`
- **Environment**: `Production`, `Preview`, `Development`
- Haz clic en **Save**

#### **Variable 4:**
- **Name**: `DB_NAME`
- **Value**: `verceldb`
- **Environment**: `Production`, `Preview`, `Development`
- Haz clic en **Save**

#### **Variable 5:**
- **Name**: `DB_PORT`
- **Value**: `5432`
- **Environment**: `Production`, `Preview`, `Development`
- Haz clic en **Save**

#### **Variable 6:**
- **Name**: `JWT_SECRET`
- **Value**: `tu_super_secreto_jwt_muy_seguro_aqui_2024`
- **Environment**: `Production`, `Preview`, `Development`
- Haz clic en **Save**

#### **Variable 7:**
- **Name**: `GOOGLE_CLIENT_ID`
- **Value**: `tu_google_client_id_aqui`
- **Environment**: `Production`, `Preview`, `Development`
- Haz clic en **Save**

#### **Variable 8:**
- **Name**: `PORT`
- **Value**: `3000`
- **Environment**: `Production`, `Preview`, `Development`
- Haz clic en **Save**

### **PASO 3: Redeploy**
1. Ve a **Deployments**
2. Haz clic en **Redeploy** en el último deployment
3. Espera a que termine el deploy

### **PASO 4: Verificar**
1. Una vez terminado el deploy, ve a tu URL de Vercel
2. Agrega `/env-check` al final de la URL
3. Deberías ver un JSON con el estado de las variables

## 🔍 **VERIFICACIÓN**

### **URLs para probar:**
- `https://tu-proyecto.vercel.app/` - Debería mostrar "Wallet TIC server is working"
- `https://tu-proyecto.vercel.app/env-check` - Debería mostrar el estado de las variables

### **Respuesta esperada en /env-check:**
```json
{
  "status": "OK",
  "message": "Todas las variables están configuradas",
  "variables": {
    "DB_HOST": true,
    "DB_USER": true,
    "DB_PASSWORD": true,
    "DB_NAME": true,
    "DB_PORT": true,
    "JWT_SECRET": true,
    "GOOGLE_CLIENT_ID": true,
    "PORT": true
  },
  "missing": []
}
```

## 🆘 **SI SIGUE EL ERROR 500**

### **Verificar logs:**
1. Ve a **Deployments**
2. Haz clic en el último deployment
3. Ve a **Functions**
4. Haz clic en **View Function Logs**
5. Busca errores específicos

### **Errores comunes:**
- **"Variables de entorno faltantes"** → Configurar las variables
- **"Connection timeout"** → Verificar credenciales de base de datos
- **"Database not found"** → Verificar que la base de datos esté activa en Neon

## 📞 **CONTACTO**

Si después de seguir estos pasos sigue el error:
1. Comparte los logs de Vercel
2. Comparte la respuesta de `/env-check`
3. Verifica que la base de datos en Neon esté activa

## 🎯 **RESULTADO ESPERADO**

Una vez configuradas las variables:
- ✅ **Error 500 desaparecerá**
- ✅ **Storage dashboard funcionará**
- ✅ **Todas las APIs funcionarán**
- ✅ **El proyecto estará completamente operativo** 