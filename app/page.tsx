import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-neutral-50 to-neutral-100">
      <div className="text-center animate-in">
        {/* Logo con efecto */}
        <div className="relative w-16 h-16 mx-auto mb-8">
          <div className="absolute inset-0 bg-black/10 rounded-2xl blur-xl"></div>
          <div className="relative w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
          FallGuard
        </h1>
        <p className="text-neutral-500 mb-2">
          Sistema de deteccion de caidas
        </p>
        <p className="text-xs text-neutral-400 mb-8">
          Monitoreo en tiempo real
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-all hover:scale-105 shadow-lg shadow-black/20"
        >
          Abrir Dashboard
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Status badge */}
        <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-neutral-200 text-xs text-neutral-500">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Sistema activo
        </div>
      </div>
    </main>
  )
}
