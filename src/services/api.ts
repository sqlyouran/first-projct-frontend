import type { Specialty, SpecialtyRanking, HospitalDetail, HospitalSummary, Page, Post, PostDetail, Comment, CreatePostRequest, CreateCommentRequest, InteractionResponse, User, AuthResponse, Inquiry, CreateInquiryRequest } from '@/types'
import { tokenStorage } from '../utils/tokenStorage'

const API_BASE = '/api'

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokenStorage.getRefreshToken() }),
    })
    if (res.ok) {
      const data = await res.json()
      tokenStorage.setAccessToken(data.accessToken)
      if (data.refreshToken) tokenStorage.setRefreshToken(data.refreshToken)
      return true
    }
    tokenStorage.clear()
    return false
  } catch {
    tokenStorage.clear()
    return false
  }
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = tokenStorage.getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  }

  let response = await fetch(url, { ...options, headers })

  if (response.status === 401 && tokenStorage.getRefreshToken()) {
    const refreshed = await refreshToken()
    if (refreshed) {
      headers.Authorization = `Bearer ${tokenStorage.getAccessToken()}`
      response = await fetch(url, { ...options, headers })
    }
  }

  return response
}

// ============ Auth APIs ============

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message || 'Login failed')
  }
  return res.json()
}

export async function registerApi(email: string, password: string, nickname: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nickname }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message || 'Registration failed')
  }
  return res.json()
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await authFetch(`${API_BASE}/auth/me`)
  if (!res.ok) throw new Error('Failed to fetch current user')
  return res.json()
}

export async function forgotPasswordApi(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) throw new Error('Failed to send reset email')
  return res.json()
}

export async function resetPasswordApi(token: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  })
  if (!res.ok) throw new Error('Failed to reset password')
  return res.json()
}

// ============ Public APIs ============

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

// ============ Community Board APIs ============

export function fetchPosts(sort = 'latest', page = 0, size = 10, type?: string): Promise<Page<Post>> {
  const params = new URLSearchParams()
  params.set('sort', sort)
  params.set('page', String(page))
  params.set('size', String(size))
  if (type) params.set('type', type)
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

export async function createPost(data: Omit<CreatePostRequest, 'userId'>): Promise<PostDetail> {
  const res = await authFetch(`${API_BASE}/posts`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  return res.json()
}

export function fetchComments(postId: number): Promise<Comment[]> {
  return fetchJson(`${API_BASE}/posts/${postId}/comments`)
}

export async function createComment(postId: number, data: Omit<CreateCommentRequest, 'userId'>): Promise<Comment> {
  const res = await authFetch(`${API_BASE}/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  return res.json()
}

export async function toggleLikePost(postId: number): Promise<InteractionResponse> {
  const res = await authFetch(`${API_BASE}/posts/${postId}/like`, { method: 'POST' })
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  return res.json()
}

export async function toggleFavoritePost(postId: number): Promise<InteractionResponse> {
  const res = await authFetch(`${API_BASE}/posts/${postId}/favorite`, { method: 'POST' })
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  return res.json()
}

export async function toggleLikeComment(commentId: number): Promise<InteractionResponse> {
  const res = await authFetch(`${API_BASE}/comments/${commentId}/like`, { method: 'POST' })
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  return res.json()
}

// ============ User Profile APIs ============

export async function updateProfile(nickname: string, avatarUrl?: string): Promise<User> {
  const res = await authFetch(`${API_BASE}/users/me`, {
    method: 'PUT',
    body: JSON.stringify({ nickname, avatarUrl }),
  })
  if (!res.ok) throw new Error('Failed to update profile')
  return res.json()
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/users/me/password`, {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  if (!res.ok) throw new Error('Incorrect current password')
}

export async function fetchMyPosts(): Promise<Post[]> {
  const res = await authFetch(`${API_BASE}/users/me/posts`)
  if (!res.ok) throw new Error('Failed to fetch posts')
  const data = await res.json()
  return data.content ?? data
}

export async function fetchMyFavorites(): Promise<Post[]> {
  const res = await authFetch(`${API_BASE}/users/me/favorites`)
  if (!res.ok) throw new Error('Failed to fetch favorites')
  const data = await res.json()
  return data.content ?? data
}

// ============ Story APIs ============

export async function createStory(data: Omit<CreatePostRequest, 'userId'>): Promise<PostDetail> {
  const res = await authFetch(`${API_BASE}/posts`, {
    method: 'POST',
    body: JSON.stringify({ ...data, type: 'STORY' }),
  })
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  return res.json()
}

// ============ Inquiry APIs ============

export async function createInquiry(data: CreateInquiryRequest): Promise<Inquiry> {
  const res = await authFetch(`${API_BASE}/inquiries`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  return res.json()
}

export async function fetchMyInquiries(page = 0, size = 20): Promise<Page<Inquiry>> {
  const res = await authFetch(`${API_BASE}/users/me/inquiries?page=${page}&size=${size}`)
  if (!res.ok) throw new Error('Failed to fetch inquiries')
  return res.json()
}
