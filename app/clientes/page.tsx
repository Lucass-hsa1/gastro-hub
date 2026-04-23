'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Plus, Phone, Mail, MapPin, Star, Search, X, ShoppingBag, Calendar, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Customer } from '@/lib/types'

function formatBRL(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

export default function ClientesPage() {
  const [mounted, setMounted] = useState(false)
  const store = useStore()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [detail, setDetail] = useState<Customer | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' })

  useEffect(() => setMounted(true), [])
  if (!mounted) return <AppShell title="Clientes"><div /></AppShell>

  const filtered = store.customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.totalSpent - a.totalSpent)

  const totalRev = store.customers.reduce((s, c) => s + c.totalSpent, 0)
  const avgTicket = store.customers.length > 0 ? totalRev / store.customers.reduce((s, c) => s + c.orderCount, 0) : 0
  const vipCount = store.customers.filter(c => c.tags?.includes('VIP')).length

  const submit = () => {
    if (!form.name || !form.phone) { toast.error('Nome e telefone obrigatórios'); return }
    store.addCustomer(form)
    toast.success('Cliente cadastrado!')
    setForm({ name: '', phone: '', email: '', address: '' })
    setShowAdd(false)
  }

  return (
    <AppShell title="Clientes (CRM)" subtitle={`${store.customers.length} clientes cadastrados`}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Mini label="Total" value={store.customers.length.toString()} color="teal" />
          <Mini label="VIPs" value={vipCount.toString()} color="purple" />
          <Mini label="Receita Total" value={formatBRL(totalRev)} color="green" />
          <Mini label="Ticket Médio" value={formatBRL(avgTicket)} color="orange" />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Buscar cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => {
            const isVIP = c.tags?.includes('VIP')
            return (
              <motion.div
                key={c.id}
                layout
                whileHover={{ y: -2 }}
                onClick={() => setDetail(c)}
                className="card p-5 cursor-pointer hover:shadow-md relative"
              >
                {isVIP && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                    ⭐ VIP
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{c.name}</p>
                    <p className="text-xs text-gray-500 truncate">{c.phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Pedidos</p>
                    <p className="font-bold">{c.orderCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Total gasto</p>
                    <p className="font-bold text-teal-700">{formatBRL(c.totalSpent)}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-teal-600 to-orange-500 text-white p-6 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-3">
                {detail.name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold">{detail.name}</h3>
              {detail.tags && detail.tags.length > 0 && (
                <div className="flex gap-1 justify-center mt-2">
                  {detail.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 bg-white/20 rounded-full">{t}</span>)}
                </div>
              )}
            </div>
            <div className="p-6 space-y-3">
              <InfoRow icon={<Phone />} label="Telefone" value={detail.phone} />
              {detail.email && <InfoRow icon={<Mail />} label="Email" value={detail.email} />}
              {detail.address && <InfoRow icon={<MapPin />} label="Endereço" value={detail.address} />}
              <InfoRow icon={<ShoppingBag />} label="Total de pedidos" value={`${detail.orderCount} pedidos`} />
              <InfoRow icon={<Star />} label="Total gasto" value={formatBRL(detail.totalSpent)} />
              <InfoRow icon={<Calendar />} label="Cliente desde" value={new Date(detail.createdAt).toLocaleDateString('pt-BR')} />
            </div>
            <div className="px-6 pb-6 flex gap-2">
              <button
                onClick={() => {
                  if (confirm('Excluir cliente?')) {
                    store.deleteCustomer(detail.id)
                    toast.success('Cliente removido')
                    setDetail(null)
                  }
                }}
                className="btn-secondary text-red-600 hover:bg-red-50 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
              <button onClick={() => setDetail(null)} className="btn-primary flex-1">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Novo Cliente</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input className="input" placeholder="Nome completo" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="input" placeholder="Telefone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <input className="input" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input className="input" placeholder="Endereço" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              <button onClick={submit} className="btn-primary w-full">Cadastrar</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

function Mini({ label, value, color }: any) {
  const colors: Record<string, string> = {
    teal: 'from-teal-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-amber-500',
  }
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-10 bg-gradient-to-b ${colors[color]} rounded-full`} />
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
        <div className="w-4 h-4">{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold truncate">{value}</p>
      </div>
    </div>
  )
}
