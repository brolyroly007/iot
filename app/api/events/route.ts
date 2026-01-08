import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: true,
        events: [],
        total: 0,
        message: 'Supabase not configured'
      })
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error Supabase:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      events: events || [],
      total: events?.length || 0
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo eventos' },
      { status: 500 }
    )
  }
}
