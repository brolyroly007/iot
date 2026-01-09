import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { nombre, email, password } = await request.json()

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Servidor no configurado' }, { status: 500 })
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    // Registrar usuario
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: nombre
        }
      }
    })

    if (error) {
      if (error.message.includes('already registered')) {
        return NextResponse.json({ error: 'Este correo ya está registrado' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Actualizar perfil con nombre
    if (data.user) {
      await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          nombre: nombre
        })
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado correctamente'
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
