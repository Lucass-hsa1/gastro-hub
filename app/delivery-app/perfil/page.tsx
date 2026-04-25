'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Receipt, Home as HomeIcon, User as UserIcon, Heart, MapPin,
  CreditCard, Tag, HelpCircle, LogOut, Settings, ChevronRight, Star, Award
} from 'lucide-react'
import { useMarketStore } from '@/lib/marketplace-store'
import { useStore } from '@/lib/store'
import { marketRestaurants } from '@/lib/marketplace'

export default function ProfilePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const orders = useMarketStore(s => s.orders)
  const favoriteIds = useMarketStore(s => s.favoriteRestaurantIds)
  const addresses = useMarketStore(s => s.addresses)
  const authUser = useStore(s => s.authUser)
  const logout = useStore(s => s.logout)

  useEffect(() => setMounted(true), [])

  const totalOrders = orders.length
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0)
  const points = Math.floor(totalSpent * 2)

  return (
    <div className="min-h-screen mesh-warm noise pb-24">
      <header className="sticky top-0 z-30 bg-[#FFF7EE]/90 backdrop-blur-xl border-b border-orange-100/50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/delivery-app')} className="w-10 h-10 bg-white hover:bg-orange-50 rounded-2xl flex items-center justify-center shadow-sm ring-1 ring-orange-100">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-display text-2xl">Meu perfil</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* User card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-orange-500 to-pink-500 text-white rounded-3xl p-5 shadow-xl">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl font-extrabold">
              {(mounted && authUser?.name?.[0]) || '👤'}
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase opacity-80 font-bold">Olá,</p>
              <p className="font-extrabold text-lg">{(mounted && authUser?.name) || 'Cliente'}</p>
              <p className="text-xs opacity-90">{(mounted && authUser?.email) || 'cliente@email.com'}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/20">
            <div>
              <p className="text-[10px] opacity-80 uppercase font-extrabold tracking-wider">Pedidos</p>
              <p className="text-2xl font-extrabold">{totalOrders}</p>
            </div>
            <div>
              <p className="text-[10px] opacity-80 uppercase font-extrabold tracking-wider">Pontos</p>
              <p className="text-2xl font-extrabold">{points.toLocaleString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-[10px] opacity-80 uppercase font-extrabold tracking-wider">Nível</p>
              <p className="text-2xl font-extrabold flex items-center gap-1">
                {totalSpent > 500 ? 'Ouro' : 'Prata'} <Award className="w-4 h-4" />
              </p>
            </div>
          </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/delivery-app/pedidos" className="bg-white rounded-2xl p-4 text-center hover:shadow-md transition-all">
            <Receipt className="w-5 h-5 mx-auto mb-1 text-orange-500" />
            <p className="text-lg font-extrabold">{orders.length}</p>
            <p className="text-[10px] uppercase font-bold text-gray-500">Pedidos</p>
          </Link>
          <div className="bg-white rounded-2xl p-4 text-center">
            <Heart className="w-5 h-5 mx-auto mb-1 text-red-500 fill-red-500" />
            <p className="text-lg font-extrabold">{favoriteIds.length}</p>
            <p className="text-[10px] uppercase font-bold text-gray-500">Favoritos</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center">
            <MapPin className="w-5 h-5 mx-auto mb-1 text-teal-500" />
            <p className="text-lg font-extrabold">{addresses.length}</p>
            <p className="text-[10px] uppercase font-bold text-gray-500">Endereços</p>
          </div>
        </div>

        {/* Favoritos */}
        {mounted && favoriteIds.length > 0 && (
          <section>
            <h2 className="text-xs uppercase font-extrabold text-gray-500 mb-2 flex items-center gap-1.5 px-1">
              <Heart className="w-3 h-3 text-red-500 fill-red-500" /> Restaurantes favoritos
            </h2>
            <div className="bg-white rounded-2xl divide-y divide-gray-100">
              {marketRestaurants.filter(r => favoriteIds.includes(r.id)).map(r => (
                <Link key={r.id} href={`/delivery-app/restaurante/${r.id}`} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                  <div className="w-11 h-11 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center text-2xl">
                    {r.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{r.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {r.rating} · {r.deliveryTime[0]}-{r.deliveryTime[1]} min
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Endereços */}
        <section>
          <h2 className="text-xs uppercase font-extrabold text-gray-500 mb-2 flex items-center gap-1.5 px-1">
            <MapPin className="w-3 h-3 text-orange-500" /> Meus endereços
          </h2>
          <div className="bg-white rounded-2xl divide-y divide-gray-100">
            {addresses.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                  <HomeIcon className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{a.label}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {a.street}, {a.number} — {a.neighborhood}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Menu */}
        <section className="bg-white rounded-2xl divide-y divide-gray-100">
          <MenuRow icon={<CreditCard className="w-4 h-4" />} label="Formas de pagamento" badge="3 cartões" />
          <MenuRow icon={<Tag className="w-4 h-4" />} label="Cupons e ofertas" badge="2 disponíveis" />
          <MenuRow icon={<Settings className="w-4 h-4" />} label="Configurações" />
          <MenuRow icon={<HelpCircle className="w-4 h-4" />} label="Central de ajuda" />
        </section>

        <button
          onClick={() => { logout(); router.push('/') }}
          className="w-full bg-white text-red-600 rounded-2xl p-4 flex items-center justify-center gap-2 font-bold text-sm hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" /> Sair da conta
        </button>

        <p className="text-center text-[10px] text-gray-400">GastroHub Delivery · MVP demo</p>
      </div>

      {/* Bottom nav floating */}
      <div className="fixed bottom-3 left-3 right-3 z-30 max-w-md mx-auto">
        <div className="float-nav rounded-3xl px-2 py-2 grid grid-cols-3 gap-1">
          <Link href="/delivery-app" className="flex flex-col items-center gap-0.5 py-2.5 rounded-2xl text-gray-600 hover:bg-white/60">
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Início</span>
          </Link>
          <Link href="/delivery-app/pedidos" className="flex flex-col items-center gap-0.5 py-2.5 rounded-2xl text-gray-600 hover:bg-white/60">
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Pedidos</span>
          </Link>
          <Link href="/delivery-app/perfil" className="flex flex-col items-center gap-0.5 py-2.5 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30">
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

function MenuRow({ icon, label, badge }: { icon: React.ReactNode; label: string; badge?: string }) {
  return (
    <button className="w-full flex items-center gap-3 p-3.5 hover:bg-gray-50 text-left">
      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">{icon}</div>
      <p className="flex-1 text-sm font-bold">{label}</p>
      {badge && <span className="text-xs text-gray-400">{badge}</span>}
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
  )
}
