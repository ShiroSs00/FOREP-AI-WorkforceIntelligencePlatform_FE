import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import SearchAndFilterBar from '../components/SearchAndFilterBar.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { useRole } from '../context/role.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { getManagedTeamsWorkloadHistory, getMyWorkloadHistory, getOrganizationWorkloadHistory } from '../services/analyticsService.js'
import { getDate, getId, getName, getStatus, valueOf } from '../services/responseNormalizer.js'

const pageCopy = {
  admin: ['Platform Analytics', 'Organization workload analytics for the current account context.'],
  manager: ['Team Analytics', 'Workload analytics for teams you manage.'],
  hr: ['People Analytics', 'People and workload signals for People Ops workflows.'],
  employee: ['Personal Insights', 'Your workload history and personal analytics.'],
}

function AnalyticsPage() {
  const { selectedRole, accountContext } = useRole()
  const organizationId = accountContext.organizationId
  const missingOrganizationContext = ['admin', 'hr'].includes(selectedRole) && !organizationId
  const loadAnalytics = () => {
    if (selectedRole === 'employee') return getMyWorkloadHistory()
    if (selectedRole === 'manager') return getManagedTeamsWorkloadHistory()
    if (!organizationId) return Promise.resolve([])
    return getOrganizationWorkloadHistory(organizationId)
  }
  const { data: analytics, loading, error, apiPending, retry } = useServiceData(loadAnalytics, [selectedRole, organizationId])
  const [search, setSearch] = useState('')
  const filteredAnalytics = useMemo(() => analytics.filter((item) => `${getName(item)} ${getStatus(item)} ${valueOf(item, ['summary', 'description', 'content'], '')}`.toLowerCase().includes(search.toLowerCase())), [analytics, search])
  return (
    <>
      <PageHeader title={pageCopy[selectedRole][0]} description={pageCopy[selectedRole][1]} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load analytics" description={error.message} status={error.status} details={error.details} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="Connect analytics APIs to display workload and productivity data." onRetry={retry} /> : null}
      {!loading && !error && missingOrganizationContext ? <EmptyState title="Required user or organization context is not available yet." description="Organization-scoped analytics will load after the backend provides organization context for the signed-in user." /> : null}
      {!loading && !error && !missingOrganizationContext && analytics.length ? (
        <>
          <SearchAndFilterBar search={search} onSearchChange={setSearch} filters={[]} />
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredAnalytics.map((item, index) => <Card key={`${getId(item)}-${index}`} className="page-animate opacity-0"><h2 className="font-semibold text-[var(--text)]">{getName(item)}</h2><p className="mt-2 text-sm text-[var(--muted)]">Status: {getStatus(item)}</p><p className="mt-2 text-sm text-[var(--muted)]">Date: {getDate(item)}</p><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{valueOf(item, ['summary', 'description', 'content'], 'Analytics record')}</p></Card>)}
          </div>
          {!filteredAnalytics.length ? <EmptyState title="No analytics match your search." /> : null}
        </>
      ) : null}
      {!loading && !error && !missingOrganizationContext && !analytics.length ? <EmptyState title="No analytics available." description="No workload analytics records are available for this role." /> : null}
    </>
  )
}

export default AnalyticsPage
