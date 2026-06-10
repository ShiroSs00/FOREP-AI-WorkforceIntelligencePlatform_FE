import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { routes } from '../../constants/routes.js'
import { useRole } from '../../context/role.js'
import { useLanguage } from '../../context/language.js'
import { logout } from '../../services/authService.js'

function SidebarUserCard() {
  const navigate = useNavigate()
  const { currentUser } = useRole()
  const { t } = useLanguage()

  const signOut = async () => {
    await logout()
    navigate(routes.login)
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white/75 p-3 shadow-sm dark:bg-slate-900/75">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-slate-700">{currentUser.initials}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-[var(--text)]">{currentUser.name}</span>
          <span className="block truncate text-xs text-[var(--muted)]">{currentUser.title}</span>
        </span>
        <button
          type="button"
          aria-label={t('common.signOut', 'Sign out')}
          onClick={signOut}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-slate-100 hover:text-[var(--text)] dark:hover:bg-slate-800"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  )
}

export default SidebarUserCard
