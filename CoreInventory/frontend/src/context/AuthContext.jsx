import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ci_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await authApi.login({ email, password })
      localStorage.setItem('ci_token', data.access_token)
      localStorage.setItem('ci_user', JSON.stringify(data.user))
      setUser(data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('ci_token')
    localStorage.removeItem('ci_user')
    setUser(null)
  }

  const isManager = user?.role === 'inventory_manager'
  const isStaff   = user?.role === 'warehouse_staff'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isManager, isStaff }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
