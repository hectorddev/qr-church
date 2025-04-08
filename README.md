# Calendario de Actividades de la Iglesia

Este proyecto es una aplicación web que muestra un versículo bíblico y un calendario de actividades para la iglesia.

## Requisitos

- Node.js >= 14.x
- NPM >= 6.x

## Instalación

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd qr_church
```

2. Instala las dependencias:

```bash
npm install
npm install mongoose
```

## Configuración

El proyecto utiliza MongoDB Atlas como base de datos. La cadena de conexión ya está configurada en el archivo `src/lib/db.js`.

## Ejecución

Para ejecutar el proyecto en modo desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Funcionalidades

- **Página principal:** Muestra un versículo bíblico (Juan 3:16) con animaciones.
- **Calendario:** Permite ver, agregar, editar y eliminar actividades en un calendario visual.

## Estructura de la base de datos

El proyecto utiliza MongoDB para almacenar los eventos del calendario con la siguiente estructura:

```javascript
{
  title: String,      // Título del evento
  description: String, // Descripción (opcional)
  date: String,       // Fecha en formato YYYY-MM-DD
  createdAt: Date     // Fecha de creación del evento
}
```

## Tecnologías utilizadas

- Next.js
- React
- MongoDB & Mongoose
- Tailwind CSS
