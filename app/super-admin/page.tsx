'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ShieldCheck, TrendingUp, TrendingDown, DollarSign, Users, ShoppingBag,
  Store, MapPin, Activity, AlertTriangle, LogOut, Settings, Search,
  CheckCircle2, XCircle, Plus, ArrowRight, Clock, Star, Zap
} from 'lucide-react'
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid, Legend
} from 'recharts'
import BrandLogo from '@/components/BrandLogo'
import { useStore } from '@/lib/store'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Lista mockada de restaurantes (multi-unidade)
const restaurants = [
  {
    id: 'r1', name: 'GastroHub Paulista', city: 'São Paulo · SP', address: 'Av. Paulista, 1500',
    status: 'active', monthlyRevenue: 285400, employees: 24, tables: 18, orders30d: 1840,
    plan: 'Enterprise', rating: 4.8, cover: 'from-teal-500 to-orange-500', isMain: true,
  },
  {
    id: 'r2', name: 'GastroHub Pinheiros', city: 'São Paulo · SP', address: 'Rua dos Pinheiros, 450',
    status: 'active', monthlyRevenue: 198700, employees: 16, tables: 12, orders30d: 1420,
    plan: 'Pro', rating: 4.7, cover: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'r3', name: 'GastroHub Jardins', city: 'São Paulo · SP', address: 'Alameda Santos, 200',
    status: 'active', monthlyRevenue: 342100, employees: 30, tables: 22, orders30d: 2180,
    plan: 'Enterprise', rating: 4.9, cover: 'from-pink-500 to-rose-500',
  },
  {
    id: 'r4', name: 'GastroHub Moema', city: 'São Paulo · SP', address: 'Av. Ibirapuera, 800',
    status: 'onboarding', monthlyRevenue: 45200, employees: 8, tables: 10, orders30d: 340,
    plan: 'Starter', rating: 4.5, cover: 'from-green-500 to-emerald-500',
  },
  {
    id: 'r5', name: 'GastroHub Rio', city: 'Rio de Janeiro · RJ', address: 'Av. Atlântica, 2000',
    status: 'active', monthlyRevenue: 267300, employees: 21, tables: 20, orders30d: 1680,
    plan: 'Pro', rating: 4.6, cover: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'r6', name: 'GastroHub BH', city: 'Belo Horizonte · MG', address: 'Av. Afonso Pena, 1100',
    status: 'inactive', monthlyRevenue: 0, employees: 0, tables: 15, orders30d: 0,
    plan: 'Pausado', rating: 4.4, cover: 'from-gray-400 to-gray-600',
  },
]

const networkTrend = Array.from({ length: 12 }, (_, i) => {
  const base = 850000
  const variance = Math.sin(i / 2) * 120000
  return {
    month: new Date(2026, i, 1).toLocaleDateString('pt-BR', { month: 'short' }),
    receita: Math.round(base + variance + i * 8000),
    pedidos: Math.round(6500 + Math.cos(i / 3) * 1200 + i * 80),
  }
})

export default function SuperAdminPage() {
  const router = useRouter()
  const authUser = useStore(s => s.authUser)
  const logout = useStore(s => s.logout)
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'onboarding' | 'inactive'>('all')

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (mounted && (!authUser || authUser.role !== 'super-admin')) {
      router.replace('/login?role=super-admin')
    }
  }, [mounted, authUser, router])

  if (!mounted || !authUser) return null

  const filtered = restaurants.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.city.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Totais da rede
  const totalRevenue = restaurants.reduce((s, r) => s + r.monthlyRevenue, 0)
  const totalEmployees = restaurants.reduce((s, r) => s + r.employees, 0)
  const totalOrders = restaurants.reduce((s, r) => s + r.orders30d, 0)
  const activeCount = restaurants.filter(r => r.status === 'active').length
  const avgRating = restaurants.filter(r => r.rating).reduce((s, r) => s + r.rating, 0) / restaurants.filter(r => r.rating).length

  // Top 5 por receita
  const topRest = [...restaurants].sort((a, b) => b.monthlyRevenue - a.monthlyRevenue).slice(0, 5)

  // Planos
  const planCounts = restaurants.reduce((acc, r) => {
    acc[r.plan] = (acc[r.plan] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl p-1">
              <BrandLogo size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <p className="text-xs opacity-90 uppercase font-bold">Super Admin</p>
              </div>
              <p className="text-lg font-bold">Rede GastroHub</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold">
              Landing
            </Link>
            <button
              onClick={() => { logout(); router.push('/') }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* KPIs da rede */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KPI icon={DollarSign} label="Receita mensal rede" value={formatBRL(totalRevenue)} change="+12.4%" positive color="from-green-500 to-emerald-600" />
          <KPI icon={Store} label="Unidades ativas" value={`${activeCount}/${restaurants.length}`} change="+2 no mês" positive color="from-teal-500 to-cyan-600" />
          <KPI icon={ShoppingBag} label="Pedidos 30 dias" value={totalOrders.toLocaleString('pt-BR')} change="+8.7%" positive color="from-orange-500 to-red-500" />
          <KPI icon={Users} label="Funcionários" value={totalEmployees.toString()} change="+5" positive color="from-indigo-500 to-purple-500" />
          <KPI icon={Star} label="Avaliação média" value={avgRating.toFixed(1)} change="+0.2" positive color="from-amber-500 to-yellow-500" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold">Receita & pedidos · últimos 12 meses</h3>
                <p className="text-xs text-gray-500">Consolidado de todas as unidades</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                <TrendingUp className="w-3 h-3" /> +18% YoY
              </span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={networkTrend}>
                <defs>
                  <linearGradient id="gReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B7B8C" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#0B7B8C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPedidos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF7A00" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#FF7A00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" style={{ fontSize: 11 }} />
                <YAxis yAxisId="left" style={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" style={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number, n: string) => n === 'receita' ? formatBRL(v) : v.toLocaleString('pt-BR')} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="receita" stroke="#0B7B8C" fill="url(#gReceita)" name="Receita" />
                <Area yAxisId="right" type="monotone" dataKey="pedidos" stroke="#FF7A00" fill="url(#gPedidos)" name="Pedidos" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold mb-4">Top 5 unidades · receita</h3>
            <div className="space-y-3">
              {topRest.map((r, i) => {
                const pct = (r.monthlyRevenue / topRest[0].monthlyRevenue) * 100
                return (
                  <div key={r.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold">#{i + 1} {r.name.replace('GastroHub ', '')}</span>
                      <span className="font-bold text-teal-700">{formatBRL(r.monthlyRevenue)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 mb-2">Distribuição por plano</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(planCounts).map(([plan, count]) => (
                  <div key={plan} className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg text-xs font-bold">
                    {plan} <span className="text-teal-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Restaurantes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Store className="w-5 h-5 text-teal-600" /> Unidades da rede
              <span className="text-sm font-normal text-gray-500">({filtered.length})</span>
            </h2>
            <button className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-orange-500 text-white rounded-lg text-xs font-bold flex items-center gap-1">
              <Plus className="w-3 h-3" /> Nova unidade
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                placeholder="Buscar unidade ou cidade..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-500 bg-white"
              />
            </div>
            <div className="flex gap-1">
              {(['all', 'active', 'onboarding', 'inactive'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold ${
                    statusFilter === s
                      ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white'
                      : 'bg-white border border-gray-200 text-gray-700'
                  }`}
                >
                  {s === 'all' ? 'Todas' : s === 'active' ? 'Ativas' : s === 'onboarding' ? 'Onboarding' : 'Inativas'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className={`h-24 bg-gradient-to-br ${r.cover} p-4 flex items-start justify-between text-white relative`}>
                  <div>
                    <div className="flex items-center gap-1 text-xs opacity-90">
                      <MapPin className="w-3 h-3" /> {r.city}
                    </div>
                    <p className="font-extrabold text-lg leading-tight mt-0.5">{r.name}</p>
                  </div>
                  {r.isMain && (
                    <span className="text-[9px] bg-white/30 backdrop-blur px-2 py-0.5 rounded-full font-bold">MATRIZ</span>
                  )}
                  <div className="absolute bottom-2 right-3 text-[10px] opacity-90">{r.address}</div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <StatusPill status={r.status} />
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{r.plan}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div>
                      <p className="text-sm font-bold text-teal-700">{formatBRL(r.monthlyRevenue).replace('R$', '').trim()}</p>
                      <p className="text-[9px] uppercase text-gray-500 font-bold">Receita/mês</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-orange-600">{r.orders30d.toLocaleString('pt-BR')}</p>
                      <p className="text-[9px] uppercase text-gray-500 font-bold">Pedidos 30d</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{r.employees}</p>
                      <p className="text-[9px] uppercase text-gray-500 font-bold">Funcion.</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold">{r.rating}</span>
                    </div>
                    {r.isMain ? (
                      <Link href="/painel" className="text-xs font-bold text-teal-600 flex items-center gap-1 hover:underline">
                        Abrir painel <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Ver detalhes
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminTile icon={Users} title="Gestão de franqueados" desc="14 franqueados ativos, 2 em onboarding" />
          <AdminTile icon={Settings} title="Configurações da rede" desc="Integrações, fiscais, white-label" />
          <AdminTile icon={AlertTriangle} title="Alertas globais" desc="3 unidades com estoque crítico" accent="red" />
        </div>
      </div>
    </div>
  )
}

function KPI({ icon: Icon, label, value, change, positive, color }: any) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} text-white flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
        {change && (
          <span className={`text-[10px] font-bold flex items-center gap-0.5 ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {change}
          </span>
        )}
      </div>
      <p className="text-xl font-extrabold text-gray-900 leading-tight">{value}</p>
      <p className="text-[10px] text-gray-500 uppercase font-bold mt-0.5">{label}</p>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const meta = {
    active: { label: 'Ativa', icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
    onboarding: { label: 'Onboarding', icon: Clock, color: 'bg-amber-100 text-amber-700' },
    inactive: { label: 'Inativa', icon: XCircle, color: 'bg-gray-100 text-gray-600' },
  }[status] || { label: status, icon: Activity, color: 'bg-gray-100 text-gray-600' }
  const Icon = meta.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.color}`}>
      <Icon className="w-2.5 h-2.5" /> {meta.label}
    </span>
  )
}

function AdminTile({ icon: Icon, title, desc, accent }: any) {
  const color = accent === 'red' ? 'from-red-500 to-orange-500' : 'from-teal-500 to-cyan-600'
  return (
    <button className="text-left bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} text-white flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-xs text-gray-500">{desc}</p>
      <span className="text-xs font-bold text-teal-600 flex items-center gap-1 mt-2 group-hover:gap-2 transition-all">
        Abrir <ArrowRight className="w-3 h-3" />
      </span>
    </button>
  )
}
