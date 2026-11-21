import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getMe, logout as apiLogout } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const me = await getMe()
      setUser(me)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, [refreshUser])

  const signOut = useCallback(async () => {
    await apiLogout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, setUser, refreshUser, signOut, loading }),
    [user, refreshUser, signOut, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}