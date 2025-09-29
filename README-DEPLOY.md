# 🚀 Pámpanos - Principios del Camino

## 📋 Resumen del Proyecto

Aplicación web para explorar principios bíblicos de manera interactiva a través de un mapa. Los usuarios pueden navegar por diferentes principios, leer versículos relevantes y aplicar estos conceptos en su vida diaria.

## 🎯 Características Principales

- **Mapa Interactivo**: Explora principios bíblicos en un mapa visual
- **Sistema de Autenticación**: Login con nombre y versículo ID
- **Roles de Usuario**: Admin y usuario normal
- **Gestión de Principios**: Los admins pueden crear y editar principios
- **Gestión de Usuarios**: Los admins pueden crear nuevos usuarios
- **Diseño Responsivo**: Optimizado para móvil y desktop

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilos**: Tailwind CSS v4
- **Base de Datos**: In-memory (desarrollo) / Externa (producción)
- **Despliegue**: Vercel
- **Autenticación**: JWT personalizado

## 🚀 Despliegue Rápido en Vercel

### 1. Preparación
```bash
# Clonar el repositorio
git clone [tu-repositorio]
cd qr_church

# Instalar dependencias
npm install

# Verificar que todo esté listo
npm run deploy-check
```

### 2. Configurar en Vercel

1. **Conectar Repositorio**:
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu repositorio de GitHub
   - Selecciona el proyecto `qr_church`

2. **Variables de Entorno**:
   ```
   NODE_ENV=production
   APP_NAME=Pámpanos - Principios del Camino
   APP_URL=https://tu-dominio.vercel.app
   JWT_SECRET=tu-jwt-secret-super-seguro
   NEXTAUTH_SECRET=tu-nextauth-secret
   NEXTAUTH_URL=https://tu-dominio.vercel.app
   ```

3. **Desplegar**:
   ```bash
   git push origin main
   ```

### 3. Verificación Post-Despliegue

1. **Probar Login**:
   - Usuario: `admin`
   - Contraseña: `juan316`

2. **Probar Funcionalidades**:
   - Navegar por el mapa
   - Ver principios
   - Crear nuevos usuarios (como admin)
   - Editar principios (como admin)

## 📊 Estructura del Proyecto

```
qr_church/
├── src/
│   ├── app/                 # Páginas de Next.js
│   │   ├── admin/          # Panel de administración
│   │   ├── api/            # API routes
│   │   ├── login/          # Página de login
│   │   └── mapa/           # Página principal del mapa
│   ├── components/         # Componentes React
│   │   ├── layout/         # Componentes de layout
│   │   └── mapa/           # Componentes del mapa
│   ├── contexts/           # Context de React
│   └── lib/                # Utilidades y configuración
├── public/                 # Archivos estáticos
├── scripts/                # Scripts de utilidad
└── vercel.json            # Configuración de Vercel
```

## 🔐 Usuarios por Defecto

### Administrador
- **Usuario**: `admin`
- **Contraseña**: `juan316`
- **Permisos**: Crear/editar principios, gestionar usuarios

### Usuarios de Prueba
- **Usuario**: `usuario1`
- **Contraseña**: `mateo2819`
- **Permisos**: Solo ver principios

- **Usuario**: `usuario2`
- **Contraseña**: `salmo231`
- **Permisos**: Solo ver principios

## 🗄️ Base de Datos

### Desarrollo (Actual)
- **Tipo**: In-memory
- **Ventaja**: Funciona inmediatamente
- **Limitación**: Datos se pierden al reiniciar

### Producción (Recomendado)
- **Opciones**: PlanetScale, Neon, Supabase
- **Ventaja**: Persistencia de datos
- **Configuración**: Ver `DEPLOYMENT.md`

## 📱 Funcionalidades por Rol

### 👤 Usuario Normal
- Ver mapa de principios
- Explorar principios bíblicos
- Leer versículos y aplicaciones prácticas
- Navegar por la interfaz

### 👑 Administrador
- Todas las funciones de usuario
- Crear y editar principios
- Gestionar usuarios
- Acceso al panel de administración

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Verificación pre-despliegue
npm run pre-deploy

# Verificación completa
npm run deploy-check

# Linting
npm run lint
```

## 🚨 Solución de Problemas

### Error de Build
```bash
# Limpiar cache
rm -rf .next node_modules
npm install
npm run build
```

### Error de Variables de Entorno
- Verificar que estén configuradas en Vercel
- Asegurar que estén marcadas para "Production"

### Error de Base de Datos
- Verificar conexión
- Revisar logs en Vercel Dashboard

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs en Vercel Dashboard
2. Verificar variables de entorno
3. Consultar `DEPLOYMENT.md` para detalles técnicos

## 🎉 ¡Listo para Producción!

Tu aplicación está configurada para desplegarse automáticamente en Vercel. Solo necesitas:

1. ✅ Configurar variables de entorno
2. ✅ Hacer push al repositorio
3. ✅ ¡Disfrutar tu aplicación en producción!

---

**Desarrollado con ❤️ para la Iglesia**
