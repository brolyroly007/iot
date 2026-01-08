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
    await fetch('/api/fall-detection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evento: 'test',
        magnitud: 3.5,
        dispositivo: 'TEST'
      })
    })
    await fetchEvents()
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Ahora'
      if (diffMins < 60) return `Hace ${diffMins}m`
      if (diffHours < 24) return `Hace ${diffHours}h`
      if (diffDays < 7) return `Hace ${diffDays}d`

      return date.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const fallCount = events.filter(e => e.tipo === 'caida').length
  const testCount = events.filter(e => e.tipo === 'test').length

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="font-semibold text-neutral-900">FallGuard</span>
          </Link>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            status === 'online'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}>
            <span className={`relative w-2 h-2 rounded-full ${
              status === 'online' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {status === 'online' && (
                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
              )}
            </span>
            {status === 'online' ? 'En linea' : 'Desconectado'}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-xs text-neutral-500">Caidas</span>
            </div>
            <p className="text-2xl font-semibold text-neutral-900">{fallCount}</p>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-xs text-neutral-500">Pruebas</span>
            </div>
            <p className="text-2xl font-semibold text-neutral-900">{testCount}</p>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs text-neutral-500">Total</span>
            </div>
            <p className="text-2xl font-semibold text-neutral-900">{events.length}</p>
          </div>
        </div>

        {/* Estado del dispositivo */}
        <div className={`rounded-xl border p-4 ${
          status === 'online'
            ? 'bg-green-50 border-green-200'
            : 'bg-white border-neutral-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                status === 'online' ? 'bg-green-100' : 'bg-neutral-100'
              }`}>
                <svg className={`w-5 h-5 ${status === 'online' ? 'text-green-600' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <p className={`font-medium ${status === 'online' ? 'text-green-900' : 'text-neutral-900'}`}>
                  {status === 'online' ? 'Dispositivo conectado' : 'Sin conexion'}
                </p>
                <p className={`text-xs ${status === 'online' ? 'text-green-600' : 'text-neutral-400'}`}>
                  {lastUpdate || 'ESP32-CAM'}
                </p>
              </div>
            </div>

            <button
              onClick={testAlert}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando
                </span>
              ) : 'Probar alerta'}
            </button>
          </div>
        </div>

        {/* Lista de eventos */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
            <p className="font-medium text-neutral-900">Historial de eventos</p>
            <span className="text-xs text-neutral-400">{events.length} registros</span>
          </div>

          {events.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-neutral-500 text-sm">Sin eventos registrados</p>
              <p className="text-neutral-400 text-xs mt-1">Los eventos apareceran aqui</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 max-h-96 overflow-y-auto">
              {events.map((event, i) => (
                <div
                  key={event.id || i}
                  className="px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      event.tipo === 'caida' ? 'bg-red-100' : 'bg-orange-100'
                    }`}>
                      {event.tipo === 'caida' ? (
                        <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {event.tipo === 'caida' ? 'Caida detectada' : 'Alerta de prueba'}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {event.magnitud}G · {event.dispositivo}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded-md">
                    {formatDate(event.fecha)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-neutral-400 pt-4">
          Actualizado automaticamente cada 5 segundos
        </p>
      </main>
    </div>
  )
}
