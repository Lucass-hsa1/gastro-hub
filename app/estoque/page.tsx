'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Package, AlertTriangle, Plus, Edit2, Trash2, X, TrendingUp, TrendingDown, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import type { InventoryItem } from '@/lib/types'

function formatBRL(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

export default function EstoquePage() {
  const [mounted, setMounted] = useState(false)
  const store = useStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'low' | 'ok'>('all')
  const [showForm, setShowForm] = useState<InventoryItem | 'new' | null>(null)
  const [form, setForm] = useState({
    name: '', unit: 'kg' as any, currentStock: 0, minStock: 0, maxStock: 0,
    cost: 0, supplier: '', category: '',
  })

  useEffect(() => setMounted(true), [])
  if (!mounted) return <AppShell title="Estoque"><div /></AppShell>

  const filtered = store.inventory.filter(i => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'low' && i.currentStock > i.minStock) return false
    if (filter === 'ok' && i.currentStock <= i.minStock) return false
    return true
  })

  const totalValue = store.inventory.reduce((s, i) => s + i.currentStock * i.cost, 0)
  const lowCount = store.inventory.filter(i => i.currentStock <= i.minStock).length
  const categories = [...new Set(store.inventory.map(i => i.category))]

  const openAdd = () => {
    setForm({ name: '', unit: 'kg', currentStock: 0, minStock: 0, maxStock: 0, cost: 0, supplier: '', category: '' })
    setShowForm('new')
  }

  const openEdit = (item: InventoryItem) => {
    setForm({
      name: item.name, unit: item.unit, currentStock: item.currentStock,
      minStock: item.minStock, maxStock: item.maxStock, cost: item.cost,
      supplier: item.supplier || '', category: item.category,
    })
    setShowForm(item)
  }

  const submit = () => {
    if (!form.name || !form.category) { toast.error('Preencha nome e categoria'); return }
    if (showForm === 'new') {
      store.addInventoryItem(form)
      toast.success('Item adicionado!')
    } else if (showForm) {
      store.updateInventoryItem(showForm.id, form)
      toast.success('Item atualizado!')
    }
    setShowForm(null)
  }

  const adjust = (id: string, delta: number) => {
    const item = store.inventory.find(i => i.id === id)
    if (!item) return
    store.updateInventoryItem(id, { currentStock: Math.max(0, item.currentStock + delta) })
    toast.success(delta > 0 ? 'Adicionado' : 'Removido', { duration: 800 })
  }

  return (
    <AppShell title="Estoque" subtitle={`${store.inventory.length} itens • ${formatBRL(totalValue)} em estoque`}>
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center text-white">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Total de itens</p>
                <p className="text-xl font-bold">{store.inventory.length}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center text-white">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Estoque baixo</p>
                <p className="text-xl font-bold text-red-600">{lowCount}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Categorias</p>
                <p className="text-xl font-bold">{categories.length}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Valor total</p>
                <p className="text-xl font-bold">{formatBRL(totalValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 max-w-sm relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Buscar item..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-1">
              <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>Todos</FilterPill>
              <FilterPill active={filter === 'low'} onClick={() => setFilter('low')}>Baixo</FilterPill>
              <FilterPill active={filter === 'ok'} onClick={() => setFilter('ok')}>OK</FilterPill>
            </div>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Item
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-600">Item</th>
                  <th className="text-left p-3 font-semibold text-gray-600 hidden md:table-cell">Categoria</th>
                  <th className="text-center p-3 font-semibold text-gray-600">Estoque</th>
                  <th className="text-center p-3 font-semibold text-gray-600 hidden lg:table-cell">Mín/Máx</th>
                  <th className="text-right p-3 font-semibold text-gray-600 hidden md:table-cell">Custo</th>
                  <th className="text-right p-3 font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const isLow = item.currentStock <= item.minStock
                  const pct = Math.min(100, (item.currentStock / item.maxStock) * 100)
                  return (
                    <motion.tr
                      key={item.id}
                      layout
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-3">
                        <div className="font-semibold">{item.name}</div>
                        {item.supplier && <div className="text-xs text-gray-500">{item.supplier}</div>}
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <span className="badge bg-gray-100 text-gray-700">{item.category}</span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={clsx('font-bold', isLow && 'text-red-600')}>
                            {item.currentStock} {item.unit}
                          </span>
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={clsx('h-full rounded-full', isLow ? 'bg-red-500' : 'bg-gradient-to-r from-teal-500 to-green-500')}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center text-xs text-gray-600 hidden lg:table-cell">
                        {item.minStock} / {item.maxStock}
                      </td>
                      <td className="p-3 text-right font-semibold hidden md:table-cell">{formatBRL(item.cost)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => adjust(item.id, -1)} className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-600 rounded flex items-center justify-center" title="Reduzir 1">-</button>
                          <button onClick={() => adjust(item.id, 1)} className="w-7 h-7 bg-green-50 hover:bg-green-100 text-green-600 rounded flex items-center justify-center" title="Adicionar 1">+</button>
                          <button onClick={() => openEdit(item)} className="p-1 text-gray-400 hover:text-teal-600">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{showForm === 'new' ? 'Novo Item' : 'Editar Item'}</h3>
              <button onClick={() => setShowForm(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="input col-span-2" placeholder="Nome do item" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="input" placeholder="Categoria" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              <select className="input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value as any })}>
                <option value="kg">Kilograma (kg)</option>
                <option value="g">Grama (g)</option>
                <option value="l">Litro (l)</option>
                <option value="ml">Mililitro (ml)</option>
                <option value="un">Unidade (un)</option>
                <option value="cx">Caixa (cx)</option>
              </select>
              <input className="input" type="number" placeholder="Estoque atual" value={form.currentStock || ''} onChange={e => setForm({ ...form, currentStock: parseFloat(e.target.value) || 0 })} />
              <input className="input" type="number" step="0.01" placeholder="Custo unitário" value={form.cost || ''} onChange={e => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })} />
              <input className="input" type="number" placeholder="Estoque mínimo" value={form.minStock || ''} onChange={e => setForm({ ...form, minStock: parseFloat(e.target.value) || 0 })} />
              <input className="input" type="number" placeholder="Estoque máximo" value={form.maxStock || ''} onChange={e => setForm({ ...form, maxStock: parseFloat(e.target.value) || 0 })} />
              <input className="input col-span-2" placeholder="Fornecedor (opcional)" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowForm(null)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={submit} className="btn-primary flex-1">Salvar</button>
            </div>
            {showForm !== 'new' && (
              <button
                onClick={() => {
                  if (confirm('Excluir item?')) {
                    store.deleteInventoryItem((showForm as InventoryItem).id)
                    toast.success('Item removido')
                    setShowForm(null)
                  }
                }}
                className="w-full mt-2 text-sm text-red-600 hover:bg-red-50 py-2 rounded-lg"
              >
                Excluir item
              </button>
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}

function FilterPill({ active, onClick, children }: any) {
  return (
    <button onClick={onClick} className={clsx(
      'px-3 py-2 rounded-lg text-sm font-semibold',
      active ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-700'
    )}>
      {children}
    </button>
  )
}
