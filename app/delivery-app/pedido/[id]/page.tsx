'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Check, Clock, ChefHat, Bike, MapPin, Phone, MessageCircle,
  Star, Receipt, Home, Sparkles, CheckCircle2
} from 'lucide-react'
import { useMarketStore, type MarketOrderStatus } from '@/lib/marketplace-store'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const STATUS_FLOW: MarketOrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'on-the-way', 'delivered']

const STATUS_INFO: Record<MarketOrderStatus, { label: string; icon: any; desc: string; color: string }> = {
  pending: { label: 'Pedido recebido', icon: Receipt, desc: 'Aguardando o restaurante confirmar...', color: 'text-yellow-600' },
  confirmed: { label: 'Confirmado', icon: Check, desc: 'O restaurante aceitou seu pedido!', color: 'text-blue-600' },
  preparing: { label: 'Preparando', icon: ChefHat, desc: 'Seu pedido tá sendo preparado com carinho 👨‍🍳', color: 'text-orange-600' },
  ready: { label: 'Pronto', icon: CheckCircle2, desc: 'Pedido pronto, aguardando entregador', color: 'text-teal-600' },
  'on-the-way': { label: 'Saiu para entrega', icon: Bike, desc: '🛵 Entregador a caminho!', color: 'text-purple-600' },
  delivered: { label: 'Entregue', icon: Home, desc: 'Bom apetite! 🎉', color: 'text-emerald-600' },
  canceled: { label: 'Cancelado', icon: Clock, desc: 'Pedido cancelado', color: 'text-red-600' },
}

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params?.id || '')
  const orders = useMarketStore(s => s.orders)
  const advanceOrderStatus = useMarketStore(s => s.advanceOrderStatus)

  const [mounted, setMounted] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [rating, setRating] = useState(0)
  const [ratingSent, setRatingSent] = useState(false)

  useEffect(() => setMounted(true), [])

  const order = orders.find(o => o.id === id)

  // Auto-evolução do status pra demo
  useEffect(() => {
    if (!order || order.status === 'delivered' || order.status === 'canceled') return
    const idx = STATUS_FLOW.indexOf(order.status)
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return
    // delays curtos pra demo: 3s, 6s, 9s, 12s, 15s entre cada step
    const delays: Record<MarketOrderStatus, number> = {
      pending: 4000,
      confirmed: 5000,
      preparing: 8000,
      ready: 4000,
      'on-the-way': 8000,
      delivered: 0,
      canceled: 0,
    }
    const t = setTimeout(() => {
      advanceOrderStatus(order.id, STATUS_FLOW[idx + 1])
    }, delays[order.status])
    return () => clearTimeout(t)
  }, [order, advanceOrderStatus])

  // Modal de rating quando entrega
  useEffect(() => {
    if (order?.status === 'delivered' && !ratingSent) {
      const t = setTimeout(() => setShowRating(true), 1500)
      return () => clearTimeout(t)
    }
  }, [order?.status, ratingSent])

  if (!mounted) return null

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg font-bold mb-2">Pedido não encontrado</p>
          <Link href="/delivery-app" className="text-orange-600 font-bold text-sm">← Voltar</Link>
        </div>
      </div>
    )
  }

  const currentIdx = STATUS_FLOW.indexOf(order.status)
  const isDelivered = order.status === 'delivered'

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/delivery-app')} className="w-9 h-9 hover:bg-gray-100 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="font-extrabold">Pedido #{order.number}</h1>
            <p className="text-xs text-gray-500">{order.restaurantName}</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Status hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-5 text-white shadow-lg ${
            isDelivered
              ? 'bg-gradient-to-br from-emerald-500 to-green-600'
              : 'bg-gradient-to-br from-teal-600 to-orange-500'
          }`}
        >
          <div className="flex items-start gap-4">
            <motion.div
              key={order.status}
              initial={{ scale: 0.6, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            >
              {(() => {
                const Icon = STATUS_INFO[order.status].icon
                return <Icon className="w-8 h-8" />
              })()}
            </motion.div>
            <div className="flex-1">
              <p className="text-xs opacity-80 mb-0.5">Status do pedido</p>
              <h2 className="text-xl font-extrabold leading-tight">{STATUS_INFO[order.status].label}</h2>
              <p className="text-sm opacity-90 mt-1">{STATUS_INFO[order.status].desc}</p>
              {!isDelivered && (
                <div className="flex items-center gap-1.5 mt-3 text-sm">
                  <Clock className="w-4 h-4" />
                  <span className="font-bold">Tempo estimado: {order.estimatedTime} min</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl p-5">
          <h3 className="text-xs uppercase font-extrabold text-gray-500 mb-4">Acompanhe seu pedido</h3>
          <div className="space-y-1">
            {STATUS_FLOW.map((s, i) => {
              const info = STATUS_INFO[s]
              const Icon = info.icon
              const passed = i <= currentIdx
              const active = i === currentIdx
              return (
                <div key={s} className="flex gap-3 items-stretch">
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={false}
                      animate={{
                        scale: active ? [1, 1.1, 1] : 1,
                        backgroundColor: passed ? '#FF7A00' : '#e5e7eb',
                      }}
                      transition={{ duration: active ? 1 : 0.3, repeat: active ? Infinity : 0 }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        passed ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.div>
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={`w-0.5 flex-1 my-1 ${i < currentIdx ? 'bg-orange-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className={`font-bold text-sm ${passed ? 'text-gray-900' : 'text-gray-400'}`}>
                      {info.label}
                    </p>
                    {active && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-orange-600 font-bold">
                        Agora mesmo
                      </motion.p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Driver info quando saiu pra entrega */}
        <AnimatePresence>
          {(order.status === 'on-the-way' || order.status === 'delivered') && order.driverName && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-4">
              <h3 className="text-xs uppercase font-extrabold text-gray-500 mb-3">Entregador</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">
                  {order.driverName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{order.driverName}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Bike className="w-3 h-3" /> {order.driverVehicle}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button className="w-9 h-9 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Endereço */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-xs uppercase font-extrabold text-gray-500 mb-2">Endereço de entrega</h3>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-bold">{order.address.label}</p>
              <p className="text-gray-600">
                {order.address.street}, {order.address.number}
                {order.address.complement && ` · ${order.address.complement}`}
              </p>
              <p className="text-gray-500 text-xs">
                {order.address.neighborhood} · {order.address.city}
              </p>
            </div>
          </div>
        </div>

        {/* Itens */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-xs uppercase font-extrabold text-gray-500 mb-3">Itens do pedido</h3>
          <div className="space-y-2">
            {order.items.map(i => (
              <div key={i.dishId} className="flex items-center gap-2 text-sm">
                <span className="text-2xl">{i.emoji}</span>
                <span className="flex-1 font-medium">{i.quantity}x {i.name}</span>
                <span className="text-gray-500 text-xs">{formatBRL(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo */}
        <div className="bg-white rounded-2xl p-4 space-y-2 text-sm">
          <h3 className="text-xs uppercase font-extrabold text-gray-500 mb-2">Resumo</h3>
          <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatBRL(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Taxa de entrega</span><span>{order.deliveryFee === 0 ? <span className="text-emerald-600 font-bold">Grátis</span> : formatBRL(order.deliveryFee)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Desconto</span><span className="font-bold">-{formatBRL(order.discount)}</span></div>}
          <div className="border-t border-gray-100 pt-2 flex justify-between text-base">
            <span className="font-bold">Total</span>
            <span className="font-extrabold text-teal-700">{formatBRL(order.total)}</span>
          </div>
          <p className="text-xs text-gray-500 pt-1">
            Pago em {order.paymentMethod === 'pix' ? 'PIX' : order.paymentMethod === 'cash' ? 'Dinheiro' : order.paymentMethod === 'credit' ? 'Cartão de crédito' : 'Cartão de débito'}
            {order.paymentMethod === 'cash' && order.changeFor && ` · Troco para ${formatBRL(order.changeFor)}`}
          </p>
        </div>

        {/* Voltar pra home */}
        <Link
          href="/delivery-app"
          className="block bg-white border-2 border-gray-200 hover:border-orange-300 text-gray-700 rounded-2xl p-4 text-center text-sm font-bold transition-all"
        >
          ← Voltar para o início
        </Link>
      </div>

      {/* Modal rating */}
      <AnimatePresence>
        {showRating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowRating(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 text-center"
            >
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="font-extrabold text-xl mb-1">Como foi sua experiência?</h3>
              <p className="text-sm text-gray-500 mb-5">Sua avaliação ajuda o restaurante</p>
              <div className="flex justify-center gap-2 mb-5">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setRating(n)} className="hover:scale-110 transition-transform">
                    <Star className={`w-10 h-10 ${n <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => { setRatingSent(true); setShowRating(false) }}
                  disabled={rating === 0}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  Enviar avaliação
                </button>
                <button onClick={() => setShowRating(false)} className="w-full py-2 text-gray-500 text-sm">
                  Pular
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
