'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Plus, Phone, Mail, Calendar, Briefcase, X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

function formatBRL(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

const roleLabels = {
  manager: 'Gerente', waiter: 'Garçom', cashier: 'Caixa', cook: 'Cozinheiro', delivery: 'Entregador', admin: 'Administrador'
}
const roleColors: Record<string, string> = {
  manager: 'from-purple-500 to-pink-500',
  waiter: 'from-teal-500 to-cyan-500',
  cashier: 'from-blue-500 to-indigo-500',
  cook: 'from-orange-500 to-red-500',
  delivery: 'from-green-500 to-emerald-500',
  admin: 'from-gray-700 to-gray-900',
}
const shiftLabels = { morning: 'Manhã', afternoon: 'Tarde', night: 'Noite', full: 'Integral' }

export default function FuncionariosPage() {
  const [mounted, setMounted] = useState(false)
  const store = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    name: '', role: 'waiter' as any, phone: '', email: '', salary: 0, shift: 'full' as any, status: 'active' as any,
  })

  useEffect(() => setMounted(true), [])
  if (!mounted) return <AppShell title="Funcionários"><div /></AppShell>

  const totalFolha = store.employees.filter(e => e.status === 'active').reduce((s, e) => s + e.salary, 0)

  const submit = () => {
    if (!form.name || !form.phone) { toast.error('Preencha nome e telefone'); return }
    store.addEmployee(form)
    toast.success('Funcionário cadastrado!')
    setForm({ name: '', role: 'waiter', phone: '', email: '', salary: 0, shift: 'full', status: 'active' })
    setShowAdd(false)
  }

  const del = (id: string) => {
    if (confirm('Remover funcionário?')) {
      store.deleteEmployee(id)
      toast.success('Removido')
    }
  }

  return (
    <AppShell title="Funcionários" subtitle={`${store.employees.length} funcionários • Folha: ${formatBRL(totalFolha)}/mês`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1 max-w-3xl">
            <StatBox label="Total" value={store.employees.length.toString()} icon="👥" />
            <StatBox label="Ativos" value={store.employees.filter(e => e.status === 'active').length.toString()} icon="✅" />
            <StatBox label="Em Férias" value={store.employees.filter(e => e.status === 'vacation').length.toString()} icon="🏖️" />
            <StatBox label="Folha Mensal" value={formatBRL(totalFolha)} icon="💰" />
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 ml-4">
            <Plus className="w-4 h-4" /> Novo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {store.employees.map(e => (
            <motion.div
              key={e.id}
              layout
              whileHover={{ y: -2 }}
              className="card p-5 relative group"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${roleColors[e.role]} rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
                  {e.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{e.name}</p>
                  <p className="text-xs text-gray-500">{roleLabels[e.role]}</p>
                  <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    e.status === 'active' ? 'bg-green-100 text-green-700' :
                    e.status === 'vacation' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {e.status === 'active' ? 'Ativo' : e.status === 'vacation' ? 'Férias' : 'Inativo'}
                  </span>
                </div>
                <button onClick={() => del(e.id)} className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-3 h-3" />
                  {e.phone}
                </div>
                {e.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{e.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-3 h-3" />
                  Turno: {shiftLabels[e.shift]}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Salário</span>
                <span className="font-bold text-teal-700">{formatBRL(e.salary)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Novo Funcionário</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input className="input" placeholder="Nome completo" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value as any })}>
                {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input className="input" placeholder="Telefone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <input className="input" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input className="input" type="number" placeholder="Salário" value={form.salary || ''} onChange={e => setForm({ ...form, salary: parseFloat(e.target.value) || 0 })} />
              <select className="input" value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value as any })}>
                <option value="morning">Manhã</option>
                <option value="afternoon">Tarde</option>
                <option value="night">Noite</option>
                <option value="full">Integral</option>
              </select>
              <button onClick={submit} className="btn-primary w-full">Cadastrar</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

function StatBox({ label, value, icon }: any) {
  return (
    <div className="card p-3 flex items-center gap-2">
      <div className="text-2xl">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-semibold">{label}</p>
        <p className="text-base font-bold truncate">{value}</p>
      </div>
    </div>
  )
}
