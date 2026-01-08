import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">FG</span>
            </div>
            <span className="font-semibold text-foreground">FallGuard</span>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-2xl text-center animate-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm mb-6">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Sistema activo
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
            Proteccion inteligente
            <br />
            <span className="text-muted">para quienes mas importan</span>
          </h1>

          <p className="text-lg text-muted mb-8 max-w-lg mx-auto">
            Sistema de deteccion de caidas en tiempo real con notificaciones
            instantaneas a familiares via WhatsApp y Email.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-white rounded-lg font-medium hover:bg-foreground/90 transition-colors"
            >
              Ir al Dashboard
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="https://github.com/brolyroly007/iot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg font-medium text-muted hover:text-foreground hover:border-foreground/20 transition-colors"
            >
              Ver en GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">&lt;1s</div>
              <div className="text-sm text-muted">Tiempo de respuesta</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">24/7</div>
              <div className="text-sm text-muted">Monitoreo continuo</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">2+</div>
              <div className="text-sm text-muted">Contactos de emergencia</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-border hover:border-foreground/20 transition-colors">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Deteccion instantanea</h3>
              <p className="text-sm text-muted">Algoritmo avanzado que detecta caidas en menos de un segundo usando acelerometro y giroscopio.</p>
            </div>

            <div className="p-6 rounded-xl border border-border hover:border-foreground/20 transition-colors">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Alertas WhatsApp</h3>
              <p className="text-sm text-muted">Notificaciones inmediatas via WhatsApp a multiples contactos de emergencia.</p>
            </div>

            <div className="p-6 rounded-xl border border-border hover:border-foreground/20 transition-colors">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Dashboard en vivo</h3>
              <p className="text-sm text-muted">Panel de control en tiempo real para monitorear el estado del dispositivo y historial de eventos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted">
              FallGuard IoT - Sistema de deteccion de caidas
            </p>
            <div className="flex items-center gap-4 text-sm text-muted">
              <span>ESP32-CAM + MPU6050</span>
              <span className="w-1 h-1 bg-muted rounded-full"></span>
              <span>Next.js + Vercel</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
