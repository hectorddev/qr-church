# 🆓 Configuración de Supabase - 100% GRATUITO

## 🎯 ¿Por qué Supabase?

Supabase es la mejor opción gratuita para tu aplicación:

- ✅ **100% GRATUITO** para proyectos pequeños
- ✅ **500MB** de almacenamiento gratuito
- ✅ **50,000 consultas/mes** gratuitas
- ✅ **PostgreSQL** (base de datos profesional)
- ✅ **Interfaz web** para gestionar datos
- ✅ **Backup automático**
- ✅ **API REST** automática
- ✅ **Autenticación** incluida (si la necesitas después)

## 🚀 Configuración en 5 Minutos

### 1. Crear Cuenta en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Crea una cuenta con GitHub (recomendado)
4. Verifica tu email

### 2. Crear Proyecto

1. Haz clic en "New Project"
2. **Organización**: Crea una nueva o usa la personal
3. **Nombre del proyecto**: `pampanos` (o el que prefieras)
4. **Contraseña de la base de datos**: Crea una segura (guárdala)
5. **Región**: Elige la más cercana a tus usuarios
6. Haz clic en "Create new project"

### 3. Obtener Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** → **API**
2. Copia estos valores:
   - **Project URL**: `https://tu-proyecto.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4. Configurar en Vercel

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. **Settings** → **Environment Variables**
3. Agrega estas variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Marca **"Production"** para ambas
5. Haz clic en **"Save"**

### 5. Desplegar

```bash
git add .
git commit -m "Configurar Supabase gratuito"
git push origin main
```

### 6. Inicializar Base de Datos

Una vez desplegado, haz una petición POST a:
```
https://tu-dominio.vercel.app/api/init-supabase
```

O usa curl:
```bash
curl -X POST https://tu-dominio.vercel.app/api/init-supabase
```

## 🗄️ Crear Tablas en Supabase

### Opción A: Automática (Recomendada)
La API `/api/init-supabase` creará las tablas automáticamente.

### Opción B: Manual
Si prefieres crear las tablas manualmente:

1. Ve a tu proyecto en Supabase
2. **Table Editor** → **New Table**
3. Crea la tabla `puntos`:

```sql
CREATE TABLE puntos (
  id VARCHAR(255) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  x DECIMAL(5,2) NOT NULL,
  y DECIMAL(5,2) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  pointerName VARCHAR(255) NOT NULL,
  referencias TEXT,
  año TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

4. Crea la tabla `usuarios`:

```sql
CREATE TABLE usuarios (
  id VARCHAR(255) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  versiculo_id VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'usuario',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Verificación

### 1. Verificar Estado
```bash
curl https://tu-dominio.vercel.app/api/init-supabase
```

### 2. Probar la Aplicación
1. Ve a tu aplicación
2. Inicia sesión con `admin` / `juan316`
3. Verifica que los principios se cargan
4. Crea un nuevo principio
5. Verifica que se guarda

### 3. Verificar en Supabase
1. Ve a tu proyecto en Supabase
2. **Table Editor** → **puntos**
3. Deberías ver los principios creados

## 📊 Límites Gratuitos

### Plan Gratuito de Supabase:
- ✅ **500MB** de almacenamiento
- ✅ **50,000 consultas/mes**
- ✅ **2GB** de transferencia/mes
- ✅ **Hasta 2 proyectos**
- ✅ **Backup automático**

### Para tu aplicación:
- ✅ **Más que suficiente** para empezar
- ✅ **Escalable** cuando crezcas
- ✅ **Sin costos ocultos**

## 🚨 Solución de Problemas

### Error: "Variables no configuradas"
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` esté configurada
- Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` esté configurada
- Asegúrate de que estén marcadas para "Production"

### Error: "Connection failed"
- Verifica que la URL de Supabase sea correcta
- Verifica que la clave anon sea correcta
- Asegúrate de que el proyecto esté activo

### Error: "Table doesn't exist"
- Ejecuta la inicialización: `POST /api/init-supabase`
- O crea las tablas manualmente en Supabase

### Error: "Permission denied"
- Verifica que la clave anon tenga permisos
- Revisa las políticas de RLS en Supabase

## 📈 Monitoreo

### En Supabase Dashboard:
- **Table Editor**: Ver y editar datos
- **SQL Editor**: Ejecutar consultas
- **Logs**: Ver actividad de la base de datos
- **Settings**: Configurar políticas de seguridad

### En Vercel:
- **Functions**: Ver logs de API
- **Analytics**: Métricas de rendimiento
- **Environment Variables**: Verificar configuración

## 🎉 ¡Listo!

Una vez configurado, tu aplicación:

- ✅ **Persistirá datos** entre reinicios
- ✅ **Escalará automáticamente** con el tráfico
- ✅ **Tendrá backups automáticos** en Supabase
- ✅ **Funcionará en producción** sin problemas
- ✅ **Será completamente gratuita** para empezar

## 🔄 Migración de Datos

Si ya tienes datos en la base de datos en memoria:

1. **Configura Supabase** siguiendo esta guía
2. **Inicializa** con `POST /api/init-supabase`
3. **Los datos de ejemplo** se crearán automáticamente
4. **Los datos existentes** se migrarán automáticamente

## 📞 Soporte

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Logs de Vercel**: Dashboard → Functions → Logs

---

**¡Tu aplicación ahora tiene una base de datos profesional y completamente gratuita!** 🚀
