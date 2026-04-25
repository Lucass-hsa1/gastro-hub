'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, CreditCard, Banknote, Smartphone, ChevronRight,
  Plus, Tag, Bike, Clock, Check, Trash2, Minus
} from 'lucide-react'
import { getRestaurantById } from '@/lib/marketplace'
import { useMarketStore, type MarketAddress } from '@/lib/marketplace-store'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

type Payment = 'pix' | 'credit' | 'debit' | 'cash'

export default function CheckoutPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [payment, setPayment] = useState<Payment>('pix')
  const [changeFor, setChangeFor] = useState('')
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null)
  const [showAddAddr, setShowAddAddr] = useState(false)
  const [newAddr, setNewAddr] = useState({
    label: 'Casa', street: '', number: '', complement: '', neighborhood: '', city: 'São Paulo', zip: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const cart = useMarketStore(s => s.cart)
  const cartRestaurantId = useMarketStore(s => s.cartRestaurantId)
  const addresses = useMarketStore(s => s.addresses)
  const selectedAddressId = useMarketStore(s => s.selectedAddressId)
  const selectAddress = useMarketStore(s => s.selectAddress)
  const addAddress = useMarketStore(s => s.addAddress)
  const updateQty = useMarketStore(s => s.updateQty)
  const removeFromCart = useMarketStore(s => s.removeFromCart)
  const placeOrder = useMarketStore(s => s.placeOrder)

  useEffect(() => setMounted(true), [])

  const restaurant = cartRestaurantId ? getRestaurantById(cartRestaurantId) : null
  const selectedAddress = addresses.find(a => a.id === selectedAddressId)

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const deliveryFee = restaurant
    ? (restaurant.freeFrom && subtotal >= restaurant.freeFrom ? 0 : restaurant.deliveryFee)
    : 0
  const discount = couponApplied?.discount || 0
  const total = Math.max(0, subtotal + deliveryFee - discount)

  useEffect(() => {
    if (mounted && cart.length === 0) {
      router.replace('/delivery-app')
    }
  }, [mounted, cart, router])

  const applyCoupon = () => {
    const c = coupon.trim().toUpperCase()
    if (!c) return
    if (c === 'GASTRO10') {
      setCouponApplied({ code: c, discount: subtotal * 0.1 })
    } else if (c === 'FRETE') {
      setCouponApplied({ code: c, discount: deliveryFee })
    } else if (c === 'DEMO20') {
      setCouponApplied({ code: c, discount: 20 })
    } else {
      setCouponApplied(null)
      alert('Cupom inválido. Tente: GASTRO10, FRETE ou DEMO20')
    }
  }

  const submit = async () => {
    if (!restaurant || !selectedAddress || cart.length === 0) return
    setSubmitting(true)
    // Simula processamento
    await new Promise(r => setTimeout(r, 800))
    const order = placeOrder({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantLogo: restaurant.logo,
      deliveryFee,
      paymentMethod: payment,
      changeFor: payment === 'cash' && changeFor ? Number(changeFor) : undefined,
      estimatedTime: Math.round((restaurant.deliveryTime[0] + restaurant.deliveryTime[1]) / 2),
    })
    if (order) {
      router.replace(`/delivery-app/pedido/${order.id}`)
    } else {
      setSubmitting(false)
    }
  }

  const saveNewAddress = () => {
    if (!newAddr.street || !newAddr.number || !newAddr.neighborhood) {
      alert('Preencha rua, número e bairro')
      return
    }
    addAddress(newAddr)
    setShowAddAddr(false)
    setNewAddr({ label: 'Casa', street: '', number: '', complement: '', neighborhood: '', city: 'São Paulo', zip: '' })
  }

  if (!mounted) return null
  if (!restaurant || cart.length === 0) return null

  return (
    <div className="min-h-screen mesh-warm noise pb-32">
      <header className="sticky top-0 z-30 bg-[#FFF7EE]/90 backdrop-blur-xl border-b border-orange-100/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white hover:bg-orange-50 rounded-2xl flex items-center justify-center shadow-sm ring-1 ring-orange-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-[10px] uppercase font-extrabold text-orange-600 tracking-wider">Finalizar</p>
            <h1 className="font-display text-xl">{restaurant.name}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Endereço */}
        <Section title="Entregar em" icon={<MapPin className="w-4 h-4 text-orange-500" />}>
          <div className="space-y-2">
            {addresses.map(a => (
              <button
                key={a.id}
                onClick={() => selectAddress(a.id)}
                className={`w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${
                  selectedAddressId === a.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selectedAddressId === a.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">{a.label}</p>
                    {selectedAddressId === a.id && <Check className="w-3 h-3 text-orange-500" />}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {a.street}, {a.number}
                    {a.complement && ` · ${a.complement}`}
                    {' '}— {a.neighborhood}
                  </p>
                </div>
              </button>
            ))}
            {!showAddAddr && (
              <button
                onClick={() => setShowAddAddr(true)}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-bold text-gray-500 hover:border-orange-300 hover:text-orange-600 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Adicionar novo endereço
              </button>
            )}
            {showAddAddr && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Rótulo (Casa, Trabalho)"
                    value={newAddr.label}
                    onChange={e => setNewAddr({ ...newAddr, label: e.target.value })}
                    className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-300"
                  />
                  <input
                    placeholder="Rua"
                    value={newAddr.street}
                    onChange={e => setNewAddr({ ...newAddr, street: e.target.value })}
                    className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-300"
                  />
                  <input
                    placeholder="Número"
                    value={newAddr.number}
                    onChange={e => setNewAddr({ ...newAddr, number: e.target.value })}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-300"
                  />
                  <input
                    placeholder="Complemento"
                    value={newAddr.complement}
                    onChange={e => setNewAddr({ ...newAddr, complement: e.target.value })}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-300"
                  />
                  <input
                    placeholder="Bairro"
                    value={newAddr.neighborhood}
                    onChange={e => setNewAddr({ ...newAddr, neighborhood: e.target.value })}
                    className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-300"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveNewAddress} className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold">Salvar</button>
                  <button onClick={() => setShowAddAddr(false)} className="px-4 py-2 text-gray-500 text-sm font-bold">Cancelar</button>
                </div>
              </motion.div>
            )}
          </div>
        </Section>

        {/* Itens */}
        <Section title="Seu pedido" icon={<span className="text-base">🛒</span>}>
          <div className="bg-white rounded-2xl divide-y divide-gray-100">
            {cart.map(c => (
              <div key={c.dishId} className="p-3 flex gap-3 items-center">
                <span className="text-3xl">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{c.name}</p>
                  <p className="text-xs text-gray-500">{formatBRL(c.price)} cada</p>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1">
                  <button onClick={() => updateQty(c.dishId, c.quantity - 1)} className="w-6 h-6 hover:bg-white rounded flex items-center justify-center">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{c.quantity}</span>
                  <button onClick={() => updateQty(c.dishId, c.quantity + 1)} className="w-6 h-6 hover:bg-white rounded flex items-center justify-center">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <p className="font-bold text-sm w-20 text-right">{formatBRL(c.price * c.quantity)}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Cupom */}
        <Section title="Cupom" icon={<Tag className="w-4 h-4 text-orange-500" />}>
          {couponApplied ? (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <div>
                  <p className="font-bold text-sm text-green-800">{couponApplied.code} aplicado</p>
                  <p className="text-xs text-green-600">-{formatBRL(couponApplied.discount)}</p>
                </div>
              </div>
              <button
                onClick={() => { setCouponApplied(null); setCoupon('') }}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Remover
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={coupon}
                onChange={e => setCoupon(e.target.value.toUpperCase())}
                placeholder="GASTRO10, FRETE, DEMO20..."
                className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-300"
              />
              <button
                onClick={applyCoupon}
                className="px-4 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800"
              >
                Aplicar
              </button>
            </div>
          )}
        </Section>

        {/* Pagamento */}
        <Section title="Forma de pagamento" icon={<CreditCard className="w-4 h-4 text-orange-500" />}>
          <div className="grid grid-cols-2 gap-2">
            <PaymentOption icon={<Smartphone className="w-5 h-5" />} label="PIX" subtitle="Aprovação instantânea" active={payment === 'pix'} onClick={() => setPayment('pix')} />
            <PaymentOption icon={<CreditCard className="w-5 h-5" />} label="Crédito" subtitle="Visa, Master, Elo..." active={payment === 'credit'} onClick={() => setPayment('credit')} />
            <PaymentOption icon={<CreditCard className="w-5 h-5" />} label="Débito" subtitle="Maestro, Visa Electron" active={payment === 'debit'} onClick={() => setPayment('debit')} />
            <PaymentOption icon={<Banknote className="w-5 h-5" />} label="Dinheiro" subtitle="Na entrega" active={payment === 'cash'} onClick={() => setPayment('cash')} />
          </div>
          {payment === 'cash' && (
            <div className="mt-2">
              <label className="text-xs font-bold text-gray-600 mb-1 block">Troco para quanto?</label>
              <input
                type="number"
                placeholder={`Total: ${formatBRL(total)}`}
                value={changeFor}
                onChange={e => setChangeFor(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-300"
              />
            </div>
          )}
        </Section>

        {/* Resumo */}
        <Section title="Resumo" icon={<span className="text-base">📋</span>}>
          <div className="bg-white rounded-2xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold">{formatBRL(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 flex items-center gap-1">
                <Bike className="w-3 h-3" /> Taxa de entrega
              </span>
              <span className="font-bold">
                {deliveryFee === 0 ? <span className="text-emerald-600">Grátis</span> : formatBRL(deliveryFee)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Desconto
                </span>
                <span className="font-bold">-{formatBRL(discount)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500 py-1">
              <Clock className="w-3 h-3" /> Entrega em {restaurant.deliveryTime[0]} a {restaurant.deliveryTime[1]} min
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between text-base">
              <span className="font-bold">Total</span>
              <span className="font-extrabold text-teal-700">{formatBRL(total)}</span>
            </div>
          </div>
        </Section>
      </div>

      {/* Submit fixo */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FFF7EE]/90 backdrop-blur-xl border-t border-orange-100 z-20">
        <button
          onClick={submit}
          disabled={submitting || !selectedAddress}
          className="btn-glow max-w-2xl mx-auto w-full py-4 text-white rounded-2xl font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitting ? '⏳ Processando pedido...' : `Confirmar pedido · ${formatBRL(total)}`}
          {!submitting && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs uppercase font-extrabold text-gray-500 mb-2 flex items-center gap-1.5 px-1">
        {icon} {title}
      </h2>
      {children}
    </section>
  )
}

function PaymentOption({
  icon, label, subtitle, active, onClick,
}: {
  icon: React.ReactNode; label: string; subtitle: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl border-2 text-left transition-all ${
        active ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
        active ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
      }`}>{icon}</div>
      <p className="font-bold text-sm">{label}</p>
      <p className="text-[10px] text-gray-500">{subtitle}</p>
    </button>
  )
}
