'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Tag, Plus, X, Trash2, Percent, DollarSign, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

function formatBRL(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

export default function PromocoesPage() {
  const [mounted, setMounted] = useState(false)
  const store = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', code: '', type: 'percentage' as any, value: 0, minOrder: 0,
    validFrom: new Date().toISOString().slice(0, 10),
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    active: true,
  })

  useEffect(() => setMounted(true), [])
  if (!mounted) return <AppShell title="Promoções"><div /></AppShell>

  const submit = () => {
    if (!form.name) { toast.error('Dê um nome à promoção'); return }
    store.addPromotion({
      ...form,
      validFrom: new Date(form.validFrom).toISOString(),
      validUntil: new Date(form.validUntil).toISOString(),
    })
    toast.success('Promoção criada!')
    setForm({ name: '', code: '', type: 'percentage', value: 0, minOrder: 0,
      validFrom: new Date().toISOString().slice(0, 10),
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      active: true })
    setShowAdd(false)
  }

  const del = (id: string) => {
    if (confirm('Excluir promoção?')) {
      store.deletePromotion(id)
      toast.success('Promoção excluída')
    }
  }

  const toggle = (id: string, active: boolean) => {
    store.updatePromotion(id, { active: !active })
    toast.success(active ? 'Desativada' : 'Ativada')
  }

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    toast.success('Copiado!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const activeCount = store.promotions.filter(p => p.active).length
  const totalUses = store.promotions.reduce((s, p) => s + p.uses, 0)

  return (
    <AppShell title="Promoções e Cupons" subtitle="Ofertas e descontos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-3 gap-3 flex-1 max-w-xl">
            <div className="card p-3 flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Ativas</p>
                <p className="text-lg font-bold">{activeCount}</p>
              </div>
            </div>
            <div className="card p-3 flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Usos Totais</p>
                <p className="text-lg font-bold">{totalUses}</p>
              </div>
            </div>
            <div className="card p-3 flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Economia Gerada</p>
                <p className="text-lg font-bold">{formatBRL(totalUses * 12)}</p>
              </div>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 ml-4">
            <Plus className="w-4 h-4" /> Nova
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {store.promotions.map(p => {
            const validTo = new Date(p.validUntil)
            const daysLeft = Math.ceil((validTo.getTime() - Date.now()) / 86400000)
            return (
              <motion.div
                key={p.id}
                layout
                whileHover={{ y: -2 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 text-white p-6 shadow-md"
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <Tag className="w-8 h-8" />
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggle(p.id, p.active)}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.active ? 'bg-white/30' : 'bg-gray-900/30'}`}
                      >
                        {p.active ? '● ATIVA' : '○ INATIVA'}
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl font-black">
                      {p.type === 'percentage' ? `${p.value}%` : formatBRL(p.value)}
                    </span>
                    <span className="text-sm opacity-80">OFF</span>
                  </div>
                  {p.code && (
                    <div className="bg-white/20 backdrop-blur rounded-xl px-3 py-2 flex items-center justify-between mb-3">
                      <span className="font-mono font-bold tracking-wider">{p.code}</span>
                      <button onClick={() => copyCode(p.id, p.code!)} className="text-white">
                        {copiedId === p.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                  <div className="text-xs opacity-90 space-y-1">
                    {p.minOrder && p.minOrder > 0 && <p>Pedido mín: {formatBRL(p.minOrder)}</p>}
                    <p>
                      {daysLeft > 0 ? `Expira em ${daysLeft} dias` : 'Expirada'}
                    </p>
                    <p>{p.uses} usos{p.maxUses && ` de ${p.maxUses}`}</p>
                  </div>
                  <button onClick={() => del(p.id)} className="absolute top-0 right-0 p-1 opacity-60 hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Nova Promoção</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input className="input" placeholder="Nome da promoção" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="input font-mono" placeholder="Código (ex: PROMO10)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}>
                <option value="percentage">Percentual (%)</option>
                <option value="fixed">Valor fixo (R$)</option>
              </select>
              <input className="input" type="number" placeholder={form.type === 'percentage' ? 'Percentual' : 'Valor'} value={form.value || ''} onChange={e => setForm({ ...form, value: parseFloat(e.target.value) || 0 })} />
              <input className="input" type="number" placeholder="Pedido mínimo (R$)" value={form.minOrder || ''} onChange={e => setForm({ ...form, minOrder: parseFloat(e.target.value) || 0 })} />
              <div className="grid grid-cols-2 gap-2">
                <input className="input" type="date" value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })} />
                <input className="input" type="date" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} />
              </div>
              <button onClick={submit} className="btn-primary w-full">Criar Promoção</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
