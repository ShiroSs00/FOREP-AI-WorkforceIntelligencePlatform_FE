import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, GitBranch, RefreshCw, Sparkles, UsersRound } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import LoadingState from '../../components/ui/LoadingState.jsx'
import { getAnalyticsDashboard } from '../../services/analyticsService.js'
import { normalizeObject, valueOf } from '../../services/responseNormalizer.js'

function healthLabel(score) {
  const numeric = Number(score)
  if (!Number.isFinite(numeric)) return 'Chưa có dữ liệu'
  if (numeric >= 80) return 'Tốt'
  if (numeric >= 60) return 'Cần theo dõi'
  return 'Rủi ro cao'
}

function DirectorDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboard, setDashboard] = useState({})

  const loadDashboard = useCallback(() => {
    setLoading(true)
    setError(null)
    getAnalyticsDashboard()
      .then((response) => setDashboard(normalizeObject(response)))
      .catch((err) => {
        setError(err)
        setDashboard({})
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let active = true
    getAnalyticsDashboard()
      .then((response) => { if (active) setDashboard(normalizeObject(response)) })
      .catch((err) => { if (active) setError(err) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const projectHealth = useMemo(() => dashboard.projectHealth ?? {}, [dashboard.projectHealth])
  const teamAnalytics = useMemo(() => dashboard.teamAnalytics ?? {}, [dashboard.teamAnalytics])
  const githubAnalytics = useMemo(() => dashboard.githubAnalytics ?? {}, [dashboard.githubAnalytics])
  const sprintAnalytics = useMemo(() => dashboard.sprintAnalytics ?? {}, [dashboard.sprintAnalytics])
  const workload = Array.isArray(dashboard.workloadByEmployee) ? dashboard.workloadByEmployee : []
  const latestSummaries = dashboard.aiInsightSummary?.latestSummaries ?? []

  const projectMetrics = useMemo(() => ([
    ['Health score', valueOf(projectHealth, ['healthScore'], '-')],
    ['Total issues', valueOf(projectHealth, ['totalIssues'], 0)],
    ['Overdue issues', valueOf(projectHealth, ['overdueIssues'], 0)],
    ['Blocked issues', valueOf(projectHealth, ['blockedIssues'], 0)],
    ['Completion rate', valueOf(projectHealth, ['completionRate'], '-')],
  ]), [projectHealth])

  return (
    <>
      <PageHeader
        eyebrow="Director / Organization Dashboard"
        title="Tổng quan organization"
        description="Sức khỏe dự án, phân tích team, GitHub analytics và AI insights từ dữ liệu backend."
        action={<Button variant="secondary" onClick={loadDashboard} disabled={loading}><RefreshCw size={16} />Làm mới</Button>}
      />
      {loading ? <LoadingState message="Đang tải dashboard organization..." /> : null}
      {error ? <ErrorState title="Không tải được dashboard organization" description={error.message} status={error.status} details={error.details} onRetry={loadDashboard} /> : null}
      {!loading && !error ? (
        <div className="grid gap-5">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)]">Sức khỏe dự án</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Module này dùng `projectHealth` trong analytics dashboard.</p>
              </div>
              <Badge>{healthLabel(valueOf(projectHealth, ['healthScore'], null))}</Badge>
            </div>
            {valueOf(projectHealth, ['totalIssues'], 0) ? (
              <div className="mt-5 grid gap-3 md:grid-cols-5">
                {projectMetrics.map(([label, value]) => <div key={label} className="rounded-lg border border-[var(--border)] p-3"><p className="text-xs text-[var(--muted)]">{label}</p><p className="mt-2 text-xl font-bold text-[var(--text)]">{String(value)}</p></div>)}
              </div>
            ) : (
              <EmptyState title="Chưa có dữ liệu issue." description="Hãy đồng bộ Jira hoặc GitHub để bắt đầu phân tích." />
            )}
          </Card>

          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <h2 className="font-semibold text-[var(--text)]">Phân tích team</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-[var(--border)] p-3"><UsersRound size={18} /><p className="mt-2 text-sm text-[var(--muted)]">Assigned issues</p><p className="text-2xl font-bold text-[var(--text)]">{valueOf(teamAnalytics, ['assignedIssues'], 0)}</p></div>
                <div className="rounded-lg border border-[var(--border)] p-3"><AlertTriangle size={18} /><p className="mt-2 text-sm text-[var(--muted)]">Unassigned issues</p><p className="text-2xl font-bold text-[var(--text)]">{valueOf(teamAnalytics, ['unassignedIssues'], 0)}</p></div>
                <div className="rounded-lg border border-[var(--border)] p-3"><GitBranch size={18} /><p className="mt-2 text-sm text-[var(--muted)]">Avg open / employee</p><p className="text-2xl font-bold text-[var(--text)]">{valueOf(teamAnalytics, ['averageOpenIssuesPerEmployee'], '-')}</p></div>
              </div>
              <div className="mt-4 space-y-2">
                {workload.slice(0, 6).map((item) => <div key={valueOf(item, ['employeeId'], valueOf(item, ['employeeName'], 'unknown'))} className={`rounded-lg border p-3 ${valueOf(item, ['burnoutRisk'], '') === 'HIGH' ? 'border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10' : 'border-[var(--border)]'}`}><div className="flex justify-between gap-3"><p className="font-semibold text-[var(--text)]">{valueOf(item, ['employeeName'], 'Nhân viên')}</p><Badge>{valueOf(item, ['burnoutRisk'], 'NONE')}</Badge></div><p className="mt-1 text-sm text-[var(--muted)]">{valueOf(item, ['teamName'], 'Team')} - workload {valueOf(item, ['workloadScore'], '-')}</p></div>)}
                {!workload.length ? <EmptyState title="Chưa có workload theo nhân viên." /> : null}
              </div>
            </Card>

            <Card>
              <h2 className="font-semibold text-[var(--text)]">AI Insights</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Tổng insight: {dashboard.aiInsightSummary?.totalInsights ?? 0}</p>
              <div className="mt-4 space-y-2">
                {latestSummaries.slice(0, 4).map((summary, index) => <div key={index} className="rounded-lg border border-[var(--border)] p-3"><Sparkles size={16} /><p className="mt-2 text-sm text-[var(--text)]">{summary}</p></div>)}
                {!latestSummaries.length ? <EmptyState title="Chưa có insight." description="Hãy đồng bộ dữ liệu và tạo insight." /> : null}
              </div>
            </Card>
          </div>

          {githubAnalytics.available ? (
            <Card>
              <h2 className="font-semibold text-[var(--text)]">Phân tích GitHub</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                {['repositoryCount', 'commitCount', 'pullRequestCount', 'openPullRequests', 'mergedPullRequests', 'reviewDelayRiskCount'].map((key) => <div key={key} className="rounded-lg border border-[var(--border)] p-3"><p className="text-xs text-[var(--muted)]">{key}</p><p className="mt-2 text-xl font-bold text-[var(--text)]">{valueOf(githubAnalytics, [key], 0)}</p></div>)}
              </div>
            </Card>
          ) : <Card><EmptyState title="Chưa có dữ liệu GitHub." description="Kết nối repository để xem commit và pull request analytics." /></Card>}

          {sprintAnalytics.available ? (
            <Card>
              <h2 className="font-semibold text-[var(--text)]">Sprint Analytics</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Sprint count: {valueOf(sprintAnalytics, ['sprintCount'], 0)} - Issues with sprint: {valueOf(sprintAnalytics, ['issuesWithSprint'], 0)} - Issues with story points: {valueOf(sprintAnalytics, ['issuesWithStoryPoints'], 0)}</p>
            </Card>
          ) : null}
        </div>
      ) : null}
    </>
  )
}

export default DirectorDashboard
