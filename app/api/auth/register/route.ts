import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { nombre, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y password requeridos' }, { status: 400 })
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Servidor no configurado' }, { status: 500 })
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    // Verificar si el email ya existe
    const { data: existing } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Este correo ya está registrado' }, { status: 400 })
    }

    // Crear usuario
    const { data: user, error } = await supabase
      .from('usuarios')
      .insert({
        email: email,
        password: hashPassword(password),
        nombre: nombre || 'Usuario'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
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
