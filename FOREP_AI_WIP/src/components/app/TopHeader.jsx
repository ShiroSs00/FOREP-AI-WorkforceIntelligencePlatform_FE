import { useEffect, useState } from 'react'
import { Bell, Plus, Search, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import NotificationDropdown from './NotificationDropdown.jsx'
import { getNotifications, getUnreadCount } from '../../services/notificationService.js'
import ThemeToggle from './ThemeToggle.jsx'
import Button from '../ui/Button.jsx'
import { useRole } from '../../context/role.js'
import { routes } from '../../constants/routes.js'

const actionRoutes = {
  'Create Organization': routes.organizations,
  'Invite User': routes.users,
  'Configure Integration': routes.integrations,
  'Create Team': routes.teams,
  'Create Sprint': routes.sprints,
  'Create Task': routes.tasks,
  'Assign Employee': routes.employees,
  'Assign Task': routes.tasks,
  'Request Report': routes.reports,
  'Add Employee': routes.employees,
  'Create Leave Policy': routes.leave,
  'Create Leave Request': routes.leave,
  'Add Candidate': routes.recruitment,
  'Review Leave Requests': routes.leave,
  'Open Attendance': routes.attendance,
  'Create Personal Task': routes.tasks,
  'Request Leave': routes.leave,
  'Check In': routes.attendance,
}

function TopHeader({ title }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { roleConfig } = useRole()

  const refresh = async () => {
    try {
      const [items, count] = await Promise.all([getNotifications(), getUnreadCount()])
      setNotifications(items)
      setUnreadCount(count)
    } catch {
      setNotifications([])
      setUnreadCount(0)
    }
  }

  useEffect(() => {
    Promise.resolve().then(refresh)
  }, [])

  return (
    <header className="sticky top-0 z-20 min-h-[73px] border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-[var(--muted)] lg:hidden">FOREP AI Workforce</p>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{roleConfig.breadcrumb} / {title}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-normal text-[var(--text)]">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="relative min-w-0 flex-1 sm:w-80 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
            <input type="search" placeholder={roleConfig.searchPlaceholder} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-4 focus:ring-sky-100 dark:placeholder:text-slate-500 dark:focus:ring-sky-950" />
          </label>
          <div className="relative">
            <Button variant="secondary" onClick={() => setCreateOpen((value) => !value)}><Plus size={16} /> Create</Button>
            {createOpen ? (
              <div className="absolute right-0 top-12 z-40 w-56 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
                {roleConfig.createActions.map((action) => (
                  <button key={action} type="button" onClick={() => { setCreateOpen(false); navigate(actionRoutes[action] ?? routes.dashboard) }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--text)] transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
                    {action}
                    <span className="block text-xs text-[var(--muted)]">Open role module</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <span className={`hidden rounded-full border px-3 py-2 text-xs font-semibold lg:inline-flex ${roleConfig.badgeClass}`}>{roleConfig.headerBadge}</span>
          <div className="relative">
            <button type="button" aria-label="Notifications" onClick={() => setOpen((value) => !value)} className="relative grid h-10 w-10 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]">
              <Bell size={18} />
              {unreadCount > 0 ? <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#ef4444] px-1 text-[11px] font-bold text-white">{unreadCount}</span> : null}
            </button>
            {open ? <NotificationDropdown notifications={notifications} onRefresh={refresh} /> : null}
          </div>
          <ThemeToggle />
          <button type="button" aria-label="Settings" onClick={() => navigate(routes.settings)} className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default TopHeader
