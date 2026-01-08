import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold">FG</span>
        </div>
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">
          FallGuard
        </h1>
        <p className="text-neutral-500 mb-8">
          Detector de caidas IoT
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-2.5 bg-black text-white text-sm rounded-lg hover:bg-neutral-800 transition-colors"
        >
          Abrir Dashboard
        </Link>
      </div>
    </main>
  )
}
