'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ShieldCheck, TrendingUp, TrendingDown, DollarSign, Users, ShoppingBag,
  Store, MapPin, Activity, AlertTriangle, LogOut, Settings, Search,
  CheckCircle2, XCircle, Plus, ArrowRight, Clock, Star, Zap, Sparkles,
  Building2, Receipt, Percent, BarChart3, Calendar, Globe2, Crown
} from 'lucide-react'
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid, Legend, PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import BrandLogo from '@/components/BrandLogo'
import { useStore } from '@/lib/store'
import {
  PLATFORM_CONFIG,
  platformRestaurants,
  platformMetrics,
  dailyRevenueSeries,
  planDistribution,
  topRestaurantsByGMV,
  stateDistribution,
  restaurantGrowth,
  totalGMV,
  totalRevenue,
  dailyGMV,
  type PlatformRestaurant,
} from '@/lib/super-admin-data'
import { restaurantBannerUrl } from '@/lib/food-images'

function fmtBRL(v: number, opts?: { compact?: boolean }) {
  if (opts?.compact) {
    if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2).replace('.', ',')}M`
    if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(1).replace('.', ',')}k`
  }
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmt(v: number, opts?: { compact?: boolean }) {
  if (opts?.compact && v >= 1_000) return `${(v / 1_000).toFixed(1).replace('.', ',')}k`
  return v.toLocaleString('pt-BR')
}

const PLAN_COLORS = { Starter: '#06b6d4', Pro: '#FF7A00', Enterprise: '#a855f7' }

export default function SuperAdminPage() {
  const router = useRouter()
  const authUser = useStore(s => s.authUser)
  const logout = useStore(s => s.logout)
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'onboarding' | 'trial' | 'churned'>('all')
  const [planFilter, setPlanFilter] = useState<'all' | 'Starter' | 'Pro' | 'Enterprise'>('all')

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (mounted && (!authUser || authUser.role !== 'super-admin')) {
      router.replace('/login?role=super-admin')
    }
  }, [mounted, authUser, router])

  const filtered = useMemo(() => {
    return platformRestaurants.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (planFilter !== 'all' && r.plan !== planFilter) return false
      if (search) {
        const s = search.toLowerCase()
        if (!r.name.toLowerCase().includes(s) && !r.city.toLowerCase().includes(s) && !r.cuisine.toLowerCase().includes(s)) return false
      }
      return true
    })
  }, [search, statusFilter, planFilter])

  if (!mounted || !authUser) return null

  const m = platformMetrics

  return (
    <div className="min-h-screen bg-[#0E1116] text-white">
      {/* Header dark premium */}
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 mesh-dark opacity-90" />
        <div className="absolute -top-12 -right-12 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-12 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-2xl p-1.5 shadow-xl">
              <BrandLogo size={36} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" /> SUPER ADMIN
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-bold">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full live-dot" /> AO VIVO
                </span>
              </div>
              <p className="text-xl font-display">Plataforma GastroHub</p>
              <p className="text-xs text-purple-200/80">
                {PLATFORM_CONFIG.platformDays} dias operando · {m.activeRestaurants} restaurantes ativos · MRR {fmtBRL(m.mrr, { compact: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold ring-1 ring-white/10">
              Landing
            </Link>
            <button
              onClick={() => { logout(); router.push('/') }}
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl ring-1 ring-white/10"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* KPIs principais — receita SaaS */}
        <div>
          <div className="flex items-end justify-between mb-3">
            <div>
              <h2 className="font-display text-2xl">📊 Receita da plataforma</h2>
              <p className="text-xs text-gray-400">
                Modelo: <span className="font-bold text-orange-300">R$ {PLATFORM_CONFIG.monthlyFee.toFixed(2).replace('.', ',')} mensalidade</span> + <span className="font-bold text-orange-300">{(PLATFORM_CONFIG.takeRate * 100).toFixed(0)}%</span> sobre cada pedido
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPI
              icon={DollarSign}
              label={`Receita acumulada · ${PLATFORM_CONFIG.platformDays}d`}
              value={fmtBRL(m.totalRevAccum, { compact: true })}
              sub={`${fmtBRL(m.takeAccum, { compact: true })} take + ${fmtBRL(m.feesAccum, { compact: true })} mensalidades`}
              color="from-emerald-500 to-teal-500"
              big
            />
            <KPI
              icon={TrendingUp}
              label="MRR atual"
              value={fmtBRL(m.mrr, { compact: true })}
              sub={`ARR projetado: ${fmtBRL(m.arr, { compact: true })}`}
              color="from-orange-500 to-pink-500"
              big
            />
            <KPI
              icon={ShoppingBag}
              label="GMV processado"
              value={fmtBRL(m.gmvAccum, { compact: true })}
              sub={`${fmt(m.totalOrders, { compact: true })} pedidos · ticket médio ${fmtBRL(m.avgTicket)}`}
              color="from-violet-500 to-fuchsia-500"
              big
            />
            <KPI
              icon={Building2}
              label="Restaurantes na plataforma"
              value={`${m.activeRestaurants} / ${m.restaurants}`}
              sub={`Churn ${m.churnRate.toFixed(1)}% · ${m.churned} cancelaram`}
              color="from-cyan-500 to-blue-500"
              big
            />
          </div>
        </div>

        {/* KPIs secundários */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPI icon={Receipt} label="Take rate (10%) acumulado" value={fmtBRL(m.takeAccum, { compact: true })} sub="Comissão sobre vendas" color="from-pink-500 to-rose-500" />
          <KPI icon={Percent} label="Mensalidades cobradas" value={fmtBRL(m.feesAccum, { compact: true })} sub={`${m.activeRestaurants} cobranças mensais ativas`} color="from-amber-500 to-orange-500" />
          <KPI icon={Activity} label="GMV diário (média)" value={fmtBRL(m.avgDailyGMV, { compact: true })} sub={`${fmt(m.avgDailyOrders)} pedidos/dia`} color="from-teal-500 to-cyan-500" />
          <KPI icon={Calendar} label="Lançada há" value={`${PLATFORM_CONFIG.platformDays} dias`} sub={`Desde ${PLATFORM_CONFIG.launchDate.toLocaleDateString('pt-BR')}`} color="from-indigo-500 to-purple-500" />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard
            className="lg:col-span-2"
            title="Receita diária da plataforma"
            subtitle="Take rate (10%) + mensalidades · últimos 70 dias"
            badge={{ icon: TrendingUp, text: '+ crescimento 28% no mês' }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyRevenueSeries}>
                <defs>
                  <linearGradient id="gTake" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF7A00" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#FF7A00" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gFee" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="date" style={{ fontSize: 10, fill: '#9ca3af' }} interval={9} />
                <YAxis
                  style={{ fontSize: 10, fill: '#9ca3af' }}
                  tickFormatter={(v) => v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${v}`}
                />
                <Tooltip
                  contentStyle={{ background: '#0E1116', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number, n: string) => [
                    fmtBRL(v),
                    n === 'takeRate' ? 'Take rate (10%)' : n === 'fees' ? 'Mensalidades' : n,
                  ]}
                />
                <Area type="monotone" dataKey="takeRate" stackId="1" stroke="#FF7A00" fill="url(#gTake)" name="takeRate" />
                <Area type="monotone" dataKey="fees" stackId="1" stroke="#a855f7" fill="url(#gFee)" name="fees" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Distribuição por plano"
            subtitle="Restaurantes por nível"
          >
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  dataKey="count"
                  nameKey="plan"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  label={({ count }) => count}
                  labelLine={false}
                >
                  {planDistribution.map(p => (
                    <Cell key={p.plan} fill={PLAN_COLORS[p.plan as keyof typeof PLAN_COLORS]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0E1116', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {planDistribution.map(p => (
                <div key={p.plan} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: PLAN_COLORS[p.plan as keyof typeof PLAN_COLORS] }} />
                    <span className="font-bold">{p.plan}</span>
                  </div>
                  <span className="text-gray-400">{p.count} restaurantes</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard
            title="Crescimento da base"
            subtitle="Restaurantes cadastrados (cumulativo)"
            badge={{ icon: Sparkles, text: '+25 em 70 dias' }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={restaurantGrowth}>
                <defs>
                  <linearGradient id="gGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="date" style={{ fontSize: 10, fill: '#9ca3af' }} interval={11} />
                <YAxis style={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ background: '#0E1116', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="total" stroke="#06b6d4" fill="url(#gGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="GMV diário"
            subtitle="Volume bruto processado"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyRevenueSeries.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="date" style={{ fontSize: 10, fill: '#9ca3af' }} interval={4} />
                <YAxis
                  style={{ fontSize: 10, fill: '#9ca3af' }}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                />
                <Tooltip
                  contentStyle={{ background: '#0E1116', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => fmtBRL(v)}
                />
                <Bar dataKey="gmv" fill="#FF7A00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Distribuição geográfica"
            subtitle={`Em ${stateDistribution.length} estados`}
          >
            <div className="space-y-2 mt-2">
              {stateDistribution.map(s => {
                const pct = (s.count / m.restaurants) * 100
                return (
                  <div key={s.state}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold flex items-center gap-1.5">
                        <Globe2 className="w-3 h-3 text-cyan-400" />
                        {s.state}
                      </span>
                      <span className="text-gray-400">{s.count} {s.count > 1 ? 'restaurantes' : 'restaurante'}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </ChartCard>
        </div>

        {/* Top 10 por GMV */}
        <ChartCard title="Top 10 restaurantes · receita gerada" subtitle="Maiores geradores de GMV nos últimos 70 dias" noPadding>
          <div className="divide-y divide-white/5">
            {topRestaurantsByGMV.map((r, i) => {
              const gmv = totalGMV(r)
              const rev = totalRevenue(r)
              const pct = (gmv / totalGMV(topRestaurantsByGMV[0])) * 100
              return (
                <div key={r.id} className="px-5 py-3 flex items-center gap-4 hover:bg-white/5 transition-colors">
                  <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                    i === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-yellow-900' :
                    i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                    i === 2 ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white' :
                    'bg-white/10 text-gray-300'
                  }`}>
                    {i === 0 ? <Crown className="w-3.5 h-3.5" /> : `#${i + 1}`}
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {r.cuisineEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm truncate">{r.name}</p>
                      <PlanBadge plan={r.plan} small />
                      {r.founder && <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-[9px] font-extrabold">FUNDADOR</span>}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span>{r.city} · {r.state}</span>
                      <span>{r.daysActive}d</span>
                      <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" /> {r.rating}</span>
                    </div>
                    <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-pink-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">GMV</p>
                    <p className="font-extrabold text-orange-300">{fmtBRL(gmv, { compact: true })}</p>
                    <p className="text-[10px] text-gray-500">+{fmtBRL(rev, { compact: true })} receita</p>
                  </div>
                </div>
              )
            })}
          </div>
        </ChartCard>

        {/* Lista completa */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-2xl flex items-center gap-2">
                <Store className="w-5 h-5 text-orange-400" /> Restaurantes na plataforma
              </h2>
              <p className="text-xs text-gray-400">{filtered.length} de {m.restaurants}</p>
            </div>
            <button className="btn-glow px-4 py-2 text-white rounded-xl text-xs font-extrabold flex items-center gap-1">
              <Plus className="w-3 h-3" /> Convidar restaurante
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                placeholder="Buscar restaurante, cidade ou cozinha..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white/5 border-0 rounded-xl text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {(['all', 'active', 'onboarding', 'trial', 'churned'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    statusFilter === s
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30'
                      : 'bg-white/5 text-gray-300 ring-1 ring-white/10 hover:bg-white/10'
                  }`}
                >
                  {s === 'all' ? 'Todos' : s === 'active' ? 'Ativos' : s === 'onboarding' ? 'Onboarding' : s === 'trial' ? 'Trial' : 'Churn'}
                </button>
              ))}
            </div>
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {(['all', 'Starter', 'Pro', 'Enterprise'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPlanFilter(p)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    planFilter === p
                      ? 'bg-white text-gray-900'
                      : 'bg-white/5 text-gray-300 ring-1 ring-white/10 hover:bg-white/10'
                  }`}
                >
                  {p === 'all' ? 'Todos planos' : p}
                </button>
              ))}
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r, i) => (
              <RestaurantPlatformCard key={r.id} r={r} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="bg-white/5 ring-1 ring-white/10 rounded-2xl p-10 text-center">
              <Search className="w-10 h-10 mx-auto opacity-30 mb-2" />
              <p className="text-sm font-bold mb-1">Nenhum restaurante encontrado</p>
              <p className="text-xs text-gray-500">Ajuste os filtros ou a busca</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KPI({ icon: Icon, label, value, sub, color, big }: any) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-2xl ring-1 ring-white/10 ${big ? 'p-5' : 'p-4'}`}>
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl bg-gradient-to-br {color}" />
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className={`font-extrabold text-white leading-tight ${big ? 'text-2xl' : 'text-xl'}`}>{value}</p>
      <p className="text-[11px] text-gray-400 uppercase font-bold mt-1 tracking-wider">{label}</p>
      {sub && <p className="text-[10px] text-gray-500 mt-1.5 leading-tight">{sub}</p>}
    </div>
  )
}

function ChartCard({
  title, subtitle, children, badge, className, noPadding,
}: {
  title: string; subtitle?: string; children: React.ReactNode; badge?: { icon: any; text: string }; className?: string; noPadding?: boolean
}) {
  return (
    <div className={`bg-white/[0.04] ring-1 ring-white/10 rounded-2xl ${noPadding ? 'overflow-hidden' : 'p-5'} ${className || ''}`}>
      <div className={`flex items-start justify-between mb-3 ${noPadding ? 'p-5 pb-2' : ''}`}>
        <div>
          <h3 className="font-bold">{title}</h3>
          {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {badge && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-md text-[10px] font-extrabold">
            <badge.icon className="w-3 h-3" /> {badge.text}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function PlanBadge({ plan, small }: { plan: PlatformRestaurant['plan']; small?: boolean }) {
  const colors = {
    Starter: 'bg-cyan-500/20 text-cyan-300 ring-cyan-500/30',
    Pro: 'bg-orange-500/20 text-orange-300 ring-orange-500/30',
    Enterprise: 'bg-purple-500/20 text-purple-300 ring-purple-500/30',
  }
  return (
    <span className={`inline-flex items-center px-1.5 ${small ? 'py-0' : 'py-0.5'} rounded ring-1 ${colors[plan]} text-[10px] font-extrabold uppercase tracking-wider`}>
      {plan}
    </span>
  )
}

function StatusDot({ status }: { status: PlatformRestaurant['status'] }) {
  const meta = {
    active: { color: 'bg-emerald-400', label: 'Ativo', textColor: 'text-emerald-300' },
    onboarding: { color: 'bg-amber-400', label: 'Onboarding', textColor: 'text-amber-300' },
    trial: { color: 'bg-cyan-400', label: 'Trial', textColor: 'text-cyan-300' },
    churned: { color: 'bg-red-400', label: 'Churn', textColor: 'text-red-300' },
  }[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider ${meta.textColor}`}>
      <span className={`w-1.5 h-1.5 ${meta.color} rounded-full ${status === 'active' || status === 'trial' ? 'live-dot' : ''}`} />
      {meta.label}
    </span>
  )
}

function RestaurantPlatformCard({ r, index }: { r: PlatformRestaurant; index: number }) {
  const gmv = totalGMV(r)
  const rev = totalRevenue(r)
  const dailyOrders = r.avgDailyOrders

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="relative overflow-hidden bg-white/[0.04] ring-1 ring-white/10 rounded-2xl hover:ring-orange-500/40 hover:bg-white/[0.06] transition-all"
    >
      {/* cover */}
      <div className="relative h-24 bg-gradient-to-br from-gray-700 to-gray-900 overflow-hidden">
        {r.coverPhotoId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={restaurantBannerUrl(r.coverPhotoId, 400)}
            alt={r.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="absolute -right-2 -bottom-4 text-[80px] opacity-30">{r.cuisineEmoji}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1116] via-transparent to-transparent" />
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
          <PlanBadge plan={r.plan} />
          {r.founder && (
            <span className="px-1.5 py-0.5 bg-yellow-400/90 text-yellow-900 rounded text-[9px] font-extrabold flex items-center gap-0.5">
              <Crown className="w-2.5 h-2.5" /> FUNDADOR
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 -mt-7 bg-white rounded-xl shadow-lg flex items-center justify-center text-2xl flex-shrink-0 ring-2 ring-[#0E1116]">
            {r.cuisineEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{r.name}</p>
            <p className="text-[11px] text-gray-400 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" /> {r.city} · {r.state}
            </p>
          </div>
          <StatusDot status={r.status} />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <Stat label="GMV total" value={fmtBRL(gmv, { compact: true })} accent="orange" />
          <Stat label="Receita" value={fmtBRL(rev, { compact: true })} accent="purple" />
          <Stat label="Pedidos/dia" value={dailyOrders.toString()} />
          <Stat label="Ticket médio" value={fmtBRL(r.avgTicket)} />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px]">
          <span className="text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {r.daysActive} dias
          </span>
          <span className="flex items-center gap-1 text-yellow-400">
            <Star className="w-3 h-3 fill-yellow-400" /> {r.rating}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: 'orange' | 'purple' }) {
  return (
    <div className="bg-white/[0.03] rounded-lg p-2">
      <p className={`text-sm font-extrabold ${
        accent === 'orange' ? 'text-orange-300' : accent === 'purple' ? 'text-purple-300' : 'text-white'
      }`}>{value}</p>
      <p className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">{label}</p>
    </div>
  )
}
