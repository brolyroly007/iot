-- =============================================
-- FALLGUARD - CONFIGURACIÓN DE BASE DE DATOS
-- Universidad Nacional del Altiplano - Puno
-- Curso: Internet de las Cosas
-- =============================================

-- 1. Tabla de dispositivos (sin autenticación)
CREATE TABLE IF NOT EXISTS dispositivos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL DEFAULT 'Mi Dispositivo',
  codigo TEXT UNIQUE NOT NULL,
  ubicacion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de eventos
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT DEFAULT 'caida',
  magnitud DECIMAL(5,2) DEFAULT 0,
  dispositivo TEXT,
  dispositivo_id UUID REFERENCES dispositivos(id),
  foto_url TEXT,
  atendido BOOLEAN DEFAULT false,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Agregar columnas si ya existe la tabla events
ALTER TABLE events ADD COLUMN IF NOT EXISTS dispositivo_id UUID;
ALTER TABLE events ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS atendido BOOLEAN DEFAULT false;

-- 4. Desactivar RLS para acceso simple
ALTER TABLE dispositivos DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- 5. Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_events_fecha ON events(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_dispositivos_codigo ON dispositivos(codigo);
