'use client'

import { Order } from '@/lib/storage'
import { Clock, CheckCircle2, Truck, Trash2 } from 'lucide-react'

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  preparing: { label: 'Preparando', color: 'bg-blue-100 text-blue-800', icon: Clock },
  ready: { label: 'Pronto', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  delivered: { label: 'Entregue', color: 'bg-gray-100 text-gray-800', icon: Truck },
}

export default function OrderCard({
  order,
  onStatusChange,
  onDelete,
}: {
  order: Order
  onStatusChange?: (orderId: string, status: Order['status']) => void
  onDelete?: (orderId: string) => void
}) {
  const config = statusConfig[order.status]
  const IconComponent = config.icon

  const nextStatus: Record<Order['status'], Order['status']> = {
    pending: 'preparing',
    preparing: 'ready',
    ready: 'delivered',
    delivered: 'delivered',
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{order.table}</h3>
          <p className="text-sm text-gray-500">Pedido #{order.number}</p>
        </div>
        <div className={`${config.color} px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium`}>
          <IconComponent className="w-4 h-4" />
          {config.label}
        </div>
      </div>

      <div className="space-y-1 mb-3 pb-3 border-b border-gray-200">
        {order.items.map(item => (
          <div key={item.id} className="flex justify-between text-sm text-gray-600">
            <span>{item.quantity}x {item.name}</span>
            <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-right">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl font-bold text-teal-primary">R$ {order.total.toFixed(2)}</p>
        </div>
        <div className="flex gap-2">
          {order.status !== 'delivered' && onStatusChange && (
            <button
              onClick={() => onStatusChange(order.id, nextStatus[order.status])}
              className="px-3 py-2 bg-teal-primary text-white rounded-lg text-sm font-medium hover:bg-teal-dark transition-colors"
            >
              Próximo
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(order.id)}
              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
