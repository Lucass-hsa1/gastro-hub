import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GastroHub - Delivery & Gerenciamento',
  description: 'Plataforma completa para restaurantes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
