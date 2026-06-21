import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import SearchAndFilterBar from '../components/SearchAndFilterBar.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { useRole } from '../context/role.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { getManagedTeamsWorkloadHistory, getMyWorkloadHistory, getOrganizationWorkloadHistory, getTeamWorkloadHistory, getWorkloadHistory } from '../services/analyticsService.js'
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
  const [apiScope, setApiScope] = useState(selectedRole === 'employee' ? 'my' : selectedRole === 'manager' ? 'managed' : organizationId ? 'organization' : 'team')
  const [scopeValue, setScopeValue] = useState(organizationId ?? '')
  const missingOrganizationContext = ['admin', 'hr'].includes(selectedRole) && apiScope === 'organization' && !scopeValue
  const loadAnalytics = () => {
    if (apiScope === 'my') return getMyWorkloadHistory()
    if (apiScope === 'managed') return getManagedTeamsWorkloadHistory()
    if (apiScope === 'organization') return scopeValue ? getOrganizationWorkloadHistory(scopeValue) : Promise.resolve([])
    if (apiScope === 'team') return scopeValue ? getTeamWorkloadHistory(scopeValue) : Promise.resolve([])
    if (apiScope === 'employee') return scopeValue ? getWorkloadHistory(scopeValue) : Promise.resolve([])
    return Promise.resolve([])
  }
  const { data: analytics, loading, error, apiPending, retry } = useServiceData(loadAnalytics, [selectedRole, apiScope, scopeValue])
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
