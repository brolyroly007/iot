import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Servidor no configurado' }, { status: 500 })
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    // Obtener perfil del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    return NextResponse.json({
      user: {
        ...session.user,
        nombre: profile?.nombre || ''
      }
    })
  } catch {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
