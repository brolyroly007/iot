import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

function generateCode(): string {
  return 'FG-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Servidor no configurado' }, { status: 500 })
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    const { data: dispositivos, error } = await supabase
      .from('dispositivos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ dispositivos })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const { nombre, ubicacion } = await request.json()

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Servidor no configurado' }, { status: 500 })
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    const codigo = generateCode()

    const { data: dispositivo, error } = await supabase
      .from('dispositivos')
      .insert({
        user_id: session.user.id,
        nombre: nombre || 'Mi Dispositivo',
        codigo: codigo,
        ubicacion: ubicacion || ''
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ dispositivo })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Servidor no configurado' }, { status: 500 })
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    const { error } = await supabase
      .from('dispositivos')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
