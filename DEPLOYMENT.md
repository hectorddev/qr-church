# 🚀 Guía de Despliegue en Vercel

## 📋 Configuración Inicial

### 1. Variables de Entorno en Vercel

Ve a tu proyecto en Vercel Dashboard → Settings → Environment Variables y agrega:

#### Variables Requeridas:
```
NODE_ENV=production
APP_NAME=Pámpanos - Principios del Camino
APP_URL=https://tu-dominio.vercel.app
```

#### Variables de Autenticación:
```
JWT_SECRET=tu-jwt-secret-super-seguro-para-produccion
NEXTAUTH_SECRET=tu-nextauth-secret-para-produccion
NEXTAUTH_URL=https://tu-dominio.vercel.app
```

#### Variables de Base de Datos (Opcional):
```
DATABASE_URL=tu-url-de-base-de-datos
```

### 2. Configuración de Base de Datos

#### Opción A: Base de Datos en Memoria (Actual)
- ✅ **Ventaja**: Funciona inmediatamente sin configuración
- ⚠️ **Limitación**: Los datos se pierden al reiniciar el servidor
- 🎯 **Recomendado para**: Pruebas iniciales y demos

#### Opción B: Base de Datos Externa (Recomendado para Producción)

**PlanetScale (MySQL):**
```bash
# Instalar cliente
npm install @planetscale/database

# Variable de entorno
DATABASE_URL="mysql://usuario:password@host/database?sslaccept=strict"
```

**Neon (PostgreSQL):**
```bash
# Instalar cliente
npm install @neondatabase/serverless

# Variable de entorno
DATABASE_URL="postgresql://usuario:password@host/database"
```

**Supabase (PostgreSQL):**
```bash
# Instalar cliente
npm install @supabase/supabase-js

# Variables de entorno
DATABASE_URL="postgresql://usuario:password@host/database"
SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_ANON_KEY="tu-anon-key"
```

## 🔧 Pasos para Desplegar

### 1. Preparar el Repositorio
```bash
# Asegúrate de que todos los cambios estén committeados
git add .
git commit -m "Preparar para despliegue en producción"
git push origin main
```

### 2. Conectar con Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Selecciona el proyecto `qr_church`
4. Vercel detectará automáticamente que es un proyecto Next.js

### 3. Configurar Variables de Entorno
1. En el dashboard de Vercel, ve a Settings → Environment Variables
2. Agrega todas las variables listadas arriba
3. Asegúrate de marcar "Production" para cada variable

### 4. Desplegar
```bash
# Vercel se despliega automáticamente con cada push
git push origin main
```

## 🗄️ Migración a Base de Datos Externa

### Para PlanetScale:

1. **Crear cuenta y proyecto en PlanetScale**
2. **Instalar dependencias:**
```bash
npm install @planetscale/database
```

3. **Crear archivo de migración:**
```typescript
// src/lib/planetscale.ts
import { connect } from '@planetscale/database';

const config = {
  url: process.env.DATABASE_URL,
};

export const conn = connect(config);

// Crear tabla
export async function createTables() {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS puntos (
      id VARCHAR(255) PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT,
      x DECIMAL(5,2) NOT NULL,
      y DECIMAL(5,2) NOT NULL,
      emoji VARCHAR(10) NOT NULL,
      pointerName VARCHAR(255) NOT NULL,
      referencias TEXT,
      año TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}
```

### Para Neon (PostgreSQL):

1. **Crear cuenta y proyecto en Neon**
2. **Instalar dependencias:**
```bash
npm install @neondatabase/serverless
```

3. **Crear archivo de migración:**
```typescript
// src/lib/neon.ts
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function createTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS puntos (
      id VARCHAR(255) PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT,
      x DECIMAL(5,2) NOT NULL,
      y DECIMAL(5,2) NOT NULL,
      emoji VARCHAR(10) NOT NULL,
      pointerName VARCHAR(255) NOT NULL,
      referencias TEXT,
      año TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}
```

## 🔐 Seguridad en Producción

### Variables de Entorno Seguras:
- ✅ Usa secretos largos y aleatorios para JWT_SECRET
- ✅ Nunca commitees archivos .env.local
- ✅ Usa diferentes secretos para desarrollo y producción
- ✅ Rota los secretos periódicamente

### Headers de Seguridad:
El archivo `vercel.json` ya incluye headers de seguridad básicos.

## 📊 Monitoreo

### Vercel Analytics:
1. Habilita Vercel Analytics en tu proyecto
2. Monitorea el rendimiento y errores
3. Revisa los logs en tiempo real

### Logs de Aplicación:
```typescript
// En tu código, usa console.log para debugging
console.log('Punto creado:', nuevoPunto);
```

## 🚨 Solución de Problemas

### Error: "Module not found"
- Verifica que todas las dependencias estén en package.json
- Ejecuta `npm install` localmente para verificar

### Error: "Environment variable not found"
- Verifica que las variables estén configuradas en Vercel
- Asegúrate de que estén marcadas para "Production"

### Error: "Database connection failed"
- Verifica la URL de la base de datos
- Asegúrate de que la base de datos esté accesible desde Vercel

## 📝 Checklist Pre-Despliegue

- [ ] Variables de entorno configuradas
- [ ] Base de datos configurada (si aplica)
- [ ] Tests pasando localmente
- [ ] Build exitoso (`npm run build`)
- [ ] Archivos sensibles en .gitignore
- [ ] Documentación actualizada

## 🎯 Próximos Pasos

1. **Despliegue inicial** con base de datos en memoria
2. **Pruebas de funcionalidad** en producción
3. **Migración a base de datos externa** cuando sea necesario
4. **Configuración de dominio personalizado**
5. **Implementación de analytics y monitoreo**
