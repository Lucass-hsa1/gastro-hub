'use client'

import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import StatCard from '@/components/StatCard'
import OrderCard from '@/components/OrderCard'
import { getOrders, getDeliveries, initializeStorage, Order, Delivery, getRestaurant } from '@/lib/storage'
import { TrendingUp, Truck, Clock, DollarSign, ShoppingCart } from 'lucide-react'

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [restaurant, setRestaurant] = useState<any>(null)

  useEffect(() => {
    initializeStorage()
    setOrders(getOrders())
    setDeliveries(getDeliveries())
    setRestaurant(getRestaurant())
  }, [])

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const activeDeliveries = deliveries.filter(d => d.status === 'in-transit').length
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered').length

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Bem-vindo, <span className="text-teal-primary">{restaurant?.name || 'GastroHub'}</span>
            </h1>
            <p className="text-gray-600 mt-2">Controle total do seu restaurante e entregas</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Pedidos em Andamento"
              value={pendingOrders}
              icon={<ShoppingCart className="w-6 h-6" />}
              color="orange"
            />
            <StatCard
              title="Entregas Ativas"
              value={activeDeliveries}
              icon={<Truck className="w-6 h-6" />}
              color="teal"
            />
            <StatCard
              title="Receita Total"
              value={`R$ ${totalRevenue.toFixed(0)}`}
              icon={<DollarSign className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="Entregas Completas"
              value={completedDeliveries}
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
            />
          </div>

          {/* Recent Orders */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pedidos Recentes</h2>
            {orders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.slice(0, 6).map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum pedido no momento</p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-teal-primary to-teal-dark rounded-lg p-6 text-white">
            <h3 className="font-bold text-lg mb-2">💡 Dica de Uso</h3>
            <p className="text-sm opacity-90">
              Navegue pelos menus para testar Comanda (PDV/Pedidos), Delivery (Rastreamento) e Configurações do Restaurante. Todos os dados são salvos automaticamente!
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
