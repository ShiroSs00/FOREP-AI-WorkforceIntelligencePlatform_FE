import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import SearchAndFilterBar from '../components/SearchAndFilterBar.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { useRole } from '../context/role.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { getAnalyticsDashboard, getManagedTeamsWorkloadHistory, getMyAnalyticsSummary, getMyBurnout, getMyWorkloadHistory, getOrganizationWorkloadHistory, getTeamAnalyticsSummary, getTeamBurnout, getTeamWorkloadHistory, getUserAnalyticsSummary, getUserBurnout, getWorkloadHistory } from '../services/analyticsService.js'
import { getDate, getId, getName, getStatus, valueOf } from '../services/responseNormalizer.js'

const pageCopy = {
  admin: ['Phân tích hệ thống', 'Admin chỉ xem tổng quan hệ thống, không vận hành workload chi tiết.'],
  director: ['Phân tích organization', 'Project health, team analytics, GitHub analytics và burnout risk trong organization.'],
  manager: ['Workload team', 'Workload analytics cho team/project được phân quyền.'],
  employee: ['My Workload', 'Workload và burnout risk cá nhân của bạn.'],
}

function AnalyticsPage() {
  const { selectedRole, accountContext } = useRole()
  const organizationId = accountContext.organizationId
  const [apiScope, setApiScope] = useState(selectedRole === 'employee' ? 'my' : selectedRole === 'manager' ? 'managed' : organizationId ? 'organization' : 'team')
  const [scopeValue, setScopeValue] = useState(organizationId ?? '')
  const missingOrganizationContext = ['admin', 'director'].includes(selectedRole) && apiScope === 'organization' && !scopeValue
  const loadAnalytics = () => {
    if (apiScope === 'my') return getMyWorkloadHistory()
    if (apiScope === 'managed') return getManagedTeamsWorkloadHistory()
    if (apiScope === 'organization') return scopeValue ? getOrganizationWorkloadHistory(scopeValue) : Promise.resolve([])
    if (apiScope === 'team') return scopeValue ? getTeamWorkloadHistory(scopeValue) : Promise.resolve([])
    if (apiScope === 'employee') return scopeValue ? getWorkloadHistory(scopeValue) : Promise.resolve([])
    return Promise.resolve([])
  }
  const { data: analytics, loading, error, apiPending, retry } = useServiceData(loadAnalytics, [selectedRole, apiScope, scopeValue])
  const { data: dashboard, loading: dashboardLoading, error: dashboardError, retry: retryDashboard } = useServiceData(getAnalyticsDashboard, [selectedRole])
  const [search, setSearch] = useState('')
  const [summaryScope, setSummaryScope] = useState(selectedRole === 'employee' ? 'my' : 'team')
  const [summaryScopeValue, setSummaryScopeValue] = useState('')
  const [summary, setSummary] = useState(null)
  const [burnout, setBurnout] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState(null)
  const filteredAnalytics = useMemo(() => analytics.filter((item) => `${getName(item)} ${getStatus(item)} ${valueOf(item, ['summary', 'description', 'content'], '')}`.toLowerCase().includes(search.toLowerCase())), [analytics, search])
  const loadSummaryAndBurnout = async () => {
    setSummaryError(null)
    if (summaryScope !== 'my' && !summaryScopeValue) {
      setSummary(null)
      setBurnout(null)
      setSummaryError({ message: 'Paste an employee or team UUID before loading this scope.' })
      return
    }

    setSummaryLoading(true)
    try {
      const [summaryResult, burnoutResult] = await Promise.allSettled([
        summaryScope === 'my' ? getMyAnalyticsSummary() : summaryScope === 'team' ? getTeamAnalyticsSummary(summaryScopeValue) : getUserAnalyticsSummary(summaryScopeValue),
        summaryScope === 'my' ? getMyBurnout() : summaryScope === 'team' ? getTeamBurnout(summaryScopeValue) : getUserBurnout(summaryScopeValue),
      ])
      setSummary(summaryResult.status === 'fulfilled' ? summaryResult.value : null)
      setBurnout(burnoutResult.status === 'fulfilled' ? burnoutResult.value : null)
      if (summaryResult.status === 'rejected' || burnoutResult.status === 'rejected') {
        setSummaryError({
          message: 'Some analytics summary or burnout data could not be loaded.',
          details: { summary: summaryResult.reason, burnout: burnoutResult.reason },
        })
      }
    } finally {
      setSummaryLoading(false)
    }
  }

  return (
    <>
      <PageHeader title={pageCopy[selectedRole][0]} description={pageCopy[selectedRole][1]} />
      {loading ? <LoadingState /> : null}
      {dashboardLoading ? <LoadingState message="Loading analytics dashboard..." /> : null}
      {dashboardError ? <ErrorState title="Unable to load analytics dashboard" description={dashboardError.message} status={dashboardError.status} details={dashboardError.details} onRetry={retryDashboard} /> : null}
      {!dashboardLoading && !dashboardError ? (
        <div className="mb-6 grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card><p className="text-sm text-[var(--muted)]">Total tasks</p><p className="mt-2 text-2xl font-bold text-[var(--text)]">{valueOf(dashboard, ['totalTasks'], 0)}</p></Card>
            <Card><p className="text-sm text-[var(--muted)]">Completed tasks</p><p className="mt-2 text-2xl font-bold text-[var(--text)]">{valueOf(dashboard, ['completedTasks'], 0)}</p></Card>
            <Card><p className="text-sm text-[var(--muted)]">Overdue tasks</p><p className="mt-2 text-2xl font-bold text-[var(--text)]">{valueOf(dashboard, ['overdueTasks'], 0)}</p></Card>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="font-semibold text-[var(--text)]">Burnout risk count</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {['NONE', 'WATCH', 'MEDIUM', 'HIGH'].map((risk) => <div key={risk} className="rounded-lg border border-[var(--border)] p-3"><p className="text-xs tracking-[0.16em] text-[var(--muted)]">{risk}</p><p className="mt-2 text-xl font-bold text-[var(--text)]">{dashboard?.burnoutRiskCount?.[risk] ?? 0}</p></div>)}
              </div>
            </Card>
            <Card>
              <h2 className="font-semibold text-[var(--text)]">AI insight summary</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Total insights: {dashboard?.aiInsightSummary?.totalInsights ?? 0}</p>
              <div className="mt-3 space-y-2">
                {(dashboard?.aiInsightSummary?.latestSummaries ?? []).slice(0, 3).map((summary, index) => <p key={index} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-[var(--text)] dark:bg-slate-900">{summary}</p>)}
                {!(dashboard?.aiInsightSummary?.latestSummaries ?? []).length ? <p className="text-sm text-[var(--muted)]">No AI summaries returned yet.</p> : null}
              </div>
            </Card>
          </div>
          <Card>
            <h2 className="font-semibold text-[var(--text)]">Recent activity</h2>
            <div className="mt-4 grid gap-2">
              {(dashboard?.recentActivity ?? []).slice(0, 5).map((item, index) => <div key={`${valueOf(item, ['taskId'], index)}-${index}`} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"><p className="font-semibold text-[var(--text)]">{valueOf(item, ['title'], 'Untitled task')}</p><p className="text-[var(--muted)]">{valueOf(item, ['status'], '-')} · {valueOf(item, ['sourceProvider'], 'INTERNAL')} · {valueOf(item, ['assigneeName'], 'Unassigned')}</p></div>)}
              {!(dashboard?.recentActivity ?? []).length ? <p className="text-sm text-[var(--muted)]">No recent activity returned yet.</p> : null}
            </div>
          </Card>
          <Card>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-semibold text-[var(--text)]">Summary and burnout check</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Loads the new summary and burnout endpoints for my account, a team, or an employee.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-[180px_1fr_auto]">
                <select className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]" value={summaryScope} onChange={(event) => { setSummaryScope(event.target.value); setSummaryScopeValue('') }}>
                  <option value="my">My summary</option>
                  <option value="team">Team UUID</option>
                  <option value="employee">Employee UUID</option>
                </select>
                <input className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]" disabled={summaryScope === 'my'} placeholder={summaryScope === 'my' ? 'No UUID required' : 'Paste UUID'} value={summaryScopeValue} onChange={(event) => setSummaryScopeValue(event.target.value)} />
                <button className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60" disabled={summaryLoading} type="button" onClick={loadSummaryAndBurnout}>{summaryLoading ? 'Loading...' : 'Load'}</button>
              </div>
            </div>
            {summaryError ? <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">{summaryError.message}</div> : null}
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Analytics summary</p>
                <p className="mt-3 text-sm text-[var(--muted)]">{summary ? valueOf(summary, ['summary', 'description', 'content', 'message'], 'Summary data returned by backend.') : 'No summary loaded yet.'}</p>
                {summary ? <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">{JSON.stringify(summary, null, 2)}</pre> : null}
              </div>
              <div className="rounded-lg border border-[var(--border)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Burnout signal</p>
                <p className="mt-3 text-sm text-[var(--muted)]">Risk: {burnout ? valueOf(burnout, ['riskLevel', 'burnoutRisk', 'status'], 'Returned') : 'No burnout data loaded yet.'}</p>
                {burnout ? <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">{JSON.stringify(burnout, null, 2)}</pre> : null}
              </div>
            </div>
          </Card>
        </div>
      ) : null}
      {error ? <ErrorState title="Unable to load analytics" description={error.message} status={error.status} details={error.details} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="Connect analytics APIs to display workload and productivity data." onRetry={retry} /> : null}
      {!loading && !error && missingOrganizationContext ? <EmptyState title="Required user or organization context is not available yet." description="Organization-scoped analytics will load after the backend provides organization context for the signed-in user." /> : null}
      {!loading && !error && !missingOrganizationContext && analytics.length ? (
        <>
          <div className="mb-4 grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 lg:grid-cols-[1fr_220px_260px_auto] lg:items-end">
            <label>
              <span className="text-sm font-medium text-[var(--text)]">Search</span>
              <input className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]" placeholder="Search analytics..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <label>
              <span className="text-sm font-medium text-[var(--text)]">API scope</span>
              <select className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]" value={apiScope} onChange={(event) => { setApiScope(event.target.value); setScopeValue(event.target.value === 'organization' ? organizationId ?? '' : '') }}>
                <option value="my">My workload</option>
                <option value="managed">Managed teams</option>
                <option value="organization">Organization ID</option>
                <option value="team">Team ID</option>
                <option value="employee">Employee ID</option>
              </select>
            </label>
            <label>
              <span className="text-sm font-medium text-[var(--text)]">Scope value</span>
              <input className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]" disabled={['my', 'managed'].includes(apiScope)} placeholder={['my', 'managed'].includes(apiScope) ? 'No value required' : 'Paste UUID'} value={scopeValue} onChange={(event) => setScopeValue(event.target.value)} />
            </label>
            <button className="rounded-lg border border-[var(--border)] px-4 py-2 text-[var(--text)]" type="button" onClick={retry}>Load</button>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredAnalytics.map((item, index) => <Card key={`${getId(item)}-${index}`} className="page-animate opacity-0"><h2 className="font-semibold text-[var(--text)]">{getName(item)}</h2><p className="mt-2 text-sm text-[var(--muted)]">Status: {getStatus(item)}</p><p className="mt-2 text-sm text-[var(--muted)]">Date: {getDate(item)}</p><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{valueOf(item, ['summary', 'description', 'content'], 'Analytics record')}</p></Card>)}
          </div>
          {!filteredAnalytics.length ? <EmptyState title="No analytics match your search." /> : null}
        </>
      ) : null}
      {!loading && !error && !missingOrganizationContext && !analytics.length ? (
        <>
          <SearchAndFilterBar search={search} onSearchChange={setSearch} filters={[]} />
          <EmptyState title="No analytics available." description="No workload analytics records are available for this role or selected API scope." />
        </>
      ) : null}
    </>
  )
}

export default AnalyticsPage
