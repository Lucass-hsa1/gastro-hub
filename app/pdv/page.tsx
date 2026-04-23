'use client'

import { useState, useEffect, useMemo } from 'react'
import AppShell from '@/components/AppShell'
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Plus, Minus, X, CreditCard, Banknote, QrCode, Receipt, Search, Tag, User, MapPin, Check, Utensils, Store as StoreIcon, Truck, Package as PackageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import type { OrderItem, OrderType, PaymentMethod } from '@/lib/types'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function PDVPage() {
  const [mounted, setMounted] = useState(false)
  const store = useStore()
  const [cart, setCart] = useState<OrderItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')
  const [search, setSearch] = useState('')
  const [orderType, setOrderType] = useState<OrderType>('counter')
  const [tableId, setTableId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [address, setAddress] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoCode, setPromoCode] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')

  useEffect(() => setMounted(true), [])
  if (!mounted) return <AppShell title="PDV"><div /></AppShell>

  const categories = ['Todos', ...new Set(store.menu.map(m => m.category))]

  const filteredMenu = store.menu.filter(m => {
    if (selectedCategory !== 'Todos' && m.category !== selectedCategory) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false
    return m.available
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
      }])
    }
    toast.success(`${item.name} adicionado`, { duration: 1200, icon: item.emoji })
  }

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter(i => i.id !== id))
    } else {
      setCart(cart.map(i => i.id === id ? { ...i, quantity: qty } : i))
    }
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const deliveryFee = orderType === 'delivery' ? store.restaurant.deliveryFee : 0
  const total = Math.max(0, subtotal - discount + deliveryFee)

  const applyPromo = () => {
    const promo = store.promotions.find(p => p.code?.toUpperCase() === promoCode.toUpperCase() && p.active)
    if (!promo) {
      toast.error('Código inválido')
      return
    }
    if (promo.minOrder && subtotal < promo.minOrder) {
      toast.error(`Pedido mínimo: ${formatBRL(promo.minOrder)}`)
      return
    }
    const disc = promo.type === 'percentage' ? subtotal * (promo.value / 100) : promo.value
    setDiscount(disc)
    toast.success(`${promo.name} aplicado!`)
  }

  const finalizeSale = () => {
    if (cart.length === 0) return

    if (orderType === 'dine-in' && !tableId) {
      toast.error('Selecione uma mesa')
      return
    }
    if (orderType === 'delivery' && (!customerName || !address)) {
      toast.error('Preencha dados do cliente')
      return
    }

    const order = store.createOrder({
      type: orderType,
      tableId: orderType === 'dine-in' ? tableId : undefined,
      items: cart,
      status: orderType === 'counter' ? 'delivered' : 'pending',
      subtotal,
      discount,
      total,
      paymentMethod,
      customerName: customerName || undefined,
    })

    if (orderType === 'delivery') {
      store.createDelivery({
        orderId: order.id,
        customerName,
        address,
        neighborhood: '',
        phone: customerPhone,
        status: 'pending',
        total,
        deliveryFee,
        estimatedTime: 30,
        distance: 3,
      })
    }

    toast.success(`Pedido #${order.number} criado!`, { icon: '🎉', duration: 3000 })

    // Reset
    setCart([])
    setCustomerName('')
    setCustomerPhone('')
    setAddress('')
    setTableId('')
    setDiscount(0)
    setPromoCode('')
    setShowPayment(false)
  }

  const availableTables = store.tables.filter(t => t.status === 'available')

  return (
    <AppShell title="PDV - Ponto de Venda" subtitle="Venda rápida balcão e salão">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-10rem)]">
        {/* Menu */}
        <div className="lg:col-span-2 card flex flex-col overflow-hidden">
          {/* Search + Order Type */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border-0 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Order Type Tabs */}
            <div className="flex gap-2 overflow-x-auto">
              <TypeBtn active={orderType === 'counter'} onClick={() => setOrderType('counter')} icon={<StoreIcon className="w-4 h-4" />} label="Balcão" />
              <TypeBtn active={orderType === 'dine-in'} onClick={() => setOrderType('dine-in')} icon={<Utensils className="w-4 h-4" />} label="Mesa" />
              <TypeBtn active={orderType === 'delivery'} onClick={() => setOrderType('delivery')} icon={<Truck className="w-4 h-4" />} label="Delivery" />
              <TypeBtn active={orderType === 'takeout'} onClick={() => setOrderType('takeout')} icon={<PackageIcon className="w-4 h-4" />} label="Retirada" />
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredMenu.map(item => (
                <motion.button
                  key={item.id}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => addToCart(item)}
                  className="card p-3 text-left hover:shadow-md transition-all relative group overflow-hidden"
                >
                  {item.popular && (
                    <span className="absolute top-2 right-2 text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold z-10">HOT</span>
                  )}
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform origin-left">{item.emoji}</div>
                  <p className="font-semibold text-sm text-gray-900 line-clamp-2 min-h-[40px]">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                  <p className="text-teal-600 font-bold text-lg mt-2">{formatBRL(item.price)}</p>
                </motion.button>
              ))}
            </div>
            {filteredMenu.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum produto encontrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart */}
        <div className="card flex flex-col overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-teal-600 to-orange-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h3 className="font-bold">Carrinho</h3>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {cart.reduce((s, i) => s + i.quantity, 0)} itens
                </span>
              </div>
            </div>
          </div>

          {/* Order details based on type */}
          {orderType === 'dine-in' && (
            <div className="p-3 border-b border-gray-100 bg-teal-50/30">
              <label className="text-xs font-semibold text-gray-700">Mesa:</label>
              <select
                value={tableId}
                onChange={e => setTableId(e.target.value)}
                className="input mt-1 text-sm"
              >
                <option value="">Selecionar mesa...</option>
                {availableTables.map(t => (
                  <option key={t.id} value={t.id}>Mesa {t.number} ({t.capacity} lugares)</option>
                ))}
              </select>
            </div>
          )}

          {orderType === 'delivery' && (
            <div className="p-3 border-b border-gray-100 bg-orange-50/30 space-y-2">
              <input
                className="input text-sm"
                placeholder="Nome do cliente"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
              <input
                className="input text-sm"
                placeholder="Telefone"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
              />
              <input
                className="input text-sm"
                placeholder="Endereço completo"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>
          )}

          {/* Items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <ShoppingCart className="w-16 h-16 mb-3 opacity-30" />
                <p className="text-sm">Carrinho vazio</p>
                <p className="text-xs mt-1">Adicione produtos do menu</p>
              </div>
            ) : (
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-3 border-b border-gray-100 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <div className="text-2xl">{item.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{formatBRL(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-7 h-7 bg-teal-100 text-teal-700 hover:bg-teal-200 rounded flex items-center justify-center">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Promo + Total */}
          {cart.length > 0 && (
            <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50/50">
              <div className="flex gap-2">
                <input
                  placeholder="Cupom"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  className="input text-xs flex-1"
                />
                <button onClick={applyPromo} className="px-3 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold">Aplicar</button>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatBRL(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto</span>
                    <span>-{formatBRL(discount)}</span>
                  </div>
                )}
                {deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxa de entrega</span>
                    <span>{formatBRL(deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg text-teal-700">{formatBRL(total)}</span>
                </div>
              </div>

              <button
                onClick={() => setShowPayment(true)}
                className="w-full py-3 bg-gradient-to-r from-teal-600 to-orange-500 text-white rounded-lg font-bold hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
              >
                <Receipt className="w-5 h-5" />
                Finalizar • {formatBRL(total)}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPayment(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Forma de Pagamento</h3>
                <button onClick={() => setShowPayment(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <PaymentBtn active={paymentMethod === 'pix'} onClick={() => setPaymentMethod('pix')} icon={<QrCode />} label="PIX" />
                <PaymentBtn active={paymentMethod === 'credit'} onClick={() => setPaymentMethod('credit')} icon={<CreditCard />} label="Crédito" />
                <PaymentBtn active={paymentMethod === 'debit'} onClick={() => setPaymentMethod('debit')} icon={<CreditCard />} label="Débito" />
                <PaymentBtn active={paymentMethod === 'cash'} onClick={() => setPaymentMethod('cash')} icon={<Banknote />} label="Dinheiro" />
              </div>
              <div className="bg-gradient-to-r from-teal-600 to-orange-500 rounded-xl p-4 text-white mb-6">
                <p className="text-xs opacity-80">Total a pagar</p>
                <p className="text-3xl font-bold">{formatBRL(total)}</p>
              </div>
              <button
                onClick={finalizeSale}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Confirmar Venda
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}

function TypeBtn({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
        active
          ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function PaymentBtn({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
        active
          ? 'border-teal-600 bg-teal-50 text-teal-700'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="w-6 h-6">{icon}</div>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  )
}
