'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Bike, Phone, Star, Plus, Edit2, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EntregadoresPage() {
  const [mounted, setMounted] = useState(false)
  const store = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', vehicle: 'moto' as 'moto' | 'bike' | 'car', plate: '' })

  useEffect(() => setMounted(true), [])
  if (!mounted) return <AppShell title="Entregadores"><div /></AppShell>

  const submit = () => {
    if (!form.name || !form.phone) { toast.error('Preencha nome e telefone'); return }
    store.addDriver({ ...form, status: 'available' })
    toast.success('Entregador cadastrado!')
    setForm({ name: '', phone: '', vehicle: 'moto', plate: '' })
    setShowAdd(false)
  }

  const toggleStatus = (id: string, current: string) => {
    const next = current === 'offline' ? 'available' : current === 'available' ? 'offline' : 'available'
    store.updateDriver(id, { status: next as any })
  }

  const del = (id: string) => {
    if (confirm('Excluir entregador?')) {
      store.deleteDriver(id)
      toast.success('Entregador removido')
    }
  }

  const available = store.drivers.filter(d => d.status === 'available').length
  const busy = store.drivers.filter(d => d.status === 'busy').length
  const offline = store.drivers.filter(d => d.status === 'offline').length

  return (
    <AppShell title="Entregadores" subtitle="Gestão de motoboys e bikers">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-3 gap-3 flex-1 max-w-2xl">
            <StatBlock label="Disponíveis" count={available} color="green" />
            <StatBlock label="Em entrega" count={busy} color="blue" />
            <StatBlock label="Offline" count={offline} color="gray" />
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {store.drivers.map(d => (
            <motion.div
              key={d.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold relative">
                  {d.name.charAt(0)}
                  <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                    d.status === 'available' ? 'bg-green-500' : d.status === 'busy' ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{d.name}</p>
                  <div className="flex items-center gap-1 text-yellow-500 text-xs mt-0.5">
                    <Star className="w-3 h-3 fill-yellow-500" />
                    <span className="font-bold">{d.rating}</span>
                    <span className="text-gray-500 ml-1">• {d.deliveriesCount} entregas</span>
                  </div>
                </div>
                <button onClick={() => del(d.id)} className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 mb-3 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{d.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bike className="w-4 h-4 text-gray-400" />
                  <span>
                    {d.vehicle === 'moto' ? '🛵 Moto' : d.vehicle === 'bike' ? '🚲 Bicicleta' : '🚗 Carro'}
                    {d.plate && ` • ${d.plate}`}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className={`badge ${
                  d.status === 'available' ? 'bg-green-100 text-green-700' :
                  d.status === 'busy' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {d.status === 'available' ? 'Disponível' : d.status === 'busy' ? 'Em entrega' : 'Offline'}
                </span>
                <button
                  onClick={() => toggleStatus(d.id, d.status)}
                  disabled={d.status === 'busy'}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                >
                  {d.status === 'offline' ? 'Colocar online' : 'Colocar offline'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Novo Entregador</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Nome completo" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" />
              <input placeholder="Telefone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" />
              <select value={form.vehicle} onChange={e => setForm({ ...form, vehicle: e.target.value as any })} className="input">
                <option value="moto">Moto 🛵</option>
                <option value="bike">Bicicleta 🚲</option>
                <option value="car">Carro 🚗</option>
              </select>
              {form.vehicle !== 'bike' && (
                <input placeholder="Placa" value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value })} className="input" />
              )}
              <button onClick={submit} className="btn-primary w-full">Cadastrar</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

function StatBlock({ label, count, color }: { label: string; count: number; color: string }) {
  const colors: Record<string, string> = {
    green: 'text-green-700 bg-green-100',
    blue: 'text-blue-700 bg-blue-100',
    gray: 'text-gray-600 bg-gray-100',
  }
  return (
    <div className="card p-3 flex items-center gap-2">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${colors[color]}`}>{count}</div>
      <span className="text-xs text-gray-600 font-semibold">{label}</span>
    </div>
  )
}
