'use client'

import Link from 'next/link'
import { Home, ShoppingCart, Truck, Settings, UtensilsCrossed } from 'lucide-react'

export default function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-orange-primary rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="text-teal-primary">Gastro</span>
            <span className="text-orange-primary">Hub</span>
          </Link>

          {/* Menu */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/" icon={<Home className="w-4 h-4" />} label="Dashboard" />
            <NavLink href="/order" icon={<ShoppingCart className="w-4 h-4" />} label="Comanda" />
            <NavLink href="/pdv" icon={<UtensilsCrossed className="w-4 h-4" />} label="PDV" />
            <NavLink href="/delivery" icon={<Truck className="w-4 h-4" />} label="Entregas" />
            <NavLink href="/restaurant" icon={<Settings className="w-4 h-4" />} label="Config" />
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            <MobileNavLink href="/" icon={<Home className="w-5 h-5" />} />
            <MobileNavLink href="/order" icon={<ShoppingCart className="w-5 h-5" />} />
            <MobileNavLink href="/pdv" icon={<UtensilsCrossed className="w-5 h-5" />} />
            <MobileNavLink href="/delivery" icon={<Truck className="w-5 h-5" />} />
            <MobileNavLink href="/restaurant" icon={<Settings className="w-5 h-5" />} />
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-teal-primary"
    >
      {icon}
      {label}
    </Link>
  )
}

function MobileNavLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-teal-primary"
    >
      {icon}
    </Link>
  )
}
