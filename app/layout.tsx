import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GastroHub - Plataforma Completa para Restaurantes',
  description: 'Gestão completa: PDV, Comanda, Delivery, Financeiro, Estoque e muito mais',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
