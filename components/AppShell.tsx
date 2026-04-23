'use client'

import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { Toaster } from 'react-hot-toast'
import { usePathname } from 'next/navigation'

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

  // Public menu fullscreen
  if (pathname.startsWith('/cardapio/public')) {
    return (
      <>
        {children}
        <Toaster position="top-center" />
      </>
    )
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
