'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowRight, ClipboardList, Clock, Star, MapPin, ChefHat,
  Gift, TrendingUp, History, QrCode, LogOut, Award, Flame,
  Utensils, Truck, CheckCircle2, Hash
} from 'lucide-react'
import BrandLogo from '@/components/BrandLogo'
import { useStore } from '@/lib/store'

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

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  preparing: 'bg-blue-100 text-blue-700',
  ready: 'bg-green-100 text-green-700 animate-pulse',
  served: 'bg-teal-100 text-teal-700',
  delivered: 'bg-gray-100 text-gray-600',
  canceled: 'bg-red-100 text-red-700',
}

const statusLabels = {
  pending: 'Recebido',
  preparing: 'Preparando',
  ready: 'Pronto!',
  served: 'Entregue',
  delivered: 'Finalizado',
  canceled: 'Cancelado',
}

export default function ClientePage() {
  const router = useRouter()
  const authUser = useStore(s => s.authUser)
  const logout = useStore(s => s.logout)
  const store = useStore()
  const [mounted, setMounted] = useState(false)
  const [, force] = useState(0)

  useEffect(() => {
    setMounted(true)
    const t = setInterval(() => force(n => n + 1), 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (mounted && !authUser) router.replace('/login?role=cliente')
  }, [mounted, authUser, router])

  if (!mounted || !authUser) return null

  const customerId = authUser.customerId || 'c1'
  const customer = store.customers.find(c => c.id === customerId)

  // Pedidos do cliente (filtrando por customerName como fallback)
  const myOrders = store.orders.filter(o =>
    o.customerId === customerId || o.customerName === authUser.name
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const activeOrders = myOrders.filter(o => o.status !== 'delivered' && o.status !== 'canceled')
  const historyOrders = myOrders.filter(o => o.status === 'delivered')

  const totalSpent = customer?.totalSpent || 0
  const orderCount = customer?.orderCount || 0
  const points = Math.floor(totalSpent * 2) // 2 pontos por R$1
  const level = totalSpent > 1500 ? 'Diamante' : totalSpent > 800 ? 'Ouro' : totalSpent > 300 ? 'Prata' : 'Bronze'
  const levelColor = level === 'Diamante' ? 'from-cyan-400 to-blue-600' :
                     level === 'Ouro' ? 'from-amber-400 to-orange-500' :
                     level === 'Prata' ? 'from-gray-300 to-gray-500' :
                     'from-orange-700 to-amber-900'
  const nextLevelAt = level === 'Diamante' ? null : level === 'Ouro' ? 1500 : level === 'Prata' ? 800 : 300
  const progress = nextLevelAt ? Math.min(100, (totalSpent / nextLevelAt) * 100) : 100

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 via-teal-500 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl p-1">
              <BrandLogo size={32} />
            </div>
            <div>
              <p className="text-xs opacity-80">Olá,</p>
              <p className="font-bold">{authUser.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/cardapio/public" target="_blank" className="p-2 bg-white/20 hover:bg-white/30 rounded-lg">
              <QrCode className="w-4 h-4" />
            </Link>
            <button
              onClick={() => { logout(); router.push('/') }}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Fidelidade */}
        <div className={`rounded-2xl overflow-hidden bg-gradient-to-br ${levelColor} text-white shadow-lg`}>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <p className="text-xs uppercase font-bold opacity-90">Programa Fidelidade</p>
              </div>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">Nível {level}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <p className="text-2xl font-extrabold">{points.toLocaleString('pt-BR')}</p>
                <p className="text-[10px] opacity-80 uppercase font-bold">Pontos</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold">{orderCount}</p>
                <p className="text-[10px] opacity-80 uppercase font-bold">Pedidos</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold">{formatBRL(totalSpent)}</p>
                <p className="text-[10px] opacity-80 uppercase font-bold">Total gasto</p>
              </div>
            </div>
            {nextLevelAt && (
              <div>
                <div className="flex justify-between text-[10px] mb-1 opacity-90">
                  <span>Próximo nível</span>
                  <span>{formatBRL(totalSpent)} / {formatBRL(nextLevelAt)}</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cupons / Promoções ativas */}
        {store.promotions.filter(p => p.active).length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold">Seus cupons</h3>
            </div>
            <div className="space-y-2">
              {store.promotions.filter(p => p.active).slice(0, 3).map(promo => (
                <div key={promo.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-orange-300">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{promo.name}</p>
                    <p className="text-[11px] text-gray-600">
                      {promo.type === 'percentage' ? `${promo.value}% OFF` : `${formatBRL(promo.value)} OFF`}
                      {promo.minOrder && ` · pedido mín. ${formatBRL(promo.minOrder)}`}
                    </p>
                  </div>
                  {promo.code && (
                    <code className="text-[10px] font-bold bg-white px-2 py-1 rounded border border-dashed border-orange-400 text-orange-700">
                      {promo.code}
                    </code>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pedidos ativos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-teal-600" /> Pedidos em andamento
            </h2>
            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold">
              {activeOrders.length}
            </span>
          </div>
          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center">
              <ChefHat className="w-12 h-12 mx-auto opacity-30 mb-2" />
              <p className="text-sm text-gray-500 font-bold mb-1">Nenhum pedido em andamento</p>
              <p className="text-xs text-gray-400 mb-4">Escaneie um QR Code ou peça pela web</p>
              <Link
                href="/cardapio/public"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-orange-500 text-white rounded-lg font-bold text-sm"
              >
                Ver cardápio <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map(order => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        order.type === 'delivery' ? 'bg-orange-100' : 'bg-teal-100'
                      }`}>
                        {order.type === 'delivery'
                          ? <Truck className="w-5 h-5 text-orange-600" />
                          : <Utensils className="w-5 h-5 text-teal-600" />
                        }
                      </div>
                      <div>
                        <p className="font-bold">Pedido #{order.number}</p>
                        <p className="text-xs text-gray-500">
                          {order.type === 'delivery' ? 'Delivery' : order.tableId
                            ? `Mesa ${store.tables.find(t => t.id === order.tableId)?.number}`
                            : 'Balcão'
                          } · {timeAgo(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <div className="p-4 space-y-1">
                    {order.items.slice(0, 3).map(item => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <span className="text-xl">{item.emoji}</span>
                        <span className="flex-1">{item.quantity}x {item.name}</span>
                        <span className="text-gray-500 text-xs">{formatBRL(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-gray-400">+{order.items.length - 3} itens</p>
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 flex items-center justify-between">
                    <Link
                      href={`/cardapio/public/pedido/${order.id}${order.tableId ? `?mesa=${store.tables.find(t => t.id === order.tableId)?.number}` : ''}`}
                      className="text-xs font-bold text-teal-600 flex items-center gap-1 hover:underline"
                    >
                      <Clock className="w-3 h-3" /> Acompanhar
                    </Link>
                    <p className="font-bold text-teal-700">{formatBRL(order.total)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Histórico */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-gray-600" /> Histórico
            </h2>
            <span className="text-xs text-gray-500">{historyOrders.length} pedidos</span>
          </div>
          {historyOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-sm text-gray-400">
              Nenhum pedido anterior
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {historyOrders.slice(0, 10).map((order, i) => (
                <div key={order.id} className={`p-4 flex items-center gap-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">#{order.number}</p>
                      <span className="text-[10px] text-gray-400">{timeAgo(order.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  </div>
                  <p className="font-bold text-sm text-gray-700">{formatBRL(order.total)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA rápido */}
        <Link
          href="/cardapio/public"
          className="block bg-gradient-to-r from-teal-600 to-orange-500 text-white rounded-2xl p-5 text-center hover:shadow-xl transition-all"
        >
          <QrCode className="w-8 h-8 mx-auto mb-2" />
          <p className="font-extrabold text-lg mb-1">Fazer um novo pedido</p>
          <p className="text-sm opacity-90">Delivery ou escaneie o QR da mesa</p>
        </Link>
      </div>
    </div>
  )
}
