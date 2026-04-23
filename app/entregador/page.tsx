'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bike, MapPin, Phone, Navigation, CheckCircle2, Clock, DollarSign,
  Package, TrendingUp, LogOut, Power, Star, Route, ArrowRight, AlertCircle,
  Truck, Timer, Wallet
} from 'lucide-react'
import toast from 'react-hot-toast'
import BrandLogo from '@/components/BrandLogo'
import { useStore } from '@/lib/store'
import type { Delivery } from '@/lib/types'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m atrás`
  return `${Math.floor(mins / 60)}h${mins % 60}m atrás`
}

const statusFlow = {
  assigned: { next: 'picked-up' as const, label: 'Retirar no restaurante', cta: 'Cheguei pra retirar', color: 'from-amber-500 to-orange-500' },
  'picked-up': { next: 'in-transit' as const, label: 'Pedido com você', cta: 'Sair pra entrega', color: 'from-blue-500 to-cyan-500' },
  'in-transit': { next: 'delivered' as const, label: 'A caminho do cliente', cta: 'Entregue ao cliente', color: 'from-green-500 to-emerald-600' },
}

const statusBadge = {
  pending: 'bg-gray-100 text-gray-600',
  assigned: 'bg-amber-100 text-amber-700',
  'picked-up': 'bg-blue-100 text-blue-700',
  'in-transit': 'bg-cyan-100 text-cyan-700 animate-pulse',
  delivered: 'bg-green-100 text-green-700',
  canceled: 'bg-red-100 text-red-700',
}

const statusLabel = {
  pending: 'Aguardando',
  assigned: 'Atribuída',
  'picked-up': 'Retirada',
  'in-transit': 'Em rota',
  delivered: 'Entregue',
  canceled: 'Cancelada',
}

export default function EntregadorPage() {
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
    if (mounted && (!authUser || authUser.role !== 'entregador')) {
      router.replace('/login?role=entregador')
    }
  }, [mounted, authUser, router])

  if (!mounted || !authUser) return null

  const driverId = authUser.driverId || 'd1'
  const driver = store.drivers.find(d => d.id === driverId)

  const myDeliveries = store.deliveries.filter(d => d.driverId === driverId)
  const active = myDeliveries.filter(d =>
    d.status === 'assigned' || d.status === 'picked-up' || d.status === 'in-transit'
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const today = new Date().toDateString()
  const deliveredToday = myDeliveries.filter(d =>
    d.status === 'delivered' && d.deliveredAt && new Date(d.deliveredAt).toDateString() === today
  )
  const earningsToday = deliveredToday.reduce((s, d) => s + d.deliveryFee, 0)
  // Disponíveis: pendentes sem entregador
  const available = store.deliveries.filter(d => d.status === 'pending' && !d.driverId).slice(0, 5)

  const advance = (delivery: Delivery) => {
    const flow = statusFlow[delivery.status as keyof typeof statusFlow]
    if (!flow) return
    if (flow.next === 'delivered') {
      store.updateDelivery(delivery.id, { status: 'delivered', deliveredAt: new Date().toISOString() })
      // libera entregador
      if (driver) {
        store.updateDriver(driver.id, {
          status: 'available',
          currentDeliveryId: undefined,
          deliveriesCount: driver.deliveriesCount + 1,
        })
      }
      // marca pedido como delivered
      const order = store.orders.find(o => o.id === delivery.orderId)
      if (order && order.status !== 'delivered') {
        store.updateOrderStatus(order.id, 'delivered')
      }
      toast.success(`Entregue! +${formatBRL(delivery.deliveryFee)} de comissão`, { icon: '💰' })
    } else {
      store.updateDelivery(delivery.id, { status: flow.next })
      if (flow.next === 'picked-up') toast.success('Pedido retirado', { icon: '📦' })
      else if (flow.next === 'in-transit') toast.success('A caminho!', { icon: '🛵' })
    }
  }

  const acceptDelivery = (delivery: Delivery) => {
    if (driver?.status === 'offline') {
      toast.error('Fique online primeiro')
      return
    }
    store.assignDriver(delivery.id, driverId)
    toast.success(`Entrega aceita: ${delivery.customerName}`)
  }

  const toggleOnline = () => {
    if (!driver) return
    const newStatus = driver.status === 'offline' ? 'available' : 'offline'
    store.updateDriver(driver.id, { status: newStatus })
    toast.success(newStatus === 'available' ? 'Você está online 🟢' : 'Você ficou offline')
  }

  const isOnline = driver?.status !== 'offline'

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl p-1">
              <BrandLogo size={32} />
            </div>
            <div>
              <p className="text-xs opacity-80 uppercase font-bold flex items-center gap-1">
                <Bike className="w-3 h-3" /> Entregador
              </p>
              <p className="font-bold">{authUser.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleOnline}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                isOnline ? 'bg-green-500 hover:bg-green-600' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-300'}`} />
              {isOnline ? 'Online' : 'Offline'}
            </button>
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
        {/* KPIs do dia */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPI icon={Wallet} label="Ganhos hoje" value={formatBRL(earningsToday)} color="from-green-500 to-emerald-600" />
          <KPI icon={Package} label="Entregas hoje" value={deliveredToday.length.toString()} color="from-blue-500 to-cyan-600" />
          <KPI icon={Star} label="Avaliação" value={driver?.rating.toFixed(1) || '5.0'} color="from-amber-500 to-orange-500" />
          <KPI icon={TrendingUp} label="Total entregas" value={(driver?.deliveriesCount || 0).toString()} color="from-purple-500 to-pink-500" />
        </div>

        {/* Entregas ativas */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Route className="w-4 h-4 text-cyan-600" /> Suas entregas ativas
            </h2>
            <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-bold">
              {active.length}
            </span>
          </div>
          {active.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center">
              <Truck className="w-12 h-12 mx-auto opacity-30 mb-2" />
              <p className="text-sm text-gray-500 font-bold mb-1">Nenhuma entrega ativa</p>
              <p className="text-xs text-gray-400">
                {isOnline ? 'Aguarde — novas entregas chegam em breve' : 'Fique online pra receber entregas'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {active.map(d => {
                const flow = statusFlow[d.status as keyof typeof statusFlow]
                const order = store.orders.find(o => o.id === d.orderId)
                return (
                  <motion.div
                    key={d.id}
                    layout
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 border-cyan-500"
                  >
                    <div className="p-4 flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusBadge[d.status]}`}>
                            {statusLabel[d.status]}
                          </span>
                          <span className="text-xs text-gray-500">
                            <Timer className="w-3 h-3 inline" /> {timeAgo(d.createdAt)}
                          </span>
                        </div>
                        <p className="font-bold text-base mb-1">{d.customerName}</p>
                        <div className="flex items-start gap-1 text-xs text-gray-700 mb-1">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-orange-500" />
                          <span>{d.address}{d.neighborhood && `, ${d.neighborhood}`}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-gray-500">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {d.phone}</span>
                          <span>{d.distance.toFixed(1)} km</span>
                          <span>~{d.estimatedTime}min</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Comissão</p>
                        <p className="font-extrabold text-green-600">{formatBRL(d.deliveryFee)}</p>
                      </div>
                    </div>

                    {order && (
                      <div className="px-4 pb-3 text-xs text-gray-600 bg-gray-50 py-2 border-t border-gray-100">
                        <span className="font-bold text-gray-700">Pedido #{order.number} ·</span>{' '}
                        {order.items.slice(0, 3).map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        {order.items.length > 3 && '…'}
                      </div>
                    )}

                    {flow && (
                      <div className="p-3 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-2">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.address)}`}
                          target="_blank" rel="noreferrer"
                          className="py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:border-teal-400"
                        >
                          <Navigation className="w-3 h-3" /> Rota
                        </a>
                        <button
                          onClick={() => advance(d)}
                          className={`py-2 bg-gradient-to-r ${flow.color} text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1`}
                        >
                          <CheckCircle2 className="w-3 h-3" /> {flow.cta}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Disponíveis pra aceitar */}
        {isOnline && available.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" /> Disponíveis pra aceitar
              </h2>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                {available.length}
              </span>
            </div>
            <div className="space-y-2">
              {available.map(d => (
                <div key={d.id} className="bg-white rounded-xl p-3 flex items-center gap-3 border border-orange-200">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{d.customerName}</p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {d.address} · {d.distance.toFixed(1)}km · {formatBRL(d.deliveryFee)}
                    </p>
                  </div>
                  <button
                    onClick={() => acceptDelivery(d)}
                    className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 flex-shrink-0"
                  >
                    Aceitar <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Histórico hoje */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" /> Entregas concluídas hoje
            </h2>
            <span className="text-xs text-gray-500">{deliveredToday.length}</span>
          </div>
          {deliveredToday.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-sm text-gray-400">
              Nenhuma entrega concluída ainda
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {deliveredToday.map((d, i) => (
                <div key={d.id} className={`p-4 flex items-center gap-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{d.customerName}</p>
                    <p className="text-[11px] text-gray-500 truncate">{d.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-green-600">{formatBRL(d.deliveryFee)}</p>
                    <p className="text-[10px] text-gray-400">{d.deliveredAt ? timeAgo(d.deliveredAt) : ''}</p>
                  </div>
                </div>
              ))}
              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100 flex justify-between font-bold text-sm">
                <span>Total ganho hoje</span>
                <span className="text-green-700">{formatBRL(earningsToday)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KPI({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} text-white flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-extrabold text-gray-900 leading-tight">{value}</p>
      <p className="text-[10px] text-gray-500 uppercase font-bold mt-0.5">{label}</p>
    </div>
  )
}
