'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChefHat, Clock, CheckCircle2, Truck, Utensils, Store as StoreIcon,
  ShoppingBag, Bell, ChevronRight, Flame, Timer
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import type { Order, OrderStatus, OrderType } from '@/lib/types'

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h${mins % 60}m`
}

// Mapping menuItemId → ingredientes (ids da inventory + qty por porção)
const recipeMap: Record<string, { id: string; qty: string }[]> = {
  m1: [{ id: 'i1', qty: '180g' }, { id: 'i2', qty: '40g' }, { id: 'i3', qty: '30g' }, { id: 'i4', qty: '2 folhas' }, { id: 'i5', qty: '50g' }, { id: 'i6', qty: '1 un' }],
  m2: [{ id: 'i1', qty: '180g' }, { id: 'i2', qty: '60g' }, { id: 'i6', qty: '1 un' }],
  m3: [{ id: 'i6', qty: '1 un' }, { id: 'i2', qty: '40g' }, { id: 'i4', qty: '2 folhas' }],
  m4: [{ id: 'i6', qty: '1 un' }, { id: 'i4', qty: '2 folhas' }, { id: 'i5', qty: '50g' }],
  m5: [{ id: 'i2', qty: '120g' }, { id: 'i5', qty: '80g' }, { id: 'i8', qty: '250g' }],
  m6: [{ id: 'i2', qty: '120g' }, { id: 'i8', qty: '250g' }],
  m7: [{ id: 'i2', qty: '160g' }, { id: 'i8', qty: '250g' }],
  m8: [{ id: 'i2', qty: '120g' }, { id: 'i8', qty: '250g' }],
  m9: [{ id: 'i1', qty: '60g' }, { id: 'i8', qty: '40g' }],
  m10: [{ id: 'i2', qty: '40g' }, { id: 'i8', qty: '40g' }],
  m11: [{ id: 'i11', qty: '200g' }, { id: 'i15', qty: '20ml' }],
  m12: [{ id: 'i13', qty: '180g' }, { id: 'i14', qty: '120g' }, { id: 'i1', qty: '80g' }],
  m13: [{ id: 'i14', qty: '120g' }, { id: 'i7', qty: '120g' }, { id: 'i2', qty: '40g' }],
  m14: [{ id: 'i12', qty: '120g' }, { id: 'i14', qty: '100g' }],
  m15: [{ id: 'i7', qty: '250g' }],
  m17: [{ id: 'i4', qty: '5 folhas' }],
  m18: [{ id: 'i9', qty: '1 un' }],
  m20: [{ id: 'i10', qty: '1 un' }],
}

const typeMeta: Record<OrderType, { label: string; icon: any; bg: string; text: string; border: string; accent: string }> = {
  'dine-in': { label: 'SALÃO', icon: Utensils, bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-500', accent: 'from-teal-500 to-teal-700' },
  'delivery': { label: 'DELIVERY', icon: Truck, bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-500', accent: 'from-orange-500 to-red-500' },
  'counter': { label: 'BALCÃO', icon: StoreIcon, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-500', accent: 'from-purple-500 to-pink-500' },
  'takeout': { label: 'RETIRADA', icon: ShoppingBag, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-500', accent: 'from-blue-500 to-indigo-500' },
}

const statusMeta = {
  pending: { label: 'Aguardando', icon: Clock, color: 'text-yellow-700' },
  preparing: { label: 'Preparando', icon: Flame, color: 'text-blue-700' },
  ready: { label: 'Pronto', icon: CheckCircle2, color: 'text-green-700' },
}

export default function CozinhaPage() {
  const [mounted, setMounted] = useState(false)
  const [typeFilter, setTypeFilter] = useState<OrderType | 'all'>('all')
  const store = useStore()
  const [, force] = useState(0)

  useEffect(() => {
    setMounted(true)
    const t = setInterval(() => force(n => n + 1), 5000)
    return () => clearInterval(t)
  }, [])

  if (!mounted) return <AppShell title="Cozinha"><div /></AppShell>

  const allActive = store.orders.filter(o =>
    o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'
  )
  const filtered = typeFilter === 'all' ? allActive : allActive.filter(o => o.type === typeFilter)

  const counts = {
    all: allActive.length,
    'dine-in': allActive.filter(o => o.type === 'dine-in').length,
    delivery: allActive.filter(o => o.type === 'delivery').length,
    counter: allActive.filter(o => o.type === 'counter').length,
    takeout: allActive.filter(o => o.type === 'takeout').length,
  }

  const columns: ('pending' | 'preparing' | 'ready')[] = ['pending', 'preparing', 'ready']

  const advance = (order: Order) => {
    const next: Record<string, OrderStatus> = { pending: 'preparing', preparing: 'ready', ready: 'served' }
    const newStatus = next[order.status]
    store.updateOrderStatus(order.id, newStatus)
    if (newStatus === 'preparing') toast.success(`#${order.number}: começou o preparo`, { icon: '🔥' })
    else if (newStatus === 'ready') toast.success(`#${order.number}: pronto! garçom notificado`, { icon: '🔔' })
  }

  const renderOrder = (order: Order) => {
    const meta = typeMeta[order.type]
    const Icon = meta.icon
    const table = order.tableId ? store.tables.find(t => t.id === order.tableId) : null
    const totalPrep = Math.max(...order.items.map(i => i.prepTime || 10), 5)
    const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
    const overtime = elapsed > totalPrep && order.status !== 'ready'

    return (
      <motion.div
        key={order.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={clsx(
          'bg-white rounded-xl border-l-8 shadow-sm overflow-hidden',
          meta.border,
          overtime && 'ring-2 ring-red-300'
        )}
      >
        {/* Header */}
        <div className={clsx('px-3 py-2 flex items-center justify-between', meta.bg)}>
          <div className="flex items-center gap-2">
            <Icon className={clsx('w-4 h-4', meta.text)} />
            <span className={clsx('text-xs font-bold tracking-wider', meta.text)}>{meta.label}</span>
            {table && <span className={clsx('text-xs font-bold', meta.text)}>· Mesa {table.number}</span>}
            {order.type === 'delivery' && order.customerName && (
              <span className="text-xs text-gray-700 font-semibold truncate max-w-[120px]">· {order.customerName}</span>
            )}
          </div>
          <span className={clsx('text-[10px] font-bold flex items-center gap-1', overtime ? 'text-red-600' : 'text-gray-500')}>
            <Timer className="w-3 h-3" /> {elapsed}/{totalPrep}min
          </span>
        </div>

        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-lg">#{order.number}</p>
            <span className="text-[10px] text-gray-400">{timeAgo(order.createdAt)}</span>
          </div>

          <div className="space-y-2 mb-3">
            {order.items.map(item => {
              const ingredients = recipeMap[item.menuItemId] || []
              return (
                <div key={item.id} className="border-l-2 border-gray-200 pl-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold">
                      {item.quantity}x {item.emoji} {item.name}
                    </span>
                    <span className="text-[10px] text-gray-400">{item.prepTime}min</span>
                  </div>
                  {ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ingredients.map((ing, idx) => {
                        const inv = store.inventory.find(i => i.id === ing.id)
                        if (!inv) return null
                        return (
                          <span key={idx} className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-medium">
                            {inv.name} <span className="text-gray-400">({ing.qty})</span>
                          </span>
                        )
                      })}
                    </div>
                  )}
                  {item.notes && (
                    <p className="text-[10px] text-orange-600 italic mt-1">⚠️ {item.notes}</p>
                  )}
                </div>
              )
            })}
          </div>

          {order.notes && (
            <p className="text-[10px] bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded mb-2">
              📝 {order.notes}
            </p>
          )}

          <button
            onClick={() => advance(order)}
            className={clsx(
              'w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 text-white shadow-sm',
              `bg-gradient-to-r ${meta.accent}`
            )}
          >
            {order.status === 'pending' && <><Flame className="w-3 h-3" /> Iniciar Preparo</>}
            {order.status === 'preparing' && <><CheckCircle2 className="w-3 h-3" /> Marcar Pronto</>}
            {order.status === 'ready' && <><Bell className="w-3 h-3" /> Notificar Garçom</>}
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <AppShell title="Cozinha (KDS)" subtitle="Pedidos em produção · ingredientes & cronômetro">
      <div className="space-y-4">
        {/* Filtros por tipo */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterBtn active={typeFilter === 'all'} onClick={() => setTypeFilter('all')} label="Todos" count={counts.all} />
          <FilterBtn active={typeFilter === 'dine-in'} onClick={() => setTypeFilter('dine-in')} label="🪑 Salão" count={counts['dine-in']} accent="teal" />
          <FilterBtn active={typeFilter === 'delivery'} onClick={() => setTypeFilter('delivery')} label="🛵 Delivery" count={counts.delivery} accent="orange" />
          <FilterBtn active={typeFilter === 'counter'} onClick={() => setTypeFilter('counter')} label="🏪 Balcão" count={counts.counter} accent="purple" />
          <FilterBtn active={typeFilter === 'takeout'} onClick={() => setTypeFilter('takeout')} label="🥡 Retirada" count={counts.takeout} accent="blue" />
        </div>

        {/* Kanban */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {columns.map(status => {
            const statusOrders = filtered.filter(o => o.status === status)
            const meta = statusMeta[status]
            const Icon = meta.icon
            return (
              <div key={status} className="bg-gray-50 rounded-2xl p-3 min-h-[400px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <Icon className={clsx('w-4 h-4', meta.color)} />
                    <h3 className={clsx('font-bold', meta.color)}>{meta.label}</h3>
                    <span className="text-xs bg-white px-2 py-0.5 rounded-full font-bold">{statusOrders.length}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <AnimatePresence>
                    {statusOrders.map(renderOrder)}
                  </AnimatePresence>
                  {statusOrders.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-xs">
                      <ChefHat className="w-10 h-10 mx-auto opacity-30 mb-2" />
                      Nenhum pedido
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}

function FilterBtn({ active, onClick, label, count, accent }: { active: boolean; onClick: () => void; label: string; count: number; accent?: string }) {
  const accentClasses: Record<string, string> = {
    teal: 'from-teal-600 to-teal-700',
    orange: 'from-orange-500 to-red-500',
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-indigo-500',
  }
  const gradient = accent ? accentClasses[accent] : 'from-gray-700 to-gray-900'
  return (
    <button onClick={onClick} className={clsx(
      'px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm',
      active ? `bg-gradient-to-r ${gradient} text-white shadow` : 'bg-white border border-gray-200 text-gray-700'
    )}>
      {label}
      <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full font-bold', active ? 'bg-white/20' : 'bg-gray-100')}>
        {count}
      </span>
    </button>
  )
}
