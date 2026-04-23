'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { useStore } from '@/lib/store'
import { QrCode, Smartphone, Tablet, Monitor, Copy, ExternalLink, Check, Printer, Utensils } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CardapioPage() {
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const store = useStore()

  useEffect(() => setMounted(true), [])
  if (!mounted) return <AppShell title="Cardápio"><div /></AppShell>

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/cardapio/public`
    : '/cardapio/public'

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  // QR Code SVG
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(publicUrl)}&color=0B7B8C&bgcolor=ffffff`

  return (
    <AppShell title="Cardápio Virtual" subtitle="QR Code para cliente acessar no restaurante">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code */}
          <div className="card p-8 text-center bg-gradient-to-br from-teal-50 via-white to-orange-50">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-xs font-bold text-teal-700 mb-4 border border-teal-200">
              <QrCode className="w-3 h-3" />
              QR CODE DO CARDÁPIO
            </div>
            <h3 className="text-2xl font-bold mb-2">Escaneie para ver o cardápio</h3>
            <p className="text-sm text-gray-600 mb-6">{store.restaurant.name}</p>

            <div className="inline-block bg-white p-6 rounded-2xl border-4 border-teal-600 shadow-lg">
              <img src={qrUrl} alt="QR Code" className="w-64 h-64" />
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Imprima e coloque nas mesas — clientes veem o cardápio e pedem direto no celular
            </p>
          </div>

          {/* Preview info */}
          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="font-bold mb-4">Link do cardápio público</h3>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={publicUrl}
                  className="input bg-gray-50 text-sm flex-1"
                />
                <button
                  onClick={copyLink}
                  className="btn-primary flex items-center gap-1"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={publicUrl}
                  target="_blank"
                  className="btn-secondary flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold mb-4">Compatível com</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Smartphone className="w-8 h-8 mx-auto text-teal-600 mb-2" />
                  <p className="text-xs font-semibold">Celular</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Tablet className="w-8 h-8 mx-auto text-teal-600 mb-2" />
                  <p className="text-xs font-semibold">Tablet</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Monitor className="w-8 h-8 mx-auto text-teal-600 mb-2" />
                  <p className="text-xs font-semibold">Desktop</p>
                </div>
              </div>
            </div>

            <div className="card p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <h3 className="font-bold text-orange-900 mb-2">💡 Como usar</h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Imprima o QR Code em adesivos ou displays</li>
                <li>• Cole nas mesas do restaurante</li>
                <li>• Cliente escaneia com a câmera do celular</li>
                <li>• Abre o cardápio completo, sem precisar de app</li>
              </ul>
            </div>
          </div>
        </div>

        {/* QR Codes por mesa */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold flex items-center gap-2"><Utensils className="w-4 h-4 text-teal-600" /> QR Codes por mesa</h3>
              <p className="text-xs text-gray-500">Cada mesa abre o cardápio já identificada — comanda automática</p>
            </div>
            <button onClick={() => window.print()} className="btn-secondary flex items-center gap-1 text-xs">
              <Printer className="w-3 h-3" /> Imprimir todos
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {store.tables.map(t => {
              const url = typeof window !== 'undefined'
                ? `${window.location.origin}/cardapio/public?mesa=${t.number}`
                : `/cardapio/public?mesa=${t.number}`
              const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&color=0B7B8C`
              return (
                <div key={t.id} className="border-2 border-gray-200 rounded-xl p-3 text-center">
                  <p className="text-xs uppercase font-bold text-teal-700 mb-1">Mesa {t.number}</p>
                  <img src={qr} alt={`QR Mesa ${t.number}`} className="w-full aspect-square" />
                  <a
                    href={url}
                    target="_blank"
                    className="text-[10px] text-gray-500 hover:text-teal-600 flex items-center justify-center gap-1 mt-1"
                  >
                    abrir <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )
            })}
          </div>
        </div>

        {/* Prévia do cardápio */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Prévia do cardápio público</h3>
            <a href={publicUrl} target="_blank" className="text-sm text-teal-600 hover:underline flex items-center gap-1">
              Abrir em nova aba <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center">
            <div className="w-[340px] bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-gray-900">
              <div className="bg-gradient-to-r from-teal-600 to-orange-500 p-4 text-white text-center">
                <p className="text-xs opacity-80">Bem-vindo a</p>
                <p className="text-xl font-bold">{store.restaurant.name}</p>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto space-y-2">
                {store.menu.slice(0, 4).map(m => (
                  <div key={m.id} className="flex gap-2 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="text-3xl">{m.emoji}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{m.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{m.description}</p>
                      <p className="text-sm font-bold text-teal-600 mt-1">
                        {m.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-center text-gray-400 pt-2">+{store.menu.length - 4} itens</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
