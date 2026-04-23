'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { useStore } from '@/lib/store'
import { Save, Store, Clock, Phone, Mail, MapPin, CreditCard, Truck, AlertTriangle, Database } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ConfigPage() {
  const [mounted, setMounted] = useState(false)
  const store = useStore()
  const [form, setForm] = useState(store.restaurant)

  useEffect(() => {
    setMounted(true)
    setForm(store.restaurant)
  }, [store.restaurant])

  if (!mounted) return <AppShell title="Configurações"><div /></AppShell>

  const save = () => {
    store.updateRestaurant(form)
    toast.success('Configurações salvas!')
  }

  const reset = () => {
    if (confirm('Isso vai apagar todos os dados e restaurar a demo. Continuar?')) {
      store.resetDemo()
      toast.success('Demo resetada com sucesso!')
    }
  }

  return (
    <AppShell title="Configurações" subtitle="Informações do restaurante e sistema">
      <div className="max-w-4xl space-y-6">
        {/* Info */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold">Informações do Restaurante</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Nome do Restaurante</label>
              <input className="input mt-1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Endereço</label>
              <input className="input mt-1" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Telefone</label>
              <input className="input mt-1" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Email</label>
              <input className="input mt-1" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">CNPJ</label>
              <input className="input mt-1" value={form.cnpj || ''} onChange={e => setForm({ ...form, cnpj: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Horário */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold">Horário de Funcionamento</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Abertura</label>
              <input className="input mt-1" type="time" value={form.openTime} onChange={e => setForm({ ...form, openTime: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Fechamento</label>
              <input className="input mt-1" type="time" value={form.closeTime} onChange={e => setForm({ ...form, closeTime: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Delivery */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold">Configuração de Delivery</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Taxa de entrega</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                <input className="input pl-8" type="number" step="0.01" value={form.deliveryFee} onChange={e => setForm({ ...form, deliveryFee: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Pedido mínimo</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                <input className="input pl-8" type="number" step="0.01" value={form.minOrderDelivery} onChange={e => setForm({ ...form, minOrderDelivery: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Raio máximo</label>
              <div className="relative mt-1">
                <input className="input pr-10" type="number" value={form.maxDeliveryDistance} onChange={e => setForm({ ...form, maxDeliveryDistance: parseFloat(e.target.value) || 0 })} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-between">
          <button onClick={reset} className="text-red-600 text-sm hover:bg-red-50 px-4 py-2 rounded-lg flex items-center gap-2">
            <Database className="w-4 h-4" /> Resetar dados da demo
          </button>
          <button onClick={save} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> Salvar Alterações
          </button>
        </div>

        {/* Info about persistence */}
        <div className="bg-gradient-to-r from-teal-50 to-orange-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-teal-900">Sobre a persistência dos dados</p>
            <p className="text-teal-800 mt-1">
              Este é um MVP piloto com dados armazenados localmente no navegador (localStorage).
              Todas as alterações persistem entre sessões e funcionam offline.
              Na versão final, será integrado com backend em nuvem.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
