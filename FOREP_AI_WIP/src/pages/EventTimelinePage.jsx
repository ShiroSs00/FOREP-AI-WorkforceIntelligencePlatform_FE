import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import SearchAndFilterBar from '../components/SearchAndFilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Badge from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { useRole } from '../context/role.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { getManagedTeamAttendance, getMyAttendanceHistory } from '../services/attendanceService.js'
import { getManagedTeamLeaves, getMyLeaveHistory, getLeaveRequests } from '../services/leaveService.js'
import { getNotifications } from '../services/notificationService.js'
import { getManagedTeamTasks, getMyTasks, getTasks } from '../services/taskService.js'
import { getDate, getId, getName, valueOf } from '../services/responseNormalizer.js'

const pageCopy = {
  admin: ['Platform Event Timeline', 'Operational activity across the platform scope.'],
  manager: ['Team Event Timeline', 'Operational activity for teams you manage.'],
  hr: ['People Event Timeline', 'People-operation activity for workforce workflows.'],
  employee: ['My Event Timeline', 'Your personal workflow activity.'],
}

async function loadOperationalTimeline(selectedRole) {
  const taskLoader = selectedRole === 'employee' ? getMyTasks : selectedRole === 'manager' ? getManagedTeamTasks : getTasks
  const leaveLoader = selectedRole === 'employee' ? getMyLeaveHistory : selectedRole === 'manager' ? getManagedTeamLeaves : getLeaveRequests
  const attendanceLoader = selectedRole === 'employee' ? getMyAttendanceHistory : selectedRole === 'manager' ? getManagedTeamAttendance : () => Promise.resolve([])

  const results = await Promise.allSettled([
    taskLoader(),
    leaveLoader(),
    attendanceLoader(),
    getNotifications(),
  ])

  const [tasks, leaves, attendance, notifications] = results.map((result) => (result.status === 'fulfilled' ? result.value : []))
  return [
    ...tasks.map((task) => ({ id: `task-${getId(task)}`, type: valueOf(task, ['status'], 'TASK'), source: 'Tasks', title: getName(task), description: valueOf(task, ['description'], 'No description'), actor: valueOf(task, ['assignee', 'assigneeName', 'employeeName'], 'Not assigned'), timestamp: valueOf(task, ['updatedAt', 'createdAt', 'dueDate'], getDate(task)) })),
    ...leaves.map((leave) => ({ id: `leave-${getId(leave)}`, type: `LEAVE_${valueOf(leave, ['status'], 'REQUEST')}`, source: 'Leave', title: valueOf(leave, ['employeeName'], 'Leave request'), description: valueOf(leave, ['reason'], 'No reason'), actor: valueOf(leave, ['employeeName'], 'Unknown'), timestamp: valueOf(leave, ['createdAt', 'startDate'], getDate(leave)) })),
    ...attendance.map((record) => ({ id: `attendance-${getId(record)}`, type: `ATTENDANCE_${valueOf(record, ['status'], 'RECORDED')}`, source: 'Attendance', title: valueOf(record, ['employeeName'], 'Attendance record'), description: `${valueOf(record, ['checkInTime'], '-')} to ${valueOf(record, ['checkOutTime'], '-')}`, actor: valueOf(record, ['employeeName'], 'Unknown'), timestamp: valueOf(record, ['checkInDate'], getDate(record)) })),
    ...notifications.map((notification) => ({ id: `notification-${getId(notification)}`, type: valueOf(notification, ['type'], 'NOTIFICATION'), source: 'Notifications', title: valueOf(notification, ['title'], 'Notification'), description: valueOf(notification, ['message'], 'No message'), actor: valueOf(notification, ['recipientName'], 'System'), timestamp: getDate(notification) })),
  ].sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)))
}

function EventTimelinePage() {
  const { selectedRole } = useRole()
  const { data: events, loading, error, apiPending, retry } = useServiceData(() => loadOperationalTimeline(selectedRole), [selectedRole])
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [source, setSource] = useState('')
  const [severity, setSeverity] = useState('')
  const filtered = useMemo(() => events.filter((event) => {
    const eventType = valueOf(event, ['type', 'eventType'], 'Event')
    const eventSource = valueOf(event, ['source'], 'Internal')
    const eventSeverity = valueOf(event, ['severity'], 'Info')
    return `${getName(event)} ${valueOf(event, ['description', 'content'], '')} ${valueOf(event, ['actor', 'actorName'], '')}`.toLowerCase().includes(search.toLowerCase()) && (!type || eventType === type) && (!source || eventSource === source) && (!severity || eventSeverity === severity)
  }), [events, search, type, source, severity])

  return (
    <>
      <PageHeader title={pageCopy[selectedRole][0]} description={pageCopy[selectedRole][1]} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load events" description={error.message} status={error.status} details={error.details} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="Connect event APIs to display operational events." onRetry={retry} /> : null}
      {!loading && !error && !apiPending ? (
        <>
          <SearchAndFilterBar search={search} onSearchChange={setSearch} filters={[
            { label: 'All types', value: type, onChange: setType, options: [...new Set(events.map((event) => valueOf(event, ['type', 'eventType'], '')).filter(Boolean))] },
            { label: 'All sources', value: source, onChange: setSource, options: [...new Set(events.map((event) => valueOf(event, ['source'], '')).filter(Boolean))] },
            { label: 'All severity', value: severity, onChange: setSeverity, options: [...new Set(events.map((event) => valueOf(event, ['severity'], '')).filter(Boolean))] },
          ]} />
          <div className="space-y-4">{filtered.map((event, index) => <Card key={`${getId(event)}-${index}`} className="page-animate opacity-0"><div className="flex flex-wrap gap-2"><Badge tone={valueOf(event, ['severity'], 'Info')}>{valueOf(event, ['type', 'eventType'], 'Event')}</Badge><Badge tone="Info">{valueOf(event, ['source'], 'Internal')}</Badge></div><h2 className="mt-3 font-semibold text-[var(--text)]">{getName(event)}</h2><p className="mt-1 text-sm text-[var(--muted)]">{valueOf(event, ['description', 'content'], 'No description')}</p><p className="mt-2 text-xs text-[var(--muted)]">{getDate(event)}</p></Card>)}</div>
          {!filtered.length ? <EmptyState title="No events available." description="No operational event records are available for this role." /> : null}
        </>
      ) : null}
    </>
  )
}

export default EventTimelinePage
