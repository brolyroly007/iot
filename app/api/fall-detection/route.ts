import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured'
      }, { status: 500 })
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    let eventData: {
      tipo: string
      magnitud: number
      dispositivo: string
      dispositivo_id?: string
      foto_url?: string
    }

    // Verificar si es multipart (con imagen) o JSON
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const evento = formData.get('evento') as string
      const magnitud = parseFloat(formData.get('magnitud') as string)
      const codigo = formData.get('codigo') as string
      const foto = formData.get('foto') as File | null

      // Buscar dispositivo por código
      let dispositivo_id: string | undefined
      if (codigo) {
        const { data: dispositivo } = await supabase
          .from('dispositivos')
          .select('id')
          .eq('codigo', codigo)
          .single()

        if (dispositivo) {
          dispositivo_id = dispositivo.id
        }
      }

      // Subir foto si existe
      let foto_url: string | undefined
      if (foto) {
        const fileName = `caida_${Date.now()}.jpg`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('fotos-caidas')
          .upload(fileName, foto, {
            contentType: 'image/jpeg'
          })

        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('fotos-caidas')
            .getPublicUrl(fileName)
          foto_url = publicUrl
        }
      }

      eventData = {
        tipo: evento || 'caida',
        magnitud: magnitud || 0,
        dispositivo: codigo || 'ESP32-CAM',
        dispositivo_id,
        foto_url
      }
    } else {
      // JSON normal
      const data = await request.json()

      // Buscar dispositivo por código si se proporciona
      let dispositivo_id: string | undefined
      if (data.codigo) {
        const { data: dispositivo } = await supabase
          .from('dispositivos')
          .select('id')
          .eq('codigo', data.codigo)
          .single()

        if (dispositivo) {
          dispositivo_id = dispositivo.id
        }
      }

      eventData = {
        tipo: data.evento || 'caida',
        magnitud: data.magnitud || 0,
        dispositivo: data.dispositivo || data.codigo || 'ESP32-CAM',
        dispositivo_id,
        foto_url: data.foto_url
      }
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert(eventData)
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
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
