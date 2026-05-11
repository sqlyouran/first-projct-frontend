import type { Specialty, SpecialtyRanking, HospitalDetail, HospitalSummary, Page } from '@/types'

const API_BASE = '/api'

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export function fetchSpecialties(): Promise<Specialty[]> {
  return fetchJson(`${API_BASE}/specialties`)
}

export function fetchSpecialtyRankings(id: number, city?: string, year?: number): Promise<SpecialtyRanking> {
  const params = new URLSearchParams()
  if (city) params.set('city', city)
  if (year) params.set('year', String(year))
  const qs = params.toString()
  return fetchJson(`${API_BASE}/specialties/${id}/rankings${qs ? '?' + qs : ''}`)
}

export function fetchHospitals(query?: string, city?: string, specialty?: number, page = 0, size = 10): Promise<Page<HospitalSummary>> {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (city) params.set('city', city)
  if (specialty) params.set('specialty', String(specialty))
  params.set('page', String(page))
  params.set('size', String(size))
  return fetchJson(`${API_BASE}/hospitals?${params.toString()}`)
}

export function fetchHospitalDetail(id: number): Promise<HospitalDetail> {
  return fetchJson(`${API_BASE}/hospitals/${id}`)
}
