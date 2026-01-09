# FallGuard - Sistema de Detección de Caídas para Adultos Mayores

## 1. INTRODUCCIÓN

### 1.1 Problemática
Las caídas representan una de las principales causas de lesiones graves y mortalidad en adultos mayores. Según la OMS, aproximadamente el 30% de las personas mayores de 65 años sufren al menos una caída al año. La detección tardía de estos eventos puede agravar significativamente las consecuencias para la salud del paciente.

### 1.2 Solución Propuesta
**FallGuard** es un sistema IoT (Internet de las Cosas) que detecta caídas en tiempo real mediante sensores de movimiento y envía alertas inmediatas a familiares o cuidadores a través de una plataforma web.

### 1.3 Objetivos
- Detectar caídas de forma automática y precisa
- Enviar alertas inmediatas al detectar una caída
- Proporcionar un dashboard de monitoreo en tiempo real
- Mantener un historial de eventos para seguimiento médico
- Activar alarma sonora local para alertar al entorno

---

## 2. ARQUITECTURA DEL SISTEMA

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   DISPOSITIVO   │     │    SERVIDOR     │     │    USUARIO      │
│      IoT        │────►│     CLOUD       │◄────│      WEB        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
   ESP32-CAM              Vercel + Supabase        Dashboard
   MPU6050                 API REST                Navegador
   Buzzer                  Base de datos           Móvil/PC
```

### 2.1 Capas del Sistema

| Capa | Tecnología | Función |
|------|------------|---------|
| Hardware | ESP32-CAM, MPU6050, Buzzer | Detección y alarma local |
| Comunicación | WiFi, HTTPS | Transmisión segura de datos |
| Backend | Next.js API Routes | Procesamiento de alertas |
| Base de datos | Supabase (PostgreSQL) | Almacenamiento de eventos |
| Frontend | React + Tailwind CSS | Visualización y monitoreo |
| Hosting | Vercel | Despliegue en la nube |

---

## 3. COMPONENTES DE HARDWARE

### 3.1 ESP32-CAM
- **Función:** Microcontrolador principal con WiFi integrado
- **Especificaciones:**
  - Procesador: Dual-core 240MHz
  - WiFi: 802.11 b/g/n
  - RAM: 520KB SRAM
  - Voltaje: 5V
- **Costo aproximado:** S/25-35

### 3.2 MPU6050
- **Función:** Sensor de movimiento (acelerómetro + giroscopio)
- **Especificaciones:**
  - Acelerómetro: ±2g, ±4g, ±8g, ±16g
  - Giroscopio: ±250, ±500, ±1000, ±2000 °/s
  - Comunicación: I2C
  - Voltaje: 3.3V
- **Costo aproximado:** S/8-15

### 3.3 Buzzer Activo
- **Función:** Alarma sonora local
- **Especificaciones:**
  - Voltaje: 3.3V-5V
  - Frecuencia: 2300Hz
- **Costo aproximado:** S/2-5

### 3.4 Protoboard y Cables
- **Función:** Conexión de componentes
- **Costo aproximado:** S/10-15

### 3.5 Fuente de Alimentación 5V
- **Función:** Energía para el sistema
- **Opciones:** Adaptador USB, Power bank
- **Costo aproximado:** S/15-25

### Costo Total Estimado: S/60-95

---

## 4. ALGORITMO DE DETECCIÓN DE CAÍDAS

### 4.1 Principio de Funcionamiento
El algoritmo se basa en detectar dos fases características de una caída:

1. **Fase de Caída Libre:** Cuando una persona cae, experimenta brevemente una aceleración cercana a 0G (ingravidez).

2. **Fase de Impacto:** Al golpear el suelo, se produce un pico de aceleración superior a 2.5G.

### 4.2 Diagrama de Flujo

```
          ┌─────────────────┐
          │  Leer sensores  │
          └────────┬────────┘
                   ▼
          ┌─────────────────┐
          │ Calcular        │
          │ magnitud = √(x²+y²+z²)
          └────────┬────────┘
                   ▼
          ┌─────────────────┐
          │ magnitud < 0.5G │───No───┐
          │ (caída libre?)  │        │
          └────────┬────────┘        │
                   │ Sí              │
                   ▼                 │
          ┌─────────────────┐        │
          │ Esperar impacto │        │
          │ (máx 1 segundo) │        │
          └────────┬────────┘        │
                   ▼                 │
          ┌─────────────────┐        │
          │ magnitud > 2.5G │───No───┤
          │ (impacto?)      │        │
          └────────┬────────┘        │
                   │ Sí              │
                   ▼                 │
          ┌─────────────────┐        │
          │ ¡CAÍDA DETECTADA! │       │
          │ - Activar buzzer │       │
          │ - Enviar alerta  │       │
          └────────┬────────┘        │
                   │                 │
                   └────────┬────────┘
                            ▼
                   ┌─────────────────┐
                   │    Repetir      │
                   └─────────────────┘
```

### 4.3 Parámetros del Algoritmo

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| UMBRAL_CAIDA_LIBRE | 0.5G | Detecta ingravidez |
| UMBRAL_IMPACTO | 2.5G | Detecta golpe |
| TIEMPO_CAIDA_MAX | 1000ms | Ventana de detección |
| INTERVALO_ALERTA | 5000ms | Evita alertas repetidas |

---

## 5. SOFTWARE Y TECNOLOGÍAS

### 5.1 Firmware ESP32 (Arduino/C++)

```cpp
// Bibliotecas utilizadas
#include <WiFi.h>          // Conectividad WiFi
#include <HTTPClient.h>    // Peticiones HTTP
#include <Wire.h>          // Comunicación I2C con MPU6050
```

**Funciones principales:**
- `leerMPU()` - Lee datos del acelerómetro
- `detectarCaida()` - Algoritmo de detección
- `enviarAlerta()` - Envía POST al servidor
- `activarAlarma()` - Activa buzzer con patrón de emergencia

### 5.2 Backend (Next.js + Supabase)

**API Endpoints:**

| Método | Endpoint | Función |
|--------|----------|---------|
| POST | `/api/fall-detection` | Recibe alertas del ESP32 |
| GET | `/api/events` | Lista historial de eventos |
| POST | `/api/status` | Actualiza estado del dispositivo |
| GET | `/api/status` | Consulta estado del dispositivo |

**Estructura de datos (evento):**

```json
{
  "id": "uuid",
  "tipo": "caida" | "test",
  "magnitud": 3.5,
  "dispositivo": "ESP32-CAM",
  "fecha": "2024-01-15T10:30:00Z"
}
```

### 5.3 Frontend (React + Tailwind CSS)

**Características del Dashboard:**
- Tema oscuro profesional
- Estadísticas en tiempo real (caídas, pruebas, eventos hoy)
- Banner de emergencia animado al detectar caída
- Notificación sonora en el navegador
- Historial de eventos con tiempo relativo
- Indicador de conexión del dispositivo
- Actualización automática cada 5 segundos
- Diseño responsive (móvil y escritorio)

---

## 6. DIAGRAMA DE CONEXIONES

```
                FUENTE 5V
                (+)  (-)
                 │    │
    ─────────────┴────┴─────────────
    RIEL (+) ══════════════════════
    RIEL (-) ══════════════════════
    ────────────────────────────────
                 │    │
         ┌───────┴────┴───────┐
         │     ESP32-CAM      │
         │                    │
         │  5V ◄── Riel(+)    │
         │  GND ◄── Riel(-)   │
         │                    │
         │  3.3V ────► MPU6050 VCC
         │  GND ─────► MPU6050 GND
         │  GPIO14 ──► MPU6050 SDA
         │  GPIO15 ──► MPU6050 SCL
         │                    │
         │  GPIO12 ──► BUZZER (+)
         │  GND ─────► BUZZER (-)
         │                    │
         └────────────────────┘
```

---

## 7. FLUJO DE OPERACIÓN

### 7.1 Secuencia de Inicio
1. ESP32-CAM se enciende
2. Inicializa comunicación I2C con MPU6050
3. Conecta a la red WiFi
4. Calibra el sensor (100 muestras)
5. Emite sonido de confirmación
6. Inicia monitoreo continuo

### 7.2 Secuencia de Detección de Caída
1. Sensor detecta magnitud < 0.5G (caída libre)
2. Inicia contador de tiempo
3. Sensor detecta magnitud > 2.5G (impacto)
4. Confirma caída si ocurre en < 1 segundo
5. Activa buzzer con patrón de emergencia
6. Envía alerta HTTP POST al servidor
7. Servidor guarda evento en Supabase
8. Dashboard muestra banner de emergencia
9. Navegador reproduce sonido de alerta

### 7.3 Monitoreo Continuo
- Lectura de sensores: cada 50ms
- Envío de status al servidor: cada 30 segundos
- Actualización del dashboard: cada 5 segundos

---

## 8. INTERFAZ DE USUARIO

### 8.1 Página de Inicio
- Logo y nombre del sistema
- Descripción del proyecto
- Botón de acceso al dashboard
- Indicador de estado del sistema

### 8.2 Dashboard
```
┌────────────────────────────────────────────┐
│  FallGuard          [🔊] [● En línea]      │
├────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐ │
│  │Caídas  │ │Pruebas │ │  Hoy   │ │Total │ │
│  │   2    │ │   5    │ │   3    │ │  7   │ │
│  └────────┘ └────────┘ └────────┘ └──────┘ │
├────────────────────────────────────────────┤
│  [🟢] Dispositivo conectado                │
│       ESP32-CAM + MPU6050                  │
│                      [Enviar alerta prueba]│
├────────────────────────────────────────────┤
│  Historial de eventos                      │
│  ─────────────────────────────────────     │
│  ⚠️ Caída detectada    3.2G    Hace 5 min  │
│  ⚡ Alerta de prueba   3.5G    Hace 1h     │
│  ⚠️ Caída detectada    2.8G    Hace 2h     │
└────────────────────────────────────────────┘
```

---

## 9. URLS DEL PROYECTO

| Recurso | URL |
|---------|-----|
| Dashboard | https://iot-nu-nine.vercel.app/dashboard |
| Página inicio | https://iot-nu-nine.vercel.app |
| API Eventos | https://iot-nu-nine.vercel.app/api/events |
| API Status | https://iot-nu-nine.vercel.app/api/status |
| Repositorio | https://github.com/brolyroly007/iot |

---

## 10. VENTAJAS DEL SISTEMA

| Ventaja | Descripción |
|---------|-------------|
| **Bajo costo** | Hardware económico (~S/70) |
| **No invasivo** | Dispositivo pequeño y portátil |
| **Tiempo real** | Alertas instantáneas |
| **Acceso remoto** | Dashboard desde cualquier lugar |
| **Historial** | Registro de todos los eventos |
| **Escalable** | Fácil agregar más dispositivos |
| **Open source** | Código disponible para mejoras |

---

## 11. LIMITACIONES Y MEJORAS FUTURAS

### 11.1 Limitaciones Actuales
- Requiere conexión WiFi constante
- Sensor debe estar fijo al cuerpo del usuario
- Posibles falsos positivos con movimientos bruscos

### 11.2 Mejoras Futuras
- [ ] Notificaciones WhatsApp/SMS
- [ ] Notificaciones por Email
- [ ] App móvil nativa
- [ ] GPS para ubicación
- [ ] Batería recargable integrada
- [ ] Machine Learning para reducir falsos positivos
- [ ] Múltiples dispositivos por cuenta
- [ ] Integración con servicios de emergencia

---

## 12. CONCLUSIONES

FallGuard demuestra cómo la tecnología IoT puede aplicarse para mejorar la calidad de vida y seguridad de los adultos mayores. Con componentes económicos y software de código abierto, se logra un sistema funcional de detección de caídas que:

1. **Detecta caídas** mediante análisis de aceleración en tiempo real
2. **Alerta inmediatamente** a través de buzzer local y notificación web
3. **Registra eventos** para seguimiento y análisis
4. **Es accesible** desde cualquier dispositivo con navegador

El proyecto integra conocimientos de electrónica, programación embebida, desarrollo web y bases de datos, demostrando la aplicación práctica del Internet de las Cosas en el cuidado de la salud.

---

## 13. REFERENCIAS

- Espressif ESP32 Documentation
- InvenSense MPU6050 Datasheet
- Next.js Documentation
- Supabase Documentation
- Vercel Deployment Guide
- Arduino IDE Reference

---

## 14. EQUIPO DE DESARROLLO

**Proyecto:** FallGuard - Sistema de Detección de Caídas
**Tecnologías:** IoT, ESP32, Next.js, Supabase, Vercel
**Fecha:** 2024

---

*"Tecnología al servicio del cuidado de nuestros adultos mayores"*
