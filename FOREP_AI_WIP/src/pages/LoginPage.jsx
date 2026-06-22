import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { animate } from 'animejs'
import { useRole } from '../context/role.js'
import { useLanguage } from '../context/language.js'
import { getCurrentUser, getOAuth2LoginLinks, isAuthenticated, login } from '../services/authService.js'
import LanguageToggle from '../components/app/LanguageToggle.jsx'

function getLoginMessage(error) {
  if (error?.status === 0) return 'Không thể kết nối máy chủ. Vui lòng thử lại sau ít phút.'
  if (error?.status === 401 || error?.status === 403) return 'Email hoặc mật khẩu không đúng, hoặc tài khoản chưa được cấp quyền.'
  return error?.message || 'Không thể đăng nhập. Vui lòng kiểm tra email và mật khẩu.'
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { syncRoleFromAccount } = useRole()
  const { t } = useLanguage()
  const cardRef = useRef(null)
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [oauthLinks, setOauthLinks] = useState({})
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

  useEffect(() => {
    let active = true
    getOAuth2LoginLinks()
      .then((links) => {
        if (active) setOauthLinks(links ?? {})
      })
      .catch(() => {
        if (active) setOauthLinks({})
      })
    return () => {
      active = false
    }
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
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#0ea5e9] text-sm font-bold text-white">F</span>
            <div>
              <p className="font-bold text-[var(--text)]">FOREP</p>
              <p className="text-sm text-[var(--muted)]">{t('auth.platform', 'AI Workforce Intelligence Platform')}</p>
            </div>
          </Link>
          <LanguageToggle />
        </div>
        <h1 className="text-3xl font-bold tracking-normal text-[var(--text)]">Chào mừng quay lại</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Đăng nhập để tiếp tục vào workspace FOREP của tổ chức bạn.</p>
        {location.state?.message ? <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{location.state.message}</p> : null}
        {oauthLinks.google || oauthLinks.github || oauthLinks.jira ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {oauthLinks.google ? <a href={oauthLinks.google} className="rounded-lg border border-[var(--border)] px-4 py-3 text-center text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)]">Google</a> : null}
            {oauthLinks.github ? <a href={oauthLinks.github} className="rounded-lg border border-[var(--border)] px-4 py-3 text-center text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)]">GitHub</a> : null}
            {oauthLinks.jira ? <a href={oauthLinks.jira} className="rounded-lg border border-[var(--border)] px-4 py-3 text-center text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)]">Jira</a> : null}
          </div>
        ) : null}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">{t('auth.email', 'Email')}</span>
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
              {t('auth.password', 'Password')}
              <button type="button" onClick={() => setError('Khôi phục mật khẩu sẽ được hỗ trợ trong phiên bản sau.')} className="text-xs font-semibold text-[#0ea5e9] hover:text-sky-600">Quên mật khẩu?</button>
            </span>
            <input
              type="password"
              required
              value={credentials.password}
              onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
              placeholder="Nhập mật khẩu"
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-950"
            />
          </label>
          {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{error}</p> : null}
          <button type="submit" disabled={submitting} className="w-full rounded-lg bg-[#0ea5e9] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">Tài khoản được cấp bởi quản trị viên hoặc quản lý. Nếu chưa có tài khoản, vui lòng liên hệ người phụ trách FOREP trong tổ chức.</p>
      </div>
    </main>
  )
}

export default LoginPage
