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

// Community Board Types

export interface MockUser {
  id: number
  nickname: string
  avatarUrl: string
}

export interface Post {
  id: number
  title: string
  contentPreview: string
  authorNickname: string
  authorAvatarUrl: string
  likeCount: number
  commentCount: number
  createdAt: string
}

export interface PostDetail {
  id: number
  title: string
  content: string
  authorNickname: string
  authorAvatarUrl: string
  likeCount: number
  favoriteCount: number
  commentCount: number
  createdAt: string
  hospitals: { id: number; name: string }[]
  specialties: { id: number; name: string }[]
}

export interface Comment {
  id: number
  content: string
  authorNickname: string
  authorAvatarUrl: string
  likeCount: number
  createdAt: string
  replies: Comment[]
}

export interface CreatePostRequest {
  title: string
  content: string
  userId: number
  hospitalIds?: number[]
  specialtyIds?: number[]
}

export interface CreateCommentRequest {
  content: string
  userId: number
  parentId?: number | null
}

export interface InteractionResponse {
  liked?: boolean
  favorited?: boolean
  likeCount?: number
  favoriteCount?: number
}
