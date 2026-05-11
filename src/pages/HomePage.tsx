import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchSpecialties } from '@/services/api'
import type { Specialty } from '@/types'

export default function HomePage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSpecialties()
      .then(setSpecialties)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading specialties...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">Failed to load: {error}</div>
  }

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Find Top Hospitals in China
        </h1>
        <p className="text-gray-600 text-lg">
          Browse hospital rankings by medical specialty, based on Fudan Hospital Rankings 2023
        </p>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Medical Specialties</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {specialties.map((specialty) => (
          <Link
            key={specialty.id}
            to={`/specialties/${specialty.id}`}
            className="block p-5 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all no-underline"
          >
            <div className="text-3xl mb-2">{specialty.icon}</div>
            <h3 className="font-semibold text-gray-900 text-sm">{specialty.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{specialty.nameCn}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
