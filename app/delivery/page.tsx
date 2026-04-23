'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, MapPin, Phone, Clock, CheckCircle2, Bike, User, Navigation, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

function formatBRL(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

const statusMap = {
  'pending': { label: 'Aguardando', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  'assigned': { label: 'Designado', color: 'bg-purple-100 text-purple-800', icon: User },
  'picked-up': { label: 'Coletado', color: 'bg-indigo-100 text-indigo-800', icon: Bike },
  'in-transit': { label: 'Em Rota', color: 'bg-blue-100 text-blue-800', icon: Truck },
  'delivered': { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  'canceled': { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: X },
}

export default function DeliveryPage() {
  const [mounted, setMounted] = useState(false)
  const store = useStore()
  const [showAssign, setShowAssign] = useState<string | null>(null)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <AppShell title="Delivery"><div /></AppShell>

  const active = store.deliveries.filter(d => !['delivered', 'canceled'].includes(d.status))
  const completed = store.deliveries.filter(d => d.status === 'delivered')
  const availableDrivers = store.drivers.filter(d => d.status === 'available')

  const assign = (deliveryId: string, driverId: string) => {
    store.assignDriver(deliveryId, driverId)
    toast.success('Entregador designado!')
    setShowAssign(null)
  }

  const updateStatus = (id: string, newStatus: any) => {
    store.updateDelivery(id, { status: newStatus, ...(newStatus === 'delivered' ? { deliveredAt: new Date().toISOString() } : {}) })
    if (newStatus === 'delivered') {
      const delivery = store.deliveries.find(d => d.id === id)
      if (delivery?.driverId) {
        store.updateDriver(delivery.driverId, { status: 'available', currentDeliveryId: undefined })
      }
    }
    toast.success('Status atualizado')
  }

  return (
    <AppShell title="Delivery" subtitle={`${active.length} entrega${active.length !== 1 ? 's' : ''} em andamento`}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickStat label="Aguardando" count={store.deliveries.filter(d => d.status === 'pending').length} color="from-yellow-500 to-amber-500" icon={<Clock />} />
          <QuickStat label="Em Rota" count={store.deliveries.filter(d => d.status === 'in-transit').length} color="from-blue-500 to-indigo-500" icon={<Truck />} />
          <QuickStat label="Entregues Hoje" count={completed.filter(d => new Date(d.deliveredAt || '').toDateString() === new Date().toDateString()).length} color="from-green-500 to-emerald-500" icon={<CheckCircle2 />} />
          <QuickStat label="Entregadores Livres" count={availableDrivers.length} color="from-teal-500 to-cyan-500" icon={<Bike />} />
        </div>

        {/* Active deliveries */}
        <div>
          <h3 className="font-bold text-lg mb-4">Entregas Ativas</h3>
          {active.length === 0 ? (
            <div className="card p-12 text-center">
              <Truck className="w-16 h-16 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Nenhuma entrega ativa</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {active.map(d => {
                const status = statusMap[d.status]
                const Icon = status.icon
                const driver = d.driverId ? store.drivers.find(dr => dr.id === d.driverId) : null
                const order = store.orders.find(o => o.id === d.orderId)
                return (
                  <motion.div
                    key={d.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold">{d.customerName}</p>
                          <p className="text-xs text-gray-500">Pedido #{order?.number || d.orderId.slice(0, 6)}</p>
                        </div>
                      </div>
                      <div className={`badge ${status.color}`}>
                        {status.label}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{d.address}{d.neighborhood && `, ${d.neighborhood}`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-orange-500" />
                        <span className="text-gray-700">{d.phone}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span><Navigation className="w-3 h-3 inline mr-1" />{d.distance}km</span>
                        <span><Clock className="w-3 h-3 inline mr-1" />~{d.estimatedTime}min</span>
                      </div>
                    </div>

                    {driver && (
                      <div className="bg-gradient-to-r from-teal-50 to-orange-50 rounded-lg p-2 mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {driver.name.charAt(0)}
                        </div>
                        <div className="flex-1 text-xs">
                          <p className="font-bold">{driver.name}</p>
                          <p className="text-gray-600">{driver.vehicle === 'moto' ? '🛵' : driver.vehicle === 'bike' ? '🚲' : '🚗'} {driver.plate}</p>
                        </div>
                        <span className="text-xs font-bold text-yellow-500">★ {driver.rating}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="font-bold text-teal-700">{formatBRL(d.total)}</span>
                      <div className="flex gap-2">
                        {d.status === 'pending' && (
                          <button onClick={() => setShowAssign(d.id)} className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg font-semibold">
                            Designar
                          </button>
                        )}
                        {d.status === 'assigned' && (
                          <button onClick={() => updateStatus(d.id, 'picked-up')} className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold">
                            Coletado
                          </button>
                        )}
                        {d.status === 'picked-up' && (
                          <button onClick={() => updateStatus(d.id, 'in-transit')} className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold">
                            A caminho
                          </button>
                        )}
                        {d.status === 'in-transit' && (
                          <button onClick={() => updateStatus(d.id, 'delivered')} className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg font-semibold">
                            Entregue ✓
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent delivered */}
        {completed.length > 0 && (
          <div>
            <h3 className="font-bold text-lg mb-4">Últimas Entregues</h3>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-semibold text-gray-600">Cliente</th>
                    <th className="text-left p-3 font-semibold text-gray-600 hidden md:table-cell">Endereço</th>
                    <th className="text-left p-3 font-semibold text-gray-600 hidden md:table-cell">Entregador</th>
                    <th className="text-right p-3 font-semibold text-gray-600">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {completed.slice(0, 10).map(d => {
                    const driver = d.driverId ? store.drivers.find(dr => dr.id === d.driverId) : null
                    return (
                      <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="p-3 font-semibold">{d.customerName}</td>
                        <td className="p-3 text-gray-600 hidden md:table-cell truncate max-w-xs">{d.address}</td>
                        <td className="p-3 text-gray-600 hidden md:table-cell">{driver?.name || '-'}</td>
                        <td className="p-3 text-right font-bold text-teal-700">{formatBRL(d.total)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Assign driver modal */}
      <AnimatePresence>
        {showAssign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAssign(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Designar Entregador</h3>
                <button onClick={() => setShowAssign(null)}><X className="w-5 h-5" /></button>
              </div>
              {availableDrivers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bike className="w-12 h-12 mx-auto opacity-30 mb-2" />
                  <p>Nenhum entregador disponível</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableDrivers.map(d => (
                    <button
                      key={d.id}
                      onClick={() => assign(showAssign, d.id)}
                      className="w-full p-3 bg-gray-50 hover:bg-gradient-to-r hover:from-teal-50 hover:to-orange-50 rounded-lg flex items-center gap-3 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        {d.name.charAt(0)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-sm">{d.name}</p>
                        <p className="text-xs text-gray-500">
                          {d.vehicle === 'moto' ? '🛵 Moto' : d.vehicle === 'bike' ? '🚲 Bike' : '🚗 Carro'} • {d.deliveriesCount} entregas
                        </p>
                      </div>
                      <span className="text-yellow-500 text-xs font-bold">★ {d.rating}</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}

function QuickStat({ label, count, color, icon }: any) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
        <div className="w-5 h-5">{icon}</div>
      </div>
      <div>
        <p className="text-xs text-gray-500 font-semibold">{label}</p>
        <p className="text-xl font-bold">{count}</p>
      </div>
    </div>
  )
}
