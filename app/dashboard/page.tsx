'use client'

import { useState, useEffect } from 'react'

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
      console.error('Error fetching events:', error)
    }
  }

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status')
      const data = await res.json()
      setStatus(data.online ? 'online' : 'offline')
      setLastUpdate(data.lastUpdate || '')
    } catch (error) {
      console.error('Error fetching status:', error)
    }
  }

  const testAlert = async () => {
    try {
      await fetch('/api/fall-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento: 'test',
          magnitud: 3.5,
          dispositivo: 'TEST-001'
        })
      })
      fetchEvents()
      alert('Alerta de prueba enviada!')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Panel de Monitoreo
          </h1>
          <p className="text-gray-500">Detector de Caidas IoT</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Estado del Dispositivo</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-lg">
                {status === 'online' ? 'CONECTADO' : 'DESCONECTADO'}
              </span>
            </div>
            {lastUpdate && (
              <span className="text-gray-500 text-sm">
                Ultima actividad: {lastUpdate}
              </span>
            )}
          </div>
        </div>

        {/* Alert Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Contactos de Emergencia</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <span className="text-2xl">📱</span>
              <div>
                <div className="font-medium">WhatsApp</div>
                <div className="text-gray-500 text-sm">Configurar en variables de entorno</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <span className="text-2xl">📧</span>
              <div>
                <div className="font-medium">Email</div>
                <div className="text-gray-500 text-sm">Configurar en variables de entorno</div>
              </div>
            </div>
          </div>

          <button
            onClick={testAlert}
            className="mt-4 w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            Enviar Alerta de Prueba
          </button>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Historial de Eventos</h2>

          {events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay eventos registrados
            </p>
          ) : (
            <div className="space-y-3">
              {events.map((event, index) => (
                <div
                  key={event.id || index}
                  className={`p-4 rounded-lg border-l-4 ${
                    event.tipo === 'caida'
                      ? 'bg-red-50 border-red-500'
                      : event.tipo === 'test'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-green-50 border-green-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold">
                        {event.tipo === 'caida' ? '🚨 CAIDA DETECTADA' :
                         event.tipo === 'test' ? '🧪 PRUEBA' :
                         '✅ ' + event.tipo.toUpperCase()}
                      </span>
                      <div className="text-sm text-gray-600 mt-1">
                        Magnitud: {event.magnitud}G | Dispositivo: {event.dispositivo}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {event.fecha}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
