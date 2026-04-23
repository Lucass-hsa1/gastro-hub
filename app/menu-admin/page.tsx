'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, X, Search, Flame, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import type { MenuItem } from '@/lib/types'

function formatBRL(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

const emojis = ['🍔', '🍕', '🍟', '🌭', '🥪', '🌮', '🌯', '🥗', '🍝', '🍜', '🍱', '🍣', '🍤', '🍗', '🍖', '🥩', '🍛', '🍲', '🥘', '🍳', '🥞', '🥟', '🍰', '🧁', '🍮', '🍨', '🍩', '🍪', '🥤', '🧃', '🍺', '🍻', '🍷', '🍸', '🍹']

export default function MenuAdminPage() {
  const [mounted, setMounted] = useState(false)
  const store = useStore()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [editing, setEditing] = useState<MenuItem | 'new' | null>(null)
  const [form, setForm] = useState({
    name: '', category: '', price: 0, cost: 0, description: '', emoji: '🍽️',
    available: true, prepTime: 15, popular: false,
  })

  useEffect(() => setMounted(true), [])
  if (!mounted) return <AppShell title="Menu Admin"><div /></AppShell>

  const categories = ['Todos', ...new Set(store.menu.map(m => m.category))]
  const filtered = store.menu.filter(m => {
    if (selectedCategory !== 'Todos' && m.category !== selectedCategory) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const openAdd = () => {
    setForm({ name: '', category: '', price: 0, cost: 0, description: '', emoji: '🍽️', available: true, prepTime: 15, popular: false })
    setEditing('new')
  }

  const openEdit = (item: MenuItem) => {
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      cost: item.cost,
      description: item.description,
      emoji: item.emoji,
      available: item.available,
      prepTime: item.prepTime,
      popular: item.popular || false,
    })
    setEditing(item)
  }

  const submit = () => {
    if (!form.name || !form.category) { toast.error('Nome e categoria obrigatórios'); return }
    if (editing === 'new') {
      store.addMenuItem(form)
      toast.success('Item adicionado!')
    } else if (editing) {
      store.updateMenuItem(editing.id, form)
      toast.success('Item atualizado!')
    }
    setEditing(null)
  }

  const toggleAvailable = (id: string, current: boolean) => {
    store.updateMenuItem(id, { available: !current })
  }

  return (
    <AppShell title="Gerenciar Cardápio" subtitle={`${store.menu.length} itens cadastrados`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Item
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={clsx(
                'px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold',
                selectedCategory === cat ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-700'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => (
            <motion.div
              key={item.id}
              layout
              className={clsx(
                'card p-4 relative group hover:shadow-md transition-all',
                !item.available && 'opacity-60'
              )}
            >
              {item.popular && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold z-10 flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5" /> HOT
                </div>
              )}
              <div className="flex items-start gap-3 mb-3">
                <div className="text-5xl">{item.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm line-clamp-2">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2 mb-3 min-h-[32px]">{item.description}</p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-lg font-bold text-teal-700">{formatBRL(item.price)}</p>
                  <p className="text-[10px] text-gray-500">Custo: {formatBRL(item.cost)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase">Margem</p>
                  <p className="text-sm font-bold text-green-600">
                    {(((item.price - item.cost) / item.price) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => toggleAvailable(item.id, item.available)}
                  className={clsx(
                    'flex-1 text-xs py-1.5 rounded-lg font-semibold',
                    item.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {item.available ? '● Disponível' : '○ Indisponível'}
                </button>
                <button onClick={() => openEdit(item)} className="p-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { if (confirm('Excluir?')) { store.deleteMenuItem(item.id); toast.success('Removido') } }}
                  className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{editing === 'new' ? 'Novo Item' : 'Editar Item'}</h3>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <div className="text-5xl p-2 bg-gray-50 rounded-xl">{form.emoji}</div>
                <div className="flex-1 max-h-16 overflow-y-auto grid grid-cols-10 gap-1">
                  {emojis.map(e => (
                    <button
                      key={e}
                      onClick={() => setForm({ ...form, emoji: e })}
                      className={clsx('text-lg hover:bg-gray-100 rounded', form.emoji === e && 'bg-teal-100')}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <input className="input" placeholder="Nome do prato" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="input" placeholder="Categoria" list="cats" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              <datalist id="cats">
                {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c} />)}
              </datalist>
              <textarea className="input resize-none" placeholder="Descrição" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className="input" type="number" step="0.01" placeholder="Preço" value={form.price || ''} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
                <input className="input" type="number" step="0.01" placeholder="Custo" value={form.cost || ''} onChange={e => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })} />
              </div>
              <input className="input" type="number" placeholder="Tempo de preparo (min)" value={form.prepTime || ''} onChange={e => setForm({ ...form, prepTime: parseInt(e.target.value) || 0 })} />
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} />
                  <span className="text-sm">Disponível</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.popular} onChange={e => setForm({ ...form, popular: e.target.checked })} />
                  <span className="text-sm">Popular 🔥</span>
                </label>
              </div>
              <button onClick={submit} className="btn-primary w-full">
                {editing === 'new' ? 'Adicionar' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
