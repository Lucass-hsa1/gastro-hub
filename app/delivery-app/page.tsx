'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MapPin, ChevronDown, Heart, Star, Clock, Bike, Tag, Zap,
  ShoppingBag, ArrowRight, Sparkles, Flame, Percent, Home, Receipt,
  User as UserIcon, ChevronRight, TrendingUp, Award
} from 'lucide-react'
import {
  marketRestaurants,
  marketCategories,
  type MarketRestaurant,
} from '@/lib/marketplace'
import { restaurantBannerUrl } from '@/lib/food-images'
import { useMarketStore } from '@/lib/marketplace-store'
import { useStore } from '@/lib/store'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// paletas únicas pra cada categoria (gradient soft)
const CATEGORY_COLORS: Record<string, [string, string, string]> = {
  all: ['#FFE7D1', '#FFCDA8', '#1f2937'],
  lanches: ['#FFE0CC', '#FF9F66', '#7C2D12'],
  pizza: ['#FFD9D9', '#FF8B7A', '#7F1D1D'],
  japonesa: ['#FFE0F0', '#F4A8C8', '#831843'],
  brasileira: ['#FFEDC4', '#F4B95A', '#7C2D12'],
  italiana: ['#E0F1D9', '#9DCB7A', '#14532D'],
  mexicana: ['#FFE0CC', '#FF8866', '#7C1D11'],
  doces: ['#FFE0EE', '#FFB0CC', '#831843'],
  acai: ['#E8DFFF', '#B49AE8', '#4C1D95'],
  saudavel: ['#DAF1D8', '#7BCC74', '#14532D'],
  padaria: ['#FFEFCF', '#F4D58F', '#78350F'],
  bebidas: ['#FFE5C2', '#F2B968', '#78350F'],
}

export default function DeliveryAppHome() {
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('all')
  const [showAddressPicker, setShowAddressPicker] = useState(false)

  const cart = useMarketStore(s => s.cart)
  const cartRestaurantId = useMarketStore(s => s.cartRestaurantId)
  const addresses = useMarketStore(s => s.addresses)
  const selectedAddressId = useMarketStore(s => s.selectedAddressId)
  const selectAddress = useMarketStore(s => s.selectAddress)
  const favoriteIds = useMarketStore(s => s.favoriteRestaurantIds)
  const toggleFavorite = useMarketStore(s => s.toggleFavorite)
  const orders = useMarketStore(s => s.orders)
  const authUser = useStore(s => s.authUser)

  useEffect(() => setMounted(true), [])

  const selectedAddress = addresses.find(a => a.id === selectedAddressId)
  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0)
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const filtered = useMemo(() => {
    let r = marketRestaurants
    if (activeCat !== 'all') r = r.filter(x => x.cuisine === activeCat)
    if (search) {
      const s = search.toLowerCase()
      r = r.filter(
        x =>
          x.name.toLowerCase().includes(s) ||
          x.tags.some(t => t.toLowerCase().includes(s)) ||
          x.menu.some(d => d.name.toLowerCase().includes(s))
      )
    }
    return r
  }, [activeCat, search])

  const featured = marketRestaurants.filter(r => r.superRestaurant && r.isOpen).slice(0, 4)
  const promos = marketRestaurants.filter(r => r.promo && r.isOpen)
  const favorites = marketRestaurants.filter(r => favoriteIds.includes(r.id))
  const activeOrder = orders.find(o => o.status !== 'delivered' && o.status !== 'canceled')
  const firstName = mounted && authUser?.name ? authUser.name.split(' ')[0] : 'amigo'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="min-h-screen mesh-warm noise pb-32 overflow-x-hidden">
      {/* Header dark cinematográfico */}
      <header className="relative bg-[#0E1116] text-white overflow-hidden">
        <div className="absolute inset-0 mesh-dark opacity-90" />
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-orange-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-12 w-72 h-72 bg-teal-500/30 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-5 pt-5 pb-6">
          {/* Top row */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <button
              onClick={() => setShowAddressPicker(!showAddressPicker)}
              className="flex items-center gap-2 flex-1 min-w-0 text-left group"
            >
              <span className="w-9 h-9 bg-white/10 backdrop-blur rounded-full flex items-center justify-center flex-shrink-0 ring-1 ring-white/20 group-hover:ring-orange-400/60 transition-all">
                <MapPin className="w-4 h-4 text-orange-400" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-bold tracking-wider text-orange-300/80">Entregar em</p>
                <p className="text-sm font-bold truncate flex items-center gap-1">
                  {selectedAddress ? `${selectedAddress.street}, ${selectedAddress.number}` : 'Escolha um endereço'}
                  <ChevronDown className="w-3 h-3 flex-shrink-0 opacity-70" />
                </p>
              </div>
            </button>
            <div className="flex items-center gap-2">
              <Link
                href="/delivery-app/pedidos"
                className="relative w-10 h-10 bg-white/5 hover:bg-white/10 backdrop-blur rounded-full flex items-center justify-center ring-1 ring-white/10 transition-all"
              >
                <Receipt className="w-4 h-4" />
                {orders.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0E1116]">
                    {orders.length}
                  </span>
                )}
              </Link>
              <Link
                href="/delivery-app/perfil"
                className="w-10 h-10 bg-gradient-to-br from-teal-400 via-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 ring-2 ring-white/20"
              >
                {(mounted && authUser?.name?.[0]) || 'C'}
              </Link>
            </div>
          </div>

          {/* Address dropdown */}
          <AnimatePresence>
            {showAddressPicker && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className="mb-4 bg-white/95 backdrop-blur-xl text-gray-900 rounded-2xl overflow-hidden ring-1 ring-white/30 shadow-xl"
              >
                {addresses.map(a => (
                  <button
                    key={a.id}
                    onClick={() => {
                      selectAddress(a.id)
                      setShowAddressPicker(false)
                    }}
                    className={`w-full p-3.5 flex items-center gap-3 hover:bg-orange-50 text-left border-b last:border-0 border-gray-100 transition-colors ${
                      selectedAddressId === a.id ? 'bg-orange-50' : ''
                    }`}
                  >
                    <Home className="w-4 h-4 text-orange-500" />
                    <div className="flex-1">
                      <p className="text-sm font-bold">{a.label}</p>
                      <p className="text-xs text-gray-500">
                        {a.street}, {a.number} — {a.neighborhood}
                      </p>
                    </div>
                    {selectedAddressId === a.id && <span className="w-2.5 h-2.5 bg-orange-500 rounded-full live-dot" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Greeting display */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm font-medium text-orange-200/90 mb-1">
              {greeting}, <span className="text-white font-bold">{firstName}</span> 👋
            </p>
            <h1 className="font-display text-3xl md:text-5xl text-white leading-[0.95] mb-4">
              O que vai{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-orange-300 via-pink-300 to-orange-200 bg-clip-text text-transparent">
                  matar a fome
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-2 bg-orange-500/40 -z-0 rounded-full blur-sm" />
              </span>{' '}
              hoje?
            </h1>
          </motion.div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar restaurante, prato ou marca..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border-0 rounded-2xl outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400 shadow-2xl shadow-black/30 focus:ring-4 ring-orange-400/40 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md text-xs font-bold"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Quick stats / pills */}
          <div className="flex items-center gap-2 mt-4 text-xs">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full ring-1 ring-white/20 font-bold">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full live-dot" /> {marketRestaurants.filter(r => r.isOpen).length} abertos agora
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full ring-1 ring-white/20 font-bold">
              <Bike className="w-3 h-3 text-orange-300" /> Entrega em ~30 min
            </span>
          </div>
        </div>

        {/* Wave decorativa que conecta com o body */}
        <svg className="block w-full h-8 -mb-px" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,32 C240,60 480,0 720,20 C960,40 1200,60 1440,32 L1440,60 L0,60 Z" fill="#FFF7EE" />
        </svg>
      </header>

      {/* Active order banner — flutuante e único */}
      <AnimatePresence>
        {mounted && activeOrder && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="max-w-5xl mx-auto px-5 -mt-3 relative z-10"
          >
            <Link
              href={`/delivery-app/pedido/${activeOrder.id}`}
              className="block relative overflow-hidden rounded-3xl shadow-xl shimmer"
            >
              <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-orange-500 bg-[length:200%_100%] hover:bg-[position:100%_0] transition-[background-position] duration-700 text-white p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/30 rounded-2xl blur-md live-dot" />
                    <div className="relative w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl">
                      {activeOrder.restaurantLogo}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase font-bold opacity-90 tracking-wider">
                      Pedido #{activeOrder.number} · {activeOrder.restaurantName}
                    </p>
                    <p className="font-extrabold text-base">
                      {activeOrder.status === 'pending' && '⏳ Aguardando confirmação'}
                      {activeOrder.status === 'confirmed' && '✅ Pedido confirmado'}
                      {activeOrder.status === 'preparing' && '👨‍🍳 Em preparo'}
                      {activeOrder.status === 'ready' && '📦 Pronto para sair'}
                      {activeOrder.status === 'on-the-way' && '🛵 Saiu para entrega'}
                    </p>
                    <p className="text-xs opacity-90">Chega em ~{activeOrder.estimatedTime} min</p>
                  </div>
                  <ChevronRight className="w-5 h-5 flex-shrink-0" />
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categorias — tiles 3D coloridos */}
      <section className="max-w-5xl mx-auto px-5 pt-6">
        <div className="flex items-end justify-between mb-3">
          <h2 className="font-display text-2xl">Explorar cozinhas</h2>
          {activeCat !== 'all' && (
            <button onClick={() => setActiveCat('all')} className="text-xs font-bold text-orange-600 hover:underline">
              ver tudo →
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
          {marketCategories.map((c, idx) => {
            const colors = CATEGORY_COLORS[c.id] || CATEGORY_COLORS.all
            const active = activeCat === c.id
            return (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => setActiveCat(c.id)}
                className={`cat-tile relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 ${
                  active ? 'ring-4 ring-offset-2 ring-orange-400 scale-105' : ''
                }`}
                style={{
                  ['--c1' as any]: colors[0],
                  ['--c2' as any]: colors[1],
                }}
              >
                <span className="text-2xl drop-shadow-sm">{c.emoji}</span>
                <span
                  className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider"
                  style={{ color: colors[2] }}
                >
                  {c.name}
                </span>
              </motion.button>
            )
          })}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-5 mt-8 space-y-10">
        {/* Banner promo dual com shape distintos */}
        {!search && activeCat === 'all' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <PromoTile
              href="/delivery-app/restaurante/r1"
              title="15% OFF"
              subtitle="em hambúrgueres artesanais"
              tag="OFERTA RELÂMPAGO"
              tagIcon={<Zap className="w-3 h-3" />}
              emoji="🍔"
              gradient="from-orange-500 via-red-500 to-pink-500"
            />
            <PromoTile
              href="/delivery-app/restaurante/r2"
              title="Frete grátis"
              subtitle="só hoje na Pizza Bella Napoli"
              tag="HOJE"
              tagIcon={<Sparkles className="w-3 h-3" />}
              emoji="🍕"
              gradient="from-teal-500 via-emerald-500 to-cyan-500"
            />
          </motion.div>
        )}

        {/* Favoritos — carousel horizontal */}
        {!search && activeCat === 'all' && favorites.length > 0 && (
          <SectionRow
            title="Seus favoritos"
            subtitle={`${favorites.length} restaurante${favorites.length > 1 ? 's' : ''} salvos`}
            icon={<Heart className="w-4 h-4 text-red-500 fill-red-500" />}
          >
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5 snap-x snap-mandatory">
              {favorites.map(r => (
                <div key={r.id} className="snap-start flex-shrink-0 w-[280px] sm:w-[320px]">
                  <RestaurantCard r={r} onFav={toggleFavorite} isFav={favoriteIds.includes(r.id)} />
                </div>
              ))}
            </div>
          </SectionRow>
        )}

        {/* Super Restaurantes */}
        {!search && activeCat === 'all' && (
          <SectionRow
            title="Super Restaurantes"
            subtitle="Os preferidos da galera"
            icon={<Award className="w-4 h-4 text-yellow-500" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featured.map(r => (
                <RestaurantCard key={r.id} r={r} onFav={toggleFavorite} isFav={favoriteIds.includes(r.id)} />
              ))}
            </div>
          </SectionRow>
        )}

        {/* Promoções */}
        {!search && activeCat === 'all' && (
          <SectionRow
            title="Promoções da hora"
            subtitle="Cupons e fretes grátis"
            icon={<Percent className="w-4 h-4 text-orange-500" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {promos.slice(0, 4).map(r => (
                <RestaurantCard key={r.id} r={r} onFav={toggleFavorite} isFav={favoriteIds.includes(r.id)} />
              ))}
            </div>
          </SectionRow>
        )}

        {/* Lista geral */}
        <SectionRow
          title={
            search
              ? `Resultados para "${search}"`
              : activeCat === 'all'
                ? 'Todos os restaurantes'
                : `${marketCategories.find(c => c.id === activeCat)?.name}`
          }
          subtitle={`${filtered.length} restaurante${filtered.length !== 1 ? 's' : ''} ${activeCat === 'all' ? '· perto de você' : ''}`}
          icon={<TrendingUp className="w-4 h-4 text-teal-600" />}
        >
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center ring-1 ring-gray-100">
              <Search className="w-10 h-10 mx-auto opacity-30 mb-3" />
              <p className="text-sm font-bold mb-1">Nada encontrado</p>
              <p className="text-xs text-gray-500">Tente outra busca ou categoria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map(r => (
                <RestaurantCard key={r.id} r={r} onFav={toggleFavorite} isFav={favoriteIds.includes(r.id)} />
              ))}
            </div>
          )}
        </SectionRow>

        {/* Footer hint */}
        <div className="text-center pt-4 pb-2">
          <p className="text-xs text-gray-500 font-medium">
            🍴 GastroHub Delivery · feito com calor pra demo de investidor
          </p>
        </div>
      </div>

      {/* Bottom nav floating */}
      <div className="fixed bottom-3 left-3 right-3 z-30 max-w-md mx-auto">
        <div className="float-nav rounded-3xl px-2 py-2 grid grid-cols-3 gap-1">
          <NavItem href="/delivery-app" icon={<Home className="w-5 h-5" />} label="Início" active />
          <NavItem href="/delivery-app/pedidos" icon={<Receipt className="w-5 h-5" />} label="Pedidos" badge={orders.length || undefined} />
          <NavItem href="/delivery-app/perfil" icon={<UserIcon className="w-5 h-5" />} label="Perfil" />
        </div>
      </div>

      {/* Cart floating chip */}
      <AnimatePresence>
        {mounted && cartItemCount > 0 && cartRestaurantId && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-3 right-3 z-30 max-w-md mx-auto"
          >
            <Link
              href={`/delivery-app/restaurante/${cartRestaurantId}`}
              className="btn-glow text-white rounded-2xl p-3.5 flex items-center justify-between hover:scale-[1.01] active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-orange-600 text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-orange-500">
                    {cartItemCount}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold opacity-90 tracking-wider">Seu carrinho</p>
                  <p className="font-extrabold text-sm">Ver carrinho</p>
                </div>
              </div>
              <span className="font-extrabold text-base">{formatBRL(cartTotal)}</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PromoTile({
  href, title, subtitle, tag, tagIcon, emoji, gradient,
}: {
  href: string; title: string; subtitle: string; tag: string; tagIcon: React.ReactNode; emoji: string; gradient: string
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br ${gradient} hover:shadow-2xl transition-all`}
    >
      {/* shape decorativas */}
      <div className="absolute -right-6 -bottom-6 text-[140px] leading-none opacity-25 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
        {emoji}
      </div>
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/20 to-transparent" />
      <div className="relative">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/30 backdrop-blur rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-3">
          {tagIcon} {tag}
        </span>
        <h3 className="font-display text-3xl leading-none mb-1">{title}</h3>
        <p className="text-sm opacity-95 mb-4">{subtitle}</p>
        <span className="inline-flex items-center gap-1 px-3.5 py-2 bg-white text-gray-900 rounded-full text-xs font-extrabold group-hover:gap-2 transition-all">
          Pedir agora <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  )
}

function SectionRow({
  title, subtitle, icon, children,
}: {
  title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="font-display text-2xl flex items-center gap-2">
            {icon} {title}
          </h2>
          {subtitle && <p className="text-xs text-gray-500 font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

function NavItem({
  href, icon, label, active, badge,
}: {
  href: string; icon: React.ReactNode; label: string; active?: boolean; badge?: number
}) {
  return (
    <Link
      href={href}
      className={`relative flex flex-col items-center gap-0.5 py-2.5 rounded-2xl transition-all ${
        active ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30' : 'text-gray-600 hover:bg-white/60'
      }`}
    >
      <div className="relative">
        {icon}
        {badge && badge > 0 && (
          <span className={`absolute -top-2 -right-3 w-4 h-4 text-[9px] font-extrabold rounded-full flex items-center justify-center ${
            active ? 'bg-white text-orange-600' : 'bg-orange-500 text-white'
          }`}>
            {badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-extrabold uppercase tracking-wider">{label}</span>
    </Link>
  )
}

function RestaurantCard({
  r, onFav, isFav,
}: {
  r: MarketRestaurant; onFav: (id: string) => void; isFav: boolean
}) {
  return (
    <Link
      href={`/delivery-app/restaurante/${r.id}`}
      className={`tilt-card group relative bg-white rounded-3xl overflow-hidden ring-1 ring-gray-100 hover:ring-orange-200 hover:shadow-2xl hover:shadow-orange-500/10 flex flex-col ${
        !r.isOpen ? 'opacity-60' : ''
      }`}
    >
      {/* Banner */}
      <div className={`relative h-36 bg-gradient-to-br ${r.banner} overflow-hidden`}>
        {r.coverPhotoId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={restaurantBannerUrl(r.coverPhotoId, 600)}
            alt={r.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-[120px] leading-none opacity-90 group-hover:scale-110 group-hover:-translate-y-[42%] group-hover:rotate-6 transition-all duration-500">
            {r.bannerEmoji}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Top row badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5 items-start">
            {r.superRestaurant && (
              <span className="sticker inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-400 text-yellow-900 rounded-full text-[10px] font-extrabold ring-2 ring-yellow-300/50">
                <Star className="w-3 h-3 fill-yellow-900" /> SUPER
              </span>
            )}
            {r.deliveryFee === 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-extrabold">
                FRETE GRÁTIS
              </span>
            )}
          </div>
          <button
            onClick={e => {
              e.preventDefault()
              onFav(r.id)
            }}
            className="w-9 h-9 bg-white/95 backdrop-blur rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-md"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
          </button>
        </div>

        {!r.isOpen && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <span className="px-3 py-1 bg-white/90 text-gray-900 rounded-full text-xs font-extrabold uppercase tracking-wider">
              Fechado agora
            </span>
          </div>
        )}
      </div>

      {/* Logo flutuante */}
      <div className="px-4">
        <div className="-mt-7 w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl ring-4 ring-white relative z-10">
          {r.logo}
          <span
            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ring-2 ring-white ${
              r.isOpen ? 'bg-emerald-500' : 'bg-gray-400'
            }`}
          />
        </div>
      </div>

      {/* Info */}
      <div className="px-4 pt-2 pb-4 flex-1 flex flex-col">
        <h3 className="font-extrabold text-base leading-tight tracking-tight mb-0.5">{r.name}</h3>
        <p className="text-[11px] text-gray-500 truncate font-medium mb-2.5">{r.tags.join(' · ')}</p>

        <div className="flex items-center gap-2 text-[11px] text-gray-700 flex-wrap">
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-yellow-50 text-yellow-800 rounded-md font-bold">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            {r.rating}
            <span className="opacity-60 font-medium">
              ({r.reviewCount > 999 ? `${(r.reviewCount / 1000).toFixed(1)}k` : r.reviewCount})
            </span>
          </span>
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gray-50 rounded-md font-bold">
            <Clock className="w-3 h-3" />
            {r.deliveryTime[0]}-{r.deliveryTime[1]}min
          </span>
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gray-50 rounded-md font-bold">
            <Bike className="w-3 h-3" />
            {r.deliveryFee === 0 ? <span className="text-emerald-600">Grátis</span> : formatBRL(r.deliveryFee)}
          </span>
        </div>

        {r.promo && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-orange-50 to-pink-50 ring-1 ring-orange-200/60 rounded-lg text-[11px] font-bold text-orange-800 w-fit">
            <Tag className="w-3 h-3 flex-shrink-0" /> {r.promo}
          </div>
        )}
      </div>
    </Link>
  )
}
