'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Event {
  id: string
  tipo: string
  magnitud: number
  dispositivo: string
  fecha: string
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [status, setStatus] = useState<'online' | 'offline'>('offline')
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEvents()
    fetchStatus()

    const interval = setInterval(() => {
      fetchEvents()
      fetchStatus()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status')
      const data = await res.json()
      setStatus(data.online ? 'online' : 'offline')
      setLastUpdate(data.lastUpdate || '')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const testAlert = async () => {
    setLoading(true)
    try {
      await fetch('/api/fall-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento: 'test',
          magnitud: 3.5,
          dispositivo: 'TEST-MANUAL'
        })
      })
      await fetchEvents()
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">FG</span>
            </div>
            <span className="font-semibold text-foreground">FallGuard</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`relative w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                {status === 'online' && (
                  <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
                )}
              </div>
              <span className="text-sm text-muted">
                {status === 'online' ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Status Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Device Status */}
          <div className="col-span-1 md:col-span-2 p-6 rounded-2xl border border-border bg-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-sm font-medium text-muted mb-1">Estado del dispositivo</h2>
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-semibold ${status === 'online' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {status === 'online' ? 'En linea' : 'Sin conexion'}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${status === 'online' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <svg className={`w-6 h-6 ${status === 'online' ? 'text-emerald-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            {lastUpdate && (
              <p className="text-sm text-muted">
                Ultima actividad: {lastUpdate}
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="p-6 rounded-2xl border border-border bg-white">
            <h2 className="text-sm font-medium text-muted mb-1">Total de alertas</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-foreground">{events.length}</span>
              <span className="text-sm text-muted">eventos</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Test Alert */}
          <button
            onClick={testAlert}
            disabled={loading}
            className="p-6 rounded-2xl border border-border bg-white hover:border-foreground/20 transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground mb-1">Enviar alerta de prueba</h3>
                <p className="text-sm text-muted">Simula una caida para probar el sistema</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-50 group-hover:bg-orange-100 transition-colors">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
          </button>

          {/* Notifications Config */}
          <div className="p-6 rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground mb-1">Notificaciones</h3>
                <p className="text-sm text-muted">WhatsApp y Email configurados</p>
              </div>
              <div className="flex gap-2">
                <div className="p-2 rounded-lg bg-green-50">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="p-2 rounded-lg bg-blue-50">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Timeline */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-medium text-foreground">Historial de eventos</h2>
          </div>

          {events.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-muted">No hay eventos registrados</p>
              <p className="text-sm text-muted mt-1">Las alertas apareceran aqui</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {events.map((event, index) => (
                <div
                  key={event.id || index}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      event.tipo === 'caida' ? 'bg-red-100' :
                      event.tipo === 'test' ? 'bg-orange-100' : 'bg-emerald-100'
                    }`}>
                      {event.tipo === 'caida' ? (
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : event.tipo === 'test' ? (
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        {event.tipo === 'caida' ? 'Caida detectada' :
                         event.tipo === 'test' ? 'Prueba del sistema' : event.tipo}
                      </p>
                      <p className="text-sm text-muted">
                        {event.magnitud}G · {event.dispositivo}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-muted">{event.fecha}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
