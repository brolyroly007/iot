import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Detector de Caidas IoT
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema de monitoreo en tiempo real para adultos mayores
        </p>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-gray-500">Monitoreo</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">&lt;1s</div>
              <div className="text-gray-500">Respuesta</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">2</div>
              <div className="text-gray-500">Contactos</div>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 transition"
        >
          Ir al Dashboard
        </Link>
      </div>
    </main>
  )
}
