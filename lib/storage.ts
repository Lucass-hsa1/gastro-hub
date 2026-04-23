export interface Order {
  id: string
  number: number
  table: string
  items: OrderItem[]
  status: 'pending' | 'preparing' | 'ready' | 'delivered'
  total: number
  createdAt: string
  notes?: string
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  notes?: string
}

export interface Delivery {
  id: string
  orderId: string
  customerName: string
  address: string
  phone: string
  status: 'pending' | 'in-transit' | 'delivered'
  total: number
  createdAt: string
}

export interface RestaurantData {
  name: string
  logo?: string
  address: string
  phone: string
  email: string
  operatingHours: {
    open: string
    close: string
  }
}

const STORAGE_KEYS = {
  ORDERS: 'gastro_hub_orders',
  DELIVERIES: 'gastro_hub_deliveries',
  RESTAURANT: 'gastro_hub_restaurant',
  NEXT_ORDER_ID: 'gastro_hub_next_order_id',
}

// Default data
const defaultRestaurant: RestaurantData = {
  name: 'GastroHub Demo',
  address: 'Rua Principal, 123',
  phone: '(11) 9999-9999',
  email: 'contato@gastrohub.com.br',
  operatingHours: {
    open: '11:00',
    close: '23:00',
  },
}

const defaultMenu = [
  { id: '1', name: 'Hambúrguer Clássico', category: 'Burgers', price: 25.00 },
  { id: '2', name: 'Hambúrguer Duplo', category: 'Burgers', price: 35.00 },
  { id: '3', name: 'Pizza Margherita', category: 'Pizzas', price: 45.00 },
  { id: '4', name: 'Pizza Pepperoni', category: 'Pizzas', price: 50.00 },
  { id: '5', name: 'Pastel de Carne', category: 'Pastéis', price: 8.00 },
  { id: '6', name: 'Pastel de Queijo', category: 'Pastéis', price: 8.00 },
  { id: '7', name: 'Moqueca', category: 'Pratos Quentes', price: 55.00 },
  { id: '8', name: 'Feijoada', category: 'Pratos Quentes', price: 45.00 },
  { id: '9', name: 'Refrigerante', category: 'Bebidas', price: 6.00 },
  { id: '10', name: 'Suco Natural', category: 'Bebidas', price: 8.00 },
  { id: '11', name: 'Cerveja', category: 'Bebidas', price: 10.00 },
  { id: '12', name: 'Sorvete', category: 'Sobremesas', price: 12.00 },
]

// Initialize storage with demo data if empty
export function initializeStorage() {
  if (typeof window === 'undefined') return

  // Initialize restaurant
  if (!localStorage.getItem(STORAGE_KEYS.RESTAURANT)) {
    localStorage.setItem(STORAGE_KEYS.RESTAURANT, JSON.stringify(defaultRestaurant))
  }

  // Initialize orders with demo data
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    const demoOrders: Order[] = [
      {
        id: '1',
        number: 1,
        table: 'Mesa 1',
        items: [
          { id: '1', name: 'Hambúrguer Clássico', quantity: 2, price: 25.00 },
          { id: '9', name: 'Refrigerante', quantity: 2, price: 6.00 },
        ],
        status: 'ready',
        total: 62.00,
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      },
      {
        id: '2',
        number: 2,
        table: 'Mesa 3',
        items: [
          { id: '3', name: 'Pizza Margherita', quantity: 1, price: 45.00 },
          { id: '11', name: 'Cerveja', quantity: 2, price: 10.00 },
        ],
        status: 'preparing',
        total: 65.00,
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
      },
    ]
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(demoOrders))
    localStorage.setItem(STORAGE_KEYS.NEXT_ORDER_ID, '3')
  }

  // Initialize deliveries with demo data
  if (!localStorage.getItem(STORAGE_KEYS.DELIVERIES)) {
    const demoDeliveries: Delivery[] = [
      {
        id: '1',
        orderId: '3',
        customerName: 'João Silva',
        address: 'Av. Paulista, 1000 - São Paulo, SP',
        phone: '(11) 98765-4321',
        status: 'in-transit',
        total: 85.00,
        createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
      },
      {
        id: '2',
        orderId: '4',
        customerName: 'Maria Santos',
        address: 'Rua Augusta, 500 - São Paulo, SP',
        phone: '(11) 97654-3210',
        status: 'delivered',
        total: 72.00,
        createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
      },
    ]
    localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(demoDeliveries))
  }
}

export function getOrders(): Order[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS)
  return data ? JSON.parse(data) : []
}

export function addOrder(table: string, items: OrderItem[]): Order {
  if (typeof window === 'undefined') throw new Error('Client only')

  const orders = getOrders()
  const nextId = parseInt(localStorage.getItem(STORAGE_KEYS.NEXT_ORDER_ID) || '1', 10)
  const newOrder: Order = {
    id: String(nextId),
    number: nextId,
    table,
    items,
    status: 'pending',
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    createdAt: new Date().toISOString(),
  }

  orders.push(newOrder)
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
  localStorage.setItem(STORAGE_KEYS.NEXT_ORDER_ID, String(nextId + 1))

  return newOrder
}

export function updateOrderStatus(orderId: string, status: Order['status']) {
  if (typeof window === 'undefined') throw new Error('Client only')

  const orders = getOrders()
  const order = orders.find(o => o.id === orderId)
  if (order) {
    order.status = status
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
  }
  return order
}

export function deleteOrder(orderId: string) {
  if (typeof window === 'undefined') throw new Error('Client only')

  const orders = getOrders().filter(o => o.id !== orderId)
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
}

export function getDeliveries(): Delivery[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.DELIVERIES)
  return data ? JSON.parse(data) : []
}

export function addDelivery(delivery: Omit<Delivery, 'id' | 'createdAt'>): Delivery {
  if (typeof window === 'undefined') throw new Error('Client only')

  const deliveries = getDeliveries()
  const newDelivery: Delivery = {
    ...delivery,
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
  }

  deliveries.push(newDelivery)
  localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(deliveries))

  return newDelivery
}

export function updateDeliveryStatus(deliveryId: string, status: Delivery['status']) {
  if (typeof window === 'undefined') throw new Error('Client only')

  const deliveries = getDeliveries()
  const delivery = deliveries.find(d => d.id === deliveryId)
  if (delivery) {
    delivery.status = status
    localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(deliveries))
  }
  return delivery
}

export function getRestaurant(): RestaurantData {
  if (typeof window === 'undefined') return defaultRestaurant
  const data = localStorage.getItem(STORAGE_KEYS.RESTAURANT)
  return data ? JSON.parse(data) : defaultRestaurant
}

export function updateRestaurant(data: Partial<RestaurantData>) {
  if (typeof window === 'undefined') throw new Error('Client only')

  const current = getRestaurant()
  const updated = { ...current, ...data }
  localStorage.setItem(STORAGE_KEYS.RESTAURANT, JSON.stringify(updated))
  return updated
}

export function getMenu() {
  return defaultMenu
}

export function getMenuByCategory(category: string) {
  return defaultMenu.filter(item => item.category === category)
}

export function getCategories() {
  return [...new Set(defaultMenu.map(item => item.category))]
}
