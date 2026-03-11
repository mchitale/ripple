import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext  = createContext(null)
const ACTIVE_KEY   = 'ripple_active_session'
const ALL_KEY      = 'ripple_all_sessions'

function loadAll() {
  try { return JSON.parse(localStorage.getItem(ALL_KEY)) || [] } catch { return [] }
}

export function AuthProvider({ children }) {
  const [session,     setSession]     = useState(null)
  const [allSessions, setAllSessions] = useState([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    const all    = loadAll()
    const active = (() => {
      try { return JSON.parse(localStorage.getItem(ACTIVE_KEY)) } catch { return null }
    })()
    setAllSessions(all)
    setSession(active || all[0] || null)
    setLoading(false)
  }, [])

  // Save a new group session and make it active
  function login(sessionData) {
    const all = loadAll()
    // Replace if same groupId already saved, otherwise append
    const updated = all.some(s => s.groupId === sessionData.groupId)
      ? all.map(s => s.groupId === sessionData.groupId ? sessionData : s)
      : [...all, sessionData]
    localStorage.setItem(ALL_KEY,    JSON.stringify(updated))
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(sessionData))
    setAllSessions(updated)
    setSession(sessionData)
  }

  // Switch to a previously joined group
  function switchGroup(groupId) {
    const all     = loadAll()
    const target  = all.find(s => s.groupId === groupId)
    if (!target) return
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(target))
    setSession(target)
  }

  // Leave current group (removes from saved list too)
  function leaveGroup() {
    const all     = loadAll()
    const updated = all.filter(s => s.groupId !== session?.groupId)
    localStorage.setItem(ALL_KEY, JSON.stringify(updated))
    const next = updated[0] || null
    if (next) {
      localStorage.setItem(ACTIVE_KEY, JSON.stringify(next))
    } else {
      localStorage.removeItem(ACTIVE_KEY)
    }
    setAllSessions(updated)
    setSession(next)
  }

  // Full logout — clears everything
  function logout() {
    localStorage.removeItem(ACTIVE_KEY)
    localStorage.removeItem(ALL_KEY)
    setSession(null)
    setAllSessions([])
  }

  return (
    <AuthContext.Provider value={{ session, allSessions, login, switchGroup, leaveGroup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
