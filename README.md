# 🛡️ FallGuard - Sistema IoT de Detección de Caídas

Sistema de monitoreo en tiempo real para detectar caídas en adultos mayores usando ESP32-CAM y sensores de movimiento.

![FallGuard Dashboard](https://img.shields.io/badge/Status-Active-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![ESP32](https://img.shields.io/badge/ESP32-CAM-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Tabla de Contenidos

- [Demo](#-demo)
- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Hardware Requerido](#-hardware-requerido)
- [Instalación](#-instalación)
- [Configuración del ESP32](#-configuración-del-esp32)
- [Conexiones de Hardware](#-conexiones-de-hardware)
- [Despliegue](#-despliegue)
- [API Reference](#-api-reference)
- [Algoritmo de Detección](#-algoritmo-de-detección)

---

## 🌐 Demo

- **Dashboard:** [https://iot-nu-nine.vercel.app/dashboard](https://iot-nu-nine.vercel.app/dashboard)
- **Landing:** [https://iot-nu-nine.vercel.app](https://iot-nu-nine.vercel.app)

---

## ✨ Características

### Hardware
- ✅ Detección de caídas mediante acelerómetro MPU6050
- ✅ Alarma sonora local con buzzer
- ✅ Conectividad WiFi
- ✅ Bajo consumo energético

### Software
- ✅ Dashboard en tiempo real con tema oscuro
- ✅ Estadísticas de eventos (caídas, pruebas, hoy, total)
- ✅ Banner de emergencia al detectar caída
- ✅ Sonido de alerta en navegador
- ✅ Historial de eventos con tiempo relativo
- ✅ Indicador de estado del dispositivo
- ✅ Actualización automática cada 5 segundos

---

## 🏗️ Arquitectura

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   ESP32-CAM     │  WiFi   │     Vercel      │  HTTPS  │    Dashboard    │
│   + MPU6050     │────────►│   (Next.js)     │◄────────│   (React)       │
│   + Buzzer      │         │   + Supabase    │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
     Sensor                    Servidor                    Usuario
```

### Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Microcontrolador | ESP32-CAM |
| Sensor | MPU6050 (Acelerómetro/Giroscopio) |
| Backend | Next.js 14 (API Routes) |
| Base de datos | Supabase (PostgreSQL) |
| Frontend | React + Tailwind CSS |
| Hosting | Vercel |

---

## 🔧 Hardware Requerido

| Componente | Cantidad | Precio Aprox. |
|------------|----------|---------------|
| ESP32-CAM + Base USB | 1 | S/25-35 |
| MPU6050 | 1 | S/8-15 |
| Buzzer activo 5V | 1 | S/2-5 |
| Protoboard | 1 | S/8-12 |
| Cables Dupont | 10 | S/5-8 |
| Fuente 5V USB | 1 | S/15-25 |

**Total estimado: S/60-95**

---

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/brolyroly007/iot.git
cd iot
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env.local`:

```env
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 4. Configurar Supabase

Ejecutar en SQL Editor de Supabase:

```sql
-- Crear tabla de eventos
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL,
  magnitud DECIMAL NOT NULL,
  dispositivo TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deshabilitar RLS para desarrollo
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## 🔌 Configuración del ESP32

### 1. Instalar Arduino IDE

Descargar desde [arduino.cc](https://www.arduino.cc/en/software)

### 2. Agregar soporte ESP32

1. **Archivo → Preferencias**
2. En "URLs adicionales de gestor de placas":
```
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
```
3. **Herramientas → Placa → Gestor de placas**
4. Buscar "ESP32" e instalar (versión 2.0.14)

### 3. Configurar el código

Editar las credenciales WiFi en el archivo `.ino`:

```cpp
const char* ssid = "TU_WIFI";
const char* password = "TU_PASSWORD";
const char* serverUrl = "https://tu-app.vercel.app/api/fall-detection";
```

### 4. Subir el código

1. Seleccionar placa: **AI Thinker ESP32-CAM**
2. Seleccionar puerto COM correcto
3. Mantener botón BOOT/IO0 presionado
4. Click en **Subir**
5. Soltar botón cuando empiece a subir

---

## 🔗 Conexiones de Hardware

### Diagrama de Conexiones

```
ESP32-CAM          MPU6050          BUZZER         FUENTE 5V
─────────          ───────          ──────         ─────────
   5V ◄────────────────────────────────────────────── (+)
   GND ◄───────────► GND ◄──────────► (-) ◄───────── (-)
   3.3V ───────────► VCC
   GPIO14 ─────────► SDA
   GPIO15 ─────────► SCL
   GPIO12 ─────────────────────────► (+)
```

### Tabla de Conexiones

| ESP32-CAM | MPU6050 | Buzzer | Fuente |
|-----------|---------|--------|--------|
| 5V | - | - | (+) |
| GND | GND | (-) | (-) |
| 3.3V | VCC | - | - |
| GPIO14 | SDA | - | - |
| GPIO15 | SCL | - | - |
| GPIO12 | - | (+) | - |

### Pinout ESP32-CAM

```
        ┌───────────────┐
   5V ──┤●             ●├── 3.3V → MPU VCC
  GND ──┤●             ●├── GPIO16
   12 ──┤● → BUZZER    ●├── GPIO0
   13 ──┤●             ●├── GND
   15 ──┤● → MPU SCL   ●├── VCC
   14 ──┤● → MPU SDA   ●├── U0R
    2 ──┤●             ●├── U0T
    4 ──┤●             ●├── GND → MPU GND
        └───────────────┘
```

---

## 🚀 Despliegue

### Desplegar en Vercel

1. Fork este repositorio
2. Ir a [vercel.com](https://vercel.com)
3. Importar proyecto desde GitHub
4. Configurar variables de entorno:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
5. Deploy

### Configurar Supabase

1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Ir a SQL Editor y crear la tabla `events`
4. Copiar URL y anon key desde Settings → API

---

## 📡 API Reference

### POST /api/fall-detection

Recibe alertas del ESP32 cuando detecta una caída.

**Request:**
```json
{
  "evento": "caida",
  "magnitud": 3.5,
  "dispositivo": "ESP32-CAM"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Alerta recibida",
  "eventId": "uuid"
}
```

### GET /api/events

Obtiene el historial de eventos.

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": "uuid",
      "tipo": "caida",
      "magnitud": 3.5,
      "dispositivo": "ESP32-CAM",
      "fecha": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

### POST /api/status

Actualiza el estado del dispositivo.

### GET /api/status

Consulta si el dispositivo está en línea.

---

## 🧮 Algoritmo de Detección

### Principio de Funcionamiento

El algoritmo detecta dos fases características de una caída:

1. **Caída Libre (< 0.5G):** Cuando la persona cae, experimenta ingravidez momentánea.
2. **Impacto (> 2.5G):** Al golpear el suelo, se produce un pico de aceleración.

### Fórmula de Magnitud

```
magnitud = √(ax² + ay² + az²)
```

### Parámetros

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| UMBRAL_CAIDA_LIBRE | 0.5G | Detecta ingravidez |
| UMBRAL_IMPACTO | 2.5G | Detecta golpe |
| TIEMPO_CAIDA_MAX | 1000ms | Ventana de tiempo |

---

## 📁 Estructura del Proyecto

```
detector-caidas/
├── app/
│   ├── api/
│   │   ├── events/route.ts
│   │   ├── fall-detection/route.ts
│   │   └── status/route.ts
│   ├── dashboard/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── esp32-codigo/
│   └── detector_caidas.ino
├── .env.local
├── package.json
└── README.md
```

---

## 🔮 Mejoras Futuras

- [ ] Notificaciones WhatsApp (Twilio)
- [ ] Notificaciones Email (Resend)
- [ ] Aplicación móvil
- [ ] GPS para ubicación
- [ ] Machine Learning para reducir falsos positivos

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

<p align="center">
  <b>FallGuard</b> - Tecnología al servicio del cuidado de nuestros adultos mayores 🛡️
</p>
