'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState } from 'react'
import clsx from 'clsx'
import {
  LayoutDashboard, ShoppingCart, UtensilsCrossed, Truck, Users,
  DollarSign, Package, BookOpen, Contact, BarChart3, Briefcase,
  Tag, Settings, ChevronLeft, Menu, QrCode, Bike, Soup, Store,
  ChefHat, ConciergeBell
} from 'lucide-react'

const menuItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard', group: 'Principal' },
  { href: '/pdv', icon: UtensilsCrossed, label: 'PDV', group: 'Operação', badge: 'HOT' },
  { href: '/garcom', icon: ConciergeBell, label: 'Garçom', group: 'Operação', badge: 'NEW' },
  { href: '/cozinha', icon: ChefHat, label: 'Cozinha (KDS)', group: 'Operação', badge: 'NEW' },
  { href: '/comanda', icon: ShoppingCart, label: 'Comanda', group: 'Operação' },
  { href: '/mesas', icon: Store, label: 'Mesas', group: 'Operação' },
  { href: '/cardapio', icon: QrCode, label: 'Cardápio Virtual', group: 'Operação' },
  { href: '/delivery', icon: Truck, label: 'Entregas', group: 'Operação' },
  { href: '/entregadores', icon: Bike, label: 'Entregadores', group: 'Operação' },
  { href: '/financeiro', icon: DollarSign, label: 'Financeiro', group: 'Gestão' },
  { href: '/estoque', icon: Package, label: 'Estoque', group: 'Gestão' },
  { href: '/clientes', icon: Contact, label: 'Clientes (CRM)', group: 'Gestão' },
  { href: '/funcionarios', icon: Users, label: 'Funcionários', group: 'Gestão' },
  { href: '/menu-admin', icon: Soup, label: 'Cardápio Admin', group: 'Gestão' },
  { href: '/promocoes', icon: Tag, label: 'Promoções', group: 'Marketing' },
  { href: '/relatorios', icon: BarChart3, label: 'Relatórios', group: 'Análise' },
  { href: '/config', icon: Settings, label: 'Configurações', group: 'Sistema' },
]

const groups = ['Principal', 'Operação', 'Gestão', 'Marketing', 'Análise', 'Sistema']

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Public menu doesn't use sidebar
  if (pathname.startsWith('/cardapio/public')) return null

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white rounded-lg shadow-md p-2 border border-gray-200"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 z-40 flex flex-col transition-all duration-300',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2 font-bold text-lg overflow-hidden">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="whitespace-nowrap">
                <span className="text-teal-600">Gastro</span>
                <span className="text-orange-500">Hub</span>
              </span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-6 h-6 bg-gray-100 rounded-full items-center justify-center hover:bg-gray-200"
          >
            <ChevronLeft className={clsx('w-3 h-3 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          {groups.map(group => {
            const items = menuItems.filter(i => i.group === group)
            if (items.length === 0) return null
            return (
              <div key={group} className="mb-6">
                {!collapsed && (
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">
                    {group}
                  </p>
                )}
                <div className="space-y-0.5 px-2">
                  {items.map(item => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={clsx(
                          'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative',
                          isActive
                            ? 'bg-gradient-to-r from-teal-50 to-orange-50 text-teal-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                          collapsed && 'justify-center'
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-teal-500 to-orange-500 rounded-r"
                          />
                        )}
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 whitespace-nowrap">{item.label}</span>
                            {item.badge && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-orange-500 text-white rounded-full font-bold">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* User */}
        <div className={clsx('border-t border-gray-100 p-4 flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
            M
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Marcelo A.</p>
              <p className="text-xs text-gray-500 truncate">Gerente</p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
