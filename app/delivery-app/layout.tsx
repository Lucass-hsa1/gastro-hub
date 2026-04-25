import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GastroHub Delivery — peça do seu restaurante favorito',
  description: 'Marketplace de delivery: pizza, hambúrguer, japonês, açaí e muito mais.',
}

export default function DeliveryAppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
