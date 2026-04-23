// ===== TYPES =====

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'delivered' | 'canceled'
export type OrderType = 'dine-in' | 'delivery' | 'takeout' | 'counter'
export type OrderSource = 'qr' | 'waiter' | 'pdv' | 'delivery' | 'counter'
export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'pix' | 'voucher'
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning'

export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  cost: number
  description: string
  image?: string
  emoji: string
  available: boolean
  ingredients?: { id: string; quantity: number }[]
  prepTime: number // minutos
  popular?: boolean
}

export interface OrderItem {
  id: string
  menuItemId: string
  name: string
  quantity: number
  price: number
  notes?: string
  emoji?: string
  prepTime?: number
  // Per-item kitchen status — 'served' means waiter delivered to table
  status?: OrderStatus
  addedAt?: string
}

export interface Order {
  id: string
  number: number
  type: OrderType
  tableId?: string
  items: OrderItem[]
  status: OrderStatus
  subtotal: number
  discount: number
  total: number
  paymentMethod?: PaymentMethod
  customerId?: string
  customerName?: string
  deliveryId?: string
  createdAt: string
  updatedAt: string
  notes?: string
  waiterId?: string
  source?: OrderSource
}

export interface Table {
  id: string
  number: number
  capacity: number
  status: TableStatus
  x: number
  y: number
  currentOrderId?: string
  reservedFor?: string
  reservedAt?: string
}

export interface Delivery {
  id: string
  orderId: string
  customerId?: string
  customerName: string
  address: string
  neighborhood: string
  phone: string
  status: 'pending' | 'assigned' | 'picked-up' | 'in-transit' | 'delivered' | 'canceled'
  total: number
  deliveryFee: number
  driverId?: string
  estimatedTime: number // min
  distance: number // km
  lat?: number
  lng?: number
  createdAt: string
  deliveredAt?: string
}

export interface Driver {
  id: string
  name: string
  phone: string
  vehicle: 'moto' | 'bike' | 'car'
  plate?: string
  photo?: string
  status: 'available' | 'busy' | 'offline'
  rating: number
  deliveriesCount: number
  currentDeliveryId?: string
  hireDate: string
}

export interface InventoryItem {
  id: string
  name: string
  unit: 'kg' | 'g' | 'l' | 'ml' | 'un' | 'cx'
  currentStock: number
  minStock: number
  maxStock: number
  cost: number
  supplier?: string
  category: string
  lastPurchase?: string
  expiresAt?: string
}

export interface Recipe {
  id: string
  menuItemId: string
  name: string
  servings: number
  ingredients: {
    inventoryItemId: string
    name: string
    quantity: number
    unit: string
    cost: number
  }[]
  totalCost: number
  sellPrice: number
  margin: number
  prepTime: number
  instructions: string[]
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  birthday?: string
  createdAt: string
  orderCount: number
  totalSpent: number
  lastOrderAt?: string
  favoriteItems?: string[]
  tags?: string[]
}

export interface Employee {
  id: string
  name: string
  role: 'manager' | 'waiter' | 'cashier' | 'cook' | 'delivery' | 'admin'
  phone: string
  email?: string
  salary: number
  hireDate: string
  status: 'active' | 'inactive' | 'vacation'
  shift: 'morning' | 'afternoon' | 'night' | 'full'
  photo?: string
}

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  paymentMethod: PaymentMethod
  date: string
  relatedOrderId?: string
  relatedSupplier?: string
  recurring?: boolean
}

export interface Promotion {
  id: string
  name: string
  code?: string
  type: 'percentage' | 'fixed' | 'bogo'
  value: number
  minOrder?: number
  maxDiscount?: number
  validFrom: string
  validUntil: string
  active: boolean
  uses: number
  maxUses?: number
  applicableItems?: string[]
}

export interface Restaurant {
  name: string
  logo?: string
  address: string
  phone: string
  email: string
  cnpj?: string
  openTime: string
  closeTime: string
  deliveryFee: number
  minOrderDelivery: number
  maxDeliveryDistance: number
}

export type UserRole = 'cliente' | 'garcom' | 'cozinha' | 'gerente' | 'super-admin'

export interface AuthUser {
  name: string
  email: string
  role: UserRole
  avatar?: string
  customerId?: string
  employeeId?: string
  loggedAt: string
}
