import { useMemo, useState } from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SearchAndFilterBar from '../components/SearchAndFilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { notificationSeverities, notificationTypes } from '../constants/notificationTypes.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { deleteNotification, getNotifications, markAllAsRead, markAsRead } from '../services/notificationService.js'

function NotificationPage() {
  const { data: notifications, loading, error, apiPending, setData } = useServiceData(getNotifications, [])
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [severity, setSeverity] = useState('')
  const [readFilter, setReadFilter] = useState('')
  const filtered = useMemo(() => notifications.filter((item) => `${item.title} ${item.message}`.toLowerCase().includes(search.toLowerCase()) && (!type || item.type === type) && (!severity || item.severity === severity) && (!readFilter || (readFilter === 'Unread' ? !item.read : item.read))), [notifications, search, type, severity, readFilter])

  const readOne = async (id) => {
    await markAsRead(id)
    setData((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }
  const remove = async (id) => {
    await deleteNotification(id)
    setData((current) => current.filter((item) => item.id !== id))
  }
  const readAll = async () => {
    await markAllAsRead()
    setData((current) => current.map((item) => ({ ...item, read: true })))
  }

  return (
    <AppLayout title="Notifications">
      <PageHeader title="Notification Center" description="Product notification UI prepared for backend event processing." action={<Button variant="secondary" onClick={readAll}>Mark all as read</Button>} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load notifications" description={error.message} /> : null}
      {apiPending ? <ErrorState description="Connect GET /api/notifications to display notifications." /> : null}
      {!loading && !error && !apiPending ? (
        <>
          <SearchAndFilterBar search={search} onSearchChange={setSearch} filters={[
            { label: 'All types', value: type, onChange: setType, options: notificationTypes },
            { label: 'All severity', value: severity, onChange: setSeverity, options: notificationSeverities },
            { label: 'Read status', value: readFilter, onChange: setReadFilter, options: ['Unread', 'Read'] },
          ]} />
          <div className="grid gap-4">{filtered.map((item) => <Card key={item.id} className="page-animate opacity-0"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-[var(--text)]">{item.title}</h2>{!item.read ? <span className="h-2 w-2 rounded-full bg-[#0ea5e9]" /> : null}</div><p className="mt-2 text-sm text-[var(--muted)]">{item.message}</p><div className="mt-3 flex gap-2"><Badge tone={item.severity}>{item.severity}</Badge><Badge tone="Info">{item.type}</Badge></div></div><div className="flex gap-2"><Button variant="secondary" onClick={() => readOne(item.id)} disabled={item.read}>Mark read</Button><Button variant="ghost" onClick={() => remove(item.id)}>Delete</Button></div></div></Card>)}</div>
          {!filtered.length ? <EmptyState title="No notifications yet" /> : null}
        </>
      ) : null}
    </AppLayout>
  )
}

export default NotificationPage
