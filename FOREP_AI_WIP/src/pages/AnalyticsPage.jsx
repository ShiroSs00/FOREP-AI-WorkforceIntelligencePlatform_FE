import AppLayout from '../layouts/AppLayout.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { useServiceData } from '../hooks/useServiceData.js'
import { getAnalyticsSummary } from '../services/analyticsService.js'

const panels = ['Workload Distribution', 'Task Status Overview', 'Overdue Pattern', 'Team Contribution', 'Attendance Signals', 'Burnout Risk Signals']

function AnalyticsPage() {
  const { loading, error, apiPending } = useServiceData(getAnalyticsSummary, [])
  return (
    <AppLayout title="Analytics">
      <PageHeader title="Analytics Workspace" description="Conceptual analytics panels prepared for backend workload and productivity APIs." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load analytics" description={error.message} /> : null}
      {apiPending ? <ErrorState description="Connect analytics APIs to display workload and productivity data." /> : null}
      {!loading && !error ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {panels.map((panel) => <Card key={panel} className="page-animate opacity-0"><h2 className="font-semibold text-[var(--text)]">{panel}</h2><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{panel} will appear here after event data is connected.</p><div className="mt-5 h-28 rounded-lg border border-dashed border-[var(--border)] bg-slate-50 dark:bg-slate-900" /></Card>)}
        </div>
      ) : null}
    </AppLayout>
  )
}

export default AnalyticsPage
