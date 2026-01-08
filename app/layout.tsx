import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FallGuard - Sistema de Deteccion de Caidas',
  description: 'Sistema IoT de monitoreo de caidas para adultos mayores en tiempo real',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  )
}
