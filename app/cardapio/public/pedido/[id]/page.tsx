'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Clock, ChefHat, CheckCircle2, Truck, Utensils, ClipboardList, ArrowLeft, Hash } from 'lucide-react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const stages = [
  { key: 'pending', label: 'Recebido', icon: ClipboardList },
  { key: 'preparing', label: 'Preparando', icon: ChefHat },
  { key: 'ready', label: 'Pronto', icon: CheckCircle2 },
  { key: 'served', label: 'Entregue', icon: Utensils },
] as const

export default function OrderStatusPage() {
  const params = useParams<{ id: string }>()
  const search = useSearchParams()
  const mesa = search.get('mesa')
  const store = useStore()
  const [mounted, setMounted] = useState(false)
  const [, force] = useState(0)

  useEffect(() => {
    setMounted(true)
    const t = setInterval(() => force(n => n + 1), 5000)
    return () => clearInterval(t)
  }, [])

  if (!mounted) return null

  const order = store.orders.find(o => o.id === params.id)
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-teal-50 to-orange-50">
        <p className="text-lg font-bold text-gray-700">Pedido não encontrado</p>
        <Link href="/cardapio/public" className="mt-4 text-teal-600 underline">Voltar ao cardápio</Link>
      </div>
    )
  }

  const currentStage = order.status === 'served' || order.status === 'delivered'
    ? 'served'
    : order.status === 'canceled'
      ? 'pending'
      : order.status

  const stageIndex = stages.findIndex(s => s.key === currentStage)

  // Fila: pedidos na cozinha criados antes deste e ainda não prontos
  const queueAhead = store.orders.filter(o =>
    (o.status === 'pending' || o.status === 'preparing') &&
    new Date(o.createdAt).getTime() < new Date(order.createdAt).getTime() &&
    o.id !== order.id
  ).length

  // Tempo estimado = soma do prepTime dos itens (max) + 2min por pedido na frente
  const itemsTime = Math.max(...order.items.map(i => i.prepTime || 10), 10)
  const estimatedTotal = itemsTime + queueAhead * 2
  const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
  const remaining = Math.max(0, estimatedTotal - elapsed)

  const tableNumber = mesa || (order.tableId ? store.tables.find(t => t.id === order.tableId)?.number : null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 pb-12">
      <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-orange-500 text-white p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href={`/cardapio/public${mesa ? `?mesa=${mesa}` : ''}`} className="p-2 bg-white/20 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-xs opacity-80">Acompanhe seu pedido</p>
            <h1 className="text-lg font-bold">Pedido #{order.number}</h1>
          </div>
          {tableNumber && (
            <div className="ml-auto text-right">
              <p className="text-[10px] opacity-80 uppercase font-bold">Mesa</p>
              <p className="text-2xl font-bold">{tableNumber}</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Tempo estimado e fila */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-around text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500">Tempo estimado</p>
              <p className="text-3xl font-bold text-teal-700 mt-1">
                {currentStage === 'ready' || currentStage === 'served' ? '0' : remaining}
                <span className="text-base text-gray-400 ml-1">min</span>
              </p>
            </div>
            <div className="h-12 w-px bg-gray-200" />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500">Fila na cozinha</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Hash className="w-5 h-5 text-orange-500" />
                <p className="text-3xl font-bold text-orange-600">{queueAhead}</p>
              </div>
              <p className="text-[10px] text-gray-400">{queueAhead === 0 ? 'você é o próximo' : 'pedido(s) na frente'}</p>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            {stages.map((stage, i) => {
              const Icon = stage.icon
              const active = i <= stageIndex
              const isCurrent = i === stageIndex
              return (
                <div key={stage.key} className="flex-1 flex flex-col items-center relative">
                  {i > 0 && (
                    <div className={`absolute right-1/2 top-5 w-full h-1 -translate-y-1/2 ${
                      i <= stageIndex ? 'bg-gradient-to-r from-teal-500 to-teal-600' : 'bg-gray-200'
                    }`} />
                  )}
                  <motion.div
                    animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                      active
                        ? 'bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <p className={`text-[11px] mt-2 font-bold ${active ? 'text-teal-700' : 'text-gray-400'}`}>
                    {stage.label}
                  </p>
                </div>
              )
            })}
          </div>
          {currentStage === 'ready' && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-green-700">
                🎉 Pedido pronto! {order.type === 'dine-in' ? 'O garçom já está a caminho.' : 'Aguardando garçom retirar.'}
              </p>
            </div>
          )}
          {currentStage === 'served' && (
            <div className="mt-4 bg-teal-50 border border-teal-200 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-teal-700">✅ Bom apetite!</p>
            </div>
          )}
        </div>

        {/* Itens */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold mb-3">Seus itens</h3>
          <div className="space-y-2">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <div className="text-2xl">{item.emoji}</div>
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.quantity}x · {item.prepTime}min preparo</p>
                </div>
                <p className="font-bold">{formatBRL(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-teal-700">{formatBRL(order.total)}</span>
          </div>
        </div>

        {tableNumber && (
          <Link
            href={`/cardapio/public/comanda?mesa=${tableNumber}`}
            className="block w-full py-3 bg-white border border-teal-200 text-teal-700 rounded-xl font-bold text-center hover:bg-teal-50"
          >
            <ClipboardList className="w-4 h-4 inline mr-2" />
            Ver minha comanda completa
          </Link>
        )}
        <Link
          href={`/cardapio/public${mesa ? `?mesa=${mesa}` : ''}`}
          className="block w-full py-3 bg-gradient-to-r from-teal-600 to-orange-500 text-white rounded-xl font-bold text-center"
        >
          Pedir mais itens
        </Link>
      </div>
    </div>
  )
}
