import AppLayout from '../layouts/AppLayout.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { useServiceData } from '../hooks/useServiceData.js'
import { getAnalyticsSummary } from '../services/analyticsService.js'

const dashboardPanels = ['Operational Overview', 'Recent Events', 'Workload Signals', 'AI Insight Preview', 'Pending Leave Requests', 'Notification Summary']

function DashboardPage() {
  const { data, loading, error, apiPending } = useServiceData(getAnalyticsSummary, [])
  const panels = Array.isArray(data?.overview) ? data.overview : []

  return (
    <AppLayout title="Dashboard">
      <PageHeader title="Operational Dashboard" description="Product dashboard prepared for backend operational intelligence APIs." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load dashboard" description={error.message} /> : null}
      {apiPending ? <ErrorState description="Connect backend API to display operational data." /> : null}
      {!loading && !error && !apiPending ? (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {(panels.length ? panels : dashboardPanels.map((title) => ({ title, description: 'Connect backend API to display operational data.' }))).map((panel) => (
            <Card key={panel.title} className="page-animate opacity-0">
              <h2 className="text-lg font-semibold text-[var(--text)]">{panel.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{panel.description}</p>
            </Card>
          ))}
        </div>
      ) : null}
      {!loading && !error && !apiPending && !panels.length ? <EmptyState title="No dashboard data yet" description="Connect backend API to display operational data." /> : null}
    </AppLayout>
  )
}

export default DashboardPage
