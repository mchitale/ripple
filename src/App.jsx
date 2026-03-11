import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth.jsx'
import Landing from './pages/Landing.jsx'
import { JoinPage, CreatePage } from './pages/Auth.jsx'
import AppShell from './pages/AppShell.jsx'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"       element={<Landing />} />
        <Route path="/join"   element={<JoinPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/app/*"  element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
        <Route path="*"       element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return null
  if (!session) return <Navigate to="/" replace />
  return children
}
