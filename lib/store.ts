'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  MenuItem, Order, Table, Delivery, Driver, InventoryItem,
  Recipe, Customer, Employee, Transaction, Promotion, Restaurant,
  OrderStatus, OrderItem, OrderType, PaymentMethod, AuthUser, UserRole,
  FiscalReceipt
} from './types'

// ===== DEFAULT DATA =====

const defaultMenu: MenuItem[] = [
  { id: 'm1', name: 'Hambúrguer Artesanal', category: 'Burgers', price: 32.90, cost: 12.50, description: 'Blend bovino 180g, queijo cheddar, bacon, alface, tomate e molho especial', emoji: '🍔', available: true, prepTime: 15, popular: true },
  { id: 'm2', name: 'Smash Burger Duplo', category: 'Burgers', price: 42.90, cost: 16.80, description: 'Dois smashes 90g, queijo derretido, cebola caramelizada, molho da casa', emoji: '🍔', available: true, prepTime: 15, popular: true },
  { id: 'm3', name: 'Chicken Burger', category: 'Burgers', price: 29.90, cost: 11.20, description: 'Frango empanado crocante, queijo, alface e maionese defumada', emoji: '🍔', available: true, prepTime: 12 },
  { id: 'm4', name: 'Veggie Burger', category: 'Burgers', price: 28.90, cost: 10.00, description: 'Hambúrguer de grão-de-bico, queijo vegano, rúcula e molho tahine', emoji: '🥬', available: true, prepTime: 12 },
  { id: 'm5', name: 'Pizza Margherita', category: 'Pizzas', price: 54.90, cost: 18.70, description: 'Molho de tomate, mussarela de búfala, manjericão fresco e azeite', emoji: '🍕', available: true, prepTime: 20, popular: true },
  { id: 'm6', name: 'Pizza Pepperoni', category: 'Pizzas', price: 62.90, cost: 22.40, description: 'Mussarela, pepperoni premium e orégano', emoji: '🍕', available: true, prepTime: 20 },
  { id: 'm7', name: 'Pizza 4 Queijos', category: 'Pizzas', price: 68.90, cost: 24.50, description: 'Mussarela, provolone, parmesão e gorgonzola', emoji: '🍕', available: true, prepTime: 22 },
  { id: 'm8', name: 'Pizza Calabresa', category: 'Pizzas', price: 58.90, cost: 20.10, description: 'Mussarela, calabresa, cebola roxa e azeitonas', emoji: '🍕', available: true, prepTime: 20 },
  { id: 'm9', name: 'Pastel de Carne', category: 'Pastéis', price: 12.00, cost: 3.50, description: 'Massa crocante recheada com carne moída temperada', emoji: '🥟', available: true, prepTime: 8 },
  { id: 'm10', name: 'Pastel de Queijo', category: 'Pastéis', price: 10.00, cost: 2.80, description: 'Massa crocante com mussarela derretida', emoji: '🥟', available: true, prepTime: 8 },
  { id: 'm11', name: 'Moqueca de Peixe', category: 'Pratos Principais', price: 74.90, cost: 28.40, description: 'Peixe branco no leite de coco, dendê, pimentões e coentro', emoji: '🍲', available: true, prepTime: 30 },
  { id: 'm12', name: 'Feijoada Completa', category: 'Pratos Principais', price: 54.90, cost: 19.80, description: 'Feijoada tradicional com arroz, couve, farofa e laranja', emoji: '🍛', available: true, prepTime: 25, popular: true },
  { id: 'm13', name: 'Parmegiana de Frango', category: 'Pratos Principais', price: 48.90, cost: 17.20, description: 'Filé empanado, molho de tomate, mussarela, arroz e fritas', emoji: '🍗', available: true, prepTime: 22 },
  { id: 'm14', name: 'Risoto de Camarão', category: 'Pratos Principais', price: 69.90, cost: 26.50, description: 'Risoto cremoso com camarões grelhados e limão siciliano', emoji: '🦐', available: true, prepTime: 25 },
  { id: 'm15', name: 'Batata Frita', category: 'Acompanhamentos', price: 18.90, cost: 3.20, description: 'Porção generosa de batata frita crocante', emoji: '🍟', available: true, prepTime: 10, popular: true },
  { id: 'm16', name: 'Onion Rings', category: 'Acompanhamentos', price: 22.90, cost: 5.40, description: 'Anéis de cebola empanados e crocantes', emoji: '🧅', available: true, prepTime: 10 },
  { id: 'm17', name: 'Salada Caesar', category: 'Saladas', price: 32.90, cost: 9.80, description: 'Alface, frango grelhado, croutons, parmesão e molho caesar', emoji: '🥗', available: true, prepTime: 8 },
  { id: 'm18', name: 'Coca-Cola 350ml', category: 'Bebidas', price: 7.50, cost: 2.80, description: 'Refrigerante gelado', emoji: '🥤', available: true, prepTime: 1, popular: true },
  { id: 'm19', name: 'Suco Natural', category: 'Bebidas', price: 12.00, cost: 3.50, description: 'Laranja, limão, maracujá ou abacaxi', emoji: '🧃', available: true, prepTime: 3 },
  { id: 'm20', name: 'Cerveja Artesanal IPA', category: 'Bebidas', price: 18.90, cost: 7.20, description: 'Cerveja IPA gelada 600ml', emoji: '🍺', available: true, prepTime: 1 },
  { id: 'm21', name: 'Caipirinha', category: 'Bebidas', price: 22.90, cost: 6.50, description: 'Cachaça, limão e açúcar', emoji: '🍹', available: true, prepTime: 4 },
  { id: 'm22', name: 'Brownie com Sorvete', category: 'Sobremesas', price: 22.90, cost: 7.80, description: 'Brownie quente com sorvete de baunilha e calda de chocolate', emoji: '🍰', available: true, prepTime: 5, popular: true },
  { id: 'm23', name: 'Pudim', category: 'Sobremesas', price: 16.90, cost: 4.50, description: 'Pudim de leite condensado caseiro', emoji: '🍮', available: true, prepTime: 3 },
  { id: 'm24', name: 'Cheesecake', category: 'Sobremesas', price: 19.90, cost: 6.20, description: 'Cheesecake com calda de frutas vermelhas', emoji: '🍰', available: true, prepTime: 3 },
]

const defaultInventory: InventoryItem[] = [
  { id: 'i1', name: 'Carne Bovina Moída', unit: 'kg', currentStock: 25, minStock: 10, maxStock: 50, cost: 45.00, supplier: 'Frigorífico Santa Clara', category: 'Carnes', lastPurchase: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'i2', name: 'Queijo Mussarela', unit: 'kg', currentStock: 12, minStock: 5, maxStock: 20, cost: 38.00, supplier: 'Laticínios Bom Gosto', category: 'Laticínios' },
  { id: 'i3', name: 'Bacon', unit: 'kg', currentStock: 3, minStock: 3, maxStock: 10, cost: 42.00, supplier: 'Frigorífico Santa Clara', category: 'Carnes' },
  { id: 'i4', name: 'Alface Americana', unit: 'un', currentStock: 30, minStock: 15, maxStock: 50, cost: 3.50, supplier: 'Horta Verde', category: 'Hortifruti' },
  { id: 'i5', name: 'Tomate', unit: 'kg', currentStock: 15, minStock: 8, maxStock: 25, cost: 8.00, supplier: 'Horta Verde', category: 'Hortifruti' },
  { id: 'i6', name: 'Pão de Hambúrguer', unit: 'un', currentStock: 80, minStock: 50, maxStock: 200, cost: 1.80, supplier: 'Padaria do João', category: 'Panificação' },
  { id: 'i7', name: 'Batata Congelada', unit: 'kg', currentStock: 18, minStock: 10, maxStock: 30, cost: 18.00, supplier: 'McCain', category: 'Congelados' },
  { id: 'i8', name: 'Farinha de Trigo', unit: 'kg', currentStock: 40, minStock: 20, maxStock: 80, cost: 5.50, category: 'Secos' },
  { id: 'i9', name: 'Coca-Cola 350ml', unit: 'un', currentStock: 120, minStock: 60, maxStock: 240, cost: 3.20, supplier: 'Coca-Cola FEMSA', category: 'Bebidas' },
  { id: 'i10', name: 'Cerveja IPA 600ml', unit: 'un', currentStock: 48, minStock: 24, maxStock: 96, cost: 8.50, supplier: 'Cervejaria Artesanal', category: 'Bebidas' },
  { id: 'i11', name: 'Peixe Branco Filé', unit: 'kg', currentStock: 8, minStock: 5, maxStock: 15, cost: 48.00, supplier: 'Peixaria do Mar', category: 'Pescados' },
  { id: 'i12', name: 'Camarão Médio', unit: 'kg', currentStock: 2, minStock: 3, maxStock: 8, cost: 75.00, supplier: 'Peixaria do Mar', category: 'Pescados' },
  { id: 'i13', name: 'Feijão Preto', unit: 'kg', currentStock: 25, minStock: 10, maxStock: 40, cost: 7.50, category: 'Secos' },
  { id: 'i14', name: 'Arroz Branco', unit: 'kg', currentStock: 35, minStock: 15, maxStock: 50, cost: 5.00, category: 'Secos' },
  { id: 'i15', name: 'Azeite Extra Virgem', unit: 'l', currentStock: 8, minStock: 4, maxStock: 15, cost: 32.00, category: 'Temperos' },
]

const defaultCustomers: Customer[] = [
  { id: 'c1', name: 'João Silva', phone: '(11) 98765-4321', email: 'joao@email.com', address: 'Av. Paulista, 1000 - Apt 45', createdAt: new Date(Date.now() - 180 * 86400000).toISOString(), orderCount: 28, totalSpent: 1240.50, lastOrderAt: new Date(Date.now() - 2 * 86400000).toISOString(), tags: ['VIP'] },
  { id: 'c2', name: 'Maria Santos', phone: '(11) 97654-3210', email: 'maria@email.com', address: 'Rua Augusta, 500', createdAt: new Date(Date.now() - 90 * 86400000).toISOString(), orderCount: 12, totalSpent: 580.80, lastOrderAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'c3', name: 'Pedro Oliveira', phone: '(11) 96543-2109', email: 'pedro@email.com', address: 'Rua dos Pinheiros, 200', createdAt: new Date(Date.now() - 365 * 86400000).toISOString(), orderCount: 45, totalSpent: 2150.30, lastOrderAt: new Date(Date.now() - 1 * 86400000).toISOString(), tags: ['VIP', 'Fidelidade'] },
  { id: 'c4', name: 'Ana Costa', phone: '(11) 95432-1098', address: 'Alameda Santos, 300', createdAt: new Date(Date.now() - 60 * 86400000).toISOString(), orderCount: 8, totalSpent: 320.40, lastOrderAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 'c5', name: 'Carlos Ferreira', phone: '(11) 94321-0987', email: 'carlos@email.com', address: 'Rua Oscar Freire, 150', createdAt: new Date(Date.now() - 45 * 86400000).toISOString(), orderCount: 6, totalSpent: 289.90 },
  { id: 'c6', name: 'Juliana Lima', phone: '(11) 93210-9876', address: 'Av. Rebouças, 800', createdAt: new Date(Date.now() - 30 * 86400000).toISOString(), orderCount: 4, totalSpent: 195.60, lastOrderAt: new Date(Date.now() - 3 * 86400000).toISOString() },
]

const defaultDrivers: Driver[] = [
  { id: 'd1', name: 'Roberto Souza', phone: '(11) 98888-1111', vehicle: 'moto', plate: 'ABC-1234', status: 'available', rating: 4.8, deliveriesCount: 342, hireDate: new Date(Date.now() - 400 * 86400000).toISOString() },
  { id: 'd2', name: 'Fernando Alves', phone: '(11) 97777-2222', vehicle: 'moto', plate: 'XYZ-5678', status: 'busy', rating: 4.9, deliveriesCount: 521, hireDate: new Date(Date.now() - 600 * 86400000).toISOString() },
  { id: 'd3', name: 'Lucas Pereira', phone: '(11) 96666-3333', vehicle: 'bike', status: 'available', rating: 4.7, deliveriesCount: 189, hireDate: new Date(Date.now() - 200 * 86400000).toISOString() },
  { id: 'd4', name: 'Marcos Ribeiro', phone: '(11) 95555-4444', vehicle: 'moto', plate: 'DEF-9012', status: 'offline', rating: 4.6, deliveriesCount: 278, hireDate: new Date(Date.now() - 300 * 86400000).toISOString() },
]

const defaultEmployees: Employee[] = [
  { id: 'e1', name: 'Marcelo Almeida', role: 'manager', phone: '(11) 91111-0001', email: 'marcelo@gastrohub.com', salary: 5800, hireDate: new Date(Date.now() - 800 * 86400000).toISOString(), status: 'active', shift: 'full' },
  { id: 'e2', name: 'Patricia Lopes', role: 'waiter', phone: '(11) 91111-0002', salary: 2200, hireDate: new Date(Date.now() - 400 * 86400000).toISOString(), status: 'active', shift: 'night' },
  { id: 'e3', name: 'Carlos Mendes', role: 'cook', phone: '(11) 91111-0003', salary: 3500, hireDate: new Date(Date.now() - 600 * 86400000).toISOString(), status: 'active', shift: 'full' },
  { id: 'e4', name: 'Juliana Rocha', role: 'cashier', phone: '(11) 91111-0004', salary: 2500, hireDate: new Date(Date.now() - 300 * 86400000).toISOString(), status: 'active', shift: 'afternoon' },
  { id: 'e5', name: 'Ricardo Melo', role: 'waiter', phone: '(11) 91111-0005', salary: 2200, hireDate: new Date(Date.now() - 250 * 86400000).toISOString(), status: 'active', shift: 'morning' },
  { id: 'e6', name: 'Amanda Dias', role: 'cook', phone: '(11) 91111-0006', salary: 3200, hireDate: new Date(Date.now() - 180 * 86400000).toISOString(), status: 'active', shift: 'night' },
]

const defaultTables: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: `t${i + 1}`,
  number: i + 1,
  capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
  status: 'available' as const,
  x: (i % 4) * 180 + 60,
  y: Math.floor(i / 4) * 160 + 40,
}))

// Generate historical transactions
function generateTransactions(): Transaction[] {
  const transactions: Transaction[] = []
  const now = Date.now()

  // Last 30 days income
  for (let i = 0; i < 30; i++) {
    const date = new Date(now - i * 86400000).toISOString()
    const dailyOrders = 15 + Math.floor(Math.random() * 25)
    for (let j = 0; j < dailyOrders; j++) {
      transactions.push({
        id: `t-${i}-${j}`,
        type: 'income',
        category: ['Vendas Balcão', 'Vendas Delivery', 'Vendas Salão'][Math.floor(Math.random() * 3)],
        description: `Pedido #${1000 + transactions.length}`,
        amount: 35 + Math.random() * 150,
        paymentMethod: (['cash', 'credit', 'debit', 'pix'][Math.floor(Math.random() * 4)]) as PaymentMethod,
        date,
      })
    }
  }

  // Expenses
  const expenseCategories = [
    { category: 'Aluguel', amount: 8500, description: 'Aluguel do estabelecimento' },
    { category: 'Salários', amount: 22000, description: 'Folha de pagamento' },
    { category: 'Fornecedores', amount: 4200, description: 'Compra de insumos' },
    { category: 'Fornecedores', amount: 3800, description: 'Compra de bebidas' },
    { category: 'Energia Elétrica', amount: 1850, description: 'Conta de luz' },
    { category: 'Água', amount: 420, description: 'Conta de água' },
    { category: 'Internet/Telefone', amount: 380, description: 'Internet e telefone' },
    { category: 'Marketing', amount: 1500, description: 'Anúncios Instagram' },
    { category: 'Manutenção', amount: 650, description: 'Manutenção de equipamentos' },
  ]

  expenseCategories.forEach((exp, i) => {
    transactions.push({
      id: `exp-${i}`,
      type: 'expense',
      category: exp.category,
      description: exp.description,
      amount: exp.amount,
      paymentMethod: 'pix',
      date: new Date(now - i * 3 * 86400000).toISOString(),
    })
  })

  return transactions
}

function generateDemoOrders(): Order[] {
  const now = Date.now()
  return [
    {
      id: 'o1',
      number: 1001,
      type: 'dine-in',
      tableId: 't1',
      items: [
        { id: 'oi1', menuItemId: 'm1', name: 'Hambúrguer Artesanal', quantity: 2, price: 32.90, emoji: '🍔' },
        { id: 'oi2', menuItemId: 'm18', name: 'Coca-Cola 350ml', quantity: 2, price: 7.50, emoji: '🥤' },
      ],
      status: 'preparing',
      subtotal: 80.80,
      discount: 0,
      total: 80.80,
      createdAt: new Date(now - 8 * 60000).toISOString(),
      updatedAt: new Date(now - 3 * 60000).toISOString(),
    },
    {
      id: 'o2',
      number: 1002,
      type: 'delivery',
      items: [
        { id: 'oi3', menuItemId: 'm5', name: 'Pizza Margherita', quantity: 1, price: 54.90, emoji: '🍕' },
        { id: 'oi4', menuItemId: 'm20', name: 'Cerveja Artesanal IPA', quantity: 2, price: 18.90, emoji: '🍺' },
      ],
      status: 'ready',
      subtotal: 92.70,
      discount: 0,
      total: 97.70,
      customerName: 'João Silva',
      customerId: 'c1',
      createdAt: new Date(now - 25 * 60000).toISOString(),
      updatedAt: new Date(now - 5 * 60000).toISOString(),
    },
    {
      id: 'o3',
      number: 1003,
      type: 'dine-in',
      tableId: 't3',
      items: [
        { id: 'oi5', menuItemId: 'm12', name: 'Feijoada Completa', quantity: 2, price: 54.90, emoji: '🍛' },
        { id: 'oi6', menuItemId: 'm21', name: 'Caipirinha', quantity: 2, price: 22.90, emoji: '🍹' },
      ],
      status: 'ready',
      subtotal: 155.60,
      discount: 0,
      total: 155.60,
      createdAt: new Date(now - 45 * 60000).toISOString(),
      updatedAt: new Date(now - 10 * 60000).toISOString(),
    },
    {
      id: 'o4',
      number: 1004,
      type: 'counter',
      items: [
        { id: 'oi7', menuItemId: 'm9', name: 'Pastel de Carne', quantity: 3, price: 12.00, emoji: '🥟' },
        { id: 'oi8', menuItemId: 'm18', name: 'Coca-Cola 350ml', quantity: 1, price: 7.50, emoji: '🥤' },
      ],
      status: 'delivered',
      subtotal: 43.50,
      discount: 0,
      total: 43.50,
      paymentMethod: 'pix',
      createdAt: new Date(now - 120 * 60000).toISOString(),
      updatedAt: new Date(now - 100 * 60000).toISOString(),
    },
  ]
}

function generateDemoDeliveries(): Delivery[] {
  const now = Date.now()
  return [
    {
      id: 'dl1',
      orderId: 'o2',
      customerId: 'c1',
      customerName: 'João Silva',
      address: 'Av. Paulista, 1000 - Apt 45',
      neighborhood: 'Bela Vista',
      phone: '(11) 98765-4321',
      status: 'in-transit',
      total: 97.70,
      deliveryFee: 5.00,
      driverId: 'd2',
      estimatedTime: 15,
      distance: 3.2,
      createdAt: new Date(now - 25 * 60000).toISOString(),
    },
    {
      id: 'dl2',
      orderId: 'o5',
      customerId: 'c3',
      customerName: 'Pedro Oliveira',
      address: 'Rua dos Pinheiros, 200',
      neighborhood: 'Pinheiros',
      phone: '(11) 96543-2109',
      status: 'delivered',
      total: 142.80,
      deliveryFee: 7.00,
      driverId: 'd1',
      estimatedTime: 25,
      distance: 5.1,
      createdAt: new Date(now - 80 * 60000).toISOString(),
      deliveredAt: new Date(now - 45 * 60000).toISOString(),
    },
    {
      id: 'dl3',
      orderId: 'o6',
      customerId: 'c2',
      customerName: 'Maria Santos',
      address: 'Rua Augusta, 500',
      neighborhood: 'Consolação',
      phone: '(11) 97654-3210',
      status: 'pending',
      total: 67.90,
      deliveryFee: 5.00,
      estimatedTime: 20,
      distance: 2.8,
      createdAt: new Date(now - 3 * 60000).toISOString(),
    },
  ]
}

const defaultPromotions: Promotion[] = [
  { id: 'p1', name: 'Primeiro Pedido', code: 'BEMVINDO10', type: 'percentage', value: 10, minOrder: 30, validFrom: new Date().toISOString(), validUntil: new Date(Date.now() + 90 * 86400000).toISOString(), active: true, uses: 23, maxUses: 500 },
  { id: 'p2', name: 'Frete Grátis Acima R$80', code: 'FRETEGRATIS', type: 'fixed', value: 5, minOrder: 80, validFrom: new Date().toISOString(), validUntil: new Date(Date.now() + 180 * 86400000).toISOString(), active: true, uses: 142 },
  { id: 'p3', name: 'Combo Almoço', type: 'percentage', value: 15, minOrder: 50, validFrom: new Date().toISOString(), validUntil: new Date(Date.now() + 30 * 86400000).toISOString(), active: true, uses: 89 },
]

const defaultRestaurant: Restaurant = {
  name: 'GastroHub Demo',
  address: 'Av. Paulista, 1500 - Bela Vista, São Paulo - SP',
  phone: '(11) 3456-7890',
  email: 'contato@gastrohub.com.br',
  cnpj: '12.345.678/0001-90',
  openTime: '11:00',
  closeTime: '23:00',
  deliveryFee: 5.00,
  minOrderDelivery: 25.00,
  maxDeliveryDistance: 10,
}

// ===== STORE =====

interface StoreState {
  // Data
  menu: MenuItem[]
  orders: Order[]
  tables: Table[]
  deliveries: Delivery[]
  drivers: Driver[]
  inventory: InventoryItem[]
  recipes: Recipe[]
  customers: Customer[]
  employees: Employee[]
  transactions: Transaction[]
  promotions: Promotion[]
  restaurant: Restaurant
  nextOrderNumber: number
  authUser: AuthUser | null
  fiscalReceipts: FiscalReceipt[]
  nextFiscalNumber: number

  // Auth
  login: (user: AuthUser) => void
  logout: () => void

  // Fiscal
  issueFiscalReceipt: (data: {
    orderId?: string
    orderNumber?: number
    customerName?: string
    customerDoc?: string
    items: { name: string; quantity: number; price: number; total: number }[]
    subtotal: number
    discount: number
    total: number
    paymentMethod: PaymentMethod
  }) => FiscalReceipt
  cancelFiscalReceipt: (id: string, reason: string) => void

  // Menu Actions
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void
  deleteMenuItem: (id: string) => void

  // Order Actions
  createOrder: (data: Omit<Order, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => Order
  updateOrder: (id: string, updates: Partial<Order>) => void
  updateOrderStatus: (id: string, status: OrderStatus) => void
  deleteOrder: (id: string) => void
  addItemsToOrder: (orderId: string, items: OrderItem[]) => void
  createOrAppendTableOrder: (
    tableId: string,
    items: OrderItem[],
    opts?: { source?: 'qr' | 'waiter'; customerName?: string; waiterId?: string }
  ) => Order
  closeTableBill: (tableId: string, paymentMethod: PaymentMethod) => void

  // Table Actions
  updateTable: (id: string, updates: Partial<Table>) => void

  // Delivery Actions
  createDelivery: (data: Omit<Delivery, 'id' | 'createdAt'>) => Delivery
  updateDelivery: (id: string, updates: Partial<Delivery>) => void
  assignDriver: (deliveryId: string, driverId: string) => void

  // Driver Actions
  addDriver: (data: Omit<Driver, 'id' | 'hireDate' | 'deliveriesCount' | 'rating'>) => void
  updateDriver: (id: string, updates: Partial<Driver>) => void
  deleteDriver: (id: string) => void

  // Inventory Actions
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void
  deleteInventoryItem: (id: string) => void

  // Customer Actions
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'orderCount' | 'totalSpent'>) => Customer
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  deleteCustomer: (id: string) => void

  // Employee Actions
  addEmployee: (data: Omit<Employee, 'id' | 'hireDate'>) => void
  updateEmployee: (id: string, updates: Partial<Employee>) => void
  deleteEmployee: (id: string) => void

  // Transaction Actions
  addTransaction: (data: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  // Promotion Actions
  addPromotion: (data: Omit<Promotion, 'id' | 'uses'>) => void
  updatePromotion: (id: string, updates: Partial<Promotion>) => void
  deletePromotion: (id: string) => void

  // Restaurant
  updateRestaurant: (updates: Partial<Restaurant>) => void

  // Utility
  resetDemo: () => void
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      menu: defaultMenu,
      orders: generateDemoOrders(),
      tables: defaultTables,
      deliveries: generateDemoDeliveries(),
      drivers: defaultDrivers,
      inventory: defaultInventory,
      recipes: [],
      customers: defaultCustomers,
      employees: defaultEmployees,
      transactions: generateTransactions(),
      promotions: defaultPromotions,
      restaurant: defaultRestaurant,
      nextOrderNumber: 1005,
      authUser: null,
      fiscalReceipts: [],
      nextFiscalNumber: 100001,

      login: (user) => set({ authUser: user }),
      logout: () => set({ authUser: null }),

      issueFiscalReceipt: (data) => {
        const number = get().nextFiscalNumber
        const now = new Date()
        // Chave de acesso fake (44 dígitos, formato NFC-e)
        const yymm = now.toISOString().slice(2, 7).replace('-', '')
        const cnpjDigits = (get().restaurant.cnpj || '12345678000190').replace(/\D/g, '').padStart(14, '0')
        const random = Math.floor(Math.random() * 1e9).toString().padStart(9, '0')
        const accessKey = (
          '35' + yymm + cnpjDigits + '65' + '001' +
          number.toString().padStart(9, '0') + '1' + random.slice(0, 8) + Math.floor(Math.random() * 10)
        ).slice(0, 44).padEnd(44, '0')
        const protocol = '135' + Math.floor(Math.random() * 1e15).toString().padStart(15, '0')
        // Tributos aprox. (Lei 12.741/12) ~13.45% (simplificado)
        const taxApprox = Math.round(data.total * 0.1345 * 100) / 100

        const receipt: FiscalReceipt = {
          id: uid(),
          number,
          series: 1,
          docType: 'NFCe',
          accessKey,
          protocol,
          status: 'autorizada',
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          customerName: data.customerName,
          customerDoc: data.customerDoc,
          items: data.items.map(i => ({ ...i, ncm: '21069090', cfop: '5102' })),
          subtotal: data.subtotal,
          discount: data.discount,
          total: data.total,
          taxApprox,
          paymentMethod: data.paymentMethod,
          issuedAt: now.toISOString(),
        }
        set(s => ({
          fiscalReceipts: [receipt, ...s.fiscalReceipts],
          nextFiscalNumber: s.nextFiscalNumber + 1,
        }))
        return receipt
      },

      cancelFiscalReceipt: (id, reason) => {
        set(s => ({
          fiscalReceipts: s.fiscalReceipts.map(f => f.id === id
            ? { ...f, status: 'cancelada' as const, canceledAt: new Date().toISOString(), cancelReason: reason }
            : f
          )
        }))
      },

      addMenuItem: (item) => set(s => ({ menu: [...s.menu, { ...item, id: uid() }] })),
      updateMenuItem: (id, updates) => set(s => ({ menu: s.menu.map(m => m.id === id ? { ...m, ...updates } : m) })),
      deleteMenuItem: (id) => set(s => ({ menu: s.menu.filter(m => m.id !== id) })),

      createOrder: (data) => {
        const number = get().nextOrderNumber
        const order: Order = {
          ...data,
          id: uid(),
          number,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set(s => ({ orders: [order, ...s.orders], nextOrderNumber: s.nextOrderNumber + 1 }))

        // If dine-in, mark table as occupied
        if (data.type === 'dine-in' && data.tableId) {
          set(s => ({
            tables: s.tables.map(t => t.id === data.tableId ? { ...t, status: 'occupied', currentOrderId: order.id } : t)
          }))
        }

        // Record transaction
        if (data.status === 'delivered') {
          set(s => ({
            transactions: [{
              id: uid(),
              type: 'income',
              category: data.type === 'delivery' ? 'Vendas Delivery' : data.type === 'counter' ? 'Vendas Balcão' : 'Vendas Salão',
              description: `Pedido #${number}`,
              amount: data.total,
              paymentMethod: data.paymentMethod || 'cash',
              date: new Date().toISOString(),
              relatedOrderId: order.id,
            }, ...s.transactions],
          }))
        }

        return order
      },
      updateOrder: (id, updates) => set(s => ({
        orders: s.orders.map(o => o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o)
      })),
      updateOrderStatus: (id, status) => {
        const order = get().orders.find(o => o.id === id)
        if (!order) return

        set(s => ({
          orders: s.orders.map(o => o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o)
        }))

        // For dine-in: 'served' = waiter delivered to table (comanda stays open).
        // 'delivered' here = closed/paid OR delivery dispatched. We only auto-release
        // tables for non-dine-in orders; dine-in tables are released by closeTableBill.
        if (status === 'delivered' && order.type !== 'dine-in') {
          const existing = get().transactions.find(t => t.relatedOrderId === id)
          if (!existing) {
            set(s => ({
              transactions: [{
                id: uid(),
                type: 'income',
                category: order.type === 'delivery' ? 'Vendas Delivery' : order.type === 'counter' ? 'Vendas Balcão' : 'Vendas Salão',
                description: `Pedido #${order.number}`,
                amount: order.total,
                paymentMethod: order.paymentMethod || 'cash',
                date: new Date().toISOString(),
                relatedOrderId: id,
              }, ...s.transactions]
            }))
          }
        }
      },
      deleteOrder: (id) => set(s => ({ orders: s.orders.filter(o => o.id !== id) })),

      addItemsToOrder: (orderId, items) => {
        const now = new Date().toISOString()
        const stamped = items.map(it => ({ ...it, addedAt: now, status: it.status ?? 'pending' as const }))
        set(s => ({
          orders: s.orders.map(o => {
            if (o.id !== orderId) return o
            const merged = [...o.items, ...stamped]
            const subtotal = merged.reduce((sum, it) => sum + it.price * it.quantity, 0)
            // Reopen kitchen status when new items come in
            const newStatus: OrderStatus = (o.status === 'served' || o.status === 'ready' || o.status === 'delivered')
              ? 'pending'
              : o.status
            return {
              ...o,
              items: merged,
              subtotal,
              total: subtotal - o.discount,
              status: newStatus,
              updatedAt: now,
            }
          })
        }))
      },

      createOrAppendTableOrder: (tableId, items, opts) => {
        const state = get()
        const existing = state.orders.find(o =>
          o.tableId === tableId &&
          o.type === 'dine-in' &&
          o.status !== 'delivered' &&
          o.status !== 'canceled'
        )
        if (existing) {
          get().addItemsToOrder(existing.id, items)
          return get().orders.find(o => o.id === existing.id)!
        }
        const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0)
        const now = new Date().toISOString()
        const stampedItems = items.map(it => ({ ...it, addedAt: now, status: 'pending' as const }))
        return get().createOrder({
          type: 'dine-in',
          tableId,
          items: stampedItems,
          status: 'pending',
          subtotal,
          discount: 0,
          total: subtotal,
          customerName: opts?.customerName,
          waiterId: opts?.waiterId,
          source: opts?.source ?? 'qr',
        })
      },

      closeTableBill: (tableId, paymentMethod) => {
        const state = get()
        const tableOrders = state.orders.filter(o =>
          o.tableId === tableId &&
          o.type === 'dine-in' &&
          o.status !== 'delivered' &&
          o.status !== 'canceled'
        )
        if (tableOrders.length === 0) return
        const now = new Date().toISOString()
        set(s => ({
          orders: s.orders.map(o => tableOrders.find(t => t.id === o.id)
            ? { ...o, status: 'delivered' as const, paymentMethod, updatedAt: now }
            : o
          ),
          tables: s.tables.map(t => t.id === tableId
            ? { ...t, status: 'cleaning' as const, currentOrderId: undefined }
            : t
          ),
          transactions: [
            ...tableOrders
              .filter(o => !s.transactions.find(tx => tx.relatedOrderId === o.id))
              .map(o => ({
                id: uid(),
                type: 'income' as const,
                category: 'Vendas Salão',
                description: `Pedido #${o.number} (Mesa)`,
                amount: o.total,
                paymentMethod,
                date: now,
                relatedOrderId: o.id,
              })),
            ...s.transactions,
          ],
        }))
      },

      updateTable: (id, updates) => set(s => ({
        tables: s.tables.map(t => t.id === id ? { ...t, ...updates } : t)
      })),

      createDelivery: (data) => {
        const delivery: Delivery = { ...data, id: uid(), createdAt: new Date().toISOString() }
        set(s => ({ deliveries: [delivery, ...s.deliveries] }))
        return delivery
      },
      updateDelivery: (id, updates) => set(s => ({
        deliveries: s.deliveries.map(d => d.id === id ? { ...d, ...updates } : d)
      })),
      assignDriver: (deliveryId, driverId) => {
        set(s => ({
          deliveries: s.deliveries.map(d => d.id === deliveryId ? { ...d, driverId, status: 'assigned' } : d),
          drivers: s.drivers.map(d => d.id === driverId ? { ...d, status: 'busy', currentDeliveryId: deliveryId } : d),
        }))
      },

      addDriver: (data) => set(s => ({
        drivers: [...s.drivers, { ...data, id: uid(), hireDate: new Date().toISOString(), deliveriesCount: 0, rating: 5.0 }]
      })),
      updateDriver: (id, updates) => set(s => ({
        drivers: s.drivers.map(d => d.id === id ? { ...d, ...updates } : d)
      })),
      deleteDriver: (id) => set(s => ({ drivers: s.drivers.filter(d => d.id !== id) })),

      addInventoryItem: (item) => set(s => ({ inventory: [...s.inventory, { ...item, id: uid() }] })),
      updateInventoryItem: (id, updates) => set(s => ({
        inventory: s.inventory.map(i => i.id === id ? { ...i, ...updates } : i)
      })),
      deleteInventoryItem: (id) => set(s => ({ inventory: s.inventory.filter(i => i.id !== id) })),

      addCustomer: (data) => {
        const customer: Customer = { ...data, id: uid(), createdAt: new Date().toISOString(), orderCount: 0, totalSpent: 0 }
        set(s => ({ customers: [...s.customers, customer] }))
        return customer
      },
      updateCustomer: (id, updates) => set(s => ({
        customers: s.customers.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
      deleteCustomer: (id) => set(s => ({ customers: s.customers.filter(c => c.id !== id) })),

      addEmployee: (data) => set(s => ({
        employees: [...s.employees, { ...data, id: uid(), hireDate: new Date().toISOString() }]
      })),
      updateEmployee: (id, updates) => set(s => ({
        employees: s.employees.map(e => e.id === id ? { ...e, ...updates } : e)
      })),
      deleteEmployee: (id) => set(s => ({ employees: s.employees.filter(e => e.id !== id) })),

      addTransaction: (data) => set(s => ({ transactions: [{ ...data, id: uid() }, ...s.transactions] })),
      updateTransaction: (id, updates) => set(s => ({
        transactions: s.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteTransaction: (id) => set(s => ({ transactions: s.transactions.filter(t => t.id !== id) })),

      addPromotion: (data) => set(s => ({
        promotions: [...s.promotions, { ...data, id: uid(), uses: 0 }]
      })),
      updatePromotion: (id, updates) => set(s => ({
        promotions: s.promotions.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deletePromotion: (id) => set(s => ({ promotions: s.promotions.filter(p => p.id !== id) })),

      updateRestaurant: (updates) => set(s => ({ restaurant: { ...s.restaurant, ...updates } })),

      resetDemo: () => set({
        menu: defaultMenu,
        orders: generateDemoOrders(),
        tables: defaultTables,
        deliveries: generateDemoDeliveries(),
        drivers: defaultDrivers,
        inventory: defaultInventory,
        recipes: [],
        customers: defaultCustomers,
        employees: defaultEmployees,
        transactions: generateTransactions(),
        promotions: defaultPromotions,
        restaurant: defaultRestaurant,
        nextOrderNumber: 1005,
        fiscalReceipts: [],
        nextFiscalNumber: 100001,
      }),
    }),
    {
      name: 'gastrohub-store',
      version: 2,
      migrate: (persisted: any, version) => {
        if (!persisted) return persisted
        if (version < 2) {
          persisted.fiscalReceipts = persisted.fiscalReceipts ?? []
          persisted.nextFiscalNumber = persisted.nextFiscalNumber ?? 100001
        }
        return persisted
      },
    }
  )
)
