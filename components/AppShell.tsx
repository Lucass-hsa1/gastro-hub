'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useStore } from '@/lib/store'

function isPublic(pathname: string) {
  if (pathname === '/' || pathname === '/login') return true
  if (pathname.startsWith('/cardapio/public')) return true
  return false
}

export default function AppShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode
  title: string
  subtitle?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const authUser = useStore(s => s.authUser)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted) return
    if (!authUser && !isPublic(pathname)) {
      router.replace('/login')
    }
  }, [mounted, authUser, pathname, router])

  // Cardápio público fullscreen
  if (pathname.startsWith('/cardapio/public')) {
    return (
      <>
        {children}
        <Toaster position="top-center" />
      </>
    )
  }

  // Landing/Login/Cliente/Super Admin/Entregador têm header próprio
  if (pathname === '/' || pathname === '/login' ||
      pathname.startsWith('/cliente') || pathname.startsWith('/super-admin') ||
      pathname.startsWith('/entregador')) {
    return (
      <>
        {children}
        <Toaster position="top-right" toastOptions={{
          style: { borderRadius: '10px', fontSize: '14px' }
        }} />
      </>
    )
  }

  // Shell padrão (gerente, garçom, cozinha) — espera mount + auth pra evitar flash
  if (!mounted || !authUser) {
    return <div className="min-h-screen bg-gray-50" />
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: '10px', fontSize: '14px' }
      }} />
    </div>
  )
}
