'use client'

import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import OrderCard from '@/components/OrderCard'
import { getOrders, addOrder, updateOrderStatus, deleteOrder, initializeStorage, getMenu, Order, OrderItem } from '@/lib/storage'
import { Plus, X } from 'lucide-react'

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [menu, setMenu] = useState<any[]>([])
  const [showNewOrder, setShowNewOrder] = useState(false)
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([])
  const [table, setTable] = useState('Mesa 1')

  useEffect(() => {
    initializeStorage()
    setOrders(getOrders())
    setMenu(getMenu())
  }, [])

  const addItemToOrder = (item: any) => {
    const existing = selectedItems.find(i => i.id === item.id)
    if (existing) {
      setSelectedItems(selectedItems.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ))
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }])
    }
  }

  const removeItemFromOrder = (itemId: string) => {
    setSelectedItems(selectedItems.filter(i => i.id !== itemId))
  }

  const createOrder = () => {
    if (selectedItems.length > 0) {
      const newOrder = addOrder(table, selectedItems)
      setOrders([newOrder, ...orders])
      setSelectedItems([])
      setShowNewOrder(false)
      setTable('Mesa 1')
    }
  }

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status)
    setOrders(getOrders())
  }

  const handleDelete = (orderId: string) => {
    deleteOrder(orderId)
    setOrders(getOrders())
  }

  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Comanda</h1>
            <button
              onClick={() => setShowNewOrder(!showNewOrder)}
              className="px-4 py-2 bg-teal-primary text-white rounded-lg flex items-center gap-2 font-medium hover:bg-teal-dark transition-colors"
            >
              <Plus className="w-5 h-5" />
              Novo Pedido
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-2">
              {orders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-8 text-center">
                  <p className="text-gray-500">Nenhum pedido. Crie um novo!</p>
                </div>
              )}
            </div>

            {/* New Order Panel */}
            {showNewOrder && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-6 shadow-lg sticky top-20">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Novo Pedido</h2>
                    <button onClick={() => setShowNewOrder(false)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Table Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mesa</label>
                    <input
                      type="text"
                      value={table}
                      onChange={(e) => setTable(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary"
                    />
                  </div>

                  {/* Menu Items */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Menu</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {menu.map(item => (
                        <button
                          key={item.id}
                          onClick={() => addItemToOrder(item)}
                          className="w-full text-left p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.category}</p>
                            </div>
                            <p className="font-semibold text-teal-primary text-sm">R$ {item.price.toFixed(2)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Items */}
                  <div className="mb-4 pb-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 mt-4">Itens Selecionados</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <div className="flex-1">
                            <p className="font-medium">{item.quantity}x {item.name}</p>
                            <p className="text-gray-600">R$ {(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => removeItemFromOrder(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total and Submit */}
                  {selectedItems.length > 0 && (
                    <>
                      <div className="mb-4 pb-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mt-4">
                          <span className="font-semibold">Total:</span>
                          <span className="text-2xl font-bold text-teal-primary">R$ {total.toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        onClick={createOrder}
                        className="w-full px-4 py-3 bg-teal-primary text-white rounded-lg font-semibold hover:bg-teal-dark transition-colors"
                      >
                        Criar Pedido
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
