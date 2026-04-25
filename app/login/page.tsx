'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight, ArrowLeft, ChefHat, ConciergeBell, ShieldCheck,
  Smartphone, BarChart3, User, Lock, Mail, Sparkles, Bike, UtensilsCrossed
} from 'lucide-react'
import BrandLogo from '@/components/BrandLogo'
import { useStore } from '@/lib/store'
import type { UserRole } from '@/lib/types'

const DEMOS: Record<UserRole, { email: string; password: string; name: string; subtitle: string; icon: any; color: string; home: string }> = {
  cliente: {
    email: 'joao@email.com',
    password: 'gastro',
    name: 'João Silva',
    subtitle: 'Cliente salão · pede pelo QR, vê comanda, histórico, fidelidade',
    icon: Smartphone,
    color: 'from-orange-400 to-orange-600',
    home: '/cliente',
  },
  'cliente-delivery': {
    email: 'mariana@email.com',
    password: 'gastro',
    name: 'Mariana Costa',
    subtitle: 'Cliente delivery · marketplace estilo iFood com vários restaurantes',
    icon: UtensilsCrossed,
    color: 'from-rose-500 to-orange-500',
    home: '/delivery-app',
  },
  garcom: {
    email: 'patricia@gastrohub.com',
    password: 'gastro',
    name: 'Patricia Lopes',
    subtitle: 'Garçom · mesas, comandas, pedidos prontos, fechar conta',
    icon: ConciergeBell,
    color: 'from-teal-500 to-teal-700',
    home: '/garcom',
  },
  cozinha: {
    email: 'carlos@gastrohub.com',
    password: 'gastro',
    name: 'Carlos Mendes',
    subtitle: 'Cozinha (KDS) · pedidos em produção, ingredientes, cronômetro',
    icon: ChefHat,
    color: 'from-red-500 to-orange-600',
    home: '/cozinha',
  },
  entregador: {
    email: 'roberto@gastrohub.com',
    password: 'gastro',
    name: 'Roberto Souza',
    subtitle: 'Entregador · entregas atribuídas, rota, ganhos do dia',
    icon: Bike,
    color: 'from-blue-500 to-cyan-600',
    home: '/entregador',
  },
  gerente: {
    email: 'marcelo@gastrohub.com',
    password: 'gastro',
    name: 'Marcelo Almeida',
    subtitle: 'Gerente · dashboard, financeiro, estoque, CRM, relatórios',
    icon: BarChart3,
    color: 'from-teal-600 to-emerald-600',
    home: '/painel',
  },
  'super-admin': {
    email: 'admin@gastrohub.com',
    password: 'gastro',
    name: 'Admin GastroHub',
    subtitle: 'Super admin · multi-restaurante, métricas globais, franqueados',
    icon: ShieldCheck,
    color: 'from-purple-600 to-indigo-700',
    home: '/super-admin',
  },
}

const ROLE_LABELS: Record<UserRole, string> = {
  cliente: 'Cliente Salão',
  'cliente-delivery': 'Cliente Delivery',
  garcom: 'Garçom',
  cozinha: 'Cozinha',
  entregador: 'Entregador',
  gerente: 'Gerente',
  'super-admin': 'Super Admin',
}

function LoginInner() {
  const router = useRouter()
  const params = useSearchParams()
  const login = useStore(s => s.login)

  const initial = params.get('role') as UserRole | null
  const [role, setRole] = useState<UserRole>(
    initial && DEMOS[initial] ? initial : 'cliente'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    const d = DEMOS[role]
    setEmail(d.email)
    setPassword(d.password)
    setName(d.name)
  }, [role])

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const d = DEMOS[role]
    login({
      name: name || d.name,
      email: email || d.email,
      role,
      loggedAt: new Date().toISOString(),
      customerId: role === 'cliente' ? 'c1' : role === 'cliente-delivery' ? 'c2' : undefined,
      employeeId: role === 'garcom' ? 'e2' : role === 'cozinha' ? 'e3' : role === 'gerente' ? 'e1' : undefined,
      driverId: role === 'entregador' ? 'd1' : undefined,
    })
    router.replace(d.home)
  }

  const Icon = DEMOS[role].icon

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Esquerda: brand + lista de perfis */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-orange-600 text-white p-8 lg:p-12 flex flex-col">
        <Link href="/" className="flex items-center gap-2 text-white/90 hover:text-white text-sm font-bold w-fit">
          <ArrowLeft className="w-4 h-4" /> Voltar à landing
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 inline-flex w-fit mb-5 border border-white/20">
            <BrandLogo size={48} />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs font-bold mb-4 w-fit">
            <Sparkles className="w-3 h-3 text-yellow-300" /> DEMO
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-3 leading-tight">
            7 perfis, 1 plataforma.
          </h1>
          <p className="text-white/80 text-sm mb-6">
            Use as credenciais já preenchidas — só clicar em entrar.
          </p>

          <div className="space-y-2">
            {(Object.keys(DEMOS) as UserRole[]).map(r => {
              const d = DEMOS[r]
              const RIcon = d.icon
              const active = role === r
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    active
                      ? 'bg-white text-gray-900 shadow-xl'
                      : 'bg-white/10 hover:bg-white/15 text-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${d.color} text-white flex items-center justify-center flex-shrink-0`}>
                    <RIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{ROLE_LABELS[r]}</p>
                    <p className={`text-[11px] ${active ? 'text-gray-500' : 'text-white/70'} line-clamp-1`}>{d.subtitle}</p>
                  </div>
                  {active && <ArrowRight className="w-4 h-4 text-teal-600" />}
                </button>
              )
            })}
          </div>
        </div>

        <p className="text-white/60 text-xs mt-6">© 2026 GastroHub · MVP demo</p>
      </div>

      {/* Direita: formulário */}
      <div className="bg-white p-8 lg:p-12 flex items-center justify-center">
        <motion.form
          key={role}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={submit}
          className="w-full max-w-md"
        >
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${DEMOS[role].color} flex items-center justify-center text-white mb-5`}>
            <Icon className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold mb-1">Entrar como {ROLE_LABELS[role]}</h2>
          <p className="text-sm text-gray-500 mb-6">{DEMOS[role].subtitle}</p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Nome</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-teal-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-teal-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-teal-500 text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`mt-6 w-full py-3 bg-gradient-to-r ${DEMOS[role].color} text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all`}
          >
            Entrar como {ROLE_LABELS[role]} <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-gray-400 mt-3 text-center">
            Demo · qualquer credencial funciona, dados ficam no seu navegador.
          </p>
        </motion.form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  )
}
