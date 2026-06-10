import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { useAuthStore } from '../stores/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setTokens, setUser } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data: tokens } = await authApi.login({ email, password })
      setTokens(tokens.access_token, tokens.refresh_token)
      const { data: user } = await authApi.me()
      setUser(user)
      navigate('/collections')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-pm-bg p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-pm-orange text-2xl font-bold text-white">
            R
          </div>
          <h1 className="text-2xl font-bold text-pm-text">ReqLab</h1>
          <p className="mt-1 text-sm text-pm-muted">API development &amp; testing platform</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-pm-border bg-pm-sidebar p-6 shadow-xl"
        >
          <h2 className="mb-4 text-lg font-semibold text-pm-text">Sign in to ReqLab</h2>
          {error && (
            <p className="mb-4 rounded border border-method-delete/30 bg-method-delete/10 px-3 py-2 text-sm text-method-delete">
              {error}
            </p>
          )}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium uppercase text-pm-muted">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="mb-1.5 block text-xs font-medium uppercase text-pm-muted">
              Password
            </label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-send w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="mt-4 text-center text-sm text-pm-muted">
            No account?{' '}
            <Link to="/register" className="text-pm-orange hover:text-pm-orange-hover">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
