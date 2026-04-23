'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState } from 'react'
import clsx from 'clsx'
import {
  LayoutDashboard, ShoppingCart, UtensilsCrossed, Truck, Users,
  DollarSign, Package, BookOpen, Contact, BarChart3, Briefcase,
  Tag, Settings, ChevronLeft, Menu, QrCode, Bike, Soup, Store,
  ChefHat, ConciergeBell, LogOut, ShieldCheck, Smartphone, FileText
} from 'lucide-react'
import BrandLogo from './BrandLogo'
import { useStore } from '@/lib/store'
import type { UserRole } from '@/lib/types'

type MenuItem = {
  href: string
  icon: any
  label: string
  group: string
  badge?: string
  roles?: UserRole[] // se undefined, todos os roles autenticados veem
}

const menuItems: MenuItem[] = [
  { href: '/painel', icon: LayoutDashboard, label: 'Dashboard', group: 'Principal', roles: ['gerente'] },
  { href: '/super-admin', icon: ShieldCheck, label: 'Super Admin', group: 'Principal', roles: ['super-admin'] },
  { href: '/cliente', icon: Smartphone, label: 'Meu painel', group: 'Principal', roles: ['cliente'] },
  { href: '/pdv', icon: UtensilsCrossed, label: 'PDV', group: 'Operação', badge: 'HOT', roles: ['gerente', 'garcom'] },
  { href: '/garcom', icon: ConciergeBell, label: 'Garçom', group: 'Operação', roles: ['gerente', 'garcom'] },
  { href: '/cozinha', icon: ChefHat, label: 'Cozinha (KDS)', group: 'Operação', roles: ['gerente', 'cozinha'] },
  { href: '/comanda', icon: ShoppingCart, label: 'Comanda', group: 'Operação', roles: ['gerente', 'garcom', 'cozinha'] },
  { href: '/mesas', icon: Store, label: 'Mesas', group: 'Operação', roles: ['gerente', 'garcom'] },
  { href: '/cardapio', icon: QrCode, label: 'Cardápio Virtual', group: 'Operação', roles: ['gerente'] },
  { href: '/delivery', icon: Truck, label: 'Entregas', group: 'Operação', roles: ['gerente'] },
  { href: '/entregadores', icon: Bike, label: 'Entregadores', group: 'Operação', roles: ['gerente'] },
  { href: '/financeiro', icon: DollarSign, label: 'Financeiro', group: 'Gestão', roles: ['gerente', 'super-admin'] },
  { href: '/fiscal', icon: FileText, label: 'Cupons Fiscais', group: 'Gestão', badge: 'NEW', roles: ['gerente', 'super-admin'] },
  { href: '/estoque', icon: Package, label: 'Estoque', group: 'Gestão', roles: ['gerente'] },
  { href: '/clientes', icon: Contact, label: 'Clientes (CRM)', group: 'Gestão', roles: ['gerente'] },
  { href: '/funcionarios', icon: Users, label: 'Funcionários', group: 'Gestão', roles: ['gerente', 'super-admin'] },
  { href: '/menu-admin', icon: Soup, label: 'Cardápio Admin', group: 'Gestão', roles: ['gerente'] },
  { href: '/promocoes', icon: Tag, label: 'Promoções', group: 'Marketing', roles: ['gerente', 'super-admin'] },
  { href: '/relatorios', icon: BarChart3, label: 'Relatórios', group: 'Análise', roles: ['gerente', 'super-admin'] },
  { href: '/config', icon: Settings, label: 'Configurações', group: 'Sistema', roles: ['gerente'] },
]

const groups = ['Principal', 'Operação', 'Gestão', 'Marketing', 'Análise', 'Sistema']

const roleLabels: Record<UserRole, string> = {
  cliente: 'Cliente',
  garcom: 'Garçom',
  cozinha: 'Cozinha',
  entregador: 'Entregador',
  gerente: 'Gerente',
  'super-admin': 'Super Admin',
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const authUser = useStore(s => s.authUser)
  const logout = useStore(s => s.logout)

  // Rotas sem sidebar
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/cardapio/public') ||
    pathname.startsWith('/cliente') ||
    pathname.startsWith('/super-admin') ||
    pathname.startsWith('/entregador')
  ) return null

  const visibleItems = menuItems.filter(item => {
    if (!item.roles) return true
    if (!authUser) return false
    return item.roles.includes(authUser.role)
  })

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
          {!collapsed ? (
            <Link href="/painel" className="flex items-center overflow-hidden">
              <BrandLogo size={36} />
            </Link>
          ) : (
            <Link href="/painel" className="mx-auto">
              <BrandLogo size={32} iconOnly />
            </Link>
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
            const items = visibleItems.filter(i => i.group === group)
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

        {/* User + logout */}
        <div className={clsx('border-t border-gray-100 p-3', collapsed ? 'flex flex-col items-center gap-2' : 'space-y-2')}>
          <div className={clsx('flex items-center gap-3', collapsed && 'justify-center')}>
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {authUser?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{authUser?.name || 'Visitante'}</p>
                <p className="text-xs text-gray-500 truncate">
                  {authUser ? roleLabels[authUser.role] : 'não autenticado'}
                </p>
              </div>
            )}
          </div>
          {authUser && (
            <button
              onClick={() => { logout(); router.push('/') }}
              className={clsx(
                'w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors',
                collapsed && 'justify-center'
              )}
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && 'Sair'}
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
