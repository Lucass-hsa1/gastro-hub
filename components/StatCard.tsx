import { ReactNode } from 'react'

export default function StatCard({
  title,
  value,
  icon,
  color = 'teal',
}: {
  title: string
  value: string | number
  icon: ReactNode
  color?: 'teal' | 'orange' | 'green' | 'red'
}) {
  const colorClasses = {
    teal: 'bg-teal-50 text-teal-primary',
    orange: 'bg-orange-50 text-orange-primary',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-2 text-gray-900">{value}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  )
}
