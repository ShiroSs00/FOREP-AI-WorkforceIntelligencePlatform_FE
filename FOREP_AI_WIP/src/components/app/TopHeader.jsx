import { useEffect, useState } from 'react'
import { Bell, Search, Settings } from 'lucide-react'
import NotificationDropdown from './NotificationDropdown.jsx'
import { getNotifications } from '../../services/notificationService.js'
import ThemeToggle from './ThemeToggle.jsx'

function TopHeader({ title }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  const refresh = async () => {
    try {
      setNotifications(await getNotifications())
    } catch {
      setNotifications([])
    }
  }

  useEffect(() => {
    Promise.resolve().then(refresh)
  }, [])

  const unreadCount = notifications.filter((item) => !item.read).length

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-[var(--muted)] lg:hidden">FOREP AI Workforce</p>
          <h1 className="text-2xl font-bold tracking-normal text-[var(--text)]">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="relative min-w-0 flex-1 sm:w-80 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
            <input type="search" placeholder="Search product data..." className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-4 focus:ring-sky-100 dark:placeholder:text-slate-500 dark:focus:ring-sky-950" />
          </label>
          <div className="relative">
            <button type="button" aria-label="Notifications" onClick={() => setOpen((value) => !value)} className="relative grid h-10 w-10 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]">
              <Bell size={18} />
              {unreadCount > 0 ? <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#ef4444] px-1 text-[11px] font-bold text-white">{unreadCount}</span> : null}
            </button>
            {open ? <NotificationDropdown notifications={notifications} onRefresh={refresh} /> : null}
          </div>
          <ThemeToggle />
          <button type="button" aria-label="Settings" className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default TopHeader
