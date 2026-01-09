'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

interface User {
  id: string
  email: string
  nombre: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
  const [status, setStatus] = useState<'online' | 'offline'>('offline')
  const [loading, setLoading] = useState(true)
  const [showAddDevice, setShowAddDevice] = useState(false)
  const [newDevice, setNewDevice] = useState({ nombre: '', ubicacion: '' })
  const [activeTab, setActiveTab] = useState<'eventos' | 'dispositivos'>('eventos')
  const [showAlert, setShowAlert] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevEventsLength = useRef(0)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchEvents()
      fetchDispositivos()
      fetchStatus()
      const interval = setInterval(() => {
        fetchEvents()
        fetchStatus()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [user])

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

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.user) {
        setUser(data.user)
      } else {
        router.push('/login')
      }
    } catch {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
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
    if (!confirm('¿Estás seguro de eliminar este dispositivo?')) return
    try {
      await fetch(`/api/dispositivos?id=${id}`, { method: 'DELETE' })
      fetchDispositivos()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const testAlert = async () => {
    await fetch('/api/fall-detection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evento: 'test',
        magnitud: 3.5,
        dispositivo: 'TEST'
      })
    })
    fetchEvents()
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)

      if (diffMins < 1) return 'Ahora'
      if (diffMins < 60) return `Hace ${diffMins}m`
      if (diffHours < 24) return `Hace ${diffHours}h`

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const fallCount = events.filter(e => e.tipo === 'caida').length
  const testCount = events.filter(e => e.tipo === 'test').length

  return (
    <div className="min-h-screen bg-slate-950">
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp+ZjHhxeYiVn5+XinZsfIqZo6GYiXVpdIWVoKCYinZqdoOToZ+ZjHdsdIOSn5+ajnlud4OQnJyYjnpweYSRm5qVi3l0e4aSmpeTiHd2fIaRl5WPgnV4gYuUlpKLfnZ6goqRk4+IfHd9hIuPkIt/eXuBiIyNiYJ8en+Fio2LhX98f4OHiomFgX5/goaIh4OAfX+ChYaFgoB+f4GDhIOBf35/gIKCgX9+fn+AgYGAfn5+f4CAgH9+fn5/f39/fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+"></audio>

      {/* Alert Modal */}
      {showAlert && selectedEvent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full border border-red-500 overflow-hidden animate-pulse">
            <div className="bg-red-600 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">¡ALERTA DE CAÍDA!</h3>
                  <p className="text-red-100 text-sm">Verificar inmediatamente</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {selectedEvent.foto_url && (
                <img src={selectedEvent.foto_url} alt="Foto de la caída" className="w-full h-48 object-cover rounded-lg mb-4" />
              )}
              <div className="space-y-2 text-sm">
                <p className="text-slate-400">Dispositivo: <span className="text-white">{selectedEvent.dispositivo}</span></p>
                <p className="text-slate-400">Magnitud: <span className="text-white">{selectedEvent.magnitud}G</span></p>
                <p className="text-slate-400">Hora: <span className="text-white">{formatDate(selectedEvent.fecha)}</span></p>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                className="w-full mt-6 bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-white">FallGuard</span>
              <p className="text-slate-500 text-xs">IoT - UNA Puno</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              status === 'online'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {status === 'online' ? 'En línea' : 'Desconectado'}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm hidden sm:block">{user?.nombre || user?.email}</span>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Cerrar sesión"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl border border-red-500/20 p-5">
            <p className="text-red-400 text-sm font-medium mb-1">Caídas</p>
            <p className="text-4xl font-bold text-white">{fallCount}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl border border-orange-500/20 p-5">
            <p className="text-orange-400 text-sm font-medium mb-1">Pruebas</p>
            <p className="text-4xl font-bold text-white">{testCount}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl border border-blue-500/20 p-5">
            <p className="text-blue-400 text-sm font-medium mb-1">Dispositivos</p>
            <p className="text-4xl font-bold text-white">{dispositivos.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl border border-green-500/20 p-5">
            <p className="text-green-400 text-sm font-medium mb-1">Total eventos</p>
            <p className="text-4xl font-bold text-white">{events.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('eventos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'eventos'
                ? 'bg-white text-slate-900'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Eventos
          </button>
          <button
            onClick={() => setActiveTab('dispositivos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'dispositivos'
                ? 'bg-white text-slate-900'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Dispositivos
          </button>
          <div className="flex-1"></div>
          <button
            onClick={testAlert}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors"
          >
            Probar alerta
          </button>
        </div>

        {/* Content */}
        {activeTab === 'eventos' ? (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Historial de eventos</h2>
            </div>
            {events.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-400">Sin eventos registrados</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto">
                {events.map((event) => (
                  <div key={event.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        event.tipo === 'caida' ? 'bg-red-500/20' : 'bg-orange-500/20'
                      }`}>
                        {event.foto_url ? (
                          <img src={event.foto_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                        ) : (
                          <svg className={`w-6 h-6 ${event.tipo === 'caida' ? 'text-red-400' : 'text-orange-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {event.tipo === 'caida' ? 'Caída detectada' : 'Alerta de prueba'}
                        </p>
                        <p className="text-slate-500 text-sm">{event.magnitud}G · {event.dispositivo}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs ${
                      event.tipo === 'caida' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {formatDate(event.fecha)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Add device button */}
            <button
              onClick={() => setShowAddDevice(true)}
              className="w-full bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl p-6 text-slate-400 hover:text-white hover:border-slate-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Agregar dispositivo
            </button>

            {/* Device list */}
            {dispositivos.map((device) => (
              <div key={device.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{device.nombre}</h3>
                      <p className="text-slate-500 text-sm">{device.ubicacion || 'Sin ubicación'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDevice(device.id)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="mt-4 p-4 bg-slate-800 rounded-xl">
                  <p className="text-slate-400 text-xs mb-1">Código del dispositivo (usar en ESP32):</p>
                  <code className="text-green-400 font-mono text-lg">{device.codigo}</code>
                </div>
              </div>
            ))}

            {dispositivos.length === 0 && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <p className="text-slate-400">No tienes dispositivos registrados</p>
                <p className="text-slate-600 text-sm mt-1">Agrega tu primer dispositivo para comenzar</p>
              </div>
            )}
          </div>
        )}

        {/* Add Device Modal */}
        {showAddDevice && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl max-w-md w-full border border-slate-800 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Agregar dispositivo</h3>
              <form onSubmit={handleAddDevice} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Nombre del dispositivo</label>
                  <input
                    type="text"
                    value={newDevice.nombre}
                    onChange={(e) => setNewDevice({ ...newDevice, nombre: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                    placeholder="Ej: Detector Sala"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Ubicación</label>
                  <input
                    type="text"
                    value={newDevice.ubicacion}
                    onChange={(e) => setNewDevice({ ...newDevice, ubicacion: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                    placeholder="Ej: Sala principal"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddDevice(false)}
                    className="flex-1 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Agregar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-8">
          Internet de las Cosas | Universidad Nacional del Altiplano - Puno
        </p>
      </main>
    </div>
  )
}
