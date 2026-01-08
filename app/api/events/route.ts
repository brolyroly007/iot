import { NextResponse } from 'next/server'

// Almacenamiento en memoria (compartido globalmente)
declare global {
  var fallEvents: any[]
}

if (!global.fallEvents) {
  global.fallEvents = []
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      events: global.fallEvents,
      total: global.fallEvents.length
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo eventos' },
      { status: 500 }
    )
  }
}
