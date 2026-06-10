import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import SearchAndFilterBar from '../components/SearchAndFilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { useRole } from '../context/role.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { generateInsight, getInsightsByOrganization, getManagedTeamInsights, getMyInsights } from '../services/aiInsightService.js'
import { adoptSuggestion, getManagedTeamSuggestions, getSuggestions, getSuggestionsByEmployee, getSuggestionsByOrganization } from '../services/aiSuggestionService.js'
import { extractBackendMessage, getDate, getId, getName, valueOf } from '../services/responseNormalizer.js'

const pageCopy = {
  admin: ['Platform AI Insights', 'Organization-level AI insights for the current account context.'],
  manager: ['Team AI Insights', 'AI insights for teams you manage.'],
  hr: ['People AI Insights', 'AI insights for People Ops workflows.'],
  employee: ['My AI Insights', 'AI insights for your personal workspace.'],
}

function AIInsightsPage() {
  const { selectedRole, accountContext } = useRole()
  const organizationId = accountContext.organizationId
  const employeeId = accountContext.employeeId
  const missingOrganizationContext = ['admin', 'hr'].includes(selectedRole) && !organizationId
  const loadInsights = () => {
    if (selectedRole === 'employee') return getMyInsights()
    if (selectedRole === 'manager') return getManagedTeamInsights()
    if (!organizationId) return Promise.resolve([])
    return getInsightsByOrganization(organizationId)
  }
  const { data: insights, loading, error, apiPending, retry } = useServiceData(loadInsights, [selectedRole, organizationId])
  const loadSuggestions = () => {
    if (selectedRole === 'employee') return employeeId ? getSuggestionsByEmployee(employeeId) : Promise.resolve([])
    if (selectedRole === 'manager') return getManagedTeamSuggestions()
    if (selectedRole === 'admin' || selectedRole === 'hr') return organizationId ? getSuggestionsByOrganization(organizationId) : getSuggestions()
    return getSuggestions()
  }
  const { data: suggestions, loading: suggestionsLoading, error: suggestionsError, retry: retrySuggestions } = useServiceData(loadSuggestions, [selectedRole, organizationId, employeeId])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [severity, setSeverity] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const filtered = useMemo(() => insights.filter((insight) => {
    const insightCategory = valueOf(insight, ['category', 'insightType'], 'General')
    const insightSeverity = valueOf(insight, ['severity'], 'Info')
    return `${getName(insight)} ${valueOf(insight, ['fullAnalysis', 'content', 'description', 'summary'], '')}`.toLowerCase().includes(search.toLowerCase()) && (!category || insightCategory === category) && (!severity || insightSeverity === severity)
  }), [insights, search, category, severity])

  const handleGenerateInsight = async () => {
    setActionError('')
    setActionMessage('')
    try {
      const response = await generateInsight(employeeId)
      setActionMessage(extractBackendMessage(response, 'AI insight generated.'))
      retry()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const handleAdoptSuggestion = async (suggestion) => {
    setActionError('')
    setActionMessage('')
    try {
      const response = await adoptSuggestion(getId(suggestion))
      setActionMessage(extractBackendMessage(response, 'AI suggestion adopted.'))
      retrySuggestions()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <>
      <PageHeader title={pageCopy[selectedRole][0]} description={pageCopy[selectedRole][1]} action={<Button disabled={!employeeId} onClick={handleGenerateInsight}>Generate Insight</Button>} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load insights" description={error.message} status={error.status} details={error.details} onRetry={retry} /> : null}
      {suggestionsError ? <ErrorState title="Unable to load AI suggestions" description={suggestionsError.message} status={suggestionsError.status} details={suggestionsError.details} onRetry={retrySuggestions} /> : null}
      {apiPending ? <ErrorState description="Connect AI insight APIs to display generated insights." onRetry={retry} /> : null}
      {actionMessage ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{actionMessage}</p> : null}
      {actionError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
      {!loading && !error && !apiPending && missingOrganizationContext ? <EmptyState title="Required user or organization context is not available yet." description="Organization-scoped AI insights will load after the backend provides organization context for the signed-in user." /> : null}
      {!loading && !error && !apiPending && !missingOrganizationContext ? (
        <>
          <SearchAndFilterBar search={search} onSearchChange={setSearch} filters={[
            { label: 'All categories', value: category, onChange: setCategory, options: [...new Set(insights.map((item) => valueOf(item, ['category', 'insightType'], '')).filter(Boolean))] },
            { label: 'All severity', value: severity, onChange: setSeverity, options: [...new Set(insights.map((item) => valueOf(item, ['severity'], '')).filter(Boolean))] },
          ]} />
          <div className="grid gap-4 lg:grid-cols-2">{filtered.map((insight, index) => <Card key={`${getId(insight)}-${index}`} className="page-animate opacity-0"><div className="flex gap-2"><Badge>{valueOf(insight, ['category', 'insightType'], 'General')}</Badge><Badge>{valueOf(insight, ['severity'], 'Info')}</Badge></div><h2 className="mt-4 font-semibold text-[var(--text)]">{getName(insight)}</h2><p className="mt-2 text-sm text-[var(--muted)]">{valueOf(insight, ['fullAnalysis', 'content', 'description', 'summary'], 'No description')}</p><p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-[var(--text)] dark:bg-slate-900">Confidence: {valueOf(insight, ['confidenceScore', 'confidence'], 'Not provided by API')}</p><p className="mt-3 text-xs text-[var(--muted)]">{getDate(insight)}</p></Card>)}</div>
          {!filtered.length ? <EmptyState title="No AI insights available." /> : null}
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-[var(--text)]">AI Suggestions</h2>
            {suggestionsLoading ? <LoadingState /> : null}
            <div className="grid gap-4 lg:grid-cols-2">
              {suggestions.map((suggestion, index) => <Card key={`${getId(suggestion)}-${index}`} className="page-animate opacity-0"><div className="flex flex-wrap gap-2"><Badge>{valueOf(suggestion, ['suggestionType'], 'Suggestion')}</Badge><Badge>{valueOf(suggestion, ['isAdopted', 'adopted'], false) ? 'Adopted' : 'Open'}</Badge></div><h3 className="mt-4 font-semibold text-[var(--text)]">{getName(suggestion)}</h3><p className="mt-2 text-sm text-[var(--muted)]">{valueOf(suggestion, ['description', 'content'], 'No description')}</p><p className="mt-3 text-xs text-[var(--muted)]">Confidence: {valueOf(suggestion, ['confidenceScore'], 'Not provided')}</p><Button className="mt-4" variant="secondary" disabled={Boolean(valueOf(suggestion, ['isAdopted', 'adopted'], false))} onClick={() => handleAdoptSuggestion(suggestion)}>Adopt Suggestion</Button></Card>)}
            </div>
            {!suggestionsLoading && !suggestions.length ? <EmptyState title="No AI suggestions available." /> : null}
          </div>
        </>
      ) : null}
    </>
  )
}

export default AIInsightsPage
