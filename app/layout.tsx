import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Detector de Caidas - IoT',
  description: 'Sistema de monitoreo de caidas para adultos mayores',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}
