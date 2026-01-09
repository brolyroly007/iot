'use client'

import { useState, useEffect, useRef } from 'react'

interface Event {
  id: string
  tipo: string
  magnitud: number
  dispositivo: string
  fecha: string
  foto_url?: string
  atendido?: boolean
}

interface Dispositivo {
  id: string
  nombre: string
  codigo: string
  ubicacion: string
  activo: boolean
  created_at: string
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
  const [status, setStatus] = useState<'online' | 'offline'>('offline')
  const [loading, setLoading] = useState(true)
  const [showAddDevice, setShowAddDevice] = useState(false)
  const [newDevice, setNewDevice] = useState({ nombre: '', ubicacion: '' })
  const [activeTab, setActiveTab] = useState<'eventos' | 'dispositivos' | 'estadisticas'>('eventos')
  const [showAlert, setShowAlert] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevEventsLength = useRef(0)

  useEffect(() => {
    fetchEvents()
    fetchDispositivos()
    fetchStatus()
    setLoading(false)

    const interval = setInterval(() => {
      fetchEvents()
      fetchStatus()
    }, 5000)

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(timeInterval)
    }
  }, [])

  useEffect(() => {
    if (events.length > prevEventsLength.current && prevEventsLength.current > 0) {
      const latestEvent = events[0]
      if (latestEvent?.tipo === 'caida') {
        setShowAlert(true)
        setSelectedEvent(latestEvent)
        if (audioRef.current) {
          audioRef.current.play().catch(() => {})
        }
      }
    }
    prevEventsLength.current = events.length
  }, [events])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchDispositivos = async () => {
    try {
      const res = await fetch('/api/dispositivos')
      const data = await res.json()
      setDispositivos(data.dispositivos || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status')
      const data = await res.json()
      setStatus(data.online ? 'online' : 'offline')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/dispositivos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDevice)
      })
      if (res.ok) {
        setShowAddDevice(false)
        setNewDevice({ nombre: '', ubicacion: '' })
        fetchDispositivos()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDeleteDevice = async (id: string) => {
    if (!confirm('¿Eliminar este dispositivo?')) return
    try {
      await fetch(`/api/dispositivos?id=${id}`, { method: 'DELETE' })
      fetchDispositivos()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const testAlert = async (tipo: string) => {
    await fetch('/api/fall-detection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evento: tipo,
        magnitud: tipo === 'caida' ? 3.2 : 1.5,
        dispositivo: 'ESP32-TEST'
      })
    })
    fetchEvents()
  }

  const clearEvents = async () => {
    if (!confirm('¿Eliminar todos los eventos?')) return
    // Esta funcionalidad requeriría un endpoint adicional
    alert('Función disponible próximamente')
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
      if (diffDays < 7) return `Hace ${diffDays} días`

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
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando sistema...</p>
        </div>
      </div>
    )
  }

  const fallCount = events.filter(e => e.tipo === 'caida').length
  const testCount = events.filter(e => e.tipo === 'test' || e.tipo === 'prueba').length
  const todayEvents = events.filter(e => {
    const eventDate = new Date(e.fecha)
    const today = new Date()
    return eventDate.toDateString() === today.toDateString()
  }).length

  // Calcular eventos por hora (últimas 24 horas)
  const last24h = events.filter(e => {
    const eventDate = new Date(e.fecha)
    const now = new Date()
    return (now.getTime() - eventDate.getTime()) < 86400000
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp+ZjHhxeYiVn5+XinZsfIqZo6GYiXVpdIWVoKCYinZqdoOToZ+ZjHdsdIOSn5+ajnlud4OQnJyYjnpweYSRm5qVi3l0e4aSmpeTiHd2fIaRl5WPgnV4gYuUlpKLfnZ6goqRk4+IfHd9hIuPkIt/eXuBiIyNiYJ8en+Fio2LhX98f4OHiomFgX5/goaIh4OAfX+ChYaFgoB+f4GDhIOBf35/gIKCgX9+fn+AgYGAfn5+f4CAgH9+fn5/f39/fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+"></audio>

      {/* Alert Modal */}
      {showAlert && selectedEvent && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl max-w-lg w-full border border-red-500/50 overflow-hidden shadow-2xl shadow-red-500/20">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-2xl">¡ALERTA DE CAÍDA!</h3>
                  <p className="text-red-100">Se requiere atención inmediata</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {selectedEvent.foto_url && (
                <img src={selectedEvent.foto_url} alt="Captura del incidente" className="w-full h-56 object-cover rounded-2xl mb-6 border border-slate-700" />
              )}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Dispositivo</p>
                  <p className="text-white font-semibold">{selectedEvent.dispositivo}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Magnitud</p>
                  <p className="text-white font-semibold">{selectedEvent.magnitud}G</p>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Fecha y hora</p>
                <p className="text-white">{formatFullDate(selectedEvent.fecha)}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAlert(false)}
                  className="flex-1 bg-slate-800 text-white font-semibold py-4 rounded-xl hover:bg-slate-700 transition-all"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => setShowAlert(false)}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all"
                >
                  Atendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">FallGuard</h1>
                <p className="text-slate-500 text-sm">Sistema de Detección de Caídas</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Clock */}
              <div className="hidden md:block text-right">
                <p className="text-white font-mono text-lg">{currentTime.toLocaleTimeString('es-PE')}</p>
                <p className="text-slate-500 text-xs">{currentTime.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
              </div>

              {/* Status */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
                status === 'online'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                <span className={`w-2.5 h-2.5 rounded-full ${status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                {status === 'online' ? 'Sistema Activo' : 'Desconectado'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-2xl border border-red-500/20 p-6 hover:border-red-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <span className="text-red-400 text-xs font-medium bg-red-500/20 px-2 py-1 rounded-lg">Crítico</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{fallCount}</p>
            <p className="text-slate-500 text-sm">Caídas detectadas</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-2xl border border-amber-500/20 p-6 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{testCount}</p>
            <p className="text-slate-500 text-sm">Pruebas realizadas</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl border border-blue-500/20 p-6 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{dispositivos.length}</p>
            <p className="text-slate-500 text-sm">Dispositivos</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-2xl border border-emerald-500/20 p-6 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{todayEvents}</p>
            <p className="text-slate-500 text-sm">Eventos hoy</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400 text-sm font-medium mr-2">Acciones rápidas:</span>
            <button
              onClick={() => testAlert('caida')}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/30 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
              </svg>
              Simular Caída
            </button>
            <button
              onClick={() => testAlert('test')}
              className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-xl text-sm font-medium hover:bg-amber-500/30 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Prueba Sistema
            </button>
            <button
              onClick={() => setShowAddDevice(true)}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-500/30 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Dispositivo
            </button>
            <button
              onClick={fetchEvents}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-600 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'eventos', label: 'Eventos', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { id: 'dispositivos', label: 'Dispositivos', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
            { id: 'estadisticas', label: 'Estadísticas', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-5 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'eventos' && (
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Historial de Eventos</h2>
                <p className="text-slate-500 text-sm">{events.length} eventos registrados</p>
              </div>
            </div>
            {events.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-lg mb-2">Sin eventos registrados</p>
                <p className="text-slate-600">Los eventos aparecerán aquí cuando el sistema detecte actividad</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50 max-h-[600px] overflow-y-auto">
                {events.map((event, index) => (
                  <div
                    key={event.id}
                    className={`px-6 py-5 flex items-center justify-between hover:bg-slate-800/30 transition-all cursor-pointer ${
                      index === 0 && event.tipo === 'caida' ? 'bg-red-500/5' : ''
                    }`}
                    onClick={() => {
                      setSelectedEvent(event)
                      setShowAlert(true)
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        event.tipo === 'caida'
                          ? 'bg-gradient-to-br from-red-500/30 to-red-600/20'
                          : 'bg-gradient-to-br from-amber-500/30 to-amber-600/20'
                      }`}>
                        {event.foto_url ? (
                          <img src={event.foto_url} alt="" className="w-14 h-14 rounded-2xl object-cover" />
                        ) : (
                          <svg className={`w-7 h-7 ${event.tipo === 'caida' ? 'text-red-400' : 'text-amber-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">
                          {event.tipo === 'caida' ? '⚠️ Caída Detectada' : '🔔 Alerta de Prueba'}
                        </p>
                        <p className="text-slate-500">{event.magnitud}G · {event.dispositivo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-medium ${
                        event.tipo === 'caida'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {event.tipo === 'caida' ? 'CRÍTICO' : 'PRUEBA'}
                      </span>
                      <p className="text-slate-600 text-sm mt-2">{formatDate(event.fecha)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'dispositivos' && (
          <div className="space-y-4">
            <button
              onClick={() => setShowAddDevice(true)}
              className="w-full bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-2xl p-8 text-slate-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center gap-3"
            >
              <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-medium">Agregar nuevo dispositivo</span>
            </button>

            {dispositivos.map((device) => (
              <div key={device.id} className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{device.nombre}</h3>
                      <p className="text-slate-500">{device.ubicacion || 'Sin ubicación definida'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`w-2 h-2 rounded-full ${device.activo ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                        <span className="text-xs text-slate-500">{device.activo ? 'Activo' : 'Inactivo'}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDevice(device.id)}
                    className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">Código para ESP32</p>
                  <div className="flex items-center justify-between">
                    <code className="text-emerald-400 font-mono text-xl">{device.codigo}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(device.codigo)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {dispositivos.length === 0 && (
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-16 text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-lg mb-2">No hay dispositivos registrados</p>
                <p className="text-slate-600">Agrega tu primer ESP32-CAM para comenzar el monitoreo</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'estadisticas' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                <h3 className="text-slate-400 text-sm font-medium mb-4">Últimas 24 horas</h3>
                <p className="text-4xl font-bold text-white mb-2">{last24h.length}</p>
                <p className="text-slate-500 text-sm">eventos registrados</p>
              </div>
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                <h3 className="text-slate-400 text-sm font-medium mb-4">Promedio de magnitud</h3>
                <p className="text-4xl font-bold text-white mb-2">
                  {events.length > 0
                    ? (events.reduce((acc, e) => acc + e.magnitud, 0) / events.length).toFixed(1)
                    : '0.0'}G
                </p>
                <p className="text-slate-500 text-sm">en todos los eventos</p>
              </div>
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                <h3 className="text-slate-400 text-sm font-medium mb-4">Tasa de caídas</h3>
                <p className="text-4xl font-bold text-white mb-2">
                  {events.length > 0
                    ? ((fallCount / events.length) * 100).toFixed(0)
                    : '0'}%
                </p>
                <p className="text-slate-500 text-sm">del total de eventos</p>
              </div>
            </div>

            {/* Activity Graph Placeholder */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
              <h3 className="text-white font-semibold mb-6">Actividad del Sistema</h3>
              <div className="h-48 flex items-end justify-between gap-2">
                {[...Array(12)].map((_, i) => {
                  const height = Math.random() * 100 + 20
                  const isRecent = i >= 10
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className={`w-full rounded-t-lg transition-all ${
                          isRecent ? 'bg-gradient-to-t from-red-500 to-red-400' : 'bg-gradient-to-t from-slate-700 to-slate-600'
                        }`}
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-slate-600 text-xs">{i * 2}h</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-slate-600 text-sm text-center mt-4">Eventos por hora (simulación visual)</p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20 p-6">
                <h3 className="text-white font-semibold mb-2">📡 Conexión IoT</h3>
                <p className="text-slate-400 text-sm">El sistema utiliza ESP32-CAM con sensor MPU6050 para detectar caídas en tiempo real mediante análisis de aceleración.</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 p-6">
                <h3 className="text-white font-semibold mb-2">🔔 Alertas Instantáneas</h3>
                <p className="text-slate-400 text-sm">Cuando se detecta una caída, el dashboard muestra una alerta inmediata con sonido y detalles del evento.</p>
              </div>
            </div>
          </div>
        )}

        {/* Add Device Modal */}
        {showAddDevice && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-3xl max-w-md w-full border border-slate-800 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h3 className="text-xl font-bold text-white">Nuevo Dispositivo</h3>
                <p className="text-blue-100 text-sm">Registra tu ESP32-CAM en el sistema</p>
              </div>
              <form onSubmit={handleAddDevice} className="p-6 space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2 font-medium">Nombre del dispositivo</label>
                  <input
                    type="text"
                    value={newDevice.nombre}
                    onChange={(e) => setNewDevice({ ...newDevice, nombre: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="Ej: Detector Habitación Principal"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2 font-medium">Ubicación</label>
                  <input
                    type="text"
                    value={newDevice.ubicacion}
                    onChange={(e) => setNewDevice({ ...newDevice, ubicacion: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="Ej: Sala de estar, Dormitorio"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddDevice(false)}
                    className="flex-1 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
                  >
                    Crear Dispositivo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-900/50 px-6 py-3 rounded-full border border-slate-800">
            <span className="text-slate-500 text-sm">Internet de las Cosas</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400 text-sm font-medium">Universidad Nacional del Altiplano - Puno</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
