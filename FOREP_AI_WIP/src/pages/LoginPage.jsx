import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { animate } from 'animejs'

function LoginPage() {
  const navigate = useNavigate()
  const cardRef = useRef(null)

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

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate('/dashboard')
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-4 py-12 text-[var(--text)]">
      <div ref={cardRef} className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 opacity-0 shadow-xl shadow-slate-200/70 dark:shadow-slate-950/40">
        <Link to="/" className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#0ea5e9] text-sm font-bold text-white">AI</span>
          <div>
            <p className="font-bold text-[var(--text)]">AI Workforce</p>
            <p className="text-sm text-[var(--muted)]">Demo access</p>
          </div>
        </Link>
        <h1 className="text-3xl font-bold tracking-normal text-[var(--text)]">Login to Dashboard</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Demo mode: use any email and password</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">Email</span>
            <input
              type="email"
              required
              placeholder="manager@acme.com"
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-950"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">Password</span>
            <input
              type="password"
              required
              placeholder="password"
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-950"
            />
          </label>
          <button type="submit" className="w-full rounded-lg bg-[#0ea5e9] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600">
            Sign in
          </button>
        </form>
      </div>
    </main>
  )
}

export default LoginPage
