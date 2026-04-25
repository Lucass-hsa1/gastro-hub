'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowRight, ChefHat, ConciergeBell, ShieldCheck, ShoppingBag, Store,
  QrCode, Smartphone, Truck, ClipboardList, Sparkles, Zap, BarChart3,
  Users, CheckCircle2, Star, Bike, UtensilsCrossed
} from 'lucide-react'
import BrandLogo from '@/components/BrandLogo'
import { useStore } from '@/lib/store'

const profiles = [
  {
    role: 'cliente',
    title: 'Cliente (Salão)',
    desc: 'Peça pelo QR Code da mesa, acompanhe seu pedido e veja sua comanda em tempo real.',
    icon: Smartphone,
    color: 'from-orange-400 to-orange-600',
    href: '/login?role=cliente',
  },
  {
    role: 'cliente-delivery',
    title: 'Cliente (Delivery)',
    desc: 'Marketplace estilo iFood — escolha entre vários restaurantes, pague e acompanhe a entrega.',
    icon: UtensilsCrossed,
    color: 'from-rose-500 to-orange-500',
    href: '/login?role=cliente-delivery',
  },
  {
    role: 'garcom',
    title: 'Garçom',
    desc: 'Mesas, comandas, pedidos prontos pra entregar e fechamento de conta.',
    icon: ConciergeBell,
    color: 'from-teal-500 to-teal-700',
    href: '/login?role=garcom',
  },
  {
    role: 'cozinha',
    title: 'Cozinha (KDS)',
    desc: 'Pedidos em produção, ingredientes, cronômetro, prioridade salão/delivery/balcão.',
    icon: ChefHat,
    color: 'from-red-500 to-orange-600',
    href: '/login?role=cozinha',
  },
  {
    role: 'entregador',
    title: 'Entregador',
    desc: 'Aceite entregas, navegue até o cliente, acompanhe ganhos e status online em tempo real.',
    icon: Bike,
    color: 'from-blue-500 to-cyan-600',
    href: '/login?role=entregador',
  },
  {
    role: 'gerente',
    title: 'Gerente',
    desc: 'Dashboard completo: vendas, financeiro, estoque, CRM, relatórios, funcionários.',
    icon: BarChart3,
    color: 'from-teal-600 to-emerald-600',
    href: '/login?role=gerente',
  },
  {
    role: 'super-admin',
    title: 'Super Admin',
    desc: 'Visão multi-restaurante, métricas globais, gestão de unidades e franqueados.',
    icon: ShieldCheck,
    color: 'from-purple-600 to-indigo-700',
    href: '/login?role=super-admin',
  },
]

const features = [
  { icon: QrCode, title: 'Cardápio QR por mesa', desc: 'Cliente escaneia, identifica a mesa e pede sem app' },
  { icon: ChefHat, title: 'Cozinha integrada', desc: 'Pedidos chegam por canal (salão / delivery / balcão) com ingredientes' },
  { icon: ConciergeBell, title: 'Garçom 360°', desc: 'Sabe quando entregar, abre cardápio na mesa, fecha conta' },
  { icon: Truck, title: 'Delivery próprio', desc: 'Entregadores, rotas, taxa por bairro, integrado com cozinha' },
  { icon: BarChart3, title: 'Dashboard real-time', desc: 'Vendas, DRE, ticket médio, top produtos — tudo num só lugar' },
  { icon: Sparkles, title: 'CRM + Promoções', desc: 'Clientes VIP, fidelidade, cupons, campanhas segmentadas' },
]

export default function Landing() {
  const [mounted, setMounted] = useState(false)
  const authUser = useStore(s => s.authUser)

  useEffect(() => setMounted(true), [])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-30">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size={36} />
          </Link>
          <div className="flex items-center gap-2">
            {mounted && authUser ? (
              <Link
                href={
                  authUser.role === 'cliente' ? '/cliente' :
                  authUser.role === 'cliente-delivery' ? '/delivery-app' :
                  authUser.role === 'garcom' ? '/garcom' :
                  authUser.role === 'cozinha' ? '/cozinha' :
                  authUser.role === 'entregador' ? '/entregador' :
                  authUser.role === 'super-admin' ? '/super-admin' : '/painel'
                }
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-orange-500 text-white rounded-lg font-bold text-sm flex items-center gap-2"
              >
                Voltar pro painel <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/cardapio/public" className="hidden sm:inline-flex px-3 py-2 text-sm font-bold text-teal-700 hover:bg-teal-50 rounded-lg">
                  Ver cardápio
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-orange-500 text-white rounded-lg font-bold text-sm flex items-center gap-2"
                >
                  Entrar <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-orange-50" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-200 rounded-full blur-3xl opacity-30" />

        <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold mb-4 border border-orange-200">
              <Sparkles className="w-3 h-3" />
              MVP Demo · 100% funcional
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] mb-5">
              Tudo que seu <span className="text-teal-600">restaurante</span><br />
              precisa numa <span className="text-orange-500">única plataforma</span>.
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              PDV, cardápio QR, cozinha integrada, garçom, delivery, financeiro, CRM e relatórios.
              Cinco perfis prontos pra você testar agora.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-orange-500 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                Acessar a demo <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/cardapio/public"
                className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-800 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:border-teal-400"
              >
                <QrCode className="w-4 h-4" /> Ver cardápio
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5 perfis */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold mb-2">7 perfis, 1 plataforma</h2>
            <p className="text-gray-600">Escolha por onde quer entrar — todos com login pré-preenchido</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.role}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={p.href}
                    className="group block bg-white rounded-2xl p-6 border border-gray-200 hover:border-teal-400 hover:shadow-xl transition-all h-full"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">{p.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{p.desc}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-teal-600 group-hover:gap-2 transition-all">
                      Entrar como {p.title.toLowerCase()} <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold mb-2">O que tá pronto na demo</h2>
            <p className="text-gray-600">15 telas, fluxo integrado de ponta a ponta</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="flex gap-3 p-5 bg-white rounded-xl border border-gray-100">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-teal-700" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{f.title}</h3>
                    <p className="text-xs text-gray-600">{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gradient-to-r from-teal-600 to-orange-500 text-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div><p className="text-4xl font-extrabold">19</p><p className="text-sm opacity-80">Telas</p></div>
          <div><p className="text-4xl font-extrabold">7</p><p className="text-sm opacity-80">Perfis</p></div>
          <div><p className="text-4xl font-extrabold">100%</p><p className="text-sm opacity-80">Funcional</p></div>
          <div><p className="text-4xl font-extrabold">0</p><p className="text-sm opacity-80">Backend (demo)</p></div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-3">Pronto pra ver funcionando?</h2>
          <p className="text-gray-600 mb-6">Login leva 1 clique — todos os perfis já estão pré-preenchidos.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-orange-500 text-white rounded-xl font-bold hover:shadow-2xl transition-all"
          >
            <Zap className="w-5 h-5" /> Acessar agora
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-500">
        <BrandLogo size={28} className="mx-auto mb-2" />
        © 2026 GastroHub · MVP demo
      </footer>
    </div>
  )
}
