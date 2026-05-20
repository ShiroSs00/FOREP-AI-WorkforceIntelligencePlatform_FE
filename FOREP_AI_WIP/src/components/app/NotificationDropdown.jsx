import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import { markAllAsRead, markAsRead } from '../../services/notificationService.js'
import { routes } from '../../constants/routes.js'

const icons = { Info, Success: CheckCircle, Warning: AlertTriangle, Critical: XCircle }

function NotificationDropdown({ notifications, onRefresh }) {
  const navigate = useNavigate()
  const unreadCount = notifications.filter((item) => !item.read).length

  const openItem = async (notification) => {
    await markAsRead(notification.id)
    await onRefresh()
    if (notification.link) navigate(notification.link)
  }

  const markAll = async () => {
    await markAllAsRead()
    await onRefresh()
  }

  return (
    <div className="absolute right-0 top-12 z-40 w-[min(92vw,420px)] rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-slate-200 dark:shadow-slate-950">
      <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
        <div>
          <p className="font-semibold text-[var(--text)]">Notifications</p>
          <p className="text-xs text-[var(--muted)]">{unreadCount} unread</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="px-2 py-1 shadow-none" onClick={markAll}>Mark all</Button>
          <Button variant="ghost" className="px-2 py-1 shadow-none" onClick={() => navigate(routes.notifications)}>View all</Button>
        </div>
      </div>
      <div className="max-h-96 overflow-auto p-2">
        {notifications.length ? notifications.slice(0, 8).map((notification) => {
          const Icon = icons[notification.severity] ?? Info
          return (
            <button key={notification.id} type="button" onClick={() => openItem(notification)} className="flex w-full gap-3 rounded-lg p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900">
              <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-[#0ea5e9] dark:bg-slate-900 dark:text-[#38bdf8]"><Icon size={17} /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-[var(--text)]">{notification.title}</span>
                  {!notification.read ? <span className="h-2 w-2 shrink-0 rounded-full bg-[#0ea5e9]" /> : null}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{notification.message}</span>
                <span className="mt-2 flex items-center gap-2"><Badge tone={notification.severity}>{notification.severity}</Badge></span>
              </span>
            </button>
          )
        }) : <p className="p-6 text-center text-sm text-[var(--muted)]">No notifications yet</p>}
      </div>
    </div>
  )
}

export default NotificationDropdown
