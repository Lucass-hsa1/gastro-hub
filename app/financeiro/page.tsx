'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Plus, Download, Calendar, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'

function formatBRL(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

export default function FinanceiroPage() {
  const [mounted, setMounted] = useState(false)
  const store = useStore()
  const [showAdd, setShowAdd] = useState<'income' | 'expense' | null>(null)
  const [form, setForm] = useState({ description: '', amount: 0, category: '', paymentMethod: 'pix' as any })
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d')

  useEffect(() => setMounted(true), [])
  if (!mounted) return <AppShell title="Financeiro"><div /></AppShell>

  const now = Date.now()
  const cutoff = period === '7d' ? now - 7 * 86400000 : period === '30d' ? now - 30 * 86400000 : 0

  const transactions = store.transactions.filter(t => new Date(t.date).getTime() >= cutoff)
  const income = transactions.filter(t => t.type === 'income')
  const expense = transactions.filter(t => t.type === 'expense')

  const totalIncome = income.reduce((s, t) => s + t.amount, 0)
  const totalExpense = expense.reduce((s, t) => s + t.amount, 0)
  const profit = totalIncome - totalExpense
  const margin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0

  // Daily data
  const days = period === '7d' ? 7 : 30
  const dailyData = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    const dateStr = date.toDateString()
    const dayIncome = income.filter(t => new Date(t.date).toDateString() === dateStr).reduce((s, t) => s + t.amount, 0)
    const dayExpense = expense.filter(t => new Date(t.date).toDateString() === dateStr).reduce((s, t) => s + t.amount, 0)
    return {
      day: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      receita: Math.round(dayIncome),
      despesa: Math.round(dayExpense),
      lucro: Math.round(dayIncome - dayExpense),
    }
  })

  // Expense by category
  const expenseByCat: Record<string, number> = {}
  expense.forEach(t => {
    expenseByCat[t.category] = (expenseByCat[t.category] || 0) + t.amount
  })
  const expenseData = Object.entries(expenseByCat).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value: Math.round(value) }))

  // Payment methods
  const byPayment: Record<string, number> = {}
  income.forEach(t => {
    byPayment[t.paymentMethod] = (byPayment[t.paymentMethod] || 0) + t.amount
  })
  const paymentColors: Record<string, string> = { pix: '#10b981', credit: '#3b82f6', debit: '#8b5cf6', cash: '#f59e0b', voucher: '#ec4899' }
  const paymentLabels: Record<string, string> = { pix: 'PIX', credit: 'Crédito', debit: 'Débito', cash: 'Dinheiro', voucher: 'Voucher' }
  const paymentData = Object.entries(byPayment).map(([k, v]) => ({ name: paymentLabels[k] || k, value: Math.round(v), color: paymentColors[k] || '#94a3b8' }))

  const submit = () => {
    if (!form.description || !form.amount) { toast.error('Preencha os campos'); return }
    store.addTransaction({
      type: showAdd!,
      category: form.category || (showAdd === 'income' ? 'Outras Receitas' : 'Outras Despesas'),
      description: form.description,
      amount: form.amount,
      paymentMethod: form.paymentMethod,
      date: new Date().toISOString(),
    })
    toast.success(`${showAdd === 'income' ? 'Receita' : 'Despesa'} registrada!`)
    setForm({ description: '', amount: 0, category: '', paymentMethod: 'pix' })
    setShowAdd(null)
  }

  return (
    <AppShell title="Financeiro" subtitle="Fluxo de caixa, DRE e análises">
      <div className="space-y-6">
        {/* Period & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['7d', '30d', 'all'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  period === p ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-700'
                }`}
              >
                {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : 'Tudo'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd('income')} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Receita
            </button>
            <button onClick={() => setShowAdd('expense')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Despesa
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <BigCard
            label="Receita Total"
            value={formatBRL(totalIncome)}
            trend="+15.3%"
            color="green"
            icon={<ArrowUpRight />}
          />
          <BigCard
            label="Despesas"
            value={formatBRL(totalExpense)}
            trend="-2.1%"
            color="red"
            icon={<ArrowDownRight />}
          />
          <BigCard
            label="Lucro Líquido"
            value={formatBRL(profit)}
            trend={`Margem ${margin.toFixed(1)}%`}
            color="blue"
            icon={<Wallet />}
          />
          <BigCard
            label="Ticket Médio"
            value={formatBRL(income.length > 0 ? totalIncome / income.length : 0)}
            trend={`${income.length} pedidos`}
            color="purple"
            icon={<DollarSign />}
          />
        </div>

        {/* Cashflow Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold">Fluxo de Caixa</h3>
              <p className="text-xs text-gray-500">Receitas vs Despesas</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v: any) => formatBRL(v)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="despesa" stroke="#ef4444" strokeWidth={2} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Payment methods */}
          <div className="card p-6">
            <h3 className="font-bold mb-1">Métodos de Pagamento</h3>
            <p className="text-xs text-gray-500 mb-4">Por receita</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={paymentData} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={3}>
                  {paymentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatBRL(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {paymentData.map(p => (
                <div key={p.name} className="flex justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span>{p.name}</span>
                  </div>
                  <span className="font-semibold">{formatBRL(p.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expense categories */}
          <div className="lg:col-span-2 card p-6">
            <h3 className="font-bold mb-1">Despesas por Categoria</h3>
            <p className="text-xs text-gray-500 mb-4">Onde está indo o dinheiro</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={expenseData.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${Math.round(v / 1000)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip formatter={(v: any) => formatBRL(v)} />
                <Bar dataKey="value" fill="#FF7A00" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions list */}
        <div className="card overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <h3 className="font-bold">Últimas Transações</h3>
            <span className="text-xs text-gray-500">{transactions.length} no período</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-600">Data</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Descrição</th>
                  <th className="text-left p-3 font-semibold text-gray-600 hidden md:table-cell">Categoria</th>
                  <th className="text-left p-3 font-semibold text-gray-600 hidden md:table-cell">Pgto</th>
                  <th className="text-right p-3 font-semibold text-gray-600">Valor</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 50).map(t => (
                  <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-3 text-gray-500 text-xs whitespace-nowrap">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-3">{t.description}</td>
                    <td className="p-3 text-gray-600 hidden md:table-cell">{t.category}</td>
                    <td className="p-3 hidden md:table-cell"><span className="badge bg-gray-100 text-gray-700">{paymentLabels[t.paymentMethod] || t.paymentMethod}</span></td>
                    <td className={`p-3 text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatBRL(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Nova {showAdd === 'income' ? 'Receita' : 'Despesa'}</h3>
            <div className="space-y-3">
              <input placeholder="Descrição" className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <input placeholder="Categoria" className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              <input type="number" placeholder="Valor (R$)" className="input" value={form.amount || ''} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
              <select className="input" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value as any })}>
                <option value="pix">PIX</option>
                <option value="credit">Crédito</option>
                <option value="debit">Débito</option>
                <option value="cash">Dinheiro</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => setShowAdd(null)} className="btn-secondary flex-1">Cancelar</button>
                <button onClick={submit} className={`${showAdd === 'income' ? 'bg-green-600' : 'bg-red-600'} text-white rounded-lg font-semibold px-4 py-2 flex-1`}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

function BigCard({ label, value, trend, color, icon }: any) {
  const colors: Record<string, string> = {
    green: 'from-green-500 to-emerald-600',
    red: 'from-red-500 to-rose-600',
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-pink-600',
  }
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card p-5 relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-gray-500 font-semibold uppercase">{label}</p>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white`}>
          <div className="w-4 h-4">{icon}</div>
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{trend}</p>
    </motion.div>
  )
}

const paymentLabels: Record<string, string> = { pix: 'PIX', credit: 'Crédito', debit: 'Débito', cash: 'Dinheiro', voucher: 'Voucher' }
