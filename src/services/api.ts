import type { Specialty, SpecialtyRanking, HospitalDetail, HospitalSummary, Page, MockUser, Post, PostDetail, Comment, CreatePostRequest, CreateCommentRequest, InteractionResponse } from '@/types'

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

// Community Board APIs

export function fetchMockUsers(): Promise<MockUser[]> {
  return fetchJson(`${API_BASE}/mock-users`)
}

export function fetchPosts(sort = 'latest', page = 0, size = 10): Promise<Page<Post>> {
  const params = new URLSearchParams()
  params.set('sort', sort)
  params.set('page', String(page))
  params.set('size', String(size))
  return fetchJson(`${API_BASE}/posts?${params.toString()}`)
}

export function fetchPostDetail(id: number): Promise<PostDetail> {
  return fetchJson(`${API_BASE}/posts/${id}`)
}

export function fetchPostsByHospital(hospitalId: number, page = 0, size = 5): Promise<Page<Post>> {
  return fetchJson(`${API_BASE}/posts/by-hospital/${hospitalId}?page=${page}&size=${size}`)
}

export function fetchPostsBySpecialty(specialtyId: number, page = 0, size = 5): Promise<Page<Post>> {
  return fetchJson(`${API_BASE}/posts/by-specialty/${specialtyId}?page=${page}&size=${size}`)
}

export async function createPost(data: CreatePostRequest): Promise<PostDetail> {
  const response = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return response.json()
}

export function fetchComments(postId: number): Promise<Comment[]> {
  return fetchJson(`${API_BASE}/posts/${postId}/comments`)
}

export async function createComment(postId: number, data: CreateCommentRequest): Promise<Comment> {
  const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return response.json()
}

export async function toggleLikePost(postId: number, userId: number): Promise<InteractionResponse> {
  const response = await fetch(`${API_BASE}/posts/${postId}/like?userId=${userId}`, { method: 'POST' })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return response.json()
}

export async function toggleFavoritePost(postId: number, userId: number): Promise<InteractionResponse> {
  const response = await fetch(`${API_BASE}/posts/${postId}/favorite?userId=${userId}`, { method: 'POST' })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return response.json()
}

export async function toggleLikeComment(commentId: number, userId: number): Promise<InteractionResponse> {
  const response = await fetch(`${API_BASE}/comments/${commentId}/like?userId=${userId}`, { method: 'POST' })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return response.json()
}
