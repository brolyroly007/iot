import { NextRequest, NextResponse } from 'next/server'

// Almacenamiento en memoria (compartido globalmente)
declare global {
  var fallEvents: any[]
  var lastActivity: string
}

if (!global.fallEvents) {
  global.fallEvents = []
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const event = {
      id: crypto.randomUUID(),
      tipo: data.evento || 'caida',
      magnitud: data.magnitud || 0,
      dispositivo: data.dispositivo || 'ESP32-CAM',
      fecha: new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' }),
      timestamp: Date.now()
    }

    // Guardar evento
    global.fallEvents.unshift(event)
    if (global.fallEvents.length > 100) {
      global.fallEvents = global.fallEvents.slice(0, 100)
    }

    global.lastActivity = new Date().toISOString()

    console.log('Evento recibido:', event)

    // Enviar notificaciones si es una caida real
    if (data.evento === 'caida') {
      await sendNotifications(event)
    }

    return NextResponse.json({
      success: true,
      message: 'Alerta recibida',
      eventId: event.id
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error procesando alerta' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

async function sendNotifications(event: any) {
  // WhatsApp via Twilio
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      )

      const phones = [
        process.env.WHATSAPP_PHONE_1,
        process.env.WHATSAPP_PHONE_2
      ].filter(Boolean)

      for (const phone of phones) {
        await twilio.messages.create({
          body: `ALERTA DE CAIDA!\n\nSe detecto una caida.\nMagnitud: ${event.magnitud}G\nDispositivo: ${event.dispositivo}\nFecha: ${event.fecha}\n\nVerifica el estado del adulto mayor inmediatamente.`,
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
          to: `whatsapp:${phone}`
        })
      }
      console.log('WhatsApp enviado')
    } catch (error) {
      console.error('Error WhatsApp:', error)
    }
  }

  // Email via Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = require('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      const emails = [
        process.env.EMAIL_1,
        process.env.EMAIL_2
      ].filter(Boolean)

      for (const email of emails) {
        await resend.emails.send({
          from: process.env.RESEND_FROM || 'onboarding@resend.dev',
          to: email,
          subject: 'ALERTA DE CAIDA DETECTADA',
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h1 style="color: #dc2626;">ALERTA DE CAIDA</h1>
              <p>Se ha detectado una posible caida.</p>
              <table style="margin: 20px 0;">
                <tr><td><strong>Magnitud:</strong></td><td>${event.magnitud}G</td></tr>
                <tr><td><strong>Dispositivo:</strong></td><td>${event.dispositivo}</td></tr>
                <tr><td><strong>Fecha:</strong></td><td>${event.fecha}</td></tr>
              </table>
              <p style="color: #dc2626; font-weight: bold;">
                Por favor, verifica el estado del adulto mayor inmediatamente.
              </p>
            </div>
          `
        })
      }
      console.log('Email enviado')
    } catch (error) {
      console.error('Error Email:', error)
    }
  }
}
