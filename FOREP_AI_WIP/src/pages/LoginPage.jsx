import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { animate } from 'animejs'
import { useRole } from '../context/role.js'
import { getCurrentUser, isAuthenticated, login } from '../services/authService.js'

function getLoginMessage(error) {
  if (error?.status === 0) return 'Backend API is unavailable or waking up. Please retry in a moment.'
  return error?.message || 'Unable to sign in. Please check your email and password.'
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { syncRoleFromAccount } = useRole()
  const cardRef = useRef(null)
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!cardRef.current) return undefined
    const animation = animate(cardRef.current, {
      opacity: [0, 1],
      translateY: [34, 0],
      scale: [0.98, 1],
      duration: 720,
      ease: 'outCubic',
    })
    return () => animation.pause()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await login(credentials)
      if (!result?.token && !isAuthenticated()) {
        throw new Error('Sign in succeeded, but the backend did not return a session token.')
      }
      const currentUser = await getCurrentUser().catch(() => result?.user ?? null)
      syncRoleFromAccount(currentUser ?? result?.user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getLoginMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-4 py-12 text-[var(--text)]">
      <div ref={cardRef} className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 opacity-0 shadow-xl shadow-slate-200/70 dark:shadow-slate-950/40">
        <Link to="/" className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#0ea5e9] text-sm font-bold text-white">F</span>
          <div>
            <p className="font-bold text-[var(--text)]">FOREP</p>
            <p className="text-sm text-[var(--muted)]">AI Workforce Intelligence Platform</p>
          </div>
        </Link>
        <h1 className="text-3xl font-bold tracking-normal text-[var(--text)]">Welcome back</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Sign in to continue to your workforce intelligence workspace.</p>
        {location.state?.message ? <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{location.state.message}</p> : null}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">Email</span>
            <input
              type="email"
              required
              value={credentials.email}
              onChange={(event) => setCredentials((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@company.com"
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-950"
            />
          </label>
          <label className="block">
            <span className="flex items-center justify-between text-sm font-medium text-[var(--text)]">
              Password
              <button type="button" onClick={() => setError('Password recovery will be available soon.')} className="text-xs font-semibold text-[#0ea5e9] hover:text-sky-600">Forgot password?</button>
            </span>
            <input
              type="password"
              required
              value={credentials.password}
              onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
              placeholder="Enter your password"
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-950"
            />
          </label>
          {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{error}</p> : null}
          <button type="submit" disabled={submitting} className="w-full rounded-lg bg-[#0ea5e9] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Don't have an account? <Link to="/register" className="font-semibold text-[#0ea5e9] hover:text-sky-600">Create account</Link>
        </p>
      </div>
    </main>
  )
}

export default LoginPage
