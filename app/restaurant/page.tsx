'use client'

import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { getRestaurant, updateRestaurant, initializeStorage, RestaurantData } from '@/lib/storage'
import { Save, Store, Clock, Phone, Mail } from 'lucide-react'

export default function RestaurantPage() {
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    initializeStorage()
    setRestaurant(getRestaurant())
  }, [])

  const handleChange = (field: keyof RestaurantData, value: any) => {
    if (!restaurant) return
    setRestaurant({ ...restaurant, [field]: value })
    setSaved(false)
  }

  const handleOperatingHourChange = (field: 'open' | 'close', value: string) => {
    if (!restaurant) return
    setRestaurant({
      ...restaurant,
      operatingHours: { ...restaurant.operatingHours, [field]: value },
    })
    setSaved(false)
  }

  const handleSave = () => {
    if (restaurant) {
      updateRestaurant(restaurant)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (!restaurant) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center">Carregando...</div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações do Restaurante</h1>
          <p className="text-gray-600 mb-8">Gerencie informações e configurações do seu estabelecimento</p>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <form className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Store className="w-4 h-4 text-teal-primary" />
                    Nome do Restaurante
                  </div>
                </label>
                <input
                  type="text"
                  value={restaurant.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary"
                  placeholder="GastroHub"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  value={restaurant.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary"
                  placeholder="Rua Principal, 123"
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="w-4 h-4 text-orange-primary" />
                      Telefone
                    </div>
                  </label>
                  <input
                    type="tel"
                    value={restaurant.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary"
                    placeholder="(11) 9999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-teal-primary" />
                      Email
                    </div>
                  </label>
                  <input
                    type="email"
                    value={restaurant.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary"
                    placeholder="contato@gastrohub.com.br"
                  />
                </div>
              </div>

              {/* Operating Hours */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-primary" />
                  Horário de Funcionamento
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Abertura
                    </label>
                    <input
                      type="time"
                      value={restaurant.operatingHours.open}
                      onChange={(e) => handleOperatingHourChange('open', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fechamento
                    </label>
                    <input
                      type="time"
                      value={restaurant.operatingHours.close}
                      onChange={(e) => handleOperatingHourChange('close', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Informações</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Todos os dados são salvos automaticamente no seu navegador</li>
                  <li>• A persistência funciona mesmo após fechar o navegador</li>
                  <li>• Dados compartilhados entre todas as páginas do aplicativo</li>
                </ul>
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-3 pt-6">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-teal-primary to-orange-primary text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </button>

                {saved && (
                  <div className="text-green-600 font-medium animate-pulse">
                    ✓ Salvo com sucesso!
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Footer Info */}
          <div className="mt-8 bg-gradient-to-r from-teal-primary to-orange-primary rounded-lg p-6 text-white">
            <h3 className="font-bold text-lg mb-2">🚀 Próximos Passos</h3>
            <p className="opacity-90">
              Após salvar, navegue pelas outras seções para testar comanda, PDV e entregas. Tudo funciona com dados persistentes e simulados para demonstração ao investidor!
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
