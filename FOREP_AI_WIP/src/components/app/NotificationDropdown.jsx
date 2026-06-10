import { Bell, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import { markAllAsRead, markAsRead } from '../../services/notificationService.js'
import { routes } from '../../constants/routes.js'
import { extractBackendMessage, getId, valueOf } from '../../services/responseNormalizer.js'

function NotificationDropdown({ notifications, onRefresh }) {
  const navigate = useNavigate()
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const unreadCount = notifications.filter((item) => !(item.read ?? item.isRead)).length

  const openItem = async (notification) => {
    setActionError('')
    setActionMessage('')
    try {
      const response = await markAsRead(getId(notification))
      setActionMessage(extractBackendMessage(response, 'Notification marked as read.'))
      await onRefresh()
      if (notification.link) navigate(notification.link)
    } catch (error) {
      setActionError(error?.message || 'Unable to update notification.')
    }
  }

  const markAll = async () => {
    setActionError('')
    setActionMessage('')
    try {
      const response = await markAllAsRead()
      setActionMessage(extractBackendMessage(response, 'Notifications marked as read.'))
      await onRefresh()
    } catch (error) {
      setActionError(error?.message || 'Unable to update notifications.')
    }
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
      {actionMessage ? <p className="mx-4 mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{actionMessage}</p> : null}
      {actionError ? <p className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
      <div className="max-h-96 overflow-auto p-2">
        {notifications.length ? notifications.slice(0, 8).map((notification, index) => {
          const read = Boolean(notification.read ?? notification.isRead)
          const Icon = read ? CheckCircle : Bell
          return (
            <button key={`${getId(notification)}-${index}`} type="button" onClick={() => openItem(notification)} className="flex w-full gap-3 rounded-lg p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900">
              <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-[#0ea5e9] dark:bg-slate-900 dark:text-[#38bdf8]"><Icon size={17} /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-[var(--text)]">{valueOf(notification, ['title'], 'Untitled')}</span>
                  {!read ? <span className="h-2 w-2 shrink-0 rounded-full bg-[#0ea5e9]" /> : null}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{valueOf(notification, ['message', 'content'], 'No description')}</span>
                <span className="mt-2 flex items-center gap-2"><Badge tone="Info">{valueOf(notification, ['type', 'notificationType'], 'System')}</Badge></span>
              </span>
            </button>
          )
        }) : <p className="p-6 text-center text-sm text-[var(--muted)]">No notifications yet</p>}
      </div>
    </div>
  )
}

export default NotificationDropdown
