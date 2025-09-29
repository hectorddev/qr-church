# 👥 Gestión de Usuarios - Panel de Administración

## 🎯 Funcionalidades Disponibles

### ✅ Crear Nuevos Usuarios
- **Acceso**: Solo administradores
- **Ubicación**: `/admin/usuarios`
- **Campos requeridos**:
  - **Nombre**: Identificador único para el login (mínimo 2 caracteres)
  - **Versículo ID**: Contraseña del usuario (mínimo 3 caracteres)
  - **Rol**: `usuario` o `admin`

### 🗑️ Eliminar Usuarios
- **Acceso**: Solo administradores
- **Restricción**: No se puede eliminar al administrador principal (`admin`)
- **Confirmación**: Se requiere confirmación antes de eliminar

### 📋 Ver Lista de Usuarios
- **Información mostrada**:
  - Nombre del usuario
  - Rol (con iconos distintivos)
  - Versículo ID
  - Fecha de creación
  - Botón de eliminar (si aplica)

## 🔐 Credenciales de Ejemplo

### Administrador Principal
- **Nombre**: `admin`
- **Versículo ID**: `juan316`
- **Rol**: `admin`

### Usuarios de Prueba
- **Nombre**: `usuario1`
- **Versículo ID**: `mateo2819`
- **Rol**: `usuario`

- **Nombre**: `usuario2`
- **Versículo ID**: `salmo231`
- **Rol**: `usuario`

## 🚀 Cómo Usar

### 1. Acceder al Panel de Administración
1. Inicia sesión como administrador
2. Ve a `/admin/usuarios`
3. Haz clic en "➕ Nuevo Usuario"

### 2. Crear un Usuario
1. Completa el formulario:
   - **Nombre**: Usa un identificador único (ej: `maria_garcia`)
   - **Versículo ID**: Crea una contraseña (ej: `juan316`)
   - **Rol**: Selecciona `usuario` o `admin`
2. Haz clic en "✅ Crear Usuario"
3. El usuario aparecerá en la lista

### 3. Eliminar un Usuario
1. En la lista de usuarios, haz clic en el ícono 🗑️
2. Confirma la eliminación
3. El usuario será eliminado permanentemente

## ⚠️ Consideraciones Importantes

### Seguridad
- Solo los administradores pueden gestionar usuarios
- El administrador principal no puede ser eliminado
- Los nombres de usuario deben ser únicos

### Validaciones
- **Nombre**: Mínimo 2 caracteres, no puede estar vacío
- **Versículo ID**: Mínimo 3 caracteres, no puede estar vacío
- **Rol**: Debe ser `usuario` o `admin`

### Roles y Permisos
- **Administradores**:
  - ✅ Crear, editar y eliminar principios
  - ✅ Gestionar usuarios
  - ✅ Acceso completo al sistema
- **Usuarios**:
  - ✅ Ver principios del camino
  - ❌ No pueden editar contenido
  - ❌ No pueden gestionar usuarios

## 🎨 Interfaz de Usuario

### Diseño Moderno
- Gradientes y colores vibrantes
- Iconos emoji para mejor UX
- Animaciones suaves
- Responsive design

### Mensajes de Feedback
- ✅ Mensajes de éxito (verde)
- 🚨 Mensajes de error (rojo)
- 💡 Información de ayuda (azul)

### Estados de Carga
- Spinners animados
- Botones deshabilitados durante operaciones
- Feedback visual inmediato

## 🔧 API Endpoints

### GET `/api/auth/usuarios`
- **Descripción**: Obtener lista de usuarios
- **Autenticación**: Requerida (admin)
- **Respuesta**: Lista de usuarios

### POST `/api/auth/usuarios`
- **Descripción**: Crear nuevo usuario
- **Autenticación**: Requerida (admin)
- **Body**: `{ nombre, versiculo_id, rol }`
- **Respuesta**: Usuario creado

### DELETE `/api/auth/usuarios?id={id}`
- **Descripción**: Eliminar usuario
- **Autenticación**: Requerida (admin)
- **Parámetros**: `id` del usuario
- **Respuesta**: Confirmación de eliminación

## 🚀 Próximas Mejoras

- [ ] Edición de usuarios existentes
- [ ] Búsqueda y filtrado de usuarios
- [ ] Exportación de lista de usuarios
- [ ] Historial de cambios
- [ ] Notificaciones por email
- [ ] Roles personalizados
