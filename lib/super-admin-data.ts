// ===== Super Admin — Plataforma SaaS GastroHub =====
// Simulação realista: 30 restaurantes-clientes, 70 dias operando.
// Modelo de monetização:
//   - Mensalidade fixa: R$ 99,90/mês por restaurante (cobrada a cada 30 dias)
//   - Take rate: 10% sobre cada pedido (GMV)
// Taxa: R$99,90 + 10% por pedido (sem aliquota oculta)

export const PLATFORM_CONFIG = {
  monthlyFee: 99.90,
  takeRate: 0.10,
  platformDays: 70, // dias de operação
  launchDate: (() => {
    const d = new Date()
    d.setDate(d.getDate() - 70)
    return d
  })(),
}

export interface PlatformRestaurant {
  id: string
  name: string
  cuisine: string
  cuisineEmoji: string
  city: string
  state: string
  plan: 'Starter' | 'Pro' | 'Enterprise'
  status: 'active' | 'onboarding' | 'churned' | 'trial'
  daysActive: number
  /** pedidos por dia (média) */
  avgDailyOrders: number
  /** ticket médio (R$) */
  avgTicket: number
  /** rating médio do estabelecimento */
  rating: number
  /** Bairro/região */
  region: string
  /** "fundador" — primeiros restaurantes */
  founder?: boolean
  /** ID Unsplash photoId pra cover (opcional) */
  coverPhotoId?: string
}

// Dados simulados (30 restaurantes brasileiros realistas, com variação)
// Calibragem: faturamento médio ~R$ 10k/mês por restaurante (uns mais, uns menos).
// Distribuição: ~5 grandes (15-22k/mês), ~12 médios (8-13k/mês), ~13 pequenos (4-7k/mês).
export const platformRestaurants: PlatformRestaurant[] = [
  // == "Founders" — primeiros 5, desde dia 1 ==
  { id: 'p1', name: 'Burger Boss', cuisine: 'Hambúrgueres', cuisineEmoji: '🍔', city: 'São Paulo', state: 'SP', region: 'Vila Madalena', plan: 'Pro', status: 'active', daysActive: 70, avgDailyOrders: 14, avgTicket: 38.40, rating: 4.8, founder: true, coverPhotoId: '1568901346375-23c9450c58cd' },
  { id: 'p2', name: 'Pizza Roma', cuisine: 'Pizzaria', cuisineEmoji: '🍕', city: 'São Paulo', state: 'SP', region: 'Pinheiros', plan: 'Enterprise', status: 'active', daysActive: 70, avgDailyOrders: 16, avgTicket: 48.20, rating: 4.9, founder: true, coverPhotoId: '1513104890138-7c749659a591' },
  { id: 'p3', name: 'Sushi Hana', cuisine: 'Japonesa', cuisineEmoji: '🍣', city: 'São Paulo', state: 'SP', region: 'Jardins', plan: 'Pro', status: 'active', daysActive: 70, avgDailyOrders: 8, avgTicket: 62.50, rating: 4.7, founder: true, coverPhotoId: '1579871494447-9811cf80d66c' },
  { id: 'p4', name: 'Cantina Italiana Mama Lucia', cuisine: 'Italiana', cuisineEmoji: '🍝', city: 'São Paulo', state: 'SP', region: 'Vila Mariana', plan: 'Pro', status: 'active', daysActive: 70, avgDailyOrders: 10, avgTicket: 52.30, rating: 4.8, founder: true, coverPhotoId: '1551892374-ecf8754cf8b0' },
  { id: 'p5', name: 'Açaí Tropical', cuisine: 'Açaí', cuisineEmoji: '🍇', city: 'São Paulo', state: 'SP', region: 'Itaim', plan: 'Starter', status: 'active', daysActive: 70, avgDailyOrders: 14, avgTicket: 23.80, rating: 4.6, founder: true, coverPhotoId: '1590301157890-4810ed352733' },

  // == 5 entraram dia 14 (56 dias) ==
  { id: 'p6', name: 'Empanadas del Sur', cuisine: 'Argentina', cuisineEmoji: '🥟', city: 'São Paulo', state: 'SP', region: 'Higienópolis', plan: 'Pro', status: 'active', daysActive: 56, avgDailyOrders: 8, avgTicket: 32.50, rating: 4.7 },
  { id: 'p7', name: 'Bar do João', cuisine: 'Bar', cuisineEmoji: '🍺', city: 'Rio de Janeiro', state: 'RJ', region: 'Copacabana', plan: 'Pro', status: 'active', daysActive: 56, avgDailyOrders: 12, avgTicket: 41.80, rating: 4.5, coverPhotoId: '1535958636474-b021ee887b13' },
  { id: 'p8', name: 'Padaria Pão de Ouro', cuisine: 'Padaria', cuisineEmoji: '🥐', city: 'São Paulo', state: 'SP', region: 'Tatuapé', plan: 'Starter', status: 'active', daysActive: 56, avgDailyOrders: 16, avgTicket: 22.40, rating: 4.6, coverPhotoId: '1568827999250-3f6afff96e66' },
  { id: 'p9', name: 'Veg & Co.', cuisine: 'Vegana', cuisineEmoji: '🌱', city: 'São Paulo', state: 'SP', region: 'Pinheiros', plan: 'Starter', status: 'active', daysActive: 56, avgDailyOrders: 6, avgTicket: 38.50, rating: 4.9 },
  { id: 'p10', name: 'Espetinho do Zé', cuisine: 'Churrascaria', cuisineEmoji: '🍢', city: 'Belo Horizonte', state: 'MG', region: 'Savassi', plan: 'Starter', status: 'active', daysActive: 56, avgDailyOrders: 12, avgTicket: 27.90, rating: 4.4 },

  // == 8 entraram dia 30 (40 dias) ==
  { id: 'p11', name: 'Hamburgueria do Bairro', cuisine: 'Hambúrgueres', cuisineEmoji: '🍔', city: 'Curitiba', state: 'PR', region: 'Batel', plan: 'Pro', status: 'active', daysActive: 40, avgDailyOrders: 10, avgTicket: 38.20, rating: 4.7 },
  { id: 'p12', name: 'Pizzaria Forno a Lenha', cuisine: 'Pizzaria', cuisineEmoji: '🍕', city: 'Porto Alegre', state: 'RS', region: 'Moinhos', plan: 'Pro', status: 'active', daysActive: 40, avgDailyOrders: 14, avgTicket: 47.50, rating: 4.8 },
  { id: 'p13', name: 'Doceria Sweet', cuisine: 'Doceria', cuisineEmoji: '🍰', city: 'São Paulo', state: 'SP', region: 'Moema', plan: 'Starter', status: 'active', daysActive: 40, avgDailyOrders: 8, avgTicket: 29.90, rating: 4.9, coverPhotoId: '1565958011703-44f9829ba187' },
  { id: 'p14', name: 'Marmitaria Fitness', cuisine: 'Saudável', cuisineEmoji: '🥗', city: 'São Paulo', state: 'SP', region: 'Brooklin', plan: 'Pro', status: 'active', daysActive: 40, avgDailyOrders: 18, avgTicket: 28.20, rating: 4.6 },
  { id: 'p15', name: 'Tacos & Tequila', cuisine: 'Mexicana', cuisineEmoji: '🌮', city: 'São Paulo', state: 'SP', region: 'Vila Madalena', plan: 'Pro', status: 'active', daysActive: 40, avgDailyOrders: 9, avgTicket: 41.80, rating: 4.7 },
  { id: 'p16', name: 'Sorveteria Gelato Italiano', cuisine: 'Sorveteria', cuisineEmoji: '🍨', city: 'São Paulo', state: 'SP', region: 'Jardins', plan: 'Starter', status: 'active', daysActive: 40, avgDailyOrders: 14, avgTicket: 21.90, rating: 4.5 },
  { id: 'p17', name: 'Comida da Vovó', cuisine: 'Brasileira', cuisineEmoji: '🍛', city: 'Recife', state: 'PE', region: 'Boa Viagem', plan: 'Starter', status: 'active', daysActive: 40, avgDailyOrders: 14, avgTicket: 23.50, rating: 4.6 },
  { id: 'p18', name: 'Crepe Express', cuisine: 'Crepes', cuisineEmoji: '🥞', city: 'São Paulo', state: 'SP', region: 'Pinheiros', plan: 'Starter', status: 'churned', daysActive: 28, avgDailyOrders: 6, avgTicket: 22.40, rating: 3.9 },

  // == 7 entraram dia 50 (20 dias) ==
  { id: 'p19', name: 'Yakisoba Master', cuisine: 'Asiática', cuisineEmoji: '🍜', city: 'São Paulo', state: 'SP', region: 'Liberdade', plan: 'Pro', status: 'active', daysActive: 20, avgDailyOrders: 11, avgTicket: 34.80, rating: 4.5 },
  { id: 'p20', name: 'Café Bistrô do Centro', cuisine: 'Café', cuisineEmoji: '☕', city: 'São Paulo', state: 'SP', region: 'Centro', plan: 'Starter', status: 'active', daysActive: 20, avgDailyOrders: 10, avgTicket: 24.20, rating: 4.4 },
  { id: 'p21', name: 'Boteco do Mineiro', cuisine: 'Brasileira', cuisineEmoji: '🍻', city: 'Belo Horizonte', state: 'MG', region: 'Lourdes', plan: 'Pro', status: 'active', daysActive: 20, avgDailyOrders: 16, avgTicket: 38.20, rating: 4.7 },
  { id: 'p22', name: 'Pasta & Basta', cuisine: 'Italiana', cuisineEmoji: '🍝', city: 'Florianópolis', state: 'SC', region: 'Centro', plan: 'Pro', status: 'active', daysActive: 20, avgDailyOrders: 8, avgTicket: 51.50, rating: 4.8 },
  { id: 'p23', name: 'Pastel Express', cuisine: 'Pastéis', cuisineEmoji: '🥟', city: 'Salvador', state: 'BA', region: 'Pituba', plan: 'Starter', status: 'active', daysActive: 20, avgDailyOrders: 14, avgTicket: 17.90, rating: 4.3 },
  { id: 'p24', name: 'Espaço Fit Bowls', cuisine: 'Saudável', cuisineEmoji: '🥗', city: 'São Paulo', state: 'SP', region: 'Itaim', plan: 'Starter', status: 'active', daysActive: 20, avgDailyOrders: 8, avgTicket: 31.80, rating: 4.7 },
  { id: 'p25', name: 'Sushi Express', cuisine: 'Japonesa', cuisineEmoji: '🍣', city: 'Brasília', state: 'DF', region: 'Asa Sul', plan: 'Pro', status: 'active', daysActive: 20, avgDailyOrders: 9, avgTicket: 57.40, rating: 4.6 },

  // == 5 entraram dia 60 (10 dias) ==
  { id: 'p26', name: 'Burguer Premium', cuisine: 'Hambúrgueres', cuisineEmoji: '🍔', city: 'Goiânia', state: 'GO', region: 'Setor Bueno', plan: 'Pro', status: 'active', daysActive: 10, avgDailyOrders: 9, avgTicket: 41.80, rating: 4.6 },
  { id: 'p27', name: 'Açaí da Vila', cuisine: 'Açaí', cuisineEmoji: '🍇', city: 'Fortaleza', state: 'CE', region: 'Aldeota', plan: 'Starter', status: 'onboarding', daysActive: 10, avgDailyOrders: 8, avgTicket: 22.50, rating: 4.5 },
  { id: 'p28', name: 'Casa do Pão', cuisine: 'Padaria', cuisineEmoji: '🥖', city: 'Vitória', state: 'ES', region: 'Praia do Canto', plan: 'Starter', status: 'active', daysActive: 10, avgDailyOrders: 12, avgTicket: 19.80, rating: 4.4 },
  { id: 'p29', name: 'Pizzaria Bella Vista', cuisine: 'Pizzaria', cuisineEmoji: '🍕', city: 'Manaus', state: 'AM', region: 'Adrianópolis', plan: 'Pro', status: 'onboarding', daysActive: 8, avgDailyOrders: 8, avgTicket: 41.30, rating: 4.5 },
  { id: 'p30', name: 'Brigaderia Doce Tentação', cuisine: 'Doceria', cuisineEmoji: '🍫', city: 'Natal', state: 'RN', region: 'Ponta Negra', plan: 'Starter', status: 'trial', daysActive: 5, avgDailyOrders: 6, avgTicket: 27.50, rating: 4.8 },
]

// ===== Cálculos derivados =====

export function dailyGMV(r: PlatformRestaurant): number {
  return r.avgDailyOrders * r.avgTicket
}

export function totalGMV(r: PlatformRestaurant): number {
  return dailyGMV(r) * r.daysActive
}

export function totalTakeRate(r: PlatformRestaurant): number {
  return totalGMV(r) * PLATFORM_CONFIG.takeRate
}

/** Mensalidade já cobrada: R$99,90 a cada 30 dias completos + pro-rata do mês corrente */
export function totalMonthlyFees(r: PlatformRestaurant): number {
  const monthsCharged = r.daysActive / 30
  return monthsCharged * PLATFORM_CONFIG.monthlyFee
}

export function totalRevenue(r: PlatformRestaurant): number {
  return totalTakeRate(r) + totalMonthlyFees(r)
}

/** MRR contribuição = mensalidade + take rate mensal projetado */
export function mrrContribution(r: PlatformRestaurant): number {
  if (r.status === 'churned') return 0
  return PLATFORM_CONFIG.monthlyFee + dailyGMV(r) * 30 * PLATFORM_CONFIG.takeRate
}

// ===== Agregados da plataforma =====

export const platformMetrics = (() => {
  const all = platformRestaurants
  const active = all.filter(r => r.status === 'active' || r.status === 'onboarding' || r.status === 'trial')
  const churned = all.filter(r => r.status === 'churned')

  const gmvAccum = all.reduce((s, r) => s + totalGMV(r), 0)
  const takeAccum = all.reduce((s, r) => s + totalTakeRate(r), 0)
  const feesAccum = all.reduce((s, r) => s + totalMonthlyFees(r), 0)
  const totalRevAccum = takeAccum + feesAccum

  const mrr = active.reduce((s, r) => s + mrrContribution(r), 0)
  const arr = mrr * 12

  const totalOrders = all.reduce((s, r) => s + r.avgDailyOrders * r.daysActive, 0)

  return {
    restaurants: all.length,
    activeRestaurants: active.length,
    churned: churned.length,
    churnRate: (churned.length / all.length) * 100,
    gmvAccum,
    takeAccum,
    feesAccum,
    totalRevAccum,
    mrr,
    arr,
    totalOrders,
    avgTicket: gmvAccum / totalOrders,
    avgDailyGMV: active.reduce((s, r) => s + dailyGMV(r), 0),
    avgDailyOrders: active.reduce((s, r) => s + r.avgDailyOrders, 0),
  }
})()

// ===== Série temporal: receita por dia (70 dias) =====

export const dailyRevenueSeries = (() => {
  const days = PLATFORM_CONFIG.platformDays
  const series: { day: number; date: string; gmv: number; takeRate: number; fees: number; revenue: number; activeRestaurants: number }[] = []

  for (let day = 1; day <= days; day++) {
    let dailyGmvSum = 0
    let dailyFees = 0
    let activeOnDay = 0

    platformRestaurants.forEach(r => {
      // dia em que o restaurante começou
      const start = days - r.daysActive + 1
      if (day >= start && r.status !== 'churned') {
        // variação aleatória ±18% pra parecer real
        const variance = 1 + Math.sin((day + r.id.charCodeAt(0)) * 0.5) * 0.18
        dailyGmvSum += dailyGMV(r) * variance
        activeOnDay++
      }
      // restaurantes que deram churn — ativos do start até daysActive
      if (r.status === 'churned') {
        if (day >= start && day <= start + r.daysActive - 1) {
          const variance = 1 + Math.sin((day + r.id.charCodeAt(0)) * 0.5) * 0.15
          dailyGmvSum += dailyGMV(r) * variance
          activeOnDay++
        }
      }

      // mensalidade (cobra a cada múltiplo de 30 dias desde o start)
      if (day >= start) {
        const daysSinceStart = day - start + 1
        if (daysSinceStart % 30 === 1 && day !== start) {
          dailyFees += PLATFORM_CONFIG.monthlyFee
        }
        // primeiro pagamento no start
        if (daysSinceStart === 1) {
          dailyFees += PLATFORM_CONFIG.monthlyFee
        }
      }
    })

    const date = new Date(PLATFORM_CONFIG.launchDate)
    date.setDate(date.getDate() + day - 1)

    series.push({
      day,
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      gmv: Math.round(dailyGmvSum),
      takeRate: Math.round(dailyGmvSum * PLATFORM_CONFIG.takeRate),
      fees: Math.round(dailyFees),
      revenue: Math.round(dailyGmvSum * PLATFORM_CONFIG.takeRate + dailyFees),
      activeRestaurants: activeOnDay,
    })
  }
  return series
})()

// ===== Distribuição por plano =====
export const planDistribution = (() => {
  const counts: Record<string, number> = { Starter: 0, Pro: 0, Enterprise: 0 }
  platformRestaurants.forEach(r => counts[r.plan]++)
  return Object.entries(counts).map(([plan, count]) => ({ plan, count }))
})()

// ===== Top 10 por GMV total =====
export const topRestaurantsByGMV = [...platformRestaurants]
  .sort((a, b) => totalGMV(b) - totalGMV(a))
  .slice(0, 10)

// ===== Distribuição geográfica =====
export const stateDistribution = (() => {
  const map: Record<string, number> = {}
  platformRestaurants.forEach(r => {
    map[r.state] = (map[r.state] || 0) + 1
  })
  return Object.entries(map)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
})()

// ===== Crescimento de restaurantes (cumulativo, por dia) =====
export const restaurantGrowth = (() => {
  const days = PLATFORM_CONFIG.platformDays
  const data: { day: number; date: string; total: number; new: number }[] = []
  for (let day = 1; day <= days; day++) {
    let totalSoFar = 0
    let newOnDay = 0
    platformRestaurants.forEach(r => {
      const start = days - r.daysActive + 1
      if (day >= start) totalSoFar++
      if (day === start) newOnDay++
    })
    const date = new Date(PLATFORM_CONFIG.launchDate)
    date.setDate(date.getDate() + day - 1)
    data.push({
      day,
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      total: totalSoFar,
      new: newOnDay,
    })
  }
  return data
})()
