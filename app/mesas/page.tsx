'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Clock, X, Eye, CheckCircle2, Utensils } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Table } from '@/lib/types'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const statusColors = {
  available: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700', label: 'Livre' },
  occupied: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700', label: 'Ocupada' },
  reserved: { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-700', label: 'Reservada' },
  cleaning: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', label: 'Limpeza' },
}

export default function MesasPage() {
  const [mounted, setMounted] = useState(false)
  const store = useStore()
  const [selected, setSelected] = useState<Table | null>(null)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <AppShell title="Mesas"><div /></AppShell>

  const { tables, orders, updateTable } = store

  const stats = {
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
  }

  const selectedOrder = selected?.currentOrderId ? orders.find(o => o.id === selected.currentOrderId) : null

  return (
    <AppShell title="Salão / Mesas" subtitle="Visualização em tempo real">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatusCard label="Livres" count={stats.available} color="green" />
          <StatusCard label="Ocupadas" count={stats.occupied} color="red" />
          <StatusCard label="Reservadas" count={stats.reserved} color="amber" />
          <StatusCard label="Em Limpeza" count={stats.cleaning} color="blue" />
        </div>

        {/* Layout */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg">Layout do Salão</h3>
              <p className="text-xs text-gray-500">Clique em uma mesa para gerenciar</p>
            </div>
            <div className="flex gap-3 text-xs">
              <Legend color="bg-green-400" label="Livre" />
              <Legend color="bg-red-400" label="Ocupada" />
              <Legend color="bg-amber-400" label="Reservada" />
              <Legend color="bg-blue-400" label="Limpeza" />
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200 min-h-[600px] overflow-auto">
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">🚪 Entrada</div>
            <div className="absolute top-4 right-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">🍳 Cozinha</div>
            <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">🚽 Banheiros</div>

            {tables.map(table => {
              const colors = statusColors[table.status]
              const order = table.currentOrderId ? orders.find(o => o.id === table.currentOrderId) : null
              return (
                <motion.button
                  key={table.id}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelected(table)}
                  style={{ left: table.x, top: table.y }}
                  className={`absolute w-32 h-32 ${colors.bg} ${colors.border} border-4 rounded-2xl flex flex-col items-center justify-center p-2 shadow-sm hover:shadow-md transition-all`}
                >
                  {table.status === 'occupied' && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                  <div className="text-3xl mb-1">🪑</div>
                  <p className={`font-bold ${colors.text}`}>Mesa {table.number}</p>
                  <p className="text-[10px] text-gray-600">{table.capacity} lugares</p>
                  <p className={`text-[10px] font-semibold ${colors.text}`}>{colors.label}</p>
                  {order && (
                    <p className="text-[9px] text-gray-700 mt-0.5 font-bold">{formatBRL(order.total)}</p>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-teal-600 to-orange-500 text-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Detalhes</p>
                    <h3 className="text-2xl font-bold">Mesa {selected.number}</h3>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{selected.capacity} lugares</span>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <p className="text-xs uppercase font-semibold text-gray-500 mb-2">Status atual</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusColors[selected.status].bg} ${statusColors[selected.status].text}`}>
                  {statusColors[selected.status].label}
                </div>

                {selectedOrder && (
                  <div className="mt-4 bg-gray-50 rounded-xl p-4">
                    <p className="text-xs uppercase font-semibold text-gray-500 mb-2">Pedido Atual #{selectedOrder.number}</p>
                    <div className="space-y-1 mb-3">
                      {selectedOrder.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>{formatBRL(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-teal-700">{formatBRL(selectedOrder.total)}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-6">
                  {selected.status !== 'available' && (
                    <button
                      onClick={() => {
                        updateTable(selected.id, { status: 'available', currentOrderId: undefined })
                        toast.success('Mesa liberada')
                        setSelected(null)
                      }}
                      className="py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 inline mr-1" /> Liberar
                    </button>
                  )}
                  {selected.status === 'available' && (
                    <button
                      onClick={() => {
                        updateTable(selected.id, { status: 'reserved' })
                        toast.success('Mesa reservada')
                        setSelected(null)
                      }}
                      className="py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-sm"
                    >
                      Reservar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      updateTable(selected.id, { status: 'cleaning' })
                      toast.success('Em limpeza')
                      setSelected(null)
                    }}
                    className="py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}

function StatusCard({ label, count, color }: { label: string; count: number; color: string }) {
  const colors: Record<string, string> = {
    green: 'from-green-500 to-emerald-600',
    red: 'from-red-500 to-rose-600',
    amber: 'from-amber-500 to-orange-600',
    blue: 'from-blue-500 to-indigo-600',
  }
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white text-lg font-bold`}>
        {count}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
        <p className="text-sm font-semibold text-gray-700">{count} mesa{count !== 1 ? 's' : ''}</p>
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-3 h-3 rounded ${color}`} />
      <span className="text-gray-600">{label}</span>
    </div>
  )
}
