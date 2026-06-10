import { useEffect, useState } from 'react'
import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  ClipboardList,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Plug,
  ShieldCheck,
  Settings,
  Sparkles,
  UserRound,
  UserRoundPlus,
  UsersRound,
  Workflow,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { getUnreadCount } from '../../services/notificationService.js'
import { useRole } from '../../context/role.js'
import { useLanguage } from '../../context/language.js'
import RoleSwitcher from './RoleSwitcher.jsx'
import SidebarSearch from './SidebarSearch.jsx'
import SidebarUserCard from './SidebarUserCard.jsx'

const iconMap = {
  ai: Sparkles,
  analytics: BarChart3,
  attendance: CalendarDays,
  building: Building2,
  dashboard: LayoutDashboard,
  events: Workflow,
  integration: Plug,
  leave: UserRound,
  monitoring: HeartPulse,
  notifications: Bell,
  profile: UserRound,
  recruitment: UserRoundPlus,
  reports: FileText,
  settings: Settings,
  tasks: ClipboardList,
  users: UsersRound,
}

function Sidebar() {
  const { roleConfig, menuGroups } = useRole()
  const { t } = useLanguage()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let mounted = true
    getUnreadCount()
      .then((count) => {
        if (mounted) setUnreadCount(count)
      })
      .catch(() => {
        if (mounted) setUnreadCount(0)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <aside className="sidebar-panel fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-[var(--border)] bg-slate-50/95 p-4 shadow-sm dark:bg-slate-950/95 lg:flex">
      <RoleSwitcher />
      <SidebarSearch placeholder={roleConfig.sidebarSearchPlaceholder} />

      <nav className="mt-6 flex-1 space-y-5 overflow-y-auto pr-1">
        {menuGroups.map((section) => (
          <div key={section.title}>
            <p className="px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{section.title}</p>
            <div className="mt-2 space-y-1">
              {section.items.map(({ label, icon, path, notificationBadge }) => {
                const Icon = iconMap[icon] ?? ShieldCheck
                return (
                  <NavLink
                    key={label}
                    to={path}
                    className={({ isActive }) =>
                      `relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                        isActive ? 'bg-[#e0f2fe] text-[#0284c7] shadow-sm dark:bg-sky-400/10 dark:text-[#38bdf8]' : 'text-[var(--muted)] hover:bg-white hover:text-[var(--text)] dark:hover:bg-slate-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={`absolute right-0 top-2 bottom-2 w-1 rounded-full transition-colors ${isActive ? 'bg-[#0ea5e9] dark:bg-[#38bdf8]' : 'bg-transparent'}`} />
                        <Icon size={18} />
                        <span className="min-w-0 flex-1 truncate">{t(`nav.${label}`, label)}</span>
                        {notificationBadge && unreadCount > 0 ? <span className="grid min-h-5 min-w-5 place-items-center rounded-full bg-[#ef4444] px-1.5 text-xs font-bold leading-none text-white">{unreadCount}</span> : null}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-4 border-t border-[var(--border)] pt-4">
        <SidebarUserCard />
      </div>
    </aside>
  )
}

export default Sidebar
