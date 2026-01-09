# Configuracion de Supabase para FallGuard

## 1. Ejecutar el Schema SQL

Ve a **Supabase Dashboard** > **SQL Editor** y ejecuta el contenido de `SUPABASE_SETUP.sql`

## 2. Crear Storage Bucket para Fotos

1. Ve a **Supabase Dashboard** > **Storage**
2. Click en **New bucket**
3. Nombre: `fotos-caidas`
4. Marca la opcion **Public bucket**
5. Click **Create bucket**

### Configurar politicas del bucket:

Despues de crear el bucket, ve a **Policies** y agrega estas politicas:

**Politica de INSERT (subir fotos):**
```sql
CREATE POLICY "Permitir subir fotos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'fotos-caidas');
```

**Politica de SELECT (ver fotos):**
```sql
CREATE POLICY "Permitir ver fotos" ON storage.objects
FOR SELECT USING (bucket_id = 'fotos-caidas');
```

O simplemente ejecuta esto en SQL Editor:

```sql
-- Permitir acceso publico al bucket fotos-caidas
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos-caidas', 'fotos-caidas', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Politica para subir
CREATE POLICY "allow_upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'fotos-caidas');

-- Politica para ver
CREATE POLICY "allow_read" ON storage.objects
FOR SELECT USING (bucket_id = 'fotos-caidas');
```

## 3. Verificar Variables de Entorno en Vercel

Asegurate de tener estas variables en **Vercel** > **Settings** > **Environment Variables**:

- `SUPABASE_URL` - URL de tu proyecto Supabase
- `SUPABASE_ANON_KEY` - Anon key de Supabase

## 4. Obtener Codigo de Dispositivo

1. Inicia sesion en el dashboard: https://tu-app.vercel.app/login
2. Ve a la pestana **Dispositivos**
3. Click en **Agregar Dispositivo**
4. Copia el codigo generado (ej: `FG-ABC123`)
5. Usa este codigo en el archivo Arduino:
   ```cpp
   const char* codigoDispositivo = "FG-ABC123";
   ```

## 5. Probar el Sistema

Puedes probar enviando una alerta manual con curl:

```bash
curl -X POST https://tu-app.vercel.app/api/fall-detection \
  -H "Content-Type: application/json" \
  -d '{"evento":"caida","magnitud":3.5,"codigo":"FG-ABC123"}'
```

## Estructura de la Base de Datos

```
profiles (usuarios)
  - id (UUID, FK a auth.users)
  - nombre
  - telefono
  - created_at

dispositivos
  - id (UUID)
  - user_id (FK a profiles)
  - nombre
  - codigo (unico, ej: FG-ABC123)
  - ubicacion
  - activo
  - created_at

events (alertas)
  - id (UUID)
  - tipo (caida, prueba, etc)
  - magnitud
  - dispositivo
  - dispositivo_id (FK a dispositivos)
  - foto_url
  - created_at

contactos
  - id (UUID)
  - user_id
  - nombre
  - telefono
  - email
  - es_emergencia
```
