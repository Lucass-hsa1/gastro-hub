'use client'

import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { addOrder, initializeStorage, getMenu, getCategories, OrderItem } from '@/lib/storage'
import { ShoppingCart, X, Plus, Minus } from 'lucide-react'

export default function PDVPage() {
  const [categories, setCategories] = useState<string[]>([])
  const [menu, setMenu] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [cart, setCart] = useState<OrderItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [isDelivery, setIsDelivery] = useState(false)

  useEffect(() => {
    initializeStorage()
    const cats = getCategories()
    setCategories(cats)
    if (cats.length > 0) {
      setSelectedCategory(cats[0])
    }
    setMenu(getMenu())
  }, [])

  const filteredMenu = selectedCategory
    ? menu.filter(item => item.category === selectedCategory)
    : menu

  const addToCart = (item: any) => {
    const existing = cart.find(i => i.id === item.id)
    if (existing) {
      setCart(cart.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(i => i.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
    } else {
      setCart(cart.map(i =>
        i.id === itemId ? { ...i, quantity } : i
      ))
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const finalizeSale = () => {
    if (cart.length > 0) {
      const table = isDelivery
        ? `Entrega - ${customerName}`
        : 'Balcão'

      addOrder(table, cart)

      // Reset form
      setCart([])
      setCustomerName('')
      setCustomerPhone('')
      setIsDelivery(false)

      alert('Venda finalizada com sucesso!')
    }
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto h-screen flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-primary to-orange-primary text-white p-4">
            <h1 className="text-2xl font-bold">PDV - Ponto de Venda</h1>
          </div>

          <div className="flex-1 flex gap-4 p-4 overflow-hidden">
            {/* Menu */}
            <div className="flex-1 flex flex-col bg-gray-800 rounded-lg overflow-hidden">
              {/* Categories */}
              <div className="flex gap-2 p-4 overflow-x-auto border-b border-gray-700">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-teal-primary text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredMenu.map(item => (
                    <button
                      key={item.id}
                      onClick={() => addToCart(item)}
                      className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 text-left transition-colors group"
                    >
                      <div className="mb-2 text-2xl font-bold text-orange-primary opacity-10 group-hover:opacity-30">🍔</div>
                      <p className="font-semibold text-white text-sm line-clamp-2">{item.name}</p>
                      <p className="text-orange-primary font-bold text-lg mt-1">R$ {item.price.toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-80 bg-white rounded-lg shadow-lg flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-primary to-orange-primary text-white p-4 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  <h2 className="font-bold text-lg">Carrinho</h2>
                </div>
              </div>

              {/* Delivery Option */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDelivery}
                    onChange={(e) => setIsDelivery(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Pedido para entrega</span>
                </label>

                {isDelivery && (
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      placeholder="Nome do cliente"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <input
                      type="tel"
                      placeholder="Telefone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Carrinho vazio</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 p-1 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 p-1 rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="font-bold text-orange-primary">R$ {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-3xl font-bold text-teal-primary">R$ {total.toFixed(2)}</p>
                </div>
                <button
                  onClick={finalizeSale}
                  disabled={cart.length === 0}
                  className="w-full px-4 py-3 bg-gradient-to-r from-teal-primary to-orange-primary text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
                >
                  Finalizar Venda
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
