import { NextRequest, NextResponse } from 'next/server'

let lastPing = 0
let deviceInfo: any = null

export async function GET() {
  const now = Date.now()
  const isOnline = (now - lastPing) < 30000 // Online si hubo ping en los ultimos 30 segundos

  return NextResponse.json({
    online: isOnline,
    lastUpdate: lastPing ? new Date(lastPing).toLocaleString('es-PE', { timeZone: 'America/Lima' }) : null,
    device: deviceInfo
  })
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    lastPing = Date.now()
    deviceInfo = {
      id: data.dispositivo || 'ESP32-CAM',
      ip: data.ip || 'desconocida',
      rssi: data.rssi || 0 // Fuerza de senal WiFi
    }

    return NextResponse.json({
      success: true,
      message: 'Ping recibido'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error' },
      { status: 500 }
    )
  }
}
