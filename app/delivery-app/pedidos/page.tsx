'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Receipt, Clock, Bike, Home as HomeIcon, User as UserIcon,
  ChevronRight, Star, RotateCw, Search
} from 'lucide-react'
import { useMarketStore, type MarketOrder } from '@/lib/marketplace-store'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m atrás`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h atrás`
  const days = Math.floor(hrs / 24)
  return `${days}d atrás`
}

const statusLabel: Record<MarketOrder['status'], string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Pronto',
  'on-the-way': 'A caminho',
  delivered: 'Entregue',
  canceled: 'Cancelado',
}

const statusColor: Record<MarketOrder['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700 animate-pulse',
  ready: 'bg-teal-100 text-teal-700',
  'on-the-way': 'bg-purple-100 text-purple-700 animate-pulse',
  delivered: 'bg-emerald-100 text-emerald-700',
  canceled: 'bg-red-100 text-red-700',
}

export default function OrdersPage() {
  const router = useRouter()
  const orders = useMarketStore(s => s.orders)
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<'active' | 'history'>('active')

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const active = orders.filter(o => o.status !== 'delivered' && o.status !== 'canceled')
  const history = orders.filter(o => o.status === 'delivered' || o.status === 'canceled')
  const list = tab === 'active' ? active : history

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/delivery-app')} className="w-9 h-9 hover:bg-gray-100 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-extrabold flex items-center gap-2">
            <Receipt className="w-4 h-4 text-orange-500" /> Meus pedidos
          </h1>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-2 flex gap-1">
          <button
            onClick={() => setTab('active')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === 'active' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Em andamento ({active.length})
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === 'history' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Histórico ({history.length})
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-4">
        {list.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Receipt className="w-12 h-12 mx-auto opacity-30 mb-3" />
            <p className="font-bold mb-1">
              {tab === 'active' ? 'Nenhum pedido em andamento' : 'Nenhum pedido anterior'}
            </p>
            <p className="text-xs text-gray-500 mb-4">Que tal pedir algo agora?</p>
            <Link
              href="/delivery-app"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold"
            >
              <Search className="w-3 h-3" /> Ver restaurantes
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map(o => (
              <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Link
                  href={`/delivery-app/pedido/${o.id}`}
                  className="block bg-white rounded-2xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                      {o.restaurantLogo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{o.restaurantName}</p>
                      <p className="text-xs text-gray-500">
                        Pedido #{o.number} · {timeAgo(o.createdAt)}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${statusColor[o.status]}`}>
                      {statusLabel[o.status]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3 line-clamp-1">
                    {o.items.map(i => `${i.quantity}x ${i.name}`).join(' · ')}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="font-extrabold text-teal-700">{formatBRL(o.total)}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1 font-bold hover:text-orange-600">
                      {o.status === 'delivered' ? <><RotateCw className="w-3 h-3" /> Pedir novamente</> : <>Acompanhar <ChevronRight className="w-3 h-3" /></>}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 grid grid-cols-3 gap-1">
          <Link href="/delivery-app" className="flex flex-col items-center gap-0.5 py-2 text-gray-500 hover:text-orange-600">
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">Início</span>
          </Link>
          <Link href="/delivery-app/pedidos" className="flex flex-col items-center gap-0.5 py-2 text-orange-600">
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] font-bold">Pedidos</span>
          </Link>
          <Link href="/delivery-app/perfil" className="flex flex-col items-center gap-0.5 py-2 text-gray-500 hover:text-orange-600">
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
