import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchHospitalDetail } from '@/services/api'
import type { HospitalDetail } from '@/types'

export default function HospitalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [hospital, setHospital] = useState<HospitalDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetchHospitalDetail(Number(id))
      .then(setHospital)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading hospital details...</div>
  }

  if (error || !hospital) {
    return <div className="text-center py-12 text-red-600">Hospital not found</div>
  }

  return (
    <div>
      <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
        &larr; Back to Specialties
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{hospital.name}</h1>
            <p className="text-gray-500">{hospital.nameCn}</p>
          </div>
          {hospital.hasInternational && (
            <span className="mt-2 md:mt-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              International Department Available
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Location</h3>
            <p className="text-gray-800">{hospital.city}, {hospital.province}</p>
            <p className="text-gray-600 text-sm mt-1">{hospital.address}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Contact</h3>
            {hospital.phone && <p className="text-gray-800">{hospital.phone}</p>}
            {hospital.website && (
              <a
                href={hospital.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Visit Website &rarr;
              </a>
            )}
          </div>
        </div>

        {hospital.description && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">About</h3>
            <p className="text-gray-700 leading-relaxed">{hospital.description}</p>
          </div>
        )}

        {hospital.topSpecialties.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Top Ranked Specialties</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {hospital.topSpecialties.map((spec) => (
                <div key={spec.specialtyName} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">
                    #{spec.rankPosition}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{spec.specialtyName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
