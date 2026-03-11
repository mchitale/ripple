import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const SESSION_KEY = 'ripple_session'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading]  = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) setSession(JSON.parse(stored))
    } catch (_) {}
    setLoading(false)
  }, [])

  function login(sessionData) {
    // sessionData: { userId, userName, avatarColour, groupId, groupName, inviteCode }
    setSession(sessionData)
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
  }

  function logout() {
    setSession(null)
    localStorage.removeItem(SESSION_KEY)
  }

  return (
    <AuthContext.Provider value={{ session, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
