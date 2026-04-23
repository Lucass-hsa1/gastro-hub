'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  DollarSign, ShoppingCart, Truck, Users, TrendingUp, TrendingDown,
  Clock, Package, Star, AlertTriangle, Utensils, ArrowUpRight, Calendar
} from 'lucide-react'
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const store = useStore()

  useEffect(() => setMounted(true), [])

  if (!mounted) return <AppShell title="Dashboard"><div /></AppShell>

  const { orders, deliveries, inventory, customers, transactions } = store

  // KPIs
  const today = new Date().toDateString()
  const todayIncome = transactions
    .filter(t => t.type === 'income' && new Date(t.date).toDateString() === today)
    .reduce((s, t) => s + t.amount, 0)

  const todayExpense = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === today)
    .reduce((s, t) => s + t.amount, 0)

  const activeOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length
  const activeDeliveries = deliveries.filter(d => ['pending', 'assigned', 'in-transit'].includes(d.status)).length
  const lowStock = inventory.filter(i => i.currentStock <= i.minStock).length
  const vipCustomers = customers.filter(c => c.tags?.includes('VIP')).length

  // Sales trend - last 7 days
  const salesTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toDateString()
    const total = transactions
      .filter(t => t.type === 'income' && new Date(t.date).toDateString() === dateStr)
      .reduce((s, t) => s + t.amount, 0)
    return {
      day: date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3).toUpperCase(),
      vendas: Math.round(total),
    }
  })

  // Sales by type
  const salesByType = [
    { name: 'Balcão', value: transactions.filter(t => t.category === 'Vendas Balcão').reduce((s, t) => s + t.amount, 0), color: '#0B7B8C' },
    { name: 'Delivery', value: transactions.filter(t => t.category === 'Vendas Delivery').reduce((s, t) => s + t.amount, 0), color: '#FF7A00' },
    { name: 'Salão', value: transactions.filter(t => t.category === 'Vendas Salão').reduce((s, t) => s + t.amount, 0), color: '#8b5cf6' },
  ]

  // Top items
  const itemCounts: Record<string, { name: string; count: number; total: number; emoji: string }> = {}
  orders.forEach(o => {
    o.items.forEach(item => {
      if (!itemCounts[item.menuItemId]) {
        itemCounts[item.menuItemId] = { name: item.name, count: 0, total: 0, emoji: item.emoji || '🍽️' }
      }
      itemCounts[item.menuItemId].count += item.quantity
      itemCounts[item.menuItemId].total += item.price * item.quantity
    })
  })
  const topItems = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5)

  // Hourly distribution (simulated)
  const hourlyData = Array.from({ length: 12 }, (_, i) => ({
    hora: `${11 + i}h`,
    pedidos: Math.round(3 + Math.random() * 15 + (i === 1 || i === 2 || i === 8 || i === 9 ? 10 : 0)),
  }))

  return (
    <AppShell title="Dashboard" subtitle="Visão geral do seu restaurante">
      <div className="space-y-6">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-teal-600 via-teal-500 to-orange-500 rounded-2xl p-6 text-white overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Bem-vindo de volta, Marcelo! 👋</p>
              <h2 className="text-2xl font-bold">{store.restaurant.name}</h2>
              <p className="text-white/90 text-sm mt-2">
                Hoje você teve <span className="font-bold">{formatBRL(todayIncome)}</span> em vendas
              </p>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-white/70 text-xs">Aberto</p>
              <p className="font-bold text-lg">{store.restaurant.openTime} - {store.restaurant.closeTime}</p>
              <div className="inline-flex items-center gap-1 bg-green-400/20 px-2 py-0.5 rounded-full mt-1">
                <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                <span className="text-xs font-semibold">AO VIVO</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Vendas Hoje"
            value={formatBRL(todayIncome)}
            change="+18.2%"
            trend="up"
            icon={<DollarSign />}
            gradient="from-green-500 to-emerald-600"
          />
          <KPICard
            title="Pedidos Ativos"
            value={activeOrders.toString()}
            subtitle={`${orders.length} no total`}
            icon={<ShoppingCart />}
            gradient="from-orange-500 to-amber-600"
            pulse={activeOrders > 0}
          />
          <KPICard
            title="Entregas em Rota"
            value={activeDeliveries.toString()}
            subtitle="Em andamento"
            icon={<Truck />}
            gradient="from-blue-500 to-indigo-600"
          />
          <KPICard
            title="Lucro Líquido"
            value={formatBRL(todayIncome - todayExpense)}
            change={`Despesas: ${formatBRL(todayExpense)}`}
            icon={<TrendingUp />}
            gradient="from-teal-500 to-cyan-600"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Sales Trend */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Vendas da Semana</h3>
                <p className="text-xs text-gray-500">Faturamento diário</p>
              </div>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1 bg-teal-50 text-teal-700 rounded-lg font-semibold">7 dias</button>
                <button className="text-xs px-3 py-1 text-gray-500 rounded-lg">30 dias</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B7B8C" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0B7B8C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${Math.round(v / 1000)}k`} />
                <Tooltip
                  formatter={(v: any) => formatBRL(v)}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="vendas" stroke="#0B7B8C" strokeWidth={2} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Sales by Type */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-1">Canal de Vendas</h3>
            <p className="text-xs text-gray-500 mb-4">Distribuição</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={salesByType}
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {salesByType.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => formatBRL(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {salesByType.map(s => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                    <span className="text-gray-600">{s.name}</span>
                  </div>
                  <span className="font-semibold">{formatBRL(s.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Hourly Distribution */}
          <div className="lg:col-span-2 card p-6">
            <h3 className="font-bold text-gray-900 mb-1">Movimento por Horário</h3>
            <p className="text-xs text-gray-500 mb-4">Pedidos ao longo do dia</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="hora" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="pedidos" fill="#FF7A00" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Items */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-1">Mais Pedidos</h3>
            <p className="text-xs text-gray-500 mb-4">Top 5 itens</p>
            <div className="space-y-3">
              {topItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-2xl">{item.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-orange-500 rounded-full"
                          style={{ width: `${(item.count / (topItems[0]?.count || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{item.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick alerts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AlertCard
            icon={<AlertTriangle />}
            color="amber"
            title={`${lowStock} itens com estoque baixo`}
            description="Revisar inventário"
            href="/estoque"
          />
          <AlertCard
            icon={<Star />}
            color="purple"
            title={`${vipCustomers} clientes VIP`}
            description="Engajar com promoções"
            href="/clientes"
          />
          <AlertCard
            icon={<Clock />}
            color="blue"
            title={`${activeOrders} pedidos em preparo`}
            description="Acompanhar em tempo real"
            href="/comanda"
          />
        </div>
      </div>
    </AppShell>
  )
}

function KPICard({
  title, value, change, trend, subtitle, icon, gradient, pulse,
}: {
  title: string; value: string; change?: string; trend?: 'up' | 'down';
  subtitle?: string; icon: React.ReactNode; gradient: string; pulse?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="card p-5 relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <div className={`inline-flex items-center gap-1 text-xs font-semibold mt-2 ${trend === 'up' ? 'text-green-600' : 'text-gray-600'}`}>
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {change}
            </div>
          )}
          {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white relative`}>
          {pulse && <div className="absolute inset-0 rounded-xl bg-white/30 animate-ping" />}
          <div className="relative w-5 h-5">{icon}</div>
        </div>
      </div>
    </motion.div>
  )
}

function AlertCard({
  icon, color, title, description, href,
}: { icon: React.ReactNode; color: string; title: string; description: string; href: string }) {
  const colors: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  }
  return (
    <a href={href} className={`card p-4 border flex items-center gap-3 hover:shadow-md transition-all group ${colors[color]}`}>
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
        <div className="w-5 h-5">{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{title}</p>
        <p className="text-xs opacity-70 truncate">{description}</p>
      </div>
      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  )
}
