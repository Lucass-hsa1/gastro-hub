'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Heart, Star, Clock, Bike, Tag, Plus, Minus, ShoppingBag,
  Search, Info, MapPin, ChevronRight, Trash2, X, Sparkles
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
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Banner + back */}
      <div className={`relative h-48 bg-gradient-to-br ${restaurant.banner} overflow-hidden`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-9xl opacity-30">{restaurant.bannerEmoji}</span>
        </div>
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/95 backdrop-blur rounded-full flex items-center justify-center shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => toggleFavorite(restaurant.id)}
              className="w-10 h-10 bg-white/95 backdrop-blur rounded-full flex items-center justify-center shadow-md"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
            </button>
            <button
              onClick={() => setShowInfo(true)}
              className="w-10 h-10 bg-white/95 backdrop-blur rounded-full flex items-center justify-center shadow-md"
            >
              <Info className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Restaurant info card */}
      <div className="max-w-3xl mx-auto px-4 -mt-14 relative">
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="flex gap-3">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-md flex-shrink-0 border border-gray-100">
              {restaurant.logo}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <h1 className="text-lg font-extrabold leading-tight flex-1">{restaurant.name}</h1>
                {restaurant.superRestaurant && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full text-[10px] font-extrabold flex-shrink-0">
                    <Star className="w-3 h-3 fill-yellow-900" /> SUPER
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{restaurant.tags.join(' · ')}</p>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-600 flex-wrap">
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-gray-900">{restaurant.rating}</span>
                  <span>({restaurant.reviewCount})</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  {restaurant.deliveryTime[0]}-{restaurant.deliveryTime[1]} min
                </span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Bike className="w-3 h-3" />
                  {restaurant.deliveryFee === 0
                    ? <span className="text-emerald-600 font-bold">Frete grátis</span>
                    : formatBRL(restaurant.deliveryFee)
                  }
                </span>
              </div>
            </div>
          </div>
          {restaurant.promo && (
            <div className="mt-3 flex items-center gap-2 p-2.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl">
              <Sparkles className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <p className="text-xs font-bold text-orange-800">{restaurant.promo}</p>
            </div>
          )}
          {!restaurant.isOpen && (
            <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-center">
              <p className="text-xs font-bold text-red-700">⚠️ Restaurante fechado no momento</p>
            </div>
          )}
        </div>
      </div>

      {/* Search + categories sticky */}
      <div className="sticky top-0 z-20 bg-gray-50 mt-4 border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar no cardápio..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-300"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === null ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-200'
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
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeCategory === c ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-6">
        {Object.keys(groupedMenu).length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center">
            <Search className="w-10 h-10 mx-auto opacity-30 mb-3" />
            <p className="text-sm font-bold mb-1">Nenhum item encontrado</p>
            <p className="text-xs text-gray-500">Tente outra busca</p>
          </div>
        ) : (
          Object.entries(groupedMenu).map(([category, dishes]) => (
            <section key={category} id={`cat-${category}`}>
              <h2 className="text-base font-extrabold mb-3 flex items-center gap-2">
                {category}
                <span className="text-xs text-gray-400 font-normal">{dishes.length} itens</span>
              </h2>
              <div className="space-y-2">
                {dishes.map(d => {
                  const qty = cartCount(d.id)
                  return (
                    <motion.div
                      key={d.id}
                      layout
                      className="bg-white rounded-2xl p-4 flex gap-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <h3 className="font-bold text-sm leading-tight">{d.name}</h3>
                          {d.popular && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold flex-shrink-0">
                              🔥 Top
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{d.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-teal-700">{formatBRL(d.price)}</span>
                          {d.oldPrice && (
                            <span className="text-xs text-gray-400 line-through">{formatBRL(d.oldPrice)}</span>
                          )}
                          {d.oldPrice && (
                            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded">
                              {Math.round((1 - d.price / d.oldPrice) * 100)}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                          {d.emoji}
                        </div>
                        {qty === 0 ? (
                          <button
                            onClick={() => restaurant.isOpen && handleAdd(d)}
                            disabled={!restaurant.isOpen}
                            className="w-20 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
                          >
                            <Plus className="w-3 h-3" /> Adicionar
                          </button>
                        ) : (
                          <div className="w-20 py-1 bg-orange-500 text-white rounded-lg flex items-center justify-between px-2">
                            <button onClick={() => updateQty(d.id, qty - 1)}>
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold">{qty}</span>
                            <button onClick={() => updateQty(d.id, qty + 1)}>
                              <Plus className="w-3 h-3" />
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
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-500">Carrinho</p>
                  <h3 className="font-extrabold">{restaurant.name}</h3>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="w-8 h-8 hover:bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cartItemsForThis.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-10 h-10 mx-auto opacity-30 mb-2" />
                    <p className="text-sm text-gray-500">Carrinho vazio</p>
                  </div>
                ) : (
                  cartItemsForThis.map(c => (
                    <div key={c.dishId} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-3xl">{c.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{c.name}</p>
                        <p className="text-xs text-gray-500">{formatBRL(c.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQty(c.dishId, c.quantity - 1)}
                            className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-6 text-center">{c.quantity}</span>
                          <button
                            onClick={() => updateQty(c.dishId, c.quantity + 1)}
                            className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100"
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
                      <p className="font-bold text-sm whitespace-nowrap">
                        {formatBRL(c.price * c.quantity)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {cartItemsForThis.length > 0 && (
                <div className="border-t p-4 space-y-3">
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
                    <span className="font-bold">Total</span>
                    <span className="font-extrabold text-teal-700">{formatBRL(cartTotal + restaurant.deliveryFee)}</span>
                  </div>
                  {cartTotal < restaurant.minOrder && (
                    <p className="text-[11px] text-orange-600 font-bold">
                      Faltam {formatBRL(restaurant.minOrder - cartTotal)} para o pedido mínimo
                    </p>
                  )}
                  <Link
                    href="/delivery-app/checkout"
                    onClick={() => setShowCart(false)}
                    className={`w-full block text-center py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold ${
                      cartTotal < restaurant.minOrder ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    Continuar para pagamento
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
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
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
                <div className="w-14 h-14 bg-gradient-to-br rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 border border-gray-100"
                  style={{ background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)' }}>
                  {restaurant.logo}
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-lg">{restaurant.name}</h3>
                  <p className="text-xs text-gray-500">{restaurant.tags.join(' · ')}</p>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  className="w-8 h-8 hover:bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">{restaurant.description}</p>

              <div className="space-y-3">
                <InfoRow icon={<MapPin className="w-4 h-4 text-gray-400" />} label="Endereço" value={restaurant.address} />
                <InfoRow
                  icon={<Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  label="Avaliações"
                  value={`${restaurant.rating} · ${restaurant.reviewCount} avaliações`}
                />
                <InfoRow icon={<Clock className="w-4 h-4 text-gray-400" />} label="Tempo de entrega" value={`${restaurant.deliveryTime[0]} a ${restaurant.deliveryTime[1]} min`} />
                <InfoRow
                  icon={<Bike className="w-4 h-4 text-gray-400" />}
                  label="Taxa de entrega"
                  value={restaurant.deliveryFee === 0 ? 'Grátis' : `${formatBRL(restaurant.deliveryFee)}${restaurant.freeFrom ? ` · grátis acima de ${formatBRL(restaurant.freeFrom)}` : ''}`}
                />
                <InfoRow icon={<Tag className="w-4 h-4 text-gray-400" />} label="Pedido mínimo" value={formatBRL(restaurant.minOrder)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Switch restaurant confirm */}
      <AnimatePresence>
        {showSwitchConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowSwitchConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-sm w-full p-6 text-center"
            >
              <div className="text-5xl mb-3">🛒</div>
              <h3 className="font-extrabold text-lg mb-2">Mudar de restaurante?</h3>
              <p className="text-sm text-gray-600 mb-5">
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
                  className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold"
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
      {mounted && cartItemCount > 0 && (
        <motion.button
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          onClick={() => setShowCart(true)}
          className="fixed bottom-4 left-4 right-4 z-30 max-w-3xl mx-auto bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-3 shadow-2xl flex items-center justify-between hover:shadow-orange-500/50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-orange-600 text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            </div>
            <span className="font-bold text-sm">Ver carrinho ({cartItemCount} item{cartItemCount > 1 ? 's' : ''})</span>
          </div>
          <span className="font-extrabold">{formatBRL(cartTotal)}</span>
        </motion.button>
      )}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-[10px] uppercase font-bold text-gray-500">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  )
}
