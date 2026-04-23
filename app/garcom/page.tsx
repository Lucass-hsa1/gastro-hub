'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, ChefHat, CheckCircle2, Clock, Utensils, ClipboardList, Plus,
  CreditCard, X, Receipt, Hash, Users, ShoppingBag, FileText
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import clsx from 'clsx'
import FiscalReceiptModal from '@/components/FiscalReceiptModal'
import type { Order, PaymentMethod, FiscalReceipt } from '@/lib/types'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h${mins % 60}m`
}

const paymentMethods: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: 'pix', label: 'PIX', icon: '📱' },
  { key: 'credit', label: 'Crédito', icon: '💳' },
  { key: 'debit', label: 'Débito', icon: '💳' },
  { key: 'cash', label: 'Dinheiro', icon: '💵' },
]

export default function GarcomPage() {
  const [mounted, setMounted] = useState(false)
  const store = useStore()
  const [openTableId, setOpenTableId] = useState<string | null>(null)
  const [closingTableId, setClosingTableId] = useState<string | null>(null)
  const [issueFiscal, setIssueFiscal] = useState(true)
  const [showReceipt, setShowReceipt] = useState<FiscalReceipt | null>(null)
  const [, force] = useState(0)

  useEffect(() => {
    setMounted(true)
    const t = setInterval(() => force(n => n + 1), 5000)
    return () => clearInterval(t)
  }, [])

  if (!mounted) return <AppShell title="Garçom"><div /></AppShell>

  const tables = store.tables
  const orders = store.orders

  // Pedidos prontos (ready) por mesa
  const readyByTable = new Map<string, Order[]>()
  orders.filter(o => o.status === 'ready' && o.type === 'dine-in' && o.tableId).forEach(o => {
    const arr = readyByTable.get(o.tableId!) || []
    arr.push(o)
    readyByTable.set(o.tableId!, arr)
  })

  // Pedidos prontos para entrega no salão (lista geral)
  const allReady = orders.filter(o => o.status === 'ready')
  const readyDineIn = allReady.filter(o => o.type === 'dine-in')

  // Comandas abertas (mesas ocupadas com pedidos)
  const openComandas = tables
    .filter(t => t.status === 'occupied' || readyByTable.has(t.id))
    .map(table => {
      const tableOrders = orders.filter(o =>
        o.tableId === table.id &&
        o.type === 'dine-in' &&
        o.status !== 'delivered' &&
        o.status !== 'canceled'
      )
      const total = tableOrders.reduce((s, o) => s + o.total, 0)
      const items = tableOrders.reduce((s, o) => s + o.items.reduce((q, i) => q + i.quantity, 0), 0)
      const oldestOrder = tableOrders.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )[0]
      return { table, orders: tableOrders, total, items, oldestOrder }
    })

  const openTable = openTableId ? tables.find(t => t.id === openTableId) : null
  const openTableOrders = openTable
    ? orders.filter(o => o.tableId === openTable.id && o.type === 'dine-in' && o.status !== 'delivered' && o.status !== 'canceled')
    : []

  const closingTable = closingTableId ? tables.find(t => t.id === closingTableId) : null
  const closingOrders = closingTable
    ? orders.filter(o => o.tableId === closingTable.id && o.type === 'dine-in' && o.status !== 'delivered' && o.status !== 'canceled')
    : []
  const closingTotal = closingOrders.reduce((s, o) => s + o.total, 0)

  const deliverOrder = (order: Order) => {
    store.updateOrderStatus(order.id, 'served')
    toast.success(`Pedido #${order.number} entregue na Mesa ${tables.find(t => t.id === order.tableId)?.number}`)
  }

  const closeBill = (paymentMethod: PaymentMethod) => {
    if (!closingTable) return
    const ordersToClose = closingOrders.slice() // snapshot antes do close
    const closingTableNum = closingTable.number
    store.closeTableBill(closingTable.id, paymentMethod)

    if (issueFiscal && ordersToClose.length > 0) {
      // Cupom único agregando todos os pedidos da mesa
      const allItems = ordersToClose.flatMap(o => o.items.map(i => ({
        name: i.name, quantity: i.quantity, price: i.price, total: i.price * i.quantity
      })))
      const subtotal = ordersToClose.reduce((s, o) => s + o.subtotal, 0)
      const discount = ordersToClose.reduce((s, o) => s + o.discount, 0)
      const total = ordersToClose.reduce((s, o) => s + o.total, 0)
      const numbers = ordersToClose.map(o => `#${o.number}`).join(', ')
      const receipt = store.issueFiscalReceipt({
        orderId: ordersToClose[0].id,
        orderNumber: ordersToClose[0].number,
        customerName: ordersToClose.find(o => o.customerName)?.customerName,
        items: allItems,
        subtotal, discount, total,
        paymentMethod,
      })
      setShowReceipt(receipt)
      toast.success(`Mesa ${closingTableNum} fechada · NFC-e #${receipt.number} (${numbers})`, { icon: '🧾', duration: 3500 })
    } else {
      toast.success(`Conta fechada • Mesa ${closingTableNum} • ${paymentMethods.find(p => p.key === paymentMethod)?.label}`)
    }
    setClosingTableId(null)
    setOpenTableId(null)
  }

  return (
    <AppShell title="Garçom" subtitle="Salão · pedidos prontos · comandas abertas">
      <div className="space-y-4">
        {/* Alertas: pedidos prontos */}
        {readyDineIn.length > 0 && (
          <div className="card p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-3">
              <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                <Bell className="w-5 h-5 text-green-700" />
              </motion.div>
              <h3 className="font-bold text-green-800">
                {readyDineIn.length} pedido{readyDineIn.length > 1 ? 's' : ''} pronto{readyDineIn.length > 1 ? 's' : ''} pra entregar
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {readyDineIn.map(order => {
                const table = tables.find(t => t.id === order.tableId)
                return (
                  <div key={order.id} className="bg-white p-3 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-sm">#{order.number}</p>
                        <p className="text-lg font-bold text-teal-700">Mesa {table?.number}</p>
                      </div>
                      <span className="text-[10px] bg-green-500 text-white px-2 py-1 rounded-full font-bold animate-pulse">
                        PRONTO
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2 space-y-0.5">
                      {order.items.slice(0, 2).map(it => (
                        <p key={it.id}>• {it.quantity}x {it.name}</p>
                      ))}
                      {order.items.length > 2 && <p className="text-gray-400">+{order.items.length - 2}</p>}
                    </div>
                    <button
                      onClick={() => deliverOrder(order)}
                      className="w-full py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Entregar na mesa
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Grid de mesas + comandas abertas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Layout das mesas */}
          <div className="lg:col-span-2 card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Utensils className="w-4 h-4 text-teal-600" /> Mesas
              </h3>
              <p className="text-xs text-gray-500">Toque para gerenciar</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {tables.map(table => {
                const ready = readyByTable.get(table.id) || []
                const tOrders = orders.filter(o =>
                  o.tableId === table.id && o.type === 'dine-in' &&
                  o.status !== 'delivered' && o.status !== 'canceled'
                )
                const isOccupied = table.status === 'occupied' || tOrders.length > 0
                return (
                  <button
                    key={table.id}
                    onClick={() => setOpenTableId(table.id)}
                    className={clsx(
                      'relative p-3 rounded-xl border-2 transition-all hover:scale-[1.03]',
                      isOccupied
                        ? 'bg-red-50 border-red-300'
                        : table.status === 'reserved'
                          ? 'bg-amber-50 border-amber-300'
                          : table.status === 'cleaning'
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-green-50 border-green-300'
                    )}
                  >
                    {ready.length > 0 && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-lg"
                      >
                        {ready.length}
                      </motion.div>
                    )}
                    <div className="text-2xl mb-1">🪑</div>
                    <p className="font-bold text-sm">Mesa {table.number}</p>
                    <p className="text-[10px] text-gray-500">{table.capacity} lugares</p>
                    {tOrders.length > 0 && (
                      <p className="text-[10px] font-bold text-teal-700 mt-1">
                        {formatBRL(tOrders.reduce((s, o) => s + o.total, 0))}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Comandas abertas */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-orange-600" /> Comandas Abertas
              </h3>
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full font-bold">{openComandas.length}</span>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {openComandas.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-xs">Nenhuma comanda aberta</p>
              ) : openComandas.map(c => (
                <button
                  key={c.table.id}
                  onClick={() => setOpenTableId(c.table.id)}
                  className="w-full p-3 bg-gray-50 hover:bg-teal-50 rounded-xl text-left transition-all border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-sm">Mesa {c.table.number}</p>
                    <p className="font-bold text-teal-700 text-sm">{formatBRL(c.total)}</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>{c.items} itens · {c.orders.length} pedido{c.orders.length > 1 ? 's' : ''}</span>
                    {c.oldestOrder && <span>{timeAgo(c.oldestOrder.createdAt)}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: detalhe da mesa */}
      <AnimatePresence>
        {openTable && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOpenTableId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="bg-gradient-to-r from-teal-600 to-orange-500 text-white p-5 flex items-start justify-between">
                <div>
                  <p className="text-xs opacity-80">Comanda</p>
                  <h3 className="text-2xl font-bold">Mesa {openTable.number}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {openTable.capacity} lugares</span>
                    <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> {openTableOrders.reduce((s, o) => s + o.items.reduce((q, i) => q + i.quantity, 0), 0)} itens</span>
                  </div>
                </div>
                <button onClick={() => setOpenTableId(null)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {openTableOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <ClipboardList className="w-12 h-12 mx-auto opacity-30 mb-2" />
                    <p className="text-sm">Comanda vazia</p>
                  </div>
                ) : openTableOrders.map(o => {
                  const statusColor = {
                    pending: 'bg-yellow-100 text-yellow-700',
                    preparing: 'bg-blue-100 text-blue-700',
                    ready: 'bg-green-100 text-green-700 animate-pulse',
                    served: 'bg-teal-100 text-teal-700',
                    delivered: 'bg-gray-100 text-gray-600',
                    canceled: 'bg-red-100 text-red-700',
                  }[o.status]
                  const label = {
                    pending: 'Recebido', preparing: 'Preparando', ready: '🔔 Pronto!',
                    served: 'Entregue', delivered: 'Pago', canceled: 'Cancelado',
                  }[o.status]
                  return (
                    <div key={o.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="p-3 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">#{o.number}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColor}`}>{label}</span>
                          <span className="text-[10px] text-gray-500">{timeAgo(o.createdAt)}</span>
                        </div>
                        <p className="font-bold text-sm text-teal-700">{formatBRL(o.total)}</p>
                      </div>
                      <div className="p-3 space-y-1">
                        {o.items.map(it => (
                          <div key={it.id} className="flex items-center justify-between text-sm">
                            <span>{it.quantity}x {it.emoji} {it.name}</span>
                            <span className="text-gray-500 text-xs">{formatBRL(it.price * it.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      {o.status === 'ready' && (
                        <div className="p-2 bg-green-50 border-t border-green-100">
                          <button
                            onClick={() => deliverOrder(o)}
                            className="w-full py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Marcar entregue na mesa
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-bold text-2xl text-teal-700">
                    {formatBRL(openTableOrders.reduce((s, o) => s + o.total, 0))}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/cardapio/public?mesa=${openTable.number}&modo=garcom`}
                    className="py-2 bg-white border border-teal-300 text-teal-700 rounded-lg text-sm font-bold flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Adicionar pedido
                  </Link>
                  {openTableOrders.length > 0 ? (
                    <button
                      onClick={() => setClosingTableId(openTable.id)}
                      className="py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-1"
                    >
                      <CreditCard className="w-4 h-4" /> Fechar conta
                    </button>
                  ) : (
                    <Link
                      href={`/cardapio/public/comanda?mesa=${openTable.number}`}
                      target="_blank"
                      className="py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold flex items-center justify-center gap-1"
                    >
                      <ClipboardList className="w-4 h-4" /> Comanda cliente
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: fechar conta */}
      <AnimatePresence>
        {closingTable && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setClosingTableId(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Fechar conta · Mesa {closingTable.number}</h3>
                <button onClick={() => setClosingTableId(null)}><X className="w-5 h-5" /></button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-xs uppercase font-bold text-gray-500 mb-1">Total a cobrar</p>
                <p className="text-3xl font-bold text-teal-700">{formatBRL(closingTotal)}</p>
                <p className="text-xs text-gray-500 mt-1">{closingOrders.length} pedido(s) · {closingOrders.reduce((s, o) => s + o.items.reduce((q, i) => q + i.quantity, 0), 0)} itens</p>
              </div>

              <label className="flex items-center gap-3 p-3 bg-teal-50 border border-teal-200 rounded-xl mb-4 cursor-pointer hover:bg-teal-100 transition-colors">
                <input
                  type="checkbox"
                  checked={issueFiscal}
                  onChange={e => setIssueFiscal(e.target.checked)}
                  className="w-4 h-4 accent-teal-600"
                />
                <FileText className="w-4 h-4 text-teal-700" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-teal-800">Emitir NFC-e</p>
                  <p className="text-[10px] text-teal-700">Cupom fiscal eletrônico ao confirmar pagamento</p>
                </div>
              </label>

              <p className="text-sm font-bold mb-2">Forma de pagamento</p>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map(pm => (
                  <button
                    key={pm.key}
                    onClick={() => closeBill(pm.key)}
                    className="p-4 border-2 border-gray-200 hover:border-teal-500 hover:bg-teal-50 rounded-xl transition-all"
                  >
                    <div className="text-2xl mb-1">{pm.icon}</div>
                    <p className="text-sm font-bold">{pm.label}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cupom fiscal emitido */}
      <AnimatePresence>
        {showReceipt && (
          <FiscalReceiptModal
            receipt={showReceipt}
            onClose={() => setShowReceipt(null)}
          />
        )}
      </AnimatePresence>
    </AppShell>
  )
}
