import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

function readStoredAuth() {
  return {
    token: localStorage.getItem('token'),
    username: localStorage.getItem('username'),
  }
}

export function AuthProvider({ children }) {
  const [{ token, username }, setAuth] = useState(readStoredAuth)

  const login = useCallback((nextToken, nextUsername) => {
    localStorage.setItem('token', nextToken)
    localStorage.setItem('username', nextUsername)
    setAuth({ token: nextToken, username: nextUsername })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setAuth({ token: null, username: null })
  }, [])

  const value = useMemo(
    () => ({
      token,
      username,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, username, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
