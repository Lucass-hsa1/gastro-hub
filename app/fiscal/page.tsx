'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import FiscalReceiptModal from '@/components/FiscalReceiptModal'
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, CheckCircle2, XCircle, Clock, Search, Plus, Eye,
  TrendingUp, AlertTriangle, Filter, Calendar, FilePlus2, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import type { FiscalReceipt, FiscalStatus, PaymentMethod } from '@/lib/types'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

const statusMeta: Record<FiscalStatus, { label: string; color: string; icon: any }> = {
  autorizada: { label: 'Autorizada', color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle2 },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
  rejeitada: { label: 'Rejeitada', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: AlertTriangle },
  contingencia: { label: 'Contingência', color: 'bg-amber-100 text-amber-700 border-amber-300', icon: Clock },
}

export default function FiscalPage() {
  const [mounted, setMounted] = useState(false)
  const store = useStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FiscalStatus | 'all'>('all')
  const [selected, setSelected] = useState<FiscalReceipt | null>(null)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [showIssueFromOrder, setShowIssueFromOrder] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <AppShell title="Cupons Fiscais"><div /></AppShell>

  const receipts = store.fiscalReceipts.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !r.number.toString().includes(q) &&
        !r.accessKey.includes(q) &&
        !(r.customerName?.toLowerCase().includes(q)) &&
        !(r.orderNumber?.toString().includes(q))
      ) return false
    }
    return true
  })

  const today = new Date().toDateString()
  const stats = {
    total: store.fiscalReceipts.length,
    today: store.fiscalReceipts.filter(r => new Date(r.issuedAt).toDateString() === today).length,
    revenue: store.fiscalReceipts
      .filter(r => r.status === 'autorizada' && new Date(r.issuedAt).toDateString() === today)
      .reduce((s, r) => s + r.total, 0),
    canceled: store.fiscalReceipts.filter(r => r.status === 'cancelada').length,
  }

  const issueFromOrder = (orderId: string) => {
    const order = store.orders.find(o => o.id === orderId)
    if (!order) return
    const r = store.issueFiscalReceipt({
      orderId: order.id,
      orderNumber: order.number,
      customerName: order.customerName,
      items: order.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, total: i.price * i.quantity })),
      subtotal: order.subtotal,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.paymentMethod || 'pix',
    })
    toast.success(`NFC-e #${r.number} emitida`, { icon: '🧾' })
    setShowIssueFromOrder(false)
    setSelected(r)
  }

  const handleCancel = () => {
    if (!selected) return
    if (!cancelReason || cancelReason.length < 15) {
      toast.error('Justificativa precisa ter pelo menos 15 caracteres (regra SEFAZ)')
      return
    }
    store.cancelFiscalReceipt(selected.id, cancelReason)
    toast.success('NFC-e cancelada')
    const updated = store.fiscalReceipts.find(f => f.id === selected.id)
    setSelected(updated || null)
    setCancelReason('')
    setShowCancel(false)
  }

  // Pedidos elegíveis (delivered, sem cupom emitido)
  const eligibleOrders = store.orders
    .filter(o => o.status === 'delivered')
    .filter(o => !store.fiscalReceipts.some(f => f.orderId === o.id && f.status === 'autorizada'))
    .slice(0, 30)

  return (
    <AppShell title="Cupons Fiscais (NFC-e)" subtitle="Emissão, consulta e cancelamento de cupons fiscais eletrônicos">
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={FileText} label="Total emitidas" value={stats.total.toString()} color="from-teal-500 to-teal-700" />
          <StatCard icon={Calendar} label="Emitidas hoje" value={stats.today.toString()} color="from-blue-500 to-cyan-600" />
          <StatCard icon={TrendingUp} label="Receita fiscal hoje" value={formatBRL(stats.revenue)} color="from-green-500 to-emerald-600" />
          <StatCard icon={XCircle} label="Canceladas" value={stats.canceled.toString()} color="from-red-500 to-rose-600" />
        </div>

        {/* Toolbar */}
        <div className="card p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              placeholder="Buscar por nº, chave, cliente ou pedido..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-500"
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'autorizada', 'cancelada'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={clsx(
                  'px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap',
                  statusFilter === s
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white'
                    : 'bg-white border border-gray-200 text-gray-700'
                )}
              >
                {s === 'all' ? 'Todas' : s === 'autorizada' ? 'Autorizadas' : 'Canceladas'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowIssueFromOrder(true)}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-orange-500 text-white rounded-lg text-sm font-bold flex items-center gap-1"
          >
            <FilePlus2 className="w-4 h-4" /> Emitir NFC-e
          </button>
        </div>

        {/* Lista */}
        <div className="card overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2 bg-gray-50 text-[10px] font-bold uppercase text-gray-500 border-b border-gray-100">
            <div className="col-span-2">Nº / Série</div>
            <div className="col-span-3 hidden md:block">Chave de acesso</div>
            <div className="col-span-2 hidden sm:block">Cliente</div>
            <div className="col-span-2">Total</div>
            <div className="col-span-2">Emitido</div>
            <div className="col-span-1 text-right">—</div>
          </div>
          <div className="divide-y divide-gray-100">
            {receipts.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <FileText className="w-12 h-12 mx-auto opacity-30 mb-2" />
                <p className="text-sm font-bold mb-1">Nenhum cupom emitido</p>
                <p className="text-xs">Cupons são emitidos automaticamente ao fechar conta no PDV ou no Garçom</p>
              </div>
            ) : receipts.map(r => {
              const meta = statusMeta[r.status]
              const Icon = meta.icon
              return (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="w-full grid grid-cols-12 px-4 py-3 text-left hover:bg-teal-50 transition-colors items-center"
                >
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <div>
                        <p className="font-bold text-sm">{r.number.toString().padStart(6, '0')}</p>
                        <p className="text-[10px] text-gray-500">série {r.series} · {r.docType}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 hidden md:block">
                    <p className="font-mono text-[10px] truncate text-gray-600">{r.accessKey}</p>
                    <p className="text-[10px] text-gray-400">{r.protocol.slice(0, 18)}...</p>
                  </div>
                  <div className="col-span-2 hidden sm:block min-w-0">
                    <p className="text-sm truncate">{r.customerName || 'Consumidor não identificado'}</p>
                    {r.orderNumber && <p className="text-[10px] text-gray-500">Pedido #{r.orderNumber}</p>}
                  </div>
                  <div className="col-span-2">
                    <p className="font-bold text-teal-700">{formatBRL(r.total)}</p>
                    <p className="text-[10px] text-gray-500">{r.items.length} item{r.items.length > 1 ? 's' : ''}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs">{formatDate(r.issuedAt)}</p>
                    <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.color}`}>
                      <Icon className="w-2.5 h-2.5" /> {meta.label}
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    <Eye className="w-4 h-4 text-gray-400 inline" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Modal: ver/imprimir cupom */}
      <AnimatePresence>
        {selected && (
          <FiscalReceiptModal
            receipt={selected}
            onClose={() => setSelected(null)}
            onCancel={selected.status === 'autorizada' ? () => setShowCancel(true) : undefined}
          />
        )}
      </AnimatePresence>

      {/* Modal: cancelar */}
      <AnimatePresence>
        {showCancel && selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4"
            onClick={() => setShowCancel(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md p-6"
            >
              <h3 className="text-lg font-bold mb-2">Cancelar NFC-e #{selected.number}</h3>
              <p className="text-xs text-gray-600 mb-3">
                A SEFAZ exige justificativa com no mínimo 15 caracteres.
              </p>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Ex: Erro de digitação no valor total do cupom"
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500 mb-3"
              />
              <p className={`text-[10px] mb-3 ${cancelReason.length >= 15 ? 'text-green-600' : 'text-red-600'}`}>
                {cancelReason.length}/15 caracteres mínimos
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCancel(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-bold"
                >
                  Voltar
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-lg text-sm font-bold"
                >
                  Confirmar cancelamento
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: emitir a partir de pedido */}
      <AnimatePresence>
        {showIssueFromOrder && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowIssueFromOrder(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Emitir NFC-e</h3>
                  <p className="text-xs text-gray-500">Selecione um pedido finalizado sem cupom</p>
                </div>
                <button onClick={() => setShowIssueFromOrder(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="overflow-y-auto p-4 space-y-2">
                {eligibleOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <CheckCircle2 className="w-12 h-12 mx-auto opacity-30 mb-2" />
                    <p className="text-sm">Todos os pedidos finalizados já têm NFC-e</p>
                  </div>
                ) : eligibleOrders.map(o => (
                  <button
                    key={o.id}
                    onClick={() => issueFromOrder(o.id)}
                    className="w-full p-3 border border-gray-200 rounded-lg hover:border-teal-400 hover:bg-teal-50 text-left transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">Pedido #{o.number}</p>
                        <p className="text-[11px] text-gray-500">
                          {o.customerName || 'Consumidor'} · {o.type === 'dine-in' ? 'Salão' : o.type === 'delivery' ? 'Delivery' : 'Balcão'}
                          · {o.items.length} itens
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-teal-700">{formatBRL(o.total)}</p>
                        <p className="text-[10px] text-gray-400">{formatDate(o.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-extrabold text-gray-900 leading-tight truncate">{value}</p>
        <p className="text-[10px] text-gray-500 uppercase font-bold">{label}</p>
      </div>
    </div>
  )
}
