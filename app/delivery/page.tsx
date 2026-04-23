'use client'

import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { getOrders, getDeliveries, addDelivery, updateDeliveryStatus, initializeStorage, Order, Delivery } from '@/lib/storage'
import { Truck, MapPin, Phone, User, Clock, CheckCircle2, Plus } from 'lucide-react'

const statusConfig = {
  'pending': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  'in-transit': { label: 'Em Trânsito', color: 'bg-blue-100 text-blue-800', icon: Truck },
  'delivered': { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
}

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [showNewDelivery, setShowNewDelivery] = useState(false)
  const [formData, setFormData] = useState({
    orderId: '',
    customerName: '',
    address: '',
    phone: '',
    total: 0,
  })

  useEffect(() => {
    initializeStorage()
    setDeliveries(getDeliveries())
    setOrders(getOrders())
  }, [])

  const handleCreateDelivery = () => {
    if (formData.customerName && formData.address && formData.phone) {
      const newDelivery = addDelivery({
        orderId: formData.orderId || String(Date.now()),
        customerName: formData.customerName,
        address: formData.address,
        phone: formData.phone,
        status: 'pending',
        total: formData.total,
      })
      setDeliveries([newDelivery, ...deliveries])
      setFormData({ orderId: '', customerName: '', address: '', phone: '', total: 0 })
      setShowNewDelivery(false)
    }
  }

  const handleStatusChange = (deliveryId: string, status: Delivery['status']) => {
    updateDeliveryStatus(deliveryId, status)
    setDeliveries(getDeliveries())
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Entregas</h1>
            <button
              onClick={() => setShowNewDelivery(!showNewDelivery)}
              className="px-4 py-2 bg-teal-primary text-white rounded-lg flex items-center gap-2 font-medium hover:bg-teal-dark transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nova Entrega
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Deliveries List */}
            <div className="lg:col-span-2">
              {deliveries.length > 0 ? (
                <div className="space-y-4">
                  {deliveries.map(delivery => {
                    const config = statusConfig[delivery.status]
                    const IconComponent = config.icon
                    const nextStatus: Record<Delivery['status'], Delivery['status']> = {
                      pending: 'in-transit',
                      'in-transit': 'delivered',
                      delivered: 'delivered',
                    }

                    return (
                      <div key={delivery.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{delivery.customerName}</h3>
                            <p className="text-sm text-gray-600">Pedido #{delivery.orderId}</p>
                          </div>
                          <div className={`${config.color} px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium`}>
                            <IconComponent className="w-4 h-4" />
                            {config.label}
                          </div>
                        </div>

                        <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-teal-primary mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Endereço</p>
                              <p className="text-sm text-gray-600">{delivery.address}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-orange-primary flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Telefone</p>
                              <p className="text-sm text-gray-600">{delivery.phone}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Valor</p>
                              <p className="text-lg font-bold text-teal-primary">R$ {delivery.total.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {delivery.status !== 'delivered' && (
                            <button
                              onClick={() => handleStatusChange(delivery.id, nextStatus[delivery.status])}
                              className="flex-1 px-3 py-2 bg-teal-primary text-white rounded-lg text-sm font-medium hover:bg-teal-dark transition-colors"
                            >
                              {delivery.status === 'pending' ? 'Iniciar Entrega' : 'Marcar como Entregue'}
                            </button>
                          )}
                          {delivery.status === 'delivered' && (
                            <div className="flex-1 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium text-center">
                              ✓ Entrega Completa
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-8 text-center">
                  <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma entrega no momento</p>
                </div>
              )}
            </div>

            {/* New Delivery Form */}
            {showNewDelivery && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-6 shadow-lg sticky top-20">
                  <h2 className="text-xl font-bold mb-4">Nova Entrega</h2>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ordem (opcional)
                      </label>
                      <select
                        value={formData.orderId}
                        onChange={(e) => {
                          const orderId = e.target.value
                          const order = orders.find(o => o.id === orderId)
                          setFormData({
                            ...formData,
                            orderId,
                            total: order?.total || 0,
                          })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary"
                      >
                        <option value="">Selecione uma ordem</option>
                        {orders.map(order => (
                          <option key={order.id} value={order.id}>
                            #{order.number} - {order.table} - R$ {order.total.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Cliente *
                      </label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary"
                        placeholder="João Silva"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Endereço *
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary resize-none"
                        placeholder="Rua Principal, 123"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-600">R$</span>
                        <input
                          type="number"
                          value={formData.total}
                          onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) || 0 })}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleCreateDelivery}
                      className="w-full px-4 py-3 bg-teal-primary text-white rounded-lg font-semibold hover:bg-teal-dark transition-colors mt-4"
                    >
                      Criar Entrega
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
