'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle2, ChefHat, Truck, Utensils, X, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import type { Order, OrderStatus } from '@/lib/types'

function formatBRL(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h${mins % 60}m`
}

const statusFlow: Record<OrderStatus, { label: string; color: string; icon: any; next: OrderStatus; nextLabel: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock, next: 'preparing', nextLabel: 'Iniciar Preparo' },
  preparing: { label: 'Preparando', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: ChefHat, next: 'ready', nextLabel: 'Marcar Pronto' },
  ready: { label: 'Pronto', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle2, next: 'served', nextLabel: 'Entregar' },
  served: { label: 'Entregue', color: 'bg-teal-100 text-teal-700 border-teal-300', icon: Utensils, next: 'delivered', nextLabel: 'Fechar' },
  delivered: { label: 'Finalizado', color: 'bg-gray-100 text-gray-600 border-gray-300', icon: Truck, next: 'delivered', nextLabel: '' },
  canceled: { label: 'Cancelado', color: 'bg-red-100 text-red-600 border-red-300', icon: X, next: 'canceled', nextLabel: '' },
}

export default function ComandaPage() {
  const [mounted, setMounted] = useState(false)
  const store = useStore()
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {}, 10000) // refresh
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return <AppShell title="Comanda"><div /></AppShell>

  const activeOrders = store.orders.filter(o => o.status !== 'delivered' && o.status !== 'canceled')
  const filteredOrders = filter === 'all' ? activeOrders : store.orders.filter(o => o.status === filter)

  const columns: OrderStatus[] = ['pending', 'preparing', 'ready']

  const handleNext = (order: Order) => {
    const flow = statusFlow[order.status]
    store.updateOrderStatus(order.id, flow.next)
    toast.success(`Pedido #${order.number}: ${statusFlow[flow.next].label}`)
  }

  return (
    <AppShell title="Comanda / KDS" subtitle="Kitchen Display System - pedidos em tempo real">
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto">
            <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')} label="Ativos" count={activeOrders.length} />
            {(['pending', 'preparing', 'ready'] as OrderStatus[]).map(s => (
              <FilterBtn
                key={s}
                active={filter === s}
                onClick={() => setFilter(s)}
                label={statusFlow[s].label}
                count={store.orders.filter(o => o.status === s).length}
              />
            ))}
            <FilterBtn active={filter === 'delivered'} onClick={() => setFilter('delivered')} label="Entregues" count={store.orders.filter(o => o.status === 'delivered').length} />
          </div>
        </div>

        {/* Kanban */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {columns.map(status => {
            const orders = store.orders.filter(o => o.status === status)
            const flow = statusFlow[status]
            const Icon = flow.icon
            return (
              <div key={status} className="bg-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <h3 className="font-bold text-gray-700">{flow.label}</h3>
                    <span className="text-xs bg-white px-2 py-0.5 rounded-full font-semibold">{orders.length}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {orders.map(order => (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`card p-3 border-l-4 ${order.type === 'delivery' ? 'border-orange-500' : 'border-teal-500'}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm">#{order.number}</p>
                              {order.type === 'delivery' && <Truck className="w-3 h-3 text-orange-500" />}
                              {order.type === 'dine-in' && <Utensils className="w-3 h-3 text-teal-500" />}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {order.type === 'dine-in' ? `Mesa ${store.tables.find(t => t.id === order.tableId)?.number || '?'}` :
                               order.type === 'delivery' ? order.customerName || 'Delivery' :
                               order.type === 'counter' ? 'Balcão' : 'Retirada'}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-gray-500">{timeAgo(order.createdAt)}</span>
                        </div>

                        <div className="space-y-1 mb-3 pb-2 border-b border-gray-100">
                          {order.items.map(item => (
                            <div key={item.id} className="flex justify-between text-xs">
                              <span>
                                <span className="font-bold">{item.quantity}x</span> {item.emoji} {item.name}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-teal-700">{formatBRL(order.total)}</span>
                          {flow.next !== status && (
                            <button
                              onClick={() => handleNext(order)}
                              className="text-xs px-3 py-1.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-semibold hover:shadow-md flex items-center gap-1"
                            >
                              {flow.nextLabel}
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {orders.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-xs">
                      Nenhum pedido
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* History */}
        {filter === 'delivered' && (
          <div className="card p-4">
            <h3 className="font-bold mb-3">Pedidos Entregues Hoje</h3>
            <div className="space-y-2">
              {filteredOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-semibold">#{o.number}</span>
                    <span className="text-gray-500 ml-2">{o.customerName || o.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{timeAgo(o.updatedAt)}</span>
                    <span className="font-semibold text-teal-700">{formatBRL(o.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

function FilterBtn({ active, onClick, label, count }: any) {
  return (
    <button onClick={onClick} className={clsx(
      'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all',
      active ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow' : 'bg-white border border-gray-200 text-gray-700'
    )}>
      {label}
      <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full font-bold', active ? 'bg-white/20' : 'bg-gray-100')}>
        {count}
      </span>
    </button>
  )
}
