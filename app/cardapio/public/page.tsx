'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Plus, Minus, X, Search, MapPin, Phone, Clock, UtensilsCrossed, Star, Send } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import type { OrderItem } from '@/lib/types'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function PublicMenuPage() {
  const [mounted, setMounted] = useState(false)
  const store = useStore()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [cart, setCart] = useState<OrderItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [tableNumber, setTableNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [sentOrder, setSentOrder] = useState<number | null>(null)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const categories = ['Todos', ...new Set(store.menu.map(m => m.category))]
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
      setCart([...cart, { id: Math.random().toString(36).slice(2), menuItemId: item.id, name: item.name, quantity: 1, price: item.price, emoji: item.emoji }])
    }
    toast.success(`${item.name} adicionado`, { icon: item.emoji, duration: 1000 })
  }

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) setCart(cart.filter(i => i.id !== id))
    else setCart(cart.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  const sendOrder = () => {
    if (!tableNumber) { toast.error('Informe a mesa'); return }
    if (!customerName) { toast.error('Informe seu nome'); return }
    if (cart.length === 0) { toast.error('Carrinho vazio'); return }

    const order = store.createOrder({
      type: 'dine-in',
      items: cart,
      status: 'pending',
      subtotal: total,
      discount: 0,
      total,
      customerName,
      notes: `Mesa ${tableNumber} - Pedido via QR Code`,
    })

    setSentOrder(order.number)
    setCart([])
    setShowCart(false)

    setTimeout(() => setSentOrder(null), 8000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
      <Toaster position="top-center" />

      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-orange-500 text-white sticky top-0 z-30">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs opacity-80">Cardápio Digital</p>
                  <h1 className="text-lg font-bold">{store.restaurant.name}</h1>
                </div>
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

        {/* Search */}
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

        {/* Categories */}
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

      {/* Restaurant info */}
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-teal-600" />
            <span className="font-semibold">Aberto</span>
            <span className="text-gray-500">• {store.restaurant.openTime} - {store.restaurant.closeTime}</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-500 ml-auto">
            <Star className="w-4 h-4 fill-yellow-500" />
            <Star className="w-4 h-4 fill-yellow-500" />
            <Star className="w-4 h-4 fill-yellow-500" />
            <Star className="w-4 h-4 fill-yellow-500" />
            <Star className="w-4 h-4 fill-yellow-500" />
            <span className="text-xs text-gray-600 ml-1 font-semibold">4.9</span>
          </div>
        </div>
      </div>

      {/* Menu */}
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
                        <p className="text-lg font-bold text-teal-600">{formatBRL(item.price)}</p>
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

      {/* Floating cart button */}
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
          <span className="text-sm opacity-80">Ver carrinho →</span>
        </motion.button>
      )}

      {/* Cart modal */}
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
                <h2 className="text-lg font-bold">Seu Pedido</h2>
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
                      <input
                        placeholder="Número da mesa"
                        value={tableNumber}
                        onChange={e => setTableNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-teal-500"
                      />
                      <input
                        placeholder="Seu nome"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-teal-500"
                      />
                    </div>
                  </>
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-4 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-teal-700">{formatBRL(total)}</span>
                  </div>
                  <button
                    onClick={sendOrder}
                    className="w-full py-3 bg-gradient-to-r from-teal-600 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Enviar Pedido
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success popup */}
      <AnimatePresence>
        {sentOrder && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl p-8 text-center max-w-sm shadow-2xl">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Send className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Pedido Enviado!</h2>
              <p className="text-gray-600 mb-4">Pedido #{sentOrder} foi recebido pela cozinha</p>
              <p className="text-sm text-gray-500">Aguarde ser chamado, obrigado! 🍽️</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
