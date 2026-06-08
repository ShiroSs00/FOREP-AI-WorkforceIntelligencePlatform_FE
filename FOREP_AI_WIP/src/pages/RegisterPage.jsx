import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { animate } from 'animejs'
import { useRole } from '../context/role.js'
import { getCurrentUser, register } from '../services/authService.js'

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
}

function getRegisterMessage(error) {
  if (error?.status === 0) return 'Backend API is unavailable or waking up. Please retry in a moment.'
  return error?.message || 'Unable to create account. Please check your information.'
}

function RegisterPage() {
  const navigate = useNavigate()
  const { syncRoleFromAccount } = useRole()
  const cardRef = useRef(null)
  const [form, setForm] = useState(initialForm)
  const [fieldError, setFieldError] = useState('')
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

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setFieldError('')
    setError('')
  }

  const validate = () => {
    if (!form.firstName.trim()) return 'First name is required.'
    if (!form.lastName.trim()) return 'Last name is required.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter a valid email address.'
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    if (!form.role) return 'Select an account role.'
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setFieldError(validationError)
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
      }
      const response = await register(payload)
      if (response?.token) {
        const currentUser = await getCurrentUser().catch(() => response?.user ?? null)
        syncRoleFromAccount(currentUser ?? response?.user ?? response)
        navigate('/dashboard', { replace: true })
      }
      else navigate('/login', { state: { message: 'Account created. Please sign in.' } })
    } catch (err) {
      setError(getRegisterMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-4 py-12 text-[var(--text)]">
      <div ref={cardRef} className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 opacity-0 shadow-xl shadow-slate-200/70 dark:shadow-slate-950/40">
        <Link to="/" className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#0ea5e9] text-sm font-bold text-white">F</span>
          <div>
            <p className="font-bold text-[var(--text)]">FOREP</p>
            <p className="text-sm text-[var(--muted)]">AI Workforce Intelligence Platform</p>
          </div>
        </Link>
        <h1 className="text-3xl font-bold tracking-normal text-[var(--text)]">Create your account</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Create a FOREP workspace account for your organization.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">First name</span>
              <input required value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-950" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">Last name</span>
              <input required value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-950" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-[var(--text)]">Email</span>
              <input type="email" required value={form.email} onChange={(event) => updateField('email', event.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-950" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">Password</span>
              <input type="password" required value={form.password} onChange={(event) => updateField('password', event.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-950" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">Confirm password</span>
              <input type="password" required value={form.confirmPassword} onChange={(event) => updateField('confirmPassword', event.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-950" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-[var(--text)]">Role</span>
              <select required value={form.role} onChange={(event) => updateField('role', event.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-950">
                <option value="">Select role</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="HR" disabled>People Ops (not enabled yet)</option>
                <option value="EMPLOYEE">Employee</option>
              </select>
              <span className="mt-2 block text-xs text-[var(--muted)]">People Ops access is provisioned by an administrator when backend HR role support is enabled.</span>
            </label>
          </div>

          {fieldError ? <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">{fieldError}</p> : null}
          {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{error}</p> : null}
          <button type="submit" disabled={submitting} className="w-full rounded-lg bg-[#0ea5e9] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Already have an account? <Link to="/login" className="font-semibold text-[#0ea5e9] hover:text-sky-600">Sign in</Link>
        </p>
      </div>
    </main>
  )
}

export default RegisterPage
