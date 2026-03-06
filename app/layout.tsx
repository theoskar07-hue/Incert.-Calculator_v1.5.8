import React from "react"
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'

// No importamos globals.css para no sobreescribir los estilos de la app vanilla

export const metadata: Metadata = {
  title: 'Calculadora de Incertidumbre | Metrología GUM',
  description: 'Sistema profesional de cálculo de incertidumbre de medición. Compatible con Trazable, ANAB y EMA. Múltiples equipos, magnitudes y puntos de calibración.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
