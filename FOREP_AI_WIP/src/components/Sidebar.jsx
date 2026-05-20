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
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getUnreadCount, updateEventName } from '../utils/notificationService.js'

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Tasks', icon: ClipboardList, path: '/tasks' },
  { label: 'Team', icon: UsersRound, path: '/teams' },
  { label: 'Employees', icon: UserRound, path: '/employees' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'AI Insights', icon: Sparkles, path: '/ai-insights' },
  { label: 'Attendance', icon: CalendarDays, path: '/attendance' },
  { label: 'Leave Requests', icon: UserRound, path: '/leave' },
  { label: 'Events Timeline', icon: CalendarDays, path: '/events' },
  { label: 'Notifications', icon: Bell, path: '/notifications', notificationBadge: true },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

function Sidebar() {
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(() => getUnreadCount())

  useEffect(() => {
    const refresh = () => setUnreadCount(getUnreadCount())
    window.addEventListener(updateEventName, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(updateEventName, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return (
    <aside className="sidebar-panel fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-[#e2e8f0] bg-white p-5 shadow-sm lg:flex">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#0ea5e9] text-sm font-bold text-white">
          AI
        </span>
        <div>
          <p className="font-bold text-[#0f172a]">Workforce</p>
          <p className="text-xs text-[#64748b]">Intelligence</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {menuItems.map(({ label, icon: Icon, path, badge, notificationBadge }) => (
          <NavLink
            key={label}
            to={path ?? '/dashboard'}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                isActive ? 'bg-sky-50 text-[#0ea5e9]' : 'text-[#64748b] hover:bg-slate-50 hover:text-[#0f172a]'
              }`
            }
          >
            <Icon size={18} />
            <span className="min-w-0 flex-1 truncate">{label}</span>
            {badge || (notificationBadge && unreadCount > 0) ? <span className="rounded-full bg-[#ef4444] px-2 py-0.5 text-xs font-bold text-white">{notificationBadge ? unreadCount : badge}</span> : null}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-[#e2e8f0] pt-5">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-sm font-semibold text-[#0f172a]">Acme Corp / Admin</p>
          <p className="mt-1 text-sm text-[#64748b]">John Doe / Manager</p>
        </div>
        <button type="button" onClick={() => navigate('/login')} className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#64748b] hover:bg-slate-50">
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
