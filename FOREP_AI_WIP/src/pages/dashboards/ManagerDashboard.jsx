import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CalendarClock, CheckCircle2, GitBranch, RefreshCw } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import LoadingState from '../../components/ui/LoadingState.jsx'
import AIAnalystCard from '../../components/app/AIAnalystCard.jsx'
import PartialErrorNotice from '../../components/app/PartialErrorNotice.jsx'
import { getManagedTeamInsights } from '../../services/aiInsightService.js'
import { getManagedTeamsWorkloadHistory } from '../../services/analyticsService.js'
import { getManagedTeamAttendance } from '../../services/attendanceService.js'
import { getNotifications } from '../../services/notificationService.js'
import { getActiveSprints } from '../../services/sprintService.js'
import { getManagedTeamTasks } from '../../services/taskService.js'
import { getMyManagedTeams } from '../../services/teamService.js'
import { getId, getName, getStatus, normalizeArray, valueOf } from '../../services/responseNormalizer.js'

function fetchManagerResources() {
  return Promise.allSettled([
    getManagedTeamTasks(),
    getMyManagedTeams(),
    getActiveSprints(),
    getManagedTeamAttendance(),
    getManagedTeamsWorkloadHistory(),
    getManagedTeamInsights(),
    getNotifications(),
  ])
}

function countWhere(rows, predicate) {
  return rows.filter(predicate).length
}

function ManagerDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [failures, setFailures] = useState([])
  const [data, setData] = useState({
    tasks: [],
    teams: [],
    sprints: [],
    attendance: [],
    workload: [],
    insights: [],
    notifications: [],
  })

  const applyResults = useCallback((results) => {
    const [tasks, teams, sprints, attendance, workload, insights, notifications] = results
    setFailures(results.filter((result) => result.status === 'rejected'))
    setData({
      tasks: tasks.status === 'fulfilled' ? normalizeArray(tasks.value) : [],
      teams: teams.status === 'fulfilled' ? normalizeArray(teams.value) : [],
      sprints: sprints.status === 'fulfilled' ? normalizeArray(sprints.value) : [],
      attendance: attendance.status === 'fulfilled' ? normalizeArray(attendance.value) : [],
      workload: workload.status === 'fulfilled' ? normalizeArray(workload.value) : [],
      insights: insights.status === 'fulfilled' ? normalizeArray(insights.value) : [],
      notifications: notifications.status === 'fulfilled' ? normalizeArray(notifications.value) : [],
    })
    if (results.every((result) => result.status === 'rejected')) setError(results[0].reason)
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchManagerResources().then(applyResults).catch(setError).finally(() => setLoading(false))
  }, [applyResults])

  useEffect(() => {
    let active = true
    fetchManagerResources()
      .then((results) => { if (active) applyResults(results) })
      .catch((err) => { if (active) setError(err) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [applyResults])

  const metrics = useMemo(() => ([
    { label: 'Managed teams', value: data.teams.length, icon: GitBranch },
    { label: 'Team tasks', value: data.tasks.length, icon: CheckCircle2 },
    { label: 'Overdue tasks', value: countWhere(data.tasks, (task) => String(getStatus(task)).toUpperCase().includes('OVERDUE')), icon: AlertTriangle },
    { label: 'Active sprints', value: data.sprints.length, icon: CalendarClock },
  ]), [data])

  return (
    <>
      <PageHeader
        eyebrow="Manager / Dashboard"
        title="Team operations"
        description="Team overview, workload, task progress, sprint status and AI insight data for managed teams."
        action={<Button variant="secondary" onClick={load} disabled={loading}><RefreshCw size={16} />Refresh</Button>}
      />
      {loading ? <LoadingState message="Loading manager dashboard..." /> : null}
      {error ? <ErrorState title="Unable to load manager dashboard" description={error.message} status={error.status} details={error.details} onRetry={load} /> : null}
      {!loading && !error ? <PartialErrorNotice failures={failures} /> : null}
      {!loading && !error ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon
              return <Card key={metric.label}><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-[var(--muted)]">{metric.label}</p><p className="mt-3 text-3xl font-bold text-[var(--text)]">{metric.value}</p></div><span className="grid h-11 w-11 place-items-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"><Icon size={20} /></span></div></Card>
            })}
          </div>
          <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-5">
              <Card>
                <h2 className="font-semibold text-[var(--text)]">Managed team tasks</h2>
                <div className="mt-4 space-y-3">
                  {data.tasks.slice(0, 5).map((task) => <div key={getId(task)} className="rounded-lg border border-[var(--border)] p-3"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-[var(--text)]">{getName(task)}</p><Badge>{getStatus(task)}</Badge></div><p className="mt-1 text-sm text-[var(--muted)]">{valueOf(task, ['teamName', 'team'], 'No team')} - {valueOf(task, ['assigneeName', 'assignee'], 'Not assigned')}</p></div>)}
                  {!data.tasks.length ? <EmptyState title="No managed team tasks available." description="No task records are available for your managed teams." /> : null}
                </div>
              </Card>
              <Card>
                <h2 className="font-semibold text-[var(--text)]">Sprint and attendance summary</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-[var(--border)] p-3">
                    <p className="text-sm text-[var(--muted)]">Active sprints</p>
                    <p className="mt-2 text-2xl font-bold text-[var(--text)]">{data.sprints.length}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--border)] p-3">
                    <p className="text-sm text-[var(--muted)]">Attendance records</p>
                    <p className="mt-2 text-2xl font-bold text-[var(--text)]">{data.attendance.length}</p>
                  </div>
                </div>
              </Card>
            </div>
            <AIAnalystCard
              role="Manager"
              title="Team AI Analyst"
              signals={data.insights.slice(0, 3).map((insight) => valueOf(insight, ['summary', 'fullAnalysis'], 'AI insight available'))}
              insights={[
                `${data.workload.length} workload history records available.`,
                `${data.attendance.length} attendance records available for managed teams.`,
                `${data.notifications.length} notifications available.`,
              ]}
            />
          </div>
        </>
      ) : null}
    </>
  )
}

export default ManagerDashboard
