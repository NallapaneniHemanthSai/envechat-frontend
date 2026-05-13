import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

function readStoredAuth() {
  return {
    token: localStorage.getItem('token'),
    username: localStorage.getItem('username'),
    avatarUrl: localStorage.getItem('avatarUrl'),
  }
}

export function AuthProvider({ children }) {
  const [{ token, username, avatarUrl }, setAuth] = useState(readStoredAuth)

  const login = useCallback((nextToken, nextUsername) => {
    localStorage.setItem('token', nextToken)
    localStorage.setItem('username', nextUsername)
    setAuth((prev) => ({ ...prev, token: nextToken, username: nextUsername }))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('avatarUrl')
    setAuth({ token: null, username: null, avatarUrl: null })
  }, [])

  const setAvatar = useCallback((url) => {
    if (url) {
      localStorage.setItem('avatarUrl', url)
    } else {
      localStorage.removeItem('avatarUrl')
    }
    setAuth((prev) => ({ ...prev, avatarUrl: url }))
  }, [])

  const value = useMemo(
    () => ({
      token,
      username,
      avatarUrl,
      isAuthenticated: Boolean(token),
      login,
      logout,
      setAvatar,
    }),
    [token, username, avatarUrl, login, logout, setAvatar],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
