-- =============================================
-- FALLGUARD - CONFIGURACIÓN DE BASE DE DATOS
-- Universidad Nacional del Altiplano - Puno
-- Curso: Internet de las Cosas
-- =============================================

-- 1. Tabla de usuarios (simple, sin Supabase Auth)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nombre TEXT DEFAULT 'Usuario',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de dispositivos
CREATE TABLE IF NOT EXISTS dispositivos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT 'Mi Dispositivo',
  codigo TEXT UNIQUE NOT NULL,
  ubicacion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de eventos (si no existe)
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

-- 4. Agregar columnas si ya existe la tabla events
ALTER TABLE events ADD COLUMN IF NOT EXISTS dispositivo_id UUID REFERENCES dispositivos(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS atendido BOOLEAN DEFAULT false;

-- 5. Desactivar RLS para acceso simple
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE dispositivos DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- 6. Crear usuario admin por defecto
-- Password: admin123 (hash SHA256)
INSERT INTO usuarios (email, password, nombre)
VALUES (
  'admin@fallguard.com',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  'Administrador'
) ON CONFLICT (email) DO NOTHING;

-- 7. Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_events_dispositivo ON events(dispositivo_id);
CREATE INDEX IF NOT EXISTS idx_events_fecha ON events(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_dispositivos_user ON dispositivos(user_id);
CREATE INDEX IF NOT EXISTS idx_dispositivos_codigo ON dispositivos(codigo);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
