-- =============================================
-- FALLGUARD - CONFIGURACIÓN DE BASE DE DATOS
-- Universidad Nacional del Altiplano - Puno
-- Curso: Internet de las Cosas
-- =============================================

-- 1. Tabla de perfiles de usuario (se crea automáticamente con auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  nombre TEXT,
  telefono TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de dispositivos
CREATE TABLE IF NOT EXISTS dispositivos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT 'Mi Dispositivo',
  codigo TEXT UNIQUE NOT NULL,
  ubicacion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Actualizar tabla events para incluir dispositivo_id y foto
ALTER TABLE events ADD COLUMN IF NOT EXISTS dispositivo_id UUID REFERENCES dispositivos(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS atendido BOOLEAN DEFAULT false;

-- 4. Tabla de contactos de emergencia
CREATE TABLE IF NOT EXISTS contactos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  es_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear bucket para fotos (ejecutar en Storage de Supabase)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('fotos-caidas', 'fotos-caidas', true);

-- 6. Políticas de seguridad (RLS)

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispositivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para dispositivos
CREATE POLICY "Users can view own devices" ON dispositivos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices" ON dispositivos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices" ON dispositivos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices" ON dispositivos
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para contactos
CREATE POLICY "Users can manage own contacts" ON contactos
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para events (permitir insert desde ESP32 sin auth)
DROP POLICY IF EXISTS "Allow all inserts" ON events;
DROP POLICY IF EXISTS "Allow all reads" ON events;

CREATE POLICY "Anyone can insert events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view events from their devices" ON events
  FOR SELECT USING (
    dispositivo_id IN (
      SELECT id FROM dispositivos WHERE user_id = auth.uid()
    )
    OR auth.uid() IS NULL
  );

-- 7. Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_events_dispositivo ON events(dispositivo_id);
CREATE INDEX IF NOT EXISTS idx_events_fecha ON events(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_dispositivos_user ON dispositivos(user_id);
CREATE INDEX IF NOT EXISTS idx_dispositivos_codigo ON dispositivos(codigo);
