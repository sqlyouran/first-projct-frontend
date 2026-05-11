import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { fetchHospitals } from '@/services/api'
import type { HospitalSummary, Page } from '@/types'

const CITIES = ['Beijing', 'Shanghai', 'Guangzhou', 'Chengdu', 'Wuhan', 'Hangzhou', "Xi'an", 'Changsha']

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [results, setResults] = useState<Page<HospitalSummary> | null>(null)
  const [loading, setLoading] = useState(true)

  const query = searchParams.get('q') || ''
  const city = searchParams.get('city') || ''
  const page = Number(searchParams.get('page') || '0')

  useEffect(() => {
    setLoading(true)
    fetchHospitals(query || undefined, city || undefined, undefined, page)
      .then(setResults)
      .catch(() => setResults(null))
      .finally(() => setLoading(false))
  }, [query, city, page])

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    setSearchParams(params)
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(p))
    setSearchParams(params)
  }

  return (
    <div>
      <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
        &larr; Back to Specialties
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        {query ? `Search results for "${query}"` : 'All Hospitals'}
      </h1>

      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <label className="text-sm font-medium text-gray-700">City:</label>
        <select
          value={city}
          onChange={(e) => updateFilter('city', e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {results && (
          <span className="text-sm text-gray-500">{results.totalElements} hospitals found</span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Searching...</div>
      ) : !results || results.content.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No hospitals found.</div>
      ) : (
        <>
          <div className="space-y-3">
            {results.content.map((hospital) => (
              <Link
                key={hospital.id}
                to={`/hospitals/${hospital.id}`}
                className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all no-underline"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                    <p className="text-sm text-gray-500">{hospital.nameCn}</p>
                    <p className="text-sm text-gray-600 mt-1">{hospital.city}, {hospital.province}</p>
                  </div>
                  {hospital.hasInternational && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Int'l Dept
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {results.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 0}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-600">
                Page {page + 1} of {results.totalPages}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= results.totalPages - 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
