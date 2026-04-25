'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Heart, Star, Clock, Bike, Tag, Plus, Minus, ShoppingBag,
  Search, Info, MapPin, Trash2, X, Sparkles, Share2, Flame
} from 'lucide-react'
import { getRestaurantById } from '@/lib/marketplace'
import { useMarketStore } from '@/lib/marketplace-store'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function RestaurantPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params?.id || '')
  const restaurant = getRestaurantById(id)

  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showCart, setShowCart] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showSwitchConfirm, setShowSwitchConfirm] = useState<{ item: any; quantity: number } | null>(null)

  const cart = useMarketStore(s => s.cart)
  const cartRestaurantId = useMarketStore(s => s.cartRestaurantId)
  const addToCart = useMarketStore(s => s.addToCart)
  const updateQty = useMarketStore(s => s.updateQty)
  const removeFromCart = useMarketStore(s => s.removeFromCart)
  const clearCart = useMarketStore(s => s.clearCart)
  const favoriteIds = useMarketStore(s => s.favoriteRestaurantIds)
  const toggleFavorite = useMarketStore(s => s.toggleFavorite)

  useEffect(() => setMounted(true), [])

  const isFav = restaurant ? favoriteIds.includes(restaurant.id) : false

  const cartItemsForThis = useMemo(
    () => (cartRestaurantId === id ? cart : []),
    [cart, cartRestaurantId, id]
  )
  const cartTotal = cartItemsForThis.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const cartItemCount = cartItemsForThis.reduce((sum, i) => sum + i.quantity, 0)

  const categories = useMemo(() => {
    if (!restaurant) return []
    const set = new Set<string>()
    restaurant.menu.forEach(d => set.add(d.category))
    return Array.from(set)
  }, [restaurant])

  const filteredMenu = useMemo(() => {
    if (!restaurant) return []
    let m = restaurant.menu
    if (search) {
      const s = search.toLowerCase()
      m = m.filter(d => d.name.toLowerCase().includes(s) || d.description.toLowerCase().includes(s))
    }
    return m
  }, [restaurant, search])

  const groupedMenu = useMemo(() => {
    const grouped: Record<string, typeof filteredMenu> = {}
    filteredMenu.forEach(d => {
      if (!grouped[d.category]) grouped[d.category] = []
      grouped[d.category].push(d)
    })
    return grouped
  }, [filteredMenu])

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-warm">
        <div className="text-center">
          <p className="text-lg font-bold mb-2">Restaurante não encontrado</p>
          <Link href="/delivery-app" className="text-orange-600 font-bold text-sm">
            ← Voltar
          </Link>
        </div>
      </div>
    )
  }

  const handleAdd = (dish: typeof restaurant.menu[0]) => {
    if (cartRestaurantId && cartRestaurantId !== id && cart.length > 0) {
      setShowSwitchConfirm({ item: dish, quantity: 1 })
      return
    }
    addToCart(
      {
        dishId: dish.id,
        restaurantId: id,
        name: dish.name,
        price: dish.price,
        emoji: dish.emoji,
      },
      1
    )
  }

  const cartCount = (dishId: string) =>
    cartItemsForThis.find(c => c.dishId === dishId)?.quantity || 0

  return (
    <div className="min-h-screen mesh-warm noise pb-32">
      {/* Hero cinematográfico */}
      <div className={`relative h-72 bg-gradient-to-br ${restaurant.banner} overflow-hidden`}>
        {/* shapes decorativos */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute top-1/2 right-[-10%] -translate-y-1/2 text-[280px] leading-none opacity-40 select-none"
        >
          {restaurant.bannerEmoji}
        </motion.div>
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 right-1/3 w-56 h-56 bg-white/10 rounded-full blur-3xl" />

        {/* Top bar */}
        <div className="relative z-10 max-w-3xl mx-auto p-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-11 h-11 bg-white/95 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => navigator.share?.({ title: restaurant.name, url: window.location.href }).catch(() => {})}
              className="w-11 h-11 bg-white/95 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <Share2 className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={() => toggleFavorite(restaurant.id)}
              className="w-11 h-11 bg-white/95 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
            </button>
            <button
              onClick={() => setShowInfo(true)}
              className="w-11 h-11 bg-white/95 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <Info className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Hero text overlay */}
        <div className="absolute bottom-16 left-0 right-0 max-w-3xl mx-auto px-4 z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {restaurant.superRestaurant && (
              <span className="sticker inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-400 text-yellow-900 rounded-full text-[10px] font-extrabold">
                <Star className="w-3 h-3 fill-yellow-900" /> SUPER RESTAURANTE
              </span>
            )}
            {restaurant.deliveryFee === 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                Frete grátis
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/40 backdrop-blur text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              {restaurant.tags[0]}
            </span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl sm:text-5xl text-white leading-[0.95] drop-shadow-lg"
          >
            {restaurant.name}
          </motion.h1>
        </div>

        {/* Wave bottom */}
        <svg className="absolute bottom-0 left-0 right-0 w-full h-12 z-10" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,40 C240,60 480,10 720,30 C960,50 1200,55 1440,40 L1440,60 L0,60 Z" fill="#FFF7EE" />
        </svg>
      </div>

      {/* Stat bar — flutuante sobre o hero */}
      <div className="max-w-3xl mx-auto px-4 -mt-3 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-black/5 p-4 border-gradient"
        >
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-white via-orange-50 to-pink-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner ring-1 ring-orange-100 flex-shrink-0">
              {restaurant.logo}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 truncate font-medium">{restaurant.tags.join(' · ')}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  {restaurant.rating} <span className="opacity-60 font-medium">({restaurant.reviewCount})</span>
                </span>
                <span className="text-gray-300">•</span>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold">
                  <Clock className="w-3 h-3" />
                  {restaurant.deliveryTime[0]}-{restaurant.deliveryTime[1]} min
                </span>
                <span className="text-gray-300">•</span>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold">
                  <Bike className="w-3 h-3" />
                  {restaurant.deliveryFee === 0 ? (
                    <span className="text-emerald-600">Grátis</span>
                  ) : (
                    formatBRL(restaurant.deliveryFee)
                  )}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pedido mín.</p>
              <p className="font-extrabold text-teal-700 text-sm">{formatBRL(restaurant.minOrder)}</p>
            </div>
          </div>

          {restaurant.promo && (
            <div className="mt-3 flex items-center gap-2 p-3 bg-gradient-to-r from-orange-50 via-pink-50 to-orange-50 ring-1 ring-orange-200 rounded-2xl">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-orange-900 flex-1">{restaurant.promo}</p>
            </div>
          )}

          {!restaurant.isOpen && (
            <div className="mt-3 p-3 bg-red-50 ring-1 ring-red-200 rounded-2xl text-center">
              <p className="text-xs font-bold text-red-700">⚠️ Restaurante fechado no momento</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Search + categorias sticky */}
      <div className="sticky top-0 z-20 mt-4">
        <div className="bg-[#FFF7EE]/90 backdrop-blur-xl border-b border-orange-100/50">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar no cardápio..."
                className="w-full pl-11 pr-4 py-2.5 bg-white border-0 rounded-2xl outline-none text-sm font-medium shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-orange-400 transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
              <button
                onClick={() => setActiveCategory(null)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all ${
                  activeCategory === null
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-white text-gray-700 ring-1 ring-gray-200'
                }`}
              >
                Tudo
              </button>
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    setActiveCategory(c)
                    document.getElementById(`cat-${c}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all ${
                    activeCategory === c
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30'
                      : 'bg-white text-gray-700 ring-1 ring-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {Object.keys(groupedMenu).length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center ring-1 ring-gray-100">
            <Search className="w-10 h-10 mx-auto opacity-30 mb-3" />
            <p className="text-sm font-bold mb-1">Nenhum item encontrado</p>
            <p className="text-xs text-gray-500">Tente outra busca</p>
          </div>
        ) : (
          Object.entries(groupedMenu).map(([category, dishes]) => (
            <section key={category} id={`cat-${category}`}>
              <div className="flex items-end gap-3 mb-4">
                <h2 className="font-display text-2xl flex items-center gap-2">{category}</h2>
                <span className="text-xs text-gray-400 font-bold mb-1">{dishes.length} ITENS</span>
              </div>
              <div className="space-y-3">
                {dishes.map((d, i) => {
                  const qty = cartCount(d.id)
                  return (
                    <motion.div
                      key={d.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`group relative bg-white rounded-3xl p-4 flex gap-4 ring-1 transition-all ${
                        qty > 0 ? 'ring-orange-300 shadow-lg shadow-orange-500/10' : 'ring-gray-100 hover:ring-orange-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1.5 flex-wrap">
                          <h3 className="font-extrabold text-base leading-tight tracking-tight">{d.name}</h3>
                          {d.popular && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 rounded-full text-[10px] font-extrabold ring-1 ring-orange-200/60">
                              <Flame className="w-3 h-3" /> TOP
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{d.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-teal-700 text-lg">{formatBRL(d.price)}</span>
                          {d.oldPrice && (
                            <>
                              <span className="text-xs text-gray-400 line-through">{formatBRL(d.oldPrice)}</span>
                              <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] font-extrabold rounded-full">
                                {Math.round((1 - d.price / d.oldPrice) * 100)}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-pink-200 rounded-2xl blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
                          <div className="relative w-24 h-24 bg-gradient-to-br from-orange-50 via-white to-pink-50 rounded-2xl flex items-center justify-center text-5xl ring-1 ring-orange-100 shadow-inner group-hover:scale-105 group-hover:rotate-3 transition-transform duration-500">
                            {d.emoji}
                          </div>
                        </div>
                        {qty === 0 ? (
                          <button
                            onClick={() => restaurant.isOpen && handleAdd(d)}
                            disabled={!restaurant.isOpen}
                            className="w-24 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:shadow-lg hover:shadow-orange-500/40 disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all hover:scale-[1.03] active:scale-[0.97]"
                          >
                            <Plus className="w-3 h-3" /> Adicionar
                          </button>
                        ) : (
                          <div className="w-24 py-1.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl flex items-center justify-between px-2.5 shadow-lg shadow-orange-500/40">
                            <button onClick={() => updateQty(d.id, qty - 1)} className="hover:scale-110 transition-transform">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <motion.span
                              key={qty}
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-sm font-extrabold"
                            >
                              {qty}
                            </motion.span>
                            <button onClick={() => updateQty(d.id, qty + 1)} className="hover:scale-110 transition-transform">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Cart drawer */}
      <AnimatePresence>
        {mounted && showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-[420px] bg-[#FFF7EE] shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b border-orange-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl flex items-center justify-center text-2xl ring-1 ring-orange-100">
                    {restaurant.logo}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-extrabold text-orange-600 tracking-wider">Seu carrinho</p>
                    <h3 className="font-extrabold">{restaurant.name}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="w-9 h-9 hover:bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cartItemsForThis.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-3">🛒</div>
                    <p className="font-bold mb-1">Carrinho vazio</p>
                    <p className="text-xs text-gray-500">Adicione itens do cardápio</p>
                  </div>
                ) : (
                  cartItemsForThis.map(c => (
                    <motion.div
                      key={c.dishId}
                      layout
                      className="bg-white rounded-2xl p-3 flex gap-3 ring-1 ring-orange-100"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl flex items-center justify-center text-3xl ring-1 ring-orange-100 flex-shrink-0">
                        {c.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-sm truncate">{c.name}</p>
                        <p className="text-xs text-gray-500">{formatBRL(c.price)} cada</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQty(c.dishId, c.quantity - 1)}
                            className="w-7 h-7 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-extrabold w-6 text-center">{c.quantity}</span>
                          <button
                            onClick={() => updateQty(c.dishId, c.quantity + 1)}
                            className="w-7 h-7 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(c.dishId)}
                            className="ml-auto w-7 h-7 hover:bg-red-50 text-red-500 rounded-lg flex items-center justify-center"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="font-extrabold text-sm whitespace-nowrap text-teal-700">
                        {formatBRL(c.price * c.quantity)}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>

              {cartItemsForThis.length > 0 && (
                <div className="border-t border-orange-100 p-4 space-y-2 bg-white">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold">{formatBRL(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxa de entrega</span>
                    <span className="font-bold">
                      {restaurant.deliveryFee === 0
                        ? <span className="text-emerald-600">Grátis</span>
                        : formatBRL(restaurant.deliveryFee)
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t border-gray-100">
                    <span className="font-extrabold">Total</span>
                    <span className="font-extrabold text-teal-700 text-lg">{formatBRL(cartTotal + restaurant.deliveryFee)}</span>
                  </div>
                  {cartTotal < restaurant.minOrder && (
                    <div className="p-2 bg-orange-50 rounded-xl">
                      <p className="text-[11px] text-orange-700 font-bold text-center">
                        Faltam {formatBRL(restaurant.minOrder - cartTotal)} para o pedido mínimo
                      </p>
                    </div>
                  )}
                  <Link
                    href="/delivery-app/checkout"
                    onClick={() => setShowCart(false)}
                    className={`btn-glow w-full block text-center py-3.5 text-white rounded-2xl font-extrabold mt-2 ${
                      cartTotal < restaurant.minOrder ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    Continuar para pagamento →
                  </Link>
                  <button
                    onClick={clearCart}
                    className="w-full py-2 text-xs text-gray-500 hover:text-red-600 font-bold"
                  >
                    Esvaziar carrinho
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowInfo(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl flex items-center justify-center text-4xl ring-1 ring-orange-100">
                  {restaurant.logo}
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-lg">{restaurant.name}</h3>
                  <p className="text-xs text-gray-500">{restaurant.tags.join(' · ')}</p>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  className="w-9 h-9 hover:bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-gray-700 mb-5 leading-relaxed">{restaurant.description}</p>

              <div className="space-y-3">
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Endereço" value={restaurant.address} />
                <InfoRow
                  icon={<Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  label="Avaliações"
                  value={`${restaurant.rating} · ${restaurant.reviewCount} avaliações`}
                />
                <InfoRow icon={<Clock className="w-4 h-4" />} label="Tempo de entrega" value={`${restaurant.deliveryTime[0]} a ${restaurant.deliveryTime[1]} min`} />
                <InfoRow
                  icon={<Bike className="w-4 h-4" />}
                  label="Taxa de entrega"
                  value={restaurant.deliveryFee === 0 ? 'Grátis' : `${formatBRL(restaurant.deliveryFee)}${restaurant.freeFrom ? ` · grátis acima de ${formatBRL(restaurant.freeFrom)}` : ''}`}
                />
                <InfoRow icon={<Tag className="w-4 h-4" />} label="Pedido mínimo" value={formatBRL(restaurant.minOrder)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Switch confirm */}
      <AnimatePresence>
        {showSwitchConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowSwitchConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-sm w-full p-6 text-center"
            >
              <div className="text-6xl mb-3">🛒</div>
              <h3 className="font-extrabold text-xl mb-2">Mudar de restaurante?</h3>
              <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                Você já tem itens de outro restaurante no carrinho. Deseja substituir?
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    addToCart({
                      dishId: showSwitchConfirm.item.id,
                      restaurantId: id,
                      name: showSwitchConfirm.item.name,
                      price: showSwitchConfirm.item.price,
                      emoji: showSwitchConfirm.item.emoji,
                    }, 1)
                    setShowSwitchConfirm(null)
                  }}
                  className="btn-glow w-full py-3.5 text-white rounded-2xl font-extrabold"
                >
                  Sim, substituir carrinho
                </button>
                <button
                  onClick={() => setShowSwitchConfirm(null)}
                  className="w-full py-3 text-gray-600 font-bold text-sm"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating cart bar */}
      <AnimatePresence>
        {mounted && cartItemCount > 0 && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setShowCart(true)}
            className="fixed bottom-4 left-4 right-4 z-30 max-w-3xl mx-auto btn-glow text-white rounded-3xl p-4 flex items-center justify-between hover:scale-[1.01] active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-orange-600 text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-orange-500">
                  {cartItemCount}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase font-extrabold opacity-90 tracking-wider">
                  {cartItemCount} item{cartItemCount > 1 ? 's' : ''}
                </p>
                <p className="font-extrabold text-sm">Ver carrinho</p>
              </div>
            </div>
            <span className="font-extrabold text-base">{formatBRL(cartTotal)}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 p-3 bg-gray-50 rounded-2xl">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] uppercase font-extrabold text-gray-500 tracking-wider">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
