import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { authApi } from './api'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CollectionsPage from './pages/CollectionsPage'
import BuilderPage from './pages/BuilderPage'
import EnvironmentsPage from './pages/EnvironmentsPage'
import HistoryPage from './pages/HistoryPage'
import ImportPage from './pages/ImportPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const authenticated = useAuthStore((s) => s.isAuthenticated())
  if (!authenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { accessToken, setUser, user } = useAuthStore()

  useEffect(() => {
    if (accessToken && !user) {
      authApi.me().then(({ data }) => setUser(data)).catch(() => useAuthStore.getState().logout())
    }
  }, [accessToken, user, setUser])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/environments" element={<EnvironmentsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/import" element={<ImportPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
