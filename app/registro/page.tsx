'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function Registro() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al registrarse')
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch {
      setError('Error de conexión')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header con logos */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Image
              src="/una-logo.png"
              alt="UNA Puno"
              width={60}
              height={60}
              className="rounded-lg"
            />
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">FallGuard</h1>
          <p className="text-slate-400 text-sm">Sistema de Detección de Caídas</p>
          <p className="text-slate-500 text-xs mt-1">Internet de las Cosas - UNA Puno</p>
        </div>

        {/* Formulario */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Crear Cuenta</h2>

          {success ? (
            <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-6 rounded-lg text-center">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-medium">¡Registro exitoso!</p>
              <p className="text-sm mt-1">Redirigiendo al login...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Nombre completo</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Confirmar contraseña</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="Repetir contraseña"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registrando...
                    </>
                  ) : 'Crear cuenta'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm">
                  ¿Ya tienes cuenta?{' '}
                  <Link href="/login" className="text-red-400 hover:text-red-300 font-medium">
                    Iniciar sesión
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Universidad Nacional del Altiplano - Puno
        </p>
      </div>
    </div>
  )
}
