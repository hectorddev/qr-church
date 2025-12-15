# 🔧 Guía de Solución de Problemas de MongoDB

## ❌ Error: "Server selection timed out" o "ECONNRESET"

Este error significa que tu aplicación no puede alcanzar el servidor de MongoDB Atlas.

### ✅ Soluciones paso a paso:

#### 1. Verificar Whitelist de IPs en MongoDB Atlas

1. Ve a [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
2. Selecciona tu proyecto
3. Ve a **Network Access** (en el menú lateral)
4. Haz clic en **Add IP Address**
5. Tienes dos opciones:
   - **Opción A (Desarrollo)**: Añade `0.0.0.0/0` para permitir todas las IPs
   - **Opción B (Producción)**: Añade tu IP específica
6. Espera 1-2 minutos para que los cambios se apliquen

#### 2. Verificar que el Cluster esté Activo

1. Ve a **Clusters** en MongoDB Atlas
2. Verifica que tu cluster **NO** esté pausado
3. Si está pausado, haz clic en **Resume** para reactivarlo

#### 3. Verificar la URI de Conexión

Tu URI debe tener este formato:
```
mongodb+srv://hectordmv21_db_user:javascript@pampanos01.fj0fsa4.mongodb.net/?appName=Pampanos01
```

**Importante:**
- Reemplaza `<db_password>` con tu contraseña real
- Si tu contraseña tiene caracteres especiales, codifícalos en URL:
  - `@` → `%40`
  - `#` → `%23`
  - `%` → `%25`
  - Espacio → `%20`
  - `:` → `%3A`
  - `/` → `%2F`

#### 4. Configurar el archivo .env.local

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
MONGODB_URI=mongodb+srv://hectordmv21_db_user:javascript@pampanos01.fj0fsa4.mongodb.net/?appName=Pampanos01
MONGODB_DB_NAME=pampanos
```

**Nota:** El archivo `.env.local` está en `.gitignore` y no se sube al repositorio.

#### 5. Probar la Conexión

Ejecuta el script de prueba:
```bash
node test-mongodb-connection.js
```

Este script verificará:
- ✅ Resolución DNS
- ✅ Conexión al servidor
- ✅ Autenticación
- ✅ Acceso a la base de datos

#### 6. Verificar Firewall/Antivirus

- Algunos firewalls o antivirus pueden bloquear conexiones salientes
- Intenta desactivar temporalmente el firewall para probar
- Si funciona, añade una excepción para Node.js

#### 7. Verificar Red/Internet

- Prueba desde otra red (móvil, otra WiFi)
- Verifica que puedas acceder a otros servicios en internet
- Intenta usar un VPN si estás en una red corporativa

## ❌ Error: "Authentication failed"

Este error significa que las credenciales son incorrectas.

### ✅ Soluciones:

1. **Verifica la contraseña:**
   - Ve a MongoDB Atlas → Database Access
   - Verifica que la contraseña sea correcta
   - Si no la recuerdas, puedes resetearla

2. **Verifica el usuario:**
   - Asegúrate de que el usuario `hectordmv21_db_user` exista
   - Verifica que tenga permisos de lectura/escritura

3. **Codifica caracteres especiales:**
   - Si la contraseña tiene caracteres especiales, codifícalos en URL

## 🔍 Verificar Configuración Actual

Puedes verificar tu configuración ejecutando:

```bash
# Verificar que la variable esté configurada
node -e "console.log(process.env.MONGODB_URI ? '✅ Configurada' : '❌ No configurada')"
```

O en tu código Next.js, puedes crear una ruta de prueba:

```typescript
// app/api/test-mongodb/route.ts
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const collections = await db.listCollections().toArray();
    return Response.json({ 
      success: true, 
      collections: collections.map(c => c.name) 
    });
  } catch (error: any) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

Luego visita: `http://localhost:3000/api/test-mongodb`

## 📞 Contacto

Si después de seguir estos pasos el problema persiste:
1. Verifica los logs en MongoDB Atlas → Monitoring
2. Revisa los logs de tu aplicación
3. Contacta al soporte de MongoDB Atlas si es necesario

