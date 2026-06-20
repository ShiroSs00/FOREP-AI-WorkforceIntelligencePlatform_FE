import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, RefreshCw, UserRoundPlus, UsersRound } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import LoadingState from '../../components/ui/LoadingState.jsx'
import AIAnalystCard from '../../components/app/AIAnalystCard.jsx'
import PartialErrorNotice from '../../components/app/PartialErrorNotice.jsx'
import { useRole } from '../../context/role.js'
import { getInsightsByOrganization } from '../../services/aiInsightService.js'
import { getSuggestions, getSuggestionsByOrganization } from '../../services/aiSuggestionService.js'
import { getAttendanceByOrganization } from '../../services/attendanceService.js'
import { getEmployees } from '../../services/employeeService.js'
import { getLeaveRequests } from '../../services/leaveService.js'
import { getNotifications } from '../../services/notificationService.js'
import { getId, getName, getStatus, normalizeArray, valueOf } from '../../services/responseNormalizer.js'

function fetchHRResources(organizationId) {
  return Promise.allSettled([
    getEmployees(),
    getLeaveRequests(),
    getNotifications(),
    organizationId ? getAttendanceByOrganization(organizationId) : Promise.resolve([]),
    organizationId ? getInsightsByOrganization(organizationId) : Promise.resolve([]),
    organizationId ? getSuggestionsByOrganization(organizationId) : getSuggestions(),
  ])
}

function HRDashboard() {
  const { accountContext } = useRole()
  const organizationId = accountContext.organizationId
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [failures, setFailures] = useState([])
  const [data, setData] = useState({ employees: [], leaves: [], notifications: [], attendance: [], insights: [], suggestions: [] })

  const applyResults = useCallback((results) => {
    const [employees, leaves, notifications, attendance, insights, suggestions] = results
    setFailures(results.filter((result) => result.status === 'rejected'))
    setData({
      employees: employees.status === 'fulfilled' ? normalizeArray(employees.value) : [],
      leaves: leaves.status === 'fulfilled' ? normalizeArray(leaves.value) : [],
      notifications: notifications.status === 'fulfilled' ? normalizeArray(notifications.value) : [],
      attendance: attendance.status === 'fulfilled' ? normalizeArray(attendance.value) : [],
      insights: insights.status === 'fulfilled' ? normalizeArray(insights.value) : [],
      suggestions: suggestions.status === 'fulfilled' ? normalizeArray(suggestions.value) : [],
    })
    if (results.every((result) => result.status === 'rejected')) setError(results[0].reason)
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchHRResources(organizationId).then(applyResults).catch(setError).finally(() => setLoading(false))
  }, [applyResults, organizationId])

  useEffect(() => {
    let active = true
    fetchHRResources(organizationId)
      .then((results) => { if (active) applyResults(results) })
      .catch((err) => { if (active) setError(err) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [applyResults, organizationId])

  const metrics = useMemo(() => {
    const pendingLeaves = data.leaves.filter((leave) => String(getStatus(leave)).toUpperCase() === 'PENDING').length
    const highRisk = data.employees.filter((employee) => String(valueOf(employee, ['burnoutRisk'], '')).toUpperCase().includes('HIGH')).length
    return [
      { label: 'Employees', value: data.employees.length, icon: UsersRound },
      { label: 'Pending leave', value: pendingLeaves, icon: CalendarDays },
      { label: 'People risk signals', value: data.insights.length || highRisk, icon: UserRoundPlus },
      { label: 'Notifications', value: data.notifications.length, icon: CalendarDays },
    ]
  }, [data])

  return (
    <>
      <PageHeader
        eyebrow="People Ops / Dashboard"
        title="Workforce overview"
        description="Employee directory, leave review and people signals for People Ops."
        action={<Button variant="secondary" onClick={load} disabled={loading}><RefreshCw size={16} />Refresh</Button>}
      />
      {loading ? <LoadingState message="Loading People Ops dashboard..." /> : null}
      {error ? <ErrorState title="Unable to load People Ops dashboard" description={error.message} status={error.status} details={error.details} onRetry={load} /> : null}
      {!loading && !error ? <PartialErrorNotice failures={failures} /> : null}
      {!loading && !error ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon
              return <Card key={metric.label}><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-[var(--muted)]">{metric.label}</p><p className="mt-3 text-3xl font-bold text-[var(--text)]">{metric.value}</p></div><span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"><Icon size={20} /></span></div></Card>
            })}
          </div>
          <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-5">
              <Card>
                <h2 className="font-semibold text-[var(--text)]">Leave request review</h2>
                <div className="mt-4 space-y-3">
                  {data.leaves.slice(0, 5).map((leave) => <div key={getId(leave)} className="rounded-lg border border-[var(--border)] p-3"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-[var(--text)]">{valueOf(leave, ['employeeName'], 'Unknown employee')}</p><Badge>{getStatus(leave)}</Badge></div><p className="mt-1 text-sm text-[var(--muted)]">{valueOf(leave, ['reason'], 'No reason')}</p></div>)}
                  {!data.leaves.length ? <EmptyState title="No leave requests available." description="No leave records are available for this account." /> : null}
                </div>
              </Card>
              <Card>
                <h2 className="font-semibold text-[var(--text)]">Employee directory preview</h2>
                <div className="mt-4 space-y-3">
                  {data.employees.slice(0, 5).map((employee) => <div key={getId(employee)} className="rounded-lg border border-[var(--border)] p-3"><p className="font-semibold text-[var(--text)]">{getName(employee)}</p><p className="mt-1 text-sm text-[var(--muted)]">{valueOf(employee, ['jobTitle', 'role'], 'Unknown role')} - {valueOf(employee, ['teamName'], 'No team')}</p></div>)}
                  {!data.employees.length ? <EmptyState title="No employees returned." /> : null}
                </div>
              </Card>
              <Card>
                <h2 className="font-semibold text-[var(--text)]">Recruitment</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Recruitment is visible for People Ops, but this module needs backend support before records can be managed here.</p>
              </Card>
            </div>
            <AIAnalystCard
              role="People Ops"
              title="People AI Analyst"
              signals={[
                `${data.employees.length} employee records available.`,
                `${data.leaves.length} leave records available.`,
                `${data.attendance.length} attendance records available.`,
                `${data.suggestions.length} AI suggestions available for People Ops.`,
              ]}
              insights={['No keystroke or screen tracking is shown in HR views.', 'People signals are derived only from backend employee and leave data currently available.']}
            />
          </div>
        </>
      ) : null}
    </>
  )
}

export default HRDashboard
