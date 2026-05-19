import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { fetchHospitals } from '@/services/api'
import type { HospitalSummary, Page } from '@/types'
import { ArrowLeft, Globe } from 'lucide-react'

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
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary no-underline mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Specialties
      </Link>

      <h1 className="text-3xl font-bold text-text-primary mb-2">
        {query ? `Search results for "${query}"` : 'All Hospitals'}
      </h1>

      <div className="mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-text-secondary">City:</label>
          <select
            value={city}
            onChange={(e) => updateFilter('city', e.target.value)}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="">All Cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        {results && (
          <span className="text-sm text-text-muted">{results.totalElements} hospitals found</span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-text-muted">Searching...</div>
      ) : !results || results.content.length === 0 ? (
        <div className="text-center py-20 text-text-muted bg-surface rounded-2xl shadow-card">No hospitals found.</div>
      ) : (
        <>
          <div className="space-y-4">
            {results.content.map((hospital) => (
              <Link
                key={hospital.id}
                to={`/hospitals/${hospital.id}`}
                className="block p-6 bg-surface rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 no-underline"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary">{hospital.name}</h3>
                    <p className="text-sm text-text-muted">{hospital.nameCn}</p>
                    <p className="text-sm text-text-secondary mt-1">{hospital.city}, {hospital.province}</p>
                  </div>
                  {hospital.hasInternational && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-light text-primary">
                      <Globe className="w-3 h-3" /> Int'l Dept
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {results.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 0}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-surface border border-border text-text-secondary hover:bg-primary-light hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-text-muted">
                Page {page + 1} of {results.totalPages}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= results.totalPages - 1}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-surface border border-border text-text-secondary hover:bg-primary-light hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
