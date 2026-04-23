'use client'

import { Bell, Search, User, RefreshCw } from 'lucide-react'
import { useStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'

export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { resetDemo, orders, deliveries } = useStore()
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    update()
    const interval = setInterval(update, 30000)
    return () => clearInterval(interval)
  }, [])

  const pendingCount = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length
    + deliveries.filter(d => d.status === 'pending' || d.status === 'in-transit').length

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 lg:px-8 h-16 flex items-center justify-between">
        <div className="ml-12 lg:ml-0">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 w-64">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent outline-none text-sm flex-1"
            />
          </div>

          {/* Time */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-teal-50 to-orange-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-gray-700">{time}</span>
          </div>

          {/* Reset demo */}
          <button
            onClick={() => {
              if (confirm('Resetar todos os dados da demo?')) {
                resetDemo()
                toast.success('Demo resetada!')
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Resetar demo"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
