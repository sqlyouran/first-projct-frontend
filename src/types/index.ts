export interface Specialty {
  id: number
  name: string
  nameCn: string
  description: string
  icon: string
}

export interface HospitalSummary {
  id: number
  name: string
  nameCn: string
  city: string
  province: string
  hasInternational: boolean
}

export interface HospitalDetail {
  id: number
  name: string
  nameCn: string
  city: string
  province: string
  address: string
  phone: string
  website: string
  description: string
  hasInternational: boolean
  imageUrl: string | null
  topSpecialties: TopSpecialty[]
}

export interface TopSpecialty {
  specialtyName: string
  rankPosition: number
}

export interface RankingEntry {
  rankPosition: number
  tier: string
  hospital: HospitalSummary
}

export interface SpecialtyRanking {
  specialty: Specialty
  year: number
  rankings: RankingEntry[]
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
