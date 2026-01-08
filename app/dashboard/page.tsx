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
      return new Date(dateString).toLocaleString('es-PE', { timeZone: 'America/Lima' })
    } catch {
      return dateString
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-semibold text-neutral-900">FallGuard</Link>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-neutral-600">
              {status === 'online' ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Estado */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Estado</p>
              <p className={`font-medium ${status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                {status === 'online' ? 'Dispositivo en linea' : 'Sin conexion'}
              </p>
              {lastUpdate && (
                <p className="text-xs text-neutral-400 mt-1">{lastUpdate}</p>
              )}
            </div>
            <button
              onClick={testAlert}
              className="px-4 py-2 text-sm bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
            >
              Probar alerta
            </button>
          </div>
        </div>

        {/* Eventos */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200">
            <p className="font-medium text-neutral-900">Eventos</p>
          </div>

          {events.length === 0 ? (
            <div className="px-4 py-12 text-center text-neutral-400">
              Sin eventos
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {events.map((event, i) => (
                <div key={event.id || i} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      event.tipo === 'caida' ? 'bg-red-500' : 'bg-orange-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {event.tipo === 'caida' ? 'Caida detectada' : 'Prueba'}
                      </p>
                      <p className="text-xs text-neutral-400">{event.magnitud}G</p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400">{formatDate(event.fecha)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
