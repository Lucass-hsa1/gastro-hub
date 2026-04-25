'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search, MapPin, ChevronDown, Heart, Star, Clock, Bike, Tag, Zap,
  ShoppingBag, ArrowRight, Sparkles, Flame, Percent, Home, Receipt,
  User as UserIcon, ChevronRight
} from 'lucide-react'
import {
  marketRestaurants,
  marketCategories,
  type MarketRestaurant,
} from '@/lib/marketplace'
import { useMarketStore } from '@/lib/marketplace-store'
import { useStore } from '@/lib/store'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function DeliveryAppHome() {
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('all')
  const [showAddressPicker, setShowAddressPicker] = useState(false)

  const cart = useMarketStore(s => s.cart)
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setShowAddressPicker(!showAddressPicker)}
              className="flex items-center gap-2 flex-1 min-w-0 text-left"
            >
              <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-bold text-gray-500">Entregar em</p>
                <p className="text-sm font-bold truncate flex items-center gap-1">
                  {selectedAddress ? `${selectedAddress.street}, ${selectedAddress.number}` : 'Escolha um endereço'}
                  <ChevronDown className="w-3 h-3 flex-shrink-0" />
                </p>
              </div>
            </button>
            <Link href="/delivery-app/perfil" className="w-10 h-10 bg-gradient-to-br from-teal-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(mounted && authUser?.name?.[0]) || 'C'}
            </Link>
          </div>

          {/* Address picker dropdown */}
          {showAddressPicker && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 border border-gray-200 rounded-xl overflow-hidden bg-white"
            >
              {addresses.map(a => (
                <button
                  key={a.id}
                  onClick={() => {
                    selectAddress(a.id)
                    setShowAddressPicker(false)
                  }}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-gray-50 text-left border-b last:border-0 border-gray-100 ${
                    selectedAddressId === a.id ? 'bg-orange-50' : ''
                  }`}
                >
                  <Home className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">{a.label}</p>
                    <p className="text-xs text-gray-500">
                      {a.street}, {a.number} — {a.neighborhood}
                    </p>
                  </div>
                  {selectedAddressId === a.id && (
                    <span className="w-2 h-2 bg-orange-500 rounded-full" />
                  )}
                </button>
              ))}
            </motion.div>
          )}

          {/* Search */}
          <div className="relative mt-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar restaurante, prato ou item..."
              className="w-full pl-9 pr-3 py-2.5 bg-gray-100 border-0 rounded-xl outline-none text-sm focus:bg-white focus:ring-2 focus:ring-orange-200"
            />
          </div>
        </div>
      </header>

      {/* Active order banner */}
      {mounted && activeOrder && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto px-4 mt-4"
        >
          <Link
            href={`/delivery-app/pedido/${activeOrder.id}`}
            className="block bg-gradient-to-r from-teal-600 to-orange-500 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                {activeOrder.restaurantLogo}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-bold opacity-90">
                  Pedido #{activeOrder.number} · {activeOrder.restaurantName}
                </p>
                <p className="font-bold">
                  {activeOrder.status === 'pending' && 'Aguardando confirmação...'}
                  {activeOrder.status === 'confirmed' && 'Pedido confirmado!'}
                  {activeOrder.status === 'preparing' && '👨‍🍳 Em preparo'}
                  {activeOrder.status === 'ready' && 'Pronto para sair'}
                  {activeOrder.status === 'on-the-way' && '🛵 Saiu para entrega'}
                </p>
                <p className="text-xs opacity-90">Tempo estimado: {activeOrder.estimatedTime} min</p>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </Link>
        </motion.div>
      )}

      {/* Categorias */}
      <section className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin">
          {marketCategories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl transition-all ${
                activeCat === c.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-xs font-bold whitespace-nowrap">{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 space-y-6">
        {/* Banner promocional */}
        {!search && activeCat === 'all' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-5 overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 text-7xl opacity-20">🍔</div>
              <div className="relative">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold mb-2">
                  <Zap className="w-3 h-3" /> OFERTA RELÂMPAGO
                </span>
                <h3 className="font-extrabold text-lg leading-tight">15% OFF em hambúrgueres</h3>
                <p className="text-xs opacity-90 mb-3">Burguer House — pedidos acima de R$ 50</p>
                <Link
                  href="/delivery-app/restaurante/r1"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-orange-600 rounded-lg text-xs font-bold"
                >
                  Pedir agora <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal-600 to-emerald-500 text-white rounded-2xl p-5 overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 text-7xl opacity-20">🍕</div>
              <div className="relative">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold mb-2">
                  <Sparkles className="w-3 h-3" /> FRETE GRÁTIS
                </span>
                <h3 className="font-extrabold text-lg leading-tight">Pizza sem taxa de entrega</h3>
                <p className="text-xs opacity-90 mb-3">Pizza Bella Napoli — só hoje</p>
                <Link
                  href="/delivery-app/restaurante/r2"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-teal-700 rounded-lg text-xs font-bold"
                >
                  Pedir agora <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Favoritos */}
        {!search && activeCat === 'all' && favorites.length > 0 && (
          <Section title="Seus favoritos" icon={<Heart className="w-4 h-4 text-red-500 fill-red-500" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favorites.map(r => (
                <RestaurantCard key={r.id} r={r} compact onFav={toggleFavorite} isFav={favoriteIds.includes(r.id)} />
              ))}
            </div>
          </Section>
        )}

        {/* Destaques */}
        {!search && activeCat === 'all' && (
          <Section title="Super Restaurantes" icon={<Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featured.map(r => (
                <RestaurantCard key={r.id} r={r} onFav={toggleFavorite} isFav={favoriteIds.includes(r.id)} />
              ))}
            </div>
          </Section>
        )}

        {/* Promoções */}
        {!search && activeCat === 'all' && (
          <Section title="Promoções imperdíveis" icon={<Percent className="w-4 h-4 text-orange-500" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {promos.slice(0, 4).map(r => (
                <RestaurantCard key={r.id} r={r} onFav={toggleFavorite} isFav={favoriteIds.includes(r.id)} />
              ))}
            </div>
          </Section>
        )}

        {/* Lista geral */}
        <Section
          title={
            search
              ? `Resultados para "${search}"`
              : activeCat === 'all'
                ? 'Todos os restaurantes'
                : `${marketCategories.find(c => c.id === activeCat)?.name}`
          }
          icon={<Flame className="w-4 h-4 text-orange-500" />}
          subtitle={`${filtered.length} restaurante${filtered.length !== 1 ? 's' : ''}`}
        >
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center">
              <Search className="w-10 h-10 mx-auto opacity-30 mb-3" />
              <p className="text-sm font-bold mb-1">Nada encontrado</p>
              <p className="text-xs text-gray-500">Tente outra busca ou categoria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map(r => (
                <RestaurantCard key={r.id} r={r} onFav={toggleFavorite} isFav={favoriteIds.includes(r.id)} />
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 safe-bottom">
        <div className="max-w-5xl mx-auto px-4 py-2 grid grid-cols-3 gap-1">
          <Link href="/delivery-app" className="flex flex-col items-center gap-0.5 py-2 text-orange-600">
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold">Início</span>
          </Link>
          <Link href="/delivery-app/pedidos" className="flex flex-col items-center gap-0.5 py-2 text-gray-500 hover:text-orange-600">
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] font-bold">Pedidos</span>
          </Link>
          <Link href="/delivery-app/perfil" className="flex flex-col items-center gap-0.5 py-2 text-gray-500 hover:text-orange-600">
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">Perfil</span>
          </Link>
        </div>
      </div>

      {/* Cart floating button */}
      {mounted && cartItemCount > 0 && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          className="fixed bottom-16 left-0 right-0 z-20 px-4"
        >
          <Link
            href={`/delivery-app/restaurante/${useMarketStore.getState().cartRestaurantId}`}
            className="max-w-5xl mx-auto block bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-3 shadow-2xl flex items-center justify-between hover:shadow-orange-500/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-orange-600 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              </div>
              <span className="font-bold text-sm">Ver carrinho</span>
            </div>
            <span className="font-bold">{formatBRL(cartTotal)}</span>
          </Link>
        </motion.div>
      )}
    </div>
  )
}

function Section({
  title,
  icon,
  subtitle,
  children,
}: {
  title: string
  icon?: React.ReactNode
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-extrabold flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

function RestaurantCard({
  r,
  compact,
  onFav,
  isFav,
}: {
  r: MarketRestaurant
  compact?: boolean
  onFav: (id: string) => void
  isFav: boolean
}) {
  return (
    <Link
      href={`/delivery-app/restaurante/${r.id}`}
      className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all flex flex-col ${
        !r.isOpen ? 'opacity-60' : ''
      }`}
    >
      {/* Banner */}
      <div className={`relative h-24 bg-gradient-to-br ${r.banner} overflow-hidden flex items-center justify-center`}>
        <span className="text-6xl opacity-90 group-hover:scale-110 transition-transform">{r.bannerEmoji}</span>
        {r.superRestaurant && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full text-[10px] font-extrabold">
            <Star className="w-3 h-3 fill-yellow-900" /> SUPER
          </span>
        )}
        <button
          onClick={e => {
            e.preventDefault()
            onFav(r.id)
          }}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
        </button>
        {!r.isOpen && (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-gray-900/80 text-white rounded text-[10px] font-bold">
            FECHADO
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-start gap-2">
          <div className="w-10 h-10 -mt-7 ml-1 bg-white rounded-xl shadow-md flex items-center justify-center text-2xl flex-shrink-0 border-2 border-white">
            {r.logo}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm leading-tight truncate">{r.name}</h3>
            <p className="text-[11px] text-gray-500 truncate">{r.tags.join(' · ')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-600">
          <span className="flex items-center gap-0.5">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-gray-900">{r.rating}</span>
            <span>({r.reviewCount > 999 ? `${(r.reviewCount / 1000).toFixed(1)}k` : r.reviewCount})</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {r.deliveryTime[0]}-{r.deliveryTime[1]} min
          </span>
          <span>·</span>
          <span>{r.distance} km</span>
        </div>

        <div className="flex items-center gap-2 mt-1 text-[11px]">
          <span className="flex items-center gap-1 font-bold">
            <Bike className="w-3 h-3 text-gray-500" />
            {r.deliveryFee === 0 ? (
              <span className="text-emerald-600">Grátis</span>
            ) : (
              formatBRL(r.deliveryFee)
            )}
          </span>
          {r.freeFrom && r.deliveryFee > 0 && (
            <span className="text-gray-400">grátis a partir de {formatBRL(r.freeFrom)}</span>
          )}
        </div>

        {r.promo && (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-orange-50 border border-orange-200 rounded text-[10px] font-bold text-orange-700 w-fit">
            <Tag className="w-3 h-3" /> {r.promo}
          </div>
        )}
      </div>
    </Link>
  )
}
