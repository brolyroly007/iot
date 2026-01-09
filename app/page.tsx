import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/una-logo.png"
              alt="UNA Puno"
              width={45}
              height={45}
              className="rounded-lg"
            />
            <div className="hidden sm:block">
              <p className="text-white text-sm font-medium">Universidad Nacional del Altiplano</p>
              <p className="text-slate-400 text-xs">Escuela Profesional de Ingeniería de Sistemas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-slate-300 text-sm hover:text-white transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/registro"
              className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-200px)] px-6">
        <div className="text-center animate-in max-w-2xl">
          {/* Logo */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-red-500/30 rounded-3xl blur-xl animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/30">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            FallGuard
          </h1>
          <p className="text-slate-400 mb-2 text-xl">
            Sistema de Detección de Caídas para Adultos Mayores
          </p>
          <p className="text-slate-500 text-sm mb-10 max-w-md mx-auto">
            Monitoreo inteligente en tiempo real con tecnología IoT para el cuidado y protección de nuestros seres queridos
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 text-sm font-semibold rounded-2xl hover:bg-slate-100 transition-all hover:scale-105 shadow-2xl"
            >
              Comenzar ahora
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 text-white text-sm font-semibold rounded-2xl hover:bg-slate-700 transition-all border border-slate-700"
            >
              Ya tengo cuenta
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-xs text-slate-400">Detección<br/>instantánea</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              </div>
              <p className="text-xs text-slate-400">Conexión<br/>WiFi</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-xs text-slate-400">Captura<br/>de foto</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-xs text-slate-400">Alertas<br/>inmediatas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-slate-400 text-sm">Sistema operativo</span>
        </div>
        <p className="text-slate-600 text-xs">
          Curso: Internet de las Cosas | Universidad Nacional del Altiplano - Puno
        </p>
      </footer>
    </main>
  )
}
