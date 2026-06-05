import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrainCircuit, CalendarDays, ClipboardList, RefreshCw } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import LoadingState from '../../components/ui/LoadingState.jsx'
import AIAnalystCard from '../../components/app/AIAnalystCard.jsx'
import PartialErrorNotice from '../../components/app/PartialErrorNotice.jsx'
import { getMyInsights } from '../../services/aiInsightService.js'
import { getMyAttendanceHistory } from '../../services/attendanceService.js'
import { getEmployeeDashboard } from '../../services/dashboardService.js'
import { getProfile } from '../../services/employeeService.js'
import { getMyLeaveHistory } from '../../services/leaveService.js'
import { getMyTasks } from '../../services/taskService.js'
import { getId, getName, getStatus, normalizeArray, normalizeObject, valueOf } from '../../services/responseNormalizer.js'

async function fetchEmployeeResources() {
  const profileResult = await getProfile().then((value) => ({ status: 'fulfilled', value })).catch((reason) => ({ status: 'rejected', reason }))
  const profile = profileResult.status === 'fulfilled' ? normalizeObject(profileResult.value) : null
  const employeeId = profile ? getId(profile) : null
  const hasEmployeeId = employeeId && employeeId !== 'missing-id'

  const rest = await Promise.allSettled([
    hasEmployeeId ? getEmployeeDashboard(employeeId) : Promise.resolve({ missingEmployeeId: true }),
    getMyTasks(),
    getMyLeaveHistory(),
    getMyAttendanceHistory(),
    getMyInsights(),
  ])
  return [profileResult, ...rest]
}

function EmployeeDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [failures, setFailures] = useState([])
  const [data, setData] = useState({ profile: null, dashboard: {}, tasks: [], leaves: [], attendance: [], insights: [] })

  const applyResults = useCallback((results) => {
    const [profile, dashboard, tasks, leaves, attendance, insights] = results
    setFailures(results.filter((result) => result.status === 'rejected'))
    setData({
      profile: profile.status === 'fulfilled' ? normalizeObject(profile.value) : null,
      dashboard: dashboard.status === 'fulfilled' ? normalizeObject(dashboard.value) : {},
      tasks: tasks.status === 'fulfilled' ? normalizeArray(tasks.value) : [],
      leaves: leaves.status === 'fulfilled' ? normalizeArray(leaves.value) : [],
      attendance: attendance.status === 'fulfilled' ? normalizeArray(attendance.value) : [],
      insights: insights.status === 'fulfilled' ? normalizeArray(insights.value) : [],
    })
    if (profile.status === 'rejected') setError(profile.reason)
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchEmployeeResources().then(applyResults).catch(setError).finally(() => setLoading(false))
  }, [applyResults])

  useEffect(() => {
    let active = true
    fetchEmployeeResources()
      .then((results) => { if (active) applyResults(results) })
      .catch((err) => { if (active) setError(err) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [applyResults])

  const displayName = data.profile ? getName(data.profile) : 'Employee'
  const metrics = useMemo(() => ([
    { label: 'Focus score', value: valueOf(data.profile, ['focusScore'], '-'), icon: BrainCircuit },
    { label: 'Open tasks', value: data.tasks.filter((task) => !['DONE', 'COMPLETED'].includes(String(getStatus(task)).toUpperCase())).length, icon: ClipboardList },
    { label: 'Leave records', value: data.leaves.length, icon: CalendarDays },
    { label: 'AI insights', value: data.insights.length, icon: BrainCircuit },
  ]), [data])

  return (
    <>
      <PageHeader
        eyebrow="Employee / Dashboard"
        title={`My workspace${displayName !== 'Employee' ? ` - ${displayName}` : ''}`}
        description="Personal tasks, attendance, leave history and AI insights for your account."
        action={<Button variant="secondary" onClick={load} disabled={loading}><RefreshCw size={16} />Refresh</Button>}
      />
      {loading ? <LoadingState message="Loading employee workspace..." /> : null}
      {error ? <ErrorState title="Unable to load employee dashboard" description={error.message} status={error.status} details={error.details} onRetry={load} /> : null}
      {!loading && !error ? <PartialErrorNotice failures={failures} /> : null}
      {!loading && !error ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon
              return <Card key={metric.label}><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-[var(--muted)]">{metric.label}</p><p className="mt-3 text-3xl font-bold text-[var(--text)]">{metric.value}</p></div><span className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300"><Icon size={20} /></span></div></Card>
            })}
          </div>
          <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-5">
              <Card>
                <h2 className="font-semibold text-[var(--text)]">My tasks</h2>
                <div className="mt-4 space-y-3">
                  {data.tasks.slice(0, 5).map((task) => <div key={getId(task)} className="rounded-lg border border-[var(--border)] p-3"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-[var(--text)]">{getName(task)}</p><Badge>{getStatus(task)}</Badge></div><p className="mt-1 text-sm text-[var(--muted)]">{valueOf(task, ['description'], 'No description')}</p></div>)}
                  {!data.tasks.length ? <EmptyState title="No personal tasks available." description="No task records are available for your account." /> : null}
                </div>
              </Card>
              <Card>
                <h2 className="font-semibold text-[var(--text)]">My attendance and leave</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-[var(--border)] p-3"><p className="text-sm text-[var(--muted)]">Attendance records</p><p className="mt-2 text-2xl font-bold text-[var(--text)]">{data.attendance.length}</p></div>
                  <div className="rounded-lg border border-[var(--border)] p-3"><p className="text-sm text-[var(--muted)]">Leave records</p><p className="mt-2 text-2xl font-bold text-[var(--text)]">{data.leaves.length}</p></div>
                </div>
              </Card>
            </div>
            <AIAnalystCard
              role="Employee"
              title="Personal AI Analyst"
              signals={data.insights.slice(0, 3).map((insight) => valueOf(insight, ['summary', 'fullAnalysis'], 'Personal insight available'))}
              insights={[
                data.dashboard?.missingEmployeeId ? 'Employee profile is missing a stable employee id.' : 'Personal dashboard data was requested when employee id was available.',
                'Only employee-scoped data is used in this workspace.',
              ]}
            />
          </div>
        </>
      ) : null}
    </>
  )
}

export default EmployeeDashboard
