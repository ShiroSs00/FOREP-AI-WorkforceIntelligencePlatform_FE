import { useEffect, useState } from 'react'
import {
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
  Workflow,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { routes } from '../../constants/routes.js'
import { getNotifications } from '../../services/notificationService.js'

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: routes.dashboard },
  { label: 'Tasks', icon: ClipboardList, path: routes.tasks },
  { label: 'Team', icon: UsersRound, path: routes.teams },
  { label: 'Employees', icon: UserRound, path: routes.employees },
  { label: 'Analytics', icon: BarChart3, path: routes.analytics },
  { label: 'AI Insights', icon: Sparkles, path: routes.aiInsights },
  { label: 'Attendance', icon: CalendarDays, path: routes.attendance },
  { label: 'Leave Requests', icon: UserRound, path: routes.leave },
  { label: 'Events Timeline', icon: Workflow, path: routes.events },
  { label: 'Notifications', icon: Bell, path: routes.notifications, notificationBadge: true },
  { label: 'Settings', icon: Settings, path: routes.settings },
]

function Sidebar() {
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let mounted = true
    getNotifications()
      .then((items) => {
        if (mounted) setUnreadCount(items.filter((item) => !item.read).length)
      })
      .catch(() => {
        if (mounted) setUnreadCount(0)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <aside className="sidebar-panel fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm lg:flex">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#0ea5e9] text-sm font-bold text-white">F</span>
        <div>
          <p className="font-bold text-[var(--text)]">FOREP</p>
          <p className="text-xs text-[var(--muted)]">Workforce Intelligence</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {menuItems.map(({ label, icon: Icon, path, notificationBadge }) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                isActive ? 'bg-sky-50 text-[#0ea5e9] dark:bg-sky-950/40 dark:text-[#38bdf8]' : 'text-[var(--muted)] hover:bg-slate-50 hover:text-[var(--text)] dark:hover:bg-slate-900'
              }`
            }
          >
            <Icon size={18} />
            <span className="min-w-0 flex-1 truncate">{label}</span>
            {notificationBadge && unreadCount > 0 ? <span className="rounded-full bg-[#ef4444] px-2 py-0.5 text-xs font-bold text-white">{unreadCount}</span> : null}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-[var(--border)] pt-5">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
          <p className="text-sm font-semibold text-[var(--text)]">Organization</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Backend-ready workspace</p>
        </div>
        <button type="button" onClick={() => navigate(routes.login)} className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--muted)] hover:bg-slate-50 dark:hover:bg-slate-900">
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
