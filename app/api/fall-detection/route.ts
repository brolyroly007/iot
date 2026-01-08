import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Guardar evento en Supabase
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        tipo: data.evento || 'caida',
        magnitud: data.magnitud || 0,
        dispositivo: data.dispositivo || 'ESP32-CAM'
      })
      .select()
      .single()

    if (error) {
      console.error('Error Supabase:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log('Evento guardado:', event)

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
