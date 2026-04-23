'use client'

import { useEffect, useState, Suspense } from 'react'
import { useStore } from '@/lib/store'
import { ArrowLeft, ClipboardList, Clock, ChefHat, CheckCircle2, Utensils, Plus } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m atrás`
  return `${Math.floor(mins / 60)}h${mins % 60}m atrás`
}

const statusInfo = {
  pending: { label: 'Recebido', icon: ClipboardList, color: 'bg-yellow-100 text-yellow-800' },
  preparing: { label: 'Preparando', icon: ChefHat, color: 'bg-blue-100 text-blue-800' },
  ready: { label: 'Pronto', icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
  served: { label: 'Entregue', icon: Utensils, color: 'bg-teal-100 text-teal-800' },
  delivered: { label: 'Finalizado', icon: CheckCircle2, color: 'bg-gray-100 text-gray-600' },
  canceled: { label: 'Cancelado', icon: ClipboardList, color: 'bg-red-100 text-red-600' },
}

function ComandaInner() {
  const params = useSearchParams()
  const mesaParam = params.get('mesa')
  const store = useStore()
  const [mounted, setMounted] = useState(false)
  const [, force] = useState(0)

  useEffect(() => {
    setMounted(true)
    const t = setInterval(() => force(n => n + 1), 5000)
    return () => clearInterval(t)
  }, [])

  if (!mounted) return null

  const mesaNumber = Number(mesaParam)
  const table = store.tables.find(t => t.number === mesaNumber)

  if (!table) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-teal-50 to-orange-50">
        <p className="text-lg font-bold text-gray-700">Mesa não identificada</p>
        <Link href="/cardapio/public" className="mt-4 text-teal-600 underline">Ir ao cardápio</Link>
      </div>
    )
  }

  const orders = store.orders
    .filter(o => o.tableId === table.id && o.type === 'dine-in' && o.status !== 'canceled')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const openOrders = orders.filter(o => o.status !== 'delivered')
  const total = openOrders.reduce((s, o) => s + o.total, 0)
  const itemCount = openOrders.reduce((s, o) => s + o.items.reduce((q, i) => q + i.quantity, 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 pb-32">
      <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-orange-500 text-white p-4 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href={`/cardapio/public?mesa=${mesaNumber}`} className="p-2 bg-white/20 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-xs opacity-80">Sua comanda</p>
            <h1 className="text-lg font-bold">Mesa {table.number}</h1>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] opacity-80 uppercase font-bold">Total aberto</p>
            <p className="text-xl font-bold">{formatBRL(total)}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Resumo */}
        <div className="bg-white rounded-2xl p-5 shadow-sm grid grid-cols-3 text-center divide-x divide-gray-100">
          <div>
            <p className="text-2xl font-bold text-teal-700">{openOrders.length}</p>
            <p className="text-[10px] uppercase font-bold text-gray-500">Pedidos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{itemCount}</p>
            <p className="text-[10px] uppercase font-bold text-gray-500">Itens</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{formatBRL(total)}</p>
            <p className="text-[10px] uppercase font-bold text-gray-500">Total</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500">
            <ClipboardList className="w-16 h-16 mx-auto opacity-30 mb-3" />
            <p className="font-bold mb-1">Comanda vazia</p>
            <p className="text-sm">Nenhum pedido ainda nesta mesa</p>
          </div>
        ) : (
          orders.map(order => {
            const info = statusInfo[order.status]
            const Icon = info.icon
            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">Pedido #{order.number}</p>
                    <p className="text-xs text-gray-500">{timeAgo(order.createdAt)}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${info.color}`}>
                    <Icon className="w-3 h-3" />
                    {info.label}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 text-sm">
                      <div className="text-2xl">{item.emoji}</div>
                      <div className="flex-1">
                        <p className="font-semibold">{item.quantity}x {item.name}</p>
                      </div>
                      <p className="font-bold text-gray-700">{formatBRL(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-gray-50 flex items-center justify-between">
                  <Link
                    href={`/cardapio/public/pedido/${order.id}?mesa=${mesaNumber}`}
                    className="text-xs font-bold text-teal-600 flex items-center gap-1 hover:underline"
                  >
                    <Clock className="w-3 h-3" /> Acompanhar status
                  </Link>
                  <p className="font-bold text-teal-700">{formatBRL(order.total)}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer fixo: pedir mais */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-2xl">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Link
            href={`/cardapio/public?mesa=${mesaNumber}`}
            className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-orange-500 text-white rounded-xl font-bold text-center flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Pedir mais
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ComandaPublicPage() {
  return (
    <Suspense fallback={null}>
      <ComandaInner />
    </Suspense>
  )
}
