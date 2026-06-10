import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.register(form)
      navigate('/login')
    } catch {
      setError('Registration failed. Email or username may already exist.')
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
          <h1 className="text-2xl font-bold text-pm-text">Create your ReqLab account</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-pm-border bg-pm-sidebar p-6 shadow-xl"
        >
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
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium uppercase text-pm-muted">
              Username
            </label>
            <input
              className="input-field"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              minLength={3}
            />
          </div>
          <div className="mb-6">
            <label className="mb-1.5 block text-xs font-medium uppercase text-pm-muted">
              Password
            </label>
            <input
              type="password"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-send w-full">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
          <p className="mt-4 text-center text-sm text-pm-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-pm-orange hover:text-pm-orange-hover">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
