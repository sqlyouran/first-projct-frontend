import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types'
import { loginApi, registerApi, fetchCurrentUser } from '../services/api'
import { tokenStorage } from '../utils/tokenStorage'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, nickname: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = tokenStorage.getAccessToken()
    if (token) {
      fetchCurrentUser()
        .then(setUser)
        .catch(() => tokenStorage.clear())
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await loginApi(email, password)
    tokenStorage.setAccessToken(res.accessToken)
    tokenStorage.setRefreshToken(res.refreshToken)
    setUser(res.user)
  }

  const register = async (email: string, password: string, nickname: string) => {
    const res = await registerApi(email, password, nickname)
    tokenStorage.setAccessToken(res.accessToken)
    tokenStorage.setRefreshToken(res.refreshToken)
    setUser(res.user)
  }

  const logout = () => {
    tokenStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
