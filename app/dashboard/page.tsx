'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [showAlert, setShowAlert] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevEventsLength = useRef(0)

  useEffect(() => {
    fetchEvents()
    fetchStatus()
    const interval = setInterval(() => {
      fetchEvents()
      fetchStatus()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Check for new fall events
  useEffect(() => {
    if (events.length > prevEventsLength.current) {
      const latestEvent = events[0]
      if (latestEvent?.tipo === 'caida') {
        setShowAlert(true)
        if (soundEnabled && audioRef.current) {
          audioRef.current.play().catch(() => {})
        }
        setTimeout(() => setShowAlert(false), 10000)
      }
    }
    prevEventsLength.current = events.length
  }, [events, soundEnabled])

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

      if (diffMins < 1) return 'Ahora mismo'
      if (diffMins < 60) return `Hace ${diffMins} min`
      if (diffHours < 24) return `Hace ${diffHours}h`
      if (diffDays < 7) return `Hace ${diffDays} dias`

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

  const formatFullDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    } catch {
      return dateString
    }
  }

  const fallCount = events.filter(e => e.tipo === 'caida').length
  const testCount = events.filter(e => e.tipo === 'test').length
  const todayEvents = events.filter(e => {
    const eventDate = new Date(e.fecha).toDateString()
    const today = new Date().toDateString()
    return eventDate === today
  }).length

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Alert notification sound */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp+ZjHhxeYiVn5+XinZsfIqZo6GYiXVpdIWVoKCYinZqdoOToZ+ZjHdsdIOSn5+ajnlud4OQnJyYjnpweYSRm5qVi3l0e4aSmpeTiHd2fIaRl5WPgnV4gYuUlpKLfnZ6goqRk4+IfHd9hIuPkIt/eXuBiIyNiYJ8en+Fio2LhX98f4OHiomFgX5/goaIh4OAfX+ChYaFgoB+f4GDhIOBf35/gIKCgX9+fn+AgYGAfn5+f4CAgH9+fn5/f39/fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+"></audio>

      {/* Emergency Alert Banner */}
      {showAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-4 px-4 animate-pulse">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg">ALERTA: Caida detectada</p>
                <p className="text-red-100 text-sm">Verificar estado del paciente inmediatamente</p>
              </div>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-white text-lg">FallGuard</span>
              <p className="text-slate-500 text-xs">Panel de monitoreo</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg transition-colors ${soundEnabled ? 'bg-slate-800 text-white' : 'bg-slate-800/50 text-slate-500'}`}
              title={soundEnabled ? 'Sonido activado' : 'Sonido desactivado'}
            >
              {soundEnabled ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
            </button>

            {/* Status badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              status === 'online'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              <span className={`relative w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}>
                {status === 'online' && (
                  <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
                )}
              </span>
              {status === 'online' ? 'En linea' : 'Desconectado'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl border border-red-500/20 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <span className="text-red-400 text-sm font-medium">Caidas</span>
            </div>
            <p className="text-4xl font-bold text-white">{fallCount}</p>
            <p className="text-red-400/60 text-xs mt-1">Total detectadas</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl border border-orange-500/20 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-orange-400 text-sm font-medium">Pruebas</span>
            </div>
            <p className="text-4xl font-bold text-white">{testCount}</p>
            <p className="text-orange-400/60 text-xs mt-1">Alertas de prueba</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl border border-blue-500/20 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-blue-400 text-sm font-medium">Hoy</span>
            </div>
            <p className="text-4xl font-bold text-white">{todayEvents}</p>
            <p className="text-blue-400/60 text-xs mt-1">Eventos de hoy</p>
          </div>

          <div className="bg-gradient-to-br from-slate-500/20 to-slate-600/10 rounded-2xl border border-slate-500/20 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-slate-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-slate-400 text-sm font-medium">Total</span>
            </div>
            <p className="text-4xl font-bold text-white">{events.length}</p>
            <p className="text-slate-400/60 text-xs mt-1">Todos los eventos</p>
          </div>
        </div>

        {/* Device Status Card */}
        <div className={`rounded-2xl border p-6 transition-all ${
          status === 'online'
            ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                status === 'online' ? 'bg-green-500/20' : 'bg-slate-800'
              }`}>
                <svg className={`w-7 h-7 ${status === 'online' ? 'text-green-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${status === 'online' ? 'text-green-400' : 'text-white'}`}>
                  {status === 'online' ? 'Dispositivo conectado' : 'Dispositivo desconectado'}
                </h3>
                <p className="text-slate-400 text-sm">
                  {lastUpdate || 'ESP32-CAM + MPU6050'}
                </p>
              </div>
            </div>

            <button
              onClick={testAlert}
              disabled={loading}
              className="px-6 py-3 bg-white text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Enviar alerta de prueba
                </>
              )}
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Historial de eventos</h2>
              <p className="text-slate-500 text-sm">Ultimos {events.length} registros</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Caida
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span> Prueba
              </span>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-400 font-medium">Sin eventos registrados</p>
              <p className="text-slate-600 text-sm mt-1">Los eventos apareceran aqui cuando se detecten</p>
              <button
                onClick={testAlert}
                className="mt-6 px-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-lg hover:bg-slate-700 transition-colors"
              >
                Crear evento de prueba
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto">
              {events.map((event, i) => (
                <div
                  key={event.id || i}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      event.tipo === 'caida'
                        ? 'bg-gradient-to-br from-red-500/30 to-red-600/20'
                        : 'bg-gradient-to-br from-orange-500/30 to-orange-600/20'
                    }`}>
                      {event.tipo === 'caida' ? (
                        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {event.tipo === 'caida' ? 'Caida detectada' : 'Alerta de prueba'}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-slate-500 text-sm flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          {event.magnitud}G
                        </span>
                        <span className="text-slate-500 text-sm flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                          {event.dispositivo}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${
                      event.tipo === 'caida'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {formatDate(event.fecha)}
                    </span>
                    <p className="text-slate-600 text-xs mt-1">{formatFullDate(event.fecha)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-slate-600 text-sm">
            Actualizado automaticamente cada 5 segundos
          </p>
          <p className="text-slate-700 text-xs mt-1">
            FallGuard v1.0 - Sistema de monitoreo IoT
          </p>
        </div>
      </main>
    </div>
  )
}
