import { NextResponse } from 'next/server'

// Almacenamiento compartido
let events: any[] = []

// Importar eventos del endpoint principal
export async function GET() {
  try {
    // En produccion, obtener de Supabase
    // Por ahora usamos almacenamiento en memoria

    return NextResponse.json({
      success: true,
      events: events,
      total: events.length
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo eventos' },
      { status: 500 }
    )
  }
}

// Funcion para agregar eventos (usada internamente)
export function addEvent(event: any) {
  events.unshift(event)
  if (events.length > 100) {
    events = events.slice(0, 100)
  }
}

export { events }
