'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, Plus, Minus, X, Search, Clock, UtensilsCrossed, Star, Send,
  MapPin, ClipboardList, ChefHat, ArrowLeft
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import type { OrderItem } from '@/lib/types'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function PublicMenuInner() {
  const [mounted, setMounted] = useState(false)
  const store = useStore()
  const router = useRouter()
  const params = useSearchParams()

  const mesaParam = params.get('mesa')
  const modo = params.get('modo') // 'garcom' = aberto pelo garçom dentro do app
  const isWaiter = modo === 'garcom'

  const tableObj = mesaParam ? store.tables.find(t => t.number === Number(mesaParam)) : null
  const isDineIn = !!tableObj
  const isDelivery = !mesaParam // sem mesa = pedido delivery/balcão

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [cart, setCart] = useState<OrderItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const categories = ['Todos', ...Array.from(new Set(store.menu.map(m => m.category)))]
  const filtered = store.menu.filter(m => {
    if (!m.available) return false
    if (selectedCategory !== 'Todos' && m.category !== selectedCategory) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const addToCart = (item: typeof store.menu[0]) => {
    const existing = cart.find(i => i.menuItemId === item.id)
    if (existing) {
      setCart(cart.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      setCart([...cart, {
        id: Math.random().toString(36).slice(2),
        menuItemId: item.id,
        name: item.name,
        quantity: 1,
        price: item.price,
        emoji: item.emoji,
        prepTime: item.prepTime,
      }])
    }
    toast.success(`${item.name}`, { icon: item.emoji, duration: 800 })
  }

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) setCart(cart.filter(i => i.id !== id))
    else setCart(cart.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  const sendOrder = () => {
    if (cart.length === 0) { toast.error('Carrinho vazio'); return }

    if (isDineIn && tableObj) {
      const order = store.createOrAppendTableOrder(tableObj.id, cart, {
        source: isWaiter ? 'waiter' : 'qr',
        customerName: customerName || undefined,
      })
      setCart([])
      setShowCart(false)
      // Vai pra status (cliente) ou volta pro garçom (modo garcom)
      if (isWaiter) {
        toast.success(`Pedido enviado pra cozinha (Mesa ${tableObj.number})`, { duration: 2500 })
        setTimeout(() => router.push('/garcom'), 800)
      } else {
        router.push(`/cardapio/public/pedido/${order.id}?mesa=${tableObj.number}`)
      }
      return
    }

    // Delivery/Takeout
    if (!customerName) { toast.error('Informe seu nome'); return }
    if (!address) { toast.error('Informe o endereço'); return }
    if (!phone) { toast.error('Informe o telefone'); return }

    const order = store.createOrder({
      type: 'delivery',
      items: cart.map(i => ({ ...i, status: 'pending', addedAt: new Date().toISOString() })),
      status: 'pending',
      subtotal: total,
      discount: 0,
      total: total + store.restaurant.deliveryFee,
      customerName,
      source: 'qr',
      notes: `Endereço: ${address} • Tel: ${phone}`,
    })
    store.createDelivery({
      orderId: order.id,
      customerName,
      address,
      neighborhood: '',
      phone,
      status: 'pending',
      total: total + store.restaurant.deliveryFee,
      deliveryFee: store.restaurant.deliveryFee,
      estimatedTime: 35,
      distance: 3,
    })
    setCart([])
    setShowCart(false)
    router.push(`/cardapio/public/pedido/${order.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
      <Toaster position="top-center" />

      <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-orange-500 text-white sticky top-0 z-30">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isWaiter && (
                <button onClick={() => router.push('/garcom')} className="p-2 bg-white/20 rounded-lg">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-xs opacity-80">
                  {isWaiter ? '👤 Modo Garçom' : isDineIn ? '🪑 Pedindo na Mesa' : '🛵 Delivery'}
                </p>
                <h1 className="text-lg font-bold">{store.restaurant.name}</h1>
              </div>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-white/20 hover:bg-white/30 p-2 rounded-xl"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-400 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-4">
          <div className="bg-white rounded-xl flex items-center gap-2 px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              placeholder="Buscar prato..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm text-gray-900"
            />
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all ${
                  selectedCategory === cat ? 'bg-white text-teal-700' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Banner identificando mesa ou delivery */}
      <div className="max-w-2xl mx-auto p-4">
        {isDineIn && tableObj ? (
          <div className="bg-gradient-to-r from-teal-100 to-orange-100 border border-teal-300 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🪑</div>
              <div>
                <p className="text-xs uppercase font-bold text-teal-700">Mesa identificada</p>
                <p className="text-lg font-bold">Mesa {tableObj.number} <span className="text-xs font-normal text-gray-600">• {tableObj.capacity} lugares</span></p>
              </div>
            </div>
            <Link
              href={`/cardapio/public/comanda?mesa=${tableObj.number}`}
              className="bg-white text-teal-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 border border-teal-200"
            >
              <ClipboardList className="w-3 h-3" /> Comanda
            </Link>
          </div>
        ) : isDelivery && !isWaiter ? (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
            <div className="text-3xl">🛵</div>
            <div>
              <p className="text-xs uppercase font-bold text-orange-700">Pedido para entrega</p>
              <p className="text-sm text-gray-700">Taxa: {formatBRL(store.restaurant.deliveryFee)} • Entrega ~35 min</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-32 space-y-6">
        {categories.filter(c => c !== 'Todos' && (selectedCategory === 'Todos' || c === selectedCategory)).map(cat => {
          const items = filtered.filter(f => f.category === cat)
          if (items.length === 0) return null
          return (
            <div key={cat}>
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                {cat}
                <span className="text-xs text-gray-400">({items.length})</span>
              </h2>
              <div className="space-y-3">
                {items.map(item => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => addToCart(item)}
                    className="w-full bg-white rounded-2xl p-4 flex gap-4 text-left shadow-sm hover:shadow-md transition-all relative"
                  >
                    {item.popular && (
                      <div className="absolute top-2 right-2 text-[9px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">🔥 HOT</div>
                    )}
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-50 to-orange-50 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0">
                      {item.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-teal-600">{formatBRL(item.price)}</p>
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {item.prepTime}min
                          </span>
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-orange-500 rounded-full flex items-center justify-center text-white">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {cart.length > 0 && !showCart && (
        <motion.button
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          onClick={() => setShowCart(true)}
          className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto bg-gradient-to-r from-teal-600 to-orange-500 text-white py-3 px-5 rounded-2xl shadow-2xl flex items-center justify-between z-40"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <span className="font-bold">{cart.reduce((s, i) => s + i.quantity, 0)} itens</span>
          </div>
          <span className="font-bold text-lg">{formatBRL(total)}</span>
          <span className="text-sm opacity-80">Ver →</span>
        </motion.button>
      )}

      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Seu Pedido</h2>
                  {isDineIn && tableObj && (
                    <p className="text-xs text-teal-600 font-semibold">Mesa {tableObj.number}</p>
                  )}
                  {isDelivery && (
                    <p className="text-xs text-orange-600 font-semibold">Delivery</p>
                  )}
                </div>
                <button onClick={() => setShowCart(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingBag className="w-16 h-16 mx-auto opacity-30 mb-3" />
                    <p>Seu carrinho está vazio</p>
                  </div>
                ) : (
                  <>
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="text-3xl">{item.emoji}</div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">{formatBRL(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-7 h-7 bg-white border rounded-full flex items-center justify-center">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold w-5 text-center">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-7 h-7 bg-teal-500 text-white rounded-full flex items-center justify-center">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 space-y-2">
                      {isDineIn ? (
                        <input
                          placeholder="Seu nome (opcional)"
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-teal-500"
                        />
                      ) : (
                        <>
                          <input
                            placeholder="Seu nome *"
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-teal-500"
                          />
                          <input
                            placeholder="Telefone *"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-teal-500"
                          />
                          <div className="relative">
                            <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                            <input
                              placeholder="Endereço completo *"
                              value={address}
                              onChange={e => setAddress(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-teal-500"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-4 border-t border-gray-100 space-y-3">
                  {isDelivery && (
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Taxa de entrega</span>
                      <span>{formatBRL(store.restaurant.deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-teal-700">
                      {formatBRL(isDelivery ? total + store.restaurant.deliveryFee : total)}
                    </span>
                  </div>
                  <button
                    onClick={sendOrder}
                    className="w-full py-3 bg-gradient-to-r from-teal-600 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    {isDineIn ? <ChefHat className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                    {isWaiter
                      ? `Enviar pra Cozinha • Mesa ${tableObj?.number}`
                      : isDineIn
                        ? `Mandar pra Cozinha • Mesa ${tableObj?.number}`
                        : 'Finalizar Pedido'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PublicMenuPage() {
  return (
    <Suspense fallback={null}>
      <PublicMenuInner />
    </Suspense>
  )
}
