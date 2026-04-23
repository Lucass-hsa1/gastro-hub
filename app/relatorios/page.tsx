'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { useStore } from '@/lib/store'
import { BarChart, Bar, LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, Users, Package, Truck, Calendar, Download } from 'lucide-react'

function formatBRL(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

export default function RelatoriosPage() {
  const [mounted, setMounted] = useState(false)
  const store = useStore()

  useEffect(() => setMounted(true), [])
  if (!mounted) return <AppShell title="Relatórios"><div /></AppShell>

  // Monthly data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date()
    month.setMonth(month.getMonth() - (11 - i))
    return {
      mes: month.toLocaleDateString('pt-BR', { month: 'short' }),
      receita: Math.round(25000 + Math.random() * 30000 + i * 2000),
      despesa: Math.round(15000 + Math.random() * 10000 + i * 500),
      clientes: Math.round(120 + Math.random() * 80 + i * 10),
    }
  })

  // Items ranking
  const itemCounts: Record<string, { name: string; qty: number; revenue: number; emoji: string }> = {}
  store.orders.forEach(o => {
    o.items.forEach(item => {
      if (!itemCounts[item.menuItemId]) {
        itemCounts[item.menuItemId] = { name: item.name, qty: 0, revenue: 0, emoji: item.emoji || '🍽️' }
      }
      itemCounts[item.menuItemId].qty += item.quantity
      itemCounts[item.menuItemId].revenue += item.price * item.quantity
    })
  })
  const topItems = Object.values(itemCounts).sort((a, b) => b.revenue - a.revenue).slice(0, 10)

  // Orders by type
  const orderTypes = [
    { name: 'Balcão', value: store.orders.filter(o => o.type === 'counter').length, color: '#0B7B8C' },
    { name: 'Mesa', value: store.orders.filter(o => o.type === 'dine-in').length, color: '#FF7A00' },
    { name: 'Delivery', value: store.orders.filter(o => o.type === 'delivery').length, color: '#8b5cf6' },
    { name: 'Retirada', value: store.orders.filter(o => o.type === 'takeout').length, color: '#10b981' },
  ].filter(o => o.value > 0)

  // Day of week performance
  const weekdayData = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => ({
    day,
    pedidos: Math.round(20 + Math.random() * 60 + (i === 5 || i === 6 ? 40 : 0)),
  }))

  return (
    <AppShell title="Relatórios e Analytics" subtitle="Insights de desempenho">
      <div className="space-y-6">
        {/* KPIs Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard label="Receita Anual" value={formatBRL(monthlyData.reduce((s, m) => s + m.receita, 0))} change="+22.4%" color="teal" />
          <SummaryCard label="Ticket Médio" value={formatBRL(62.50)} change="+4.8%" color="orange" />
          <SummaryCard label="Clientes Ativos" value={store.customers.length.toString()} change="+15 novos" color="purple" />
          <SummaryCard label="Taxa Retorno" value="38.5%" change="+2.1%" color="green" />
        </div>

        {/* Annual Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold">Desempenho Anual</h3>
              <p className="text-xs text-gray-500">Receita, despesas e clientes mensalmente</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0B7B8C" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0B7B8C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="c2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF7A00" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#FF7A00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v: any) => formatBRL(v)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Area type="monotone" dataKey="receita" name="Receita" stroke="#0B7B8C" strokeWidth={2.5} fill="url(#c1)" />
              <Area type="monotone" dataKey="despesa" name="Despesa" stroke="#FF7A00" strokeWidth={2.5} fill="url(#c2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Items */}
          <div className="card p-6">
            <h3 className="font-bold mb-1">Top 10 Itens</h3>
            <p className="text-xs text-gray-500 mb-4">Maiores vendedores por receita</p>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {topItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="text-xl">{item.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.qty} vendidos</p>
                  </div>
                  <p className="font-bold text-teal-700 text-sm">{formatBRL(item.revenue)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order types */}
          <div className="card p-6">
            <h3 className="font-bold mb-1">Pedidos por Canal</h3>
            <p className="text-xs text-gray-500 mb-4">Distribuição de vendas</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={orderTypes} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {orderTypes.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {orderTypes.map(o => (
                <div key={o.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ background: o.color }} />
                  <span className="text-gray-600">{o.name}</span>
                  <span className="font-bold ml-auto">{o.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Weekday performance */}
          <div className="card p-6">
            <h3 className="font-bold mb-1">Desempenho Semanal</h3>
            <p className="text-xs text-gray-500 mb-4">Pedidos por dia da semana</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weekdayData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="pedidos" radius={[8, 8, 0, 0]}>
                  {weekdayData.map((entry, i) => (
                    <Cell key={i} fill={i === 5 || i === 6 ? '#FF7A00' : '#0B7B8C'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Customers */}
          <div className="card p-6">
            <h3 className="font-bold mb-1">Melhores Clientes</h3>
            <p className="text-xs text-gray-500 mb-4">Por gasto total</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {store.customers.slice().sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 6).map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.orderCount} pedidos</p>
                  </div>
                  <p className="font-bold text-teal-700 text-sm">{formatBRL(c.totalSpent)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function SummaryCard({ label, value, change, color }: any) {
  const colors: Record<string, string> = {
    teal: 'from-teal-500 to-cyan-500',
    orange: 'from-orange-500 to-amber-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
  }
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500 font-semibold uppercase">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
      <div className={`inline-block text-xs mt-2 bg-gradient-to-r ${colors[color]} bg-clip-text text-transparent font-bold`}>
        {change}
      </div>
    </div>
  )
}
