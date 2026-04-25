'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  dishId: string
  restaurantId: string
  name: string
  price: number
  emoji: string
  quantity: number
  notes?: string
}

export type MarketOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'on-the-way'
  | 'delivered'
  | 'canceled'

export interface MarketAddress {
  id: string
  label: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  zip: string
}

export interface MarketOrder {
  id: string
  number: number
  restaurantId: string
  restaurantName: string
  restaurantLogo: string
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  status: MarketOrderStatus
  paymentMethod: 'pix' | 'credit' | 'debit' | 'cash'
  changeFor?: number
  address: MarketAddress
  estimatedTime: number
  createdAt: string
  statusUpdatedAt: string
  driverName?: string
  driverPhone?: string
  driverVehicle?: string
}

interface MarketplaceState {
  cart: CartItem[]
  cartRestaurantId: string | null
  addresses: MarketAddress[]
  selectedAddressId: string | null
  orders: MarketOrder[]
  favoriteRestaurantIds: string[]

  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeFromCart: (dishId: string) => void
  updateQty: (dishId: string, quantity: number) => void
  clearCart: () => void

  addAddress: (address: Omit<MarketAddress, 'id'>) => void
  selectAddress: (id: string) => void
  removeAddress: (id: string) => void

  placeOrder: (data: {
    restaurantId: string
    restaurantName: string
    restaurantLogo: string
    deliveryFee: number
    paymentMethod: MarketOrder['paymentMethod']
    changeFor?: number
    estimatedTime: number
  }) => MarketOrder | null
  advanceOrderStatus: (orderId: string, status: MarketOrderStatus) => void

  toggleFavorite: (restaurantId: string) => void
}

const defaultAddresses: MarketAddress[] = [
  {
    id: 'a1',
    label: 'Casa',
    street: 'Av. Paulista',
    number: '1000',
    complement: 'Apt 45',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    zip: '01310-100',
  },
  {
    id: 'a2',
    label: 'Trabalho',
    street: 'Rua Augusta',
    number: '2500',
    complement: 'Sala 1201',
    neighborhood: 'Consolação',
    city: 'São Paulo',
    zip: '01304-001',
  },
]

export const useMarketStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      cart: [],
      cartRestaurantId: null,
      addresses: defaultAddresses,
      selectedAddressId: 'a1',
      orders: [],
      favoriteRestaurantIds: ['r2', 'r7'],

      addToCart: (item, quantity = 1) => {
        const state = get()
        // Se mudou de restaurante, limpa o carrinho
        if (state.cartRestaurantId && state.cartRestaurantId !== item.restaurantId) {
          set({
            cart: [{ ...item, quantity }],
            cartRestaurantId: item.restaurantId,
          })
          return
        }
        const existing = state.cart.find(c => c.dishId === item.dishId)
        if (existing) {
          set({
            cart: state.cart.map(c =>
              c.dishId === item.dishId ? { ...c, quantity: c.quantity + quantity } : c
            ),
          })
        } else {
          set({
            cart: [...state.cart, { ...item, quantity }],
            cartRestaurantId: item.restaurantId,
          })
        }
      },

      removeFromCart: dishId => {
        const cart = get().cart.filter(c => c.dishId !== dishId)
        set({
          cart,
          cartRestaurantId: cart.length === 0 ? null : get().cartRestaurantId,
        })
      },

      updateQty: (dishId, quantity) => {
        if (quantity <= 0) return get().removeFromCart(dishId)
        set({
          cart: get().cart.map(c => (c.dishId === dishId ? { ...c, quantity } : c)),
        })
      },

      clearCart: () => set({ cart: [], cartRestaurantId: null }),

      addAddress: address => {
        const id = `a${Date.now()}`
        set({
          addresses: [...get().addresses, { ...address, id }],
          selectedAddressId: id,
        })
      },

      selectAddress: id => set({ selectedAddressId: id }),

      removeAddress: id => {
        const addresses = get().addresses.filter(a => a.id !== id)
        set({
          addresses,
          selectedAddressId:
            get().selectedAddressId === id ? addresses[0]?.id || null : get().selectedAddressId,
        })
      },

      placeOrder: data => {
        const state = get()
        const address = state.addresses.find(a => a.id === state.selectedAddressId)
        if (!address || state.cart.length === 0) return null

        const subtotal = state.cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
        const total = subtotal + data.deliveryFee

        const order: MarketOrder = {
          id: `mo-${Date.now()}`,
          number: 1000 + state.orders.length + 1,
          restaurantId: data.restaurantId,
          restaurantName: data.restaurantName,
          restaurantLogo: data.restaurantLogo,
          items: state.cart,
          subtotal,
          deliveryFee: data.deliveryFee,
          discount: 0,
          total,
          status: 'pending',
          paymentMethod: data.paymentMethod,
          changeFor: data.changeFor,
          address,
          estimatedTime: data.estimatedTime,
          createdAt: new Date().toISOString(),
          statusUpdatedAt: new Date().toISOString(),
          driverName: 'Roberto Souza',
          driverPhone: '(11) 98888-1111',
          driverVehicle: 'Moto • ABC-1234',
        }
        set({
          orders: [order, ...state.orders],
          cart: [],
          cartRestaurantId: null,
        })
        return order
      },

      advanceOrderStatus: (orderId, status) => {
        set({
          orders: get().orders.map(o =>
            o.id === orderId
              ? { ...o, status, statusUpdatedAt: new Date().toISOString() }
              : o
          ),
        })
      },

      toggleFavorite: restaurantId => {
        const favs = get().favoriteRestaurantIds
        set({
          favoriteRestaurantIds: favs.includes(restaurantId)
            ? favs.filter(id => id !== restaurantId)
            : [...favs, restaurantId],
        })
      },
    }),
    { name: 'gastrohub-marketplace-v1' }
  )
)
