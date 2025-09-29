# 🚀 Configuración de PlanetScale - Guía Rápida

## 📋 ¿Qué es PlanetScale?

PlanetScale es una base de datos MySQL serverless que es perfecta para aplicaciones Next.js en Vercel. Ofrece:

- ✅ **Serverless**: No necesitas gestionar servidores
- ✅ **Escalable**: Se adapta automáticamente a tu tráfico
- ✅ **Gratuito**: Plan gratuito generoso
- ✅ **Compatible**: Funciona perfectamente con Vercel

## 🎯 Pasos para Configurar

### 1. Crear Cuenta en PlanetScale

1. Ve a [planetscale.com](https://planetscale.com)
2. Crea una cuenta gratuita
3. Verifica tu email

### 2. Crear Proyecto

1. Haz clic en "Create new project"
2. Nombre: `pampanos` (o el que prefieras)
3. Región: Elige la más cercana a tus usuarios
4. Haz clic en "Create project"

### 3. Crear Base de Datos

1. En tu proyecto, haz clic en "Create database"
2. Nombre: `pampanos` (o el que prefieras)
3. Haz clic en "Create database"

### 4. Generar Contraseña

1. Ve a "Passwords" en tu base de datos
2. Haz clic en "Generate new password"
3. Nombre: `vercel-production`
4. Copia la contraseña generada

### 5. Obtener URL de Conexión

1. Ve a "Connect" en tu base de datos
2. Selecciona "Node.js"
3. Copia la URL de conexión
4. Se ve así: `mysql://abc123:def456@aws.connect.psdb.cloud/pampanos?sslaccept=strict`

### 6. Configurar en Vercel

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Settings → Environment Variables
3. Agrega:
   ```
   DATABASE_URL=mysql://abc123:def456@aws.connect.psdb.cloud/pampanos?sslaccept=strict
   ```
4. Marca "Production"
5. Haz clic en "Save"

### 7. Desplegar

```bash
git add .
git commit -m "Configurar PlanetScale"
git push origin main
```

### 8. Inicializar Base de Datos

Una vez desplegado, haz una petición POST a:
```
https://tu-dominio.vercel.app/api/init-planetscale
```

O usa curl:
```bash
curl -X POST https://tu-dominio.vercel.app/api/init-planetscale
```

## 🔧 Verificación

### Verificar que PlanetScale está funcionando:

1. **Verificar estado:**
   ```bash
   curl https://tu-dominio.vercel.app/api/init-planetscale
   ```

2. **Probar la aplicación:**
   - Ve a tu aplicación
   - Inicia sesión con `admin` / `juan316`
   - Verifica que los principios se cargan
   - Crea un nuevo principio
   - Verifica que se guarda

### En PlanetScale Dashboard:

1. Ve a tu base de datos
2. Haz clic en "Console"
3. Ejecuta: `SELECT * FROM puntos;`
4. Deberías ver los principios creados

## 🚨 Solución de Problemas

### Error: "DATABASE_URL not configured"
- Verifica que la variable esté configurada en Vercel
- Asegúrate de que esté marcada para "Production"

### Error: "Connection failed"
- Verifica que la URL de PlanetScale sea correcta
- Asegúrate de que la contraseña sea la correcta
- Verifica que la base de datos esté activa

### Error: "Table doesn't exist"
- Ejecuta la inicialización: `POST /api/init-planetscale`
- Verifica que no haya errores en los logs de Vercel

### Error: "SSL connection failed"
- Asegúrate de que la URL incluya `?sslaccept=strict`
- Verifica que PlanetScale esté configurado correctamente

## 📊 Monitoreo

### En PlanetScale:
- Ve a "Insights" para ver métricas
- Revisa "Queries" para ver consultas
- Monitorea "Connections" para conexiones activas

### En Vercel:
- Ve a "Functions" para ver logs de API
- Revisa "Analytics" para métricas de rendimiento
- Monitorea errores en tiempo real

## 🎉 ¡Listo!

Una vez configurado, tu aplicación:

- ✅ **Persistirá datos** entre reinicios
- ✅ **Escalará automáticamente** con el tráfico
- ✅ **Tendrá backups automáticos** en PlanetScale
- ✅ **Funcionará en producción** sin problemas

## 🔄 Migración de Datos

Si ya tienes datos en la base de datos en memoria:

1. **Exporta datos** (si es necesario)
2. **Configura PlanetScale** siguiendo esta guía
3. **Inicializa** con `POST /api/init-planetscale`
4. **Los datos de ejemplo** se crearán automáticamente

## 📞 Soporte

- **PlanetScale Docs**: [planetscale.com/docs](https://planetscale.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Logs de Vercel**: Dashboard → Functions → Logs

---

**¡Tu aplicación ahora tiene una base de datos profesional y escalable!** 🚀
