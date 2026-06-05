import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import LoadingState from '../ui/LoadingState.jsx'
import ErrorState from '../ui/ErrorState.jsx'
import { useRole } from '../../context/role.js'
import { getCurrentUser, isAuthenticated } from '../../services/authService.js'

function ProtectedRoute() {
  const location = useLocation()
  const { syncRoleFromAccount } = useRole()
  const [checkingAccount, setCheckingAccount] = useState(() => isAuthenticated())
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isAuthenticated()) return undefined
    let active = true
    getCurrentUser()
      .then((account) => {
        if (active) syncRoleFromAccount(account)
      })
      .catch((err) => {
        if (active && err?.status !== 401) setError(err)
      })
      .finally(() => {
        if (active) setCheckingAccount(false)
      })
    return () => {
      active = false
    }
  }, [syncRoleFromAccount])

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (checkingAccount) {
    return <main className="grid min-h-screen place-items-center bg-[var(--bg)] text-[var(--text)]"><LoadingState title="Loading your workspace" description="Checking your account role before opening the dashboard." /></main>
  }

  if (error) {
    return <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-6 text-[var(--text)]"><ErrorState title="Unable to load account" description={error.message} onRetry={() => window.location.reload()} /></main>
  }

  return <Outlet />
}

export default ProtectedRoute
