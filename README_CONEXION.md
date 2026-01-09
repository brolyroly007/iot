# 🔗 Guía de Conexión: ESP32 ↔ Vercel ↔ Supabase

Esta guía explica cómo el ESP32 se comunica con la nube (Vercel y Supabase).

---

## 📊 Flujo de Datos

```
┌─────────────┐      WiFi/HTTP       ┌─────────────┐      SQL        ┌─────────────┐
│   ESP32     │ ──────────────────►  │   VERCEL    │ ──────────────► │  SUPABASE   │
│  (Arduino)  │    POST request      │  (Next.js)  │    Insert       │ (Database)  │
└─────────────┘                      └─────────────┘                 └─────────────┘
      │                                    │                              │
      │                                    │                              │
   Sensor                              Servidor                      Base de datos
   detecta                             procesa                       almacena
   caída                               alerta                        evento
```

---

## 🔑 ¿Dónde está la conexión?

### En el código del ESP32 (Arduino):

La URL del servidor se define al inicio del código:

```cpp
// Esta línea conecta al servidor de Vercel
const char* serverUrl = "https://iot-nu-nine.vercel.app/api/fall-detection";
```

Esta URL queda **grabada permanentemente** en el ESP32 cuando compilas y subes el código.

---

## 📤 Función que envía datos al servidor

```cpp
void enviarAlerta(float magnitud) {
  // 1. Verifica conexión WiFi
  if (WiFi.status() == WL_CONNECTED) {

    // 2. Crea cliente HTTP
    HTTPClient http;

    // 3. Se conecta a la URL de Vercel
    http.begin(serverUrl);  // <-- AQUÍ SE CONECTA
    http.addHeader("Content-Type", "application/json");

    // 4. Prepara los datos en formato JSON
    String json = "{\"evento\":\"caida\",\"magnitud\":" + String(magnitud) + ",\"dispositivo\":\"ESP32-CAM\"}";

    // 5. Envía los datos por POST
    int codigo = http.POST(json);  // <-- AQUÍ ENVÍA

    // 6. Verifica respuesta
    if (codigo > 0) {
      Serial.println("Alerta enviada OK");
    } else {
      Serial.println("Error enviando alerta");
    }

    // 7. Cierra conexión
    http.end();
  }
}
```

---

## 📥 Código en Vercel que recibe la alerta

Archivo: `/api/fall-detection/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  // 1. Recibe el JSON del ESP32
  const data = await request.json()
  // data = { evento: "caida", magnitud: 3.5, dispositivo: "ESP32-CAM" }

  // 2. Conecta a Supabase usando variables de entorno
  const supabase = createClient(
    process.env.SUPABASE_URL,      // URL de Supabase
    process.env.SUPABASE_ANON_KEY  // Clave de Supabase
  )

  // 3. Guarda en la base de datos
  const { data: event, error } = await supabase
    .from('events')
    .insert({
      tipo: data.evento,           // "caida"
      magnitud: data.magnitud,     // 3.5
      dispositivo: data.dispositivo // "ESP32-CAM"
    })
    .select()
    .single()

  // 4. Responde al ESP32
  return NextResponse.json({
    success: true,
    message: 'Alerta recibida',
    eventId: event.id
  })
}
```

---

## 📱 Dashboard que lee los eventos

Archivo: `/app/dashboard/page.tsx`

```typescript
// Cada 5 segundos, el dashboard consulta los eventos
const fetchEvents = async () => {
  // Llama a la API de Vercel
  const res = await fetch('/api/events')
  const data = await res.json()

  // Actualiza la lista de eventos
  setEvents(data.events)
}

useEffect(() => {
  fetchEvents()
  // Repetir cada 5 segundos
  const interval = setInterval(fetchEvents, 5000)
  return () => clearInterval(interval)
}, [])
```

---

## 🔄 Diagrama de secuencia completo

```
ARDUINO IDE          ESP32-CAM              VERCEL              SUPABASE           DASHBOARD
    │                    │                    │                    │                    │
    │  1. Compilar       │                    │                    │                    │
    │    código          │                    │                    │                    │
    │ ──────────────►    │                    │                    │                    │
    │   (URL grabada)    │                    │                    │                    │
    │                    │                    │                    │                    │
    │                    │  2. Conectar WiFi  │                    │                    │
    │                    │ ──────────────────►│                    │                    │
    │                    │                    │                    │                    │
    │                    │  3. Detecta caída  │                    │                    │
    │                    │       ⚠️            │                    │                    │
    │                    │                    │                    │                    │
    │                    │  4. HTTP POST      │                    │                    │
    │                    │ ──────────────────►│                    │                    │
    │                    │   {evento, mag}    │                    │                    │
    │                    │                    │                    │                    │
    │                    │                    │  5. INSERT         │                    │
    │                    │                    │ ──────────────────►│                    │
    │                    │                    │                    │                    │
    │                    │                    │  6. OK             │                    │
    │                    │                    │ ◄──────────────────│                    │
    │                    │                    │                    │                    │
    │                    │  7. Response OK    │                    │                    │
    │                    │ ◄──────────────────│                    │                    │
    │                    │                    │                    │                    │
    │                    │                    │                    │  8. GET /events    │
    │                    │                    │ ◄───────────────────────────────────────│
    │                    │                    │                    │                    │
    │                    │                    │  9. SELECT         │                    │
    │                    │                    │ ──────────────────►│                    │
    │                    │                    │                    │                    │
    │                    │                    │  10. Eventos       │                    │
    │                    │                    │ ◄──────────────────│                    │
    │                    │                    │                    │                    │
    │                    │                    │  11. JSON response │                    │
    │                    │                    │ ────────────────────────────────────────►
    │                    │                    │                    │                    │
    │                    │                    │                    │  12. Mostrar       │
    │                    │                    │                    │      eventos       │
    │                    │                    │                    │        📊          │
```

---

## 📋 Paso a paso detallado

| Paso | Momento | Componente | Acción |
|------|---------|------------|--------|
| 1 | Al compilar | Arduino IDE | Graba la URL de Vercel en el ESP32 |
| 2 | Al encender | ESP32 | Conecta a la red WiFi |
| 3 | Continuamente | ESP32 | Lee el sensor MPU6050 |
| 4 | Al detectar caída | ESP32 | Crea JSON con datos del evento |
| 5 | Al detectar caída | ESP32 | Envía HTTP POST a Vercel |
| 6 | Al recibir POST | Vercel | Parsea el JSON recibido |
| 7 | Al recibir POST | Vercel | Conecta a Supabase |
| 8 | Al recibir POST | Vercel | Inserta evento en tabla `events` |
| 9 | Al recibir POST | Vercel | Responde OK al ESP32 |
| 10 | Cada 5 segundos | Dashboard | Hace GET a `/api/events` |
| 11 | Al recibir GET | Vercel | Consulta eventos en Supabase |
| 12 | Al recibir GET | Vercel | Devuelve lista de eventos |
| 13 | Al recibir eventos | Dashboard | Actualiza la interfaz |

---

## 🔐 Conexiones y credenciales

### ESP32 → Vercel

| Configuración | Dónde se define | Valor |
|---------------|-----------------|-------|
| URL del servidor | Código Arduino (hardcoded) | `https://iot-nu-nine.vercel.app/api/fall-detection` |
| WiFi SSID | Código Arduino | Tu red WiFi |
| WiFi Password | Código Arduino | Tu contraseña |

### Vercel → Supabase

| Configuración | Dónde se define | Valor |
|---------------|-----------------|-------|
| SUPABASE_URL | Variables de entorno en Vercel | `https://xxxxx.supabase.co` |
| SUPABASE_ANON_KEY | Variables de entorno en Vercel | Clave anónima de Supabase |

---

## 📦 Formato del JSON

### ESP32 envía a Vercel:

```json
{
  "evento": "caida",
  "magnitud": 3.5,
  "dispositivo": "ESP32-CAM"
}
```

### Vercel guarda en Supabase:

```sql
INSERT INTO events (tipo, magnitud, dispositivo, fecha)
VALUES ('caida', 3.5, 'ESP32-CAM', NOW());
```

### Supabase almacena:

| id | tipo | magnitud | dispositivo | fecha |
|----|------|----------|-------------|-------|
| uuid-xxx | caida | 3.5 | ESP32-CAM | 2024-01-15 10:30:00 |

### Dashboard recibe:

```json
{
  "success": true,
  "events": [
    {
      "id": "uuid-xxx",
      "tipo": "caida",
      "magnitud": 3.5,
      "dispositivo": "ESP32-CAM",
      "fecha": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

---

## 🌐 URLs del sistema

| Componente | URL | Función |
|------------|-----|---------|
| Landing | https://iot-nu-nine.vercel.app | Página de inicio |
| Dashboard | https://iot-nu-nine.vercel.app/dashboard | Panel de monitoreo |
| API Alertas | https://iot-nu-nine.vercel.app/api/fall-detection | Recibe alertas del ESP32 |
| API Eventos | https://iot-nu-nine.vercel.app/api/events | Lista eventos |
| API Status | https://iot-nu-nine.vercel.app/api/status | Estado del dispositivo |
| Supabase | https://ujmnoyrtpfdeplliqgqd.supabase.co | Base de datos |

---

## 📝 Resumen

| Componente | Se conecta a | Método | Credenciales |
|------------|--------------|--------|--------------|
| ESP32 | Vercel | HTTP POST (WiFi) | URL hardcodeada en código |
| Vercel | Supabase | SDK JavaScript | Variables de entorno |
| Dashboard | Vercel API | fetch() | Ninguna (público) |

**La "magia" está en que la URL de Vercel está escrita directamente en el código del ESP32. Cuando el sensor detecta una caída, el ESP32 envía los datos a esa URL por internet usando WiFi.**

---

## 🔧 Librerías necesarias

### ESP32 (Arduino):
```cpp
#include <WiFi.h>        // Conexión WiFi
#include <HTTPClient.h>  // Peticiones HTTP
#include <Wire.h>        // Comunicación I2C con MPU6050
```

### Vercel (Next.js):
```typescript
import { createClient } from '@supabase/supabase-js'  // SDK de Supabase
```

---

<p align="center">
  <b>FallGuard</b> - Conexión IoT en la nube ☁️
</p>
