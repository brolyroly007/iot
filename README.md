# Detector de Caidas IoT

Sistema de monitoreo de caidas para adultos mayores con notificaciones a WhatsApp y Email.

## Arquitectura

```
ESP32-CAM + MPU6050  -->  Vercel (API + Dashboard)  -->  WhatsApp / Email
```

## Despliegue en Vercel

1. Subir a GitHub
2. Conectar con Vercel
3. Configurar variables de entorno
4. Deploy!

## Variables de Entorno

Ver archivo `.env.example` para la lista completa.

## Endpoints API

- `POST /api/fall-detection` - Recibe alertas de caida
- `GET /api/events` - Lista eventos
- `POST /api/status` - Ping del dispositivo
- `GET /api/status` - Estado del dispositivo
