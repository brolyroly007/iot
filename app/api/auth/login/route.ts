import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Servidor no configurado' }, { status: 500 })
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    // Guardar sesión en cookie
    const cookieStore = await cookies()
    cookieStore.set('session', JSON.stringify({
      access_token: data.session?.access_token,
      user: {
        id: data.user?.id,
        email: data.user?.email
      }
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    })

    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
