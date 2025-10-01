-- Script SQL para crear la tabla usuarios en Supabase
-- Ejecuta este script en Supabase Dashboard → SQL Editor

-- Crear tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id VARCHAR(255) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  versiculo_id VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario')),
  puntuacion INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_nombre ON usuarios(nombre);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_created_at ON usuarios(created_at);

-- Crear tabla retos (si no existe)
CREATE TABLE IF NOT EXISTS retos (
  id VARCHAR(255) PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para retos
CREATE INDEX IF NOT EXISTS idx_retos_activo ON retos(activo);
CREATE INDEX IF NOT EXISTS idx_retos_fecha_inicio ON retos(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_retos_created_at ON retos(created_at);

-- Insertar usuarios de ejemplo (solo si la tabla está vacía)
INSERT INTO usuarios (id, nombre, versiculo_id, rol, puntuacion)
SELECT * FROM (VALUES
  ('user_admin', 'admin', 'juan316', 'admin', 0),
  ('user_1', 'usuario1', 'mateo2819', 'usuario', 150),
  ('user_2', 'usuario2', 'salmo231', 'usuario', 200)
) AS v(id, nombre, versiculo_id, rol, puntuacion)
WHERE NOT EXISTS (SELECT 1 FROM usuarios LIMIT 1);

-- Insertar retos de ejemplo (solo si la tabla está vacía)
INSERT INTO retos (id, titulo, descripcion, fecha_inicio, fecha_fin, activo)
SELECT * FROM (VALUES
  ('reto_1', 'Lectura Diaria de la Biblia', 'Lee al menos un capítulo de la Biblia cada día durante esta semana', NOW(), NOW() + INTERVAL '7 days', true),
  ('reto_2', 'Oración Matutina', 'Dedica 15 minutos cada mañana a la oración personal', NOW(), NOW() + INTERVAL '7 days', true)
) AS v(id, titulo, descripcion, fecha_inicio, fecha_fin, activo)
WHERE NOT EXISTS (SELECT 1 FROM retos LIMIT 1);