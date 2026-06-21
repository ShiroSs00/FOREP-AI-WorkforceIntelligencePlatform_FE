import { useEffect, useMemo, useState } from 'react'
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
import { generateInsight, getAiRuntimeStatus, getInsightsByEmployee, getInsightsByOrganization, getInsightsByProject, getInsightsByTeam, getManagedTeamInsights, getMyInsights } from '../services/aiInsightService.js'
import { adoptSuggestion, getManagedTeamSuggestions, getSuggestionsByEmployee, getSuggestionsByOrganization, getSuggestionsByTeam } from '../services/aiSuggestionService.js'
import { extractBackendMessage, getDate, getId, valueOf } from '../services/responseNormalizer.js'

const pageCopy = {
  admin: ['Platform AI Insights', 'Organization-level AI insights for the current account context.'],
  manager: ['Team AI Insights', 'AI insights for teams you manage.'],
  hr: ['People AI Insights', 'AI insights for People Ops workflows.'],
  employee: ['My AI Insights', 'AI insights for your personal workspace.'],
}

function insightTitle(insight) {
  return valueOf(insight, ['summary'], valueOf(insight, ['insightType'], 'AI insight'))
}

function suggestionTitle(suggestion) {
  const type = valueOf(suggestion, ['suggestionType'], 'Suggestion')
  const sourceTask = valueOf(suggestion, ['sourceTaskTitle'], '')
  if (sourceTask && sourceTask !== '-') return `${type}: ${sourceTask}`
  const source = valueOf(suggestion, ['sourceEmployeeName'], '')
  const target = valueOf(suggestion, ['targetEmployeeName'], '')
  if (source && source !== '-' && target && target !== '-') return `${type}: ${source} to ${target}`
  return type
}

function formatConfidence(value) {
  if (value === undefined || value === null || value === '-' || value === '') return 'Not provided'
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return value
  return numeric <= 1 ? `${Math.round(numeric * 100)}%` : `${numeric}%`
}

function parseFullAnalysis(value) {
  if (!value) return null
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function AIInsightsPage() {
  const { selectedRole, accountContext } = useRole()
  const organizationId = accountContext.organizationId
  const employeeId = accountContext.employeeId
  const [apiScope, setApiScope] = useState(selectedRole === 'employee' ? 'my' : selectedRole === 'manager' ? 'managed' : organizationId ? 'organization' : 'employee')
  const [scopeValue, setScopeValue] = useState(organizationId || employeeId || '')
  const missingOrganizationContext = ['admin', 'hr'].includes(selectedRole) && apiScope === 'organization' && !scopeValue
  const loadInsights = () => {
    if (apiScope === 'my') return getMyInsights()
    if (apiScope === 'managed') return getManagedTeamInsights()
    if (apiScope === 'organization') return scopeValue ? getInsightsByOrganization(scopeValue) : Promise.resolve([])
    if (apiScope === 'team') return scopeValue ? getInsightsByTeam(scopeValue) : Promise.resolve([])
    if (apiScope === 'project') return scopeValue ? getInsightsByProject(scopeValue) : Promise.resolve([])
    if (apiScope === 'employee') return scopeValue ? getInsightsByEmployee(scopeValue) : Promise.resolve([])
    return Promise.resolve([])
  }
  const { data: insights, loading, error, apiPending, retry } = useServiceData(loadInsights, [selectedRole, apiScope, scopeValue])
  const loadSuggestions = () => {
    if (apiScope === 'my') return employeeId ? getSuggestionsByEmployee(employeeId) : Promise.resolve([])
    if (apiScope === 'managed') return getManagedTeamSuggestions()
    if (apiScope === 'organization') return scopeValue ? getSuggestionsByOrganization(scopeValue) : Promise.resolve([])
    if (apiScope === 'team') return scopeValue ? getSuggestionsByTeam(scopeValue) : Promise.resolve([])
    if (apiScope === 'employee') return scopeValue ? getSuggestionsByEmployee(scopeValue) : Promise.resolve([])
    return Promise.resolve([])
  }
  const { data: suggestions, loading: suggestionsLoading, error: suggestionsError, retry: retrySuggestions } = useServiceData(loadSuggestions, [selectedRole, apiScope, scopeValue, employeeId])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [severity, setSeverity] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [runtimeStatus, setRuntimeStatus] = useState(null)
  const [runtimeError, setRuntimeError] = useState('')
  const filtered = useMemo(() => insights.filter((insight) => {
    const insightCategory = valueOf(insight, ['category', 'insightType'], 'General')
    const insightSeverity = valueOf(insight, ['severity'], 'Info')
    return `${insightTitle(insight)} ${valueOf(insight, ['fullAnalysis'], '')}`.toLowerCase().includes(search.toLowerCase()) && (!category || insightCategory === category) && (!severity || insightSeverity === severity)
  }), [insights, search, category, severity])

  useEffect(() => {
    let active = true
    getAiRuntimeStatus()
      .then((status) => {
        if (active) setRuntimeStatus(status)
      })
      .catch((err) => {
        if (active) setRuntimeError(err.message)
      })
    return () => {
      active = false
    }
  }, [])

  const handleGenerateInsight = async () => {
    setActionError('')
    setActionMessage('')
    const targetEmployeeId = apiScope === 'employee' ? scopeValue : employeeId
    if (!targetEmployeeId) {
      setActionError('Employee context is required before generating an AI insight.')
      return
    }
    try {
      const response = await generateInsight(targetEmployeeId)
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
      <PageHeader title={pageCopy[selectedRole][0]} description={pageCopy[selectedRole][1]} action={<Button disabled={!employeeId && apiScope !== 'employee'} onClick={handleGenerateInsight}>Generate Insight</Button>} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load insights" description={error.message} status={error.status} details={error.details} onRetry={retry} /> : null}
      {suggestionsError ? <ErrorState title="Unable to load AI suggestions" description={suggestionsError.message} status={suggestionsError.status} details={suggestionsError.details} onRetry={retrySuggestions} /> : null}
      {apiPending ? <ErrorState description="Connect AI insight APIs to display generated insights." onRetry={retry} /> : null}
      {actionMessage ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{actionMessage}</p> : null}
      {actionError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
      {runtimeStatus && valueOf(runtimeStatus, ['apiKeyConfigured'], true) === false ? <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">AI provider key is not configured. Insight generation may fail until backend AI configuration is completed.</p> : null}
      <Card className="mb-5">
        <div className="grid gap-3 md:grid-cols-4">
          <div><p className="text-sm text-[var(--muted)]">AI provider</p><p className="mt-1 font-semibold text-[var(--text)]">{valueOf(runtimeStatus, ['provider'], runtimeError || 'Not loaded')}</p></div>
          <div><p className="text-sm text-[var(--muted)]">Model</p><p className="mt-1 font-semibold text-[var(--text)]">{valueOf(runtimeStatus, ['model'], '-')}</p></div>
          <div><p className="text-sm text-[var(--muted)]">API key</p><p className="mt-1 font-semibold text-[var(--text)]">{runtimeStatus ? (valueOf(runtimeStatus, ['apiKeyConfigured'], false) ? 'Configured' : 'Missing') : '-'}</p></div>
          <div><p className="text-sm text-[var(--muted)]">RAG</p><p className="mt-1 font-semibold text-[var(--text)]">{runtimeStatus ? (valueOf(runtimeStatus, ['ragEnabled'], false) ? 'Enabled' : 'Disabled') : '-'}</p></div>
        </div>
        <div className="mt-5 grid gap-3 border-t border-[var(--border)] pt-4 lg:grid-cols-[220px_1fr_auto] lg:items-end">
          <label>
            <span className="text-sm font-medium text-[var(--text)]">API scope</span>
            <select className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]" value={apiScope} onChange={(event) => { setApiScope(event.target.value); setScopeValue(event.target.value === 'organization' ? organizationId ?? '' : event.target.value === 'employee' ? employeeId ?? '' : '') }}>
              <option value="my">My insights</option>
              <option value="managed">Managed teams</option>
              <option value="organization">Organization ID</option>
              <option value="team">Team ID</option>
              <option value="project">Project ID</option>
              <option value="employee">Employee ID</option>
            </select>
          </label>
          <label>
            <span className="text-sm font-medium text-[var(--text)]">Scope value</span>
            <input className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]" disabled={['my', 'managed'].includes(apiScope)} placeholder={['my', 'managed'].includes(apiScope) ? 'No value required' : 'Paste UUID'} value={scopeValue} onChange={(event) => setScopeValue(event.target.value)} />
          </label>
          <Button variant="secondary" onClick={() => { retry(); retrySuggestions() }}>Load AI Data</Button>
        </div>
      </Card>
      {!loading && !error && !apiPending && missingOrganizationContext ? <EmptyState title="Required user or organization context is not available yet." description="Organization-scoped AI insights will load after the backend provides organization context for the signed-in user." /> : null}
      {!loading && !error && !apiPending && !missingOrganizationContext ? (
        <>
          <SearchAndFilterBar search={search} onSearchChange={setSearch} filters={[
            { label: 'All categories', value: category, onChange: setCategory, options: [...new Set(insights.map((item) => valueOf(item, ['category', 'insightType'], '')).filter(Boolean))] },
            { label: 'All severity', value: severity, onChange: setSeverity, options: [...new Set(insights.map((item) => valueOf(item, ['severity'], '')).filter(Boolean))] },
          ]} />
          <div className="grid gap-4 lg:grid-cols-2">{filtered.map((insight, index) => {
            const analysis = parseFullAnalysis(valueOf(insight, ['fullAnalysis'], null))
            const reasons = Array.isArray(analysis?.reasons) ? analysis.reasons : []
            const recommendations = Array.isArray(analysis?.recommendations) ? analysis.recommendations : []
            return <Card key={`${getId(insight)}-${index}`} className="page-animate opacity-0"><div className="flex flex-wrap gap-2"><Badge>{valueOf(insight, ['insightType'], 'General')}</Badge><Badge>{analysis?.riskLevel || valueOf(insight, ['severity'], 'Info')}</Badge></div><h2 className="mt-4 font-semibold text-[var(--text)]">{analysis?.summary || insightTitle(insight)}</h2><p className="mt-2 text-sm text-[var(--muted)]">{analysis ? 'Structured AI analysis returned by the backend.' : valueOf(insight, ['fullAnalysis'], 'No analysis returned by the backend yet.')}</p>{reasons.length ? <div className="mt-4"><p className="text-sm font-semibold text-[var(--text)]">Reasons</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">{reasons.map((item, reasonIndex) => <li key={reasonIndex}>{item}</li>)}</ul></div> : null}{recommendations.length ? <div className="mt-4"><p className="text-sm font-semibold text-[var(--text)]">Recommendations</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">{recommendations.map((item, recommendationIndex) => <li key={recommendationIndex}>{item}</li>)}</ul></div> : null}<div className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-4 text-sm text-[var(--text)] dark:bg-slate-900 sm:grid-cols-2"><span>Confidence: {formatConfidence(valueOf(insight, ['confidenceScore'], '-'))}</span><span>Employee: {valueOf(insight, ['employee', 'employeeName'], 'Not scoped')}</span><span>Team: {valueOf(insight, ['team', 'teamName'], 'Not scoped')}</span><span>Project: {valueOf(insight, ['projectName', 'project'], 'Not scoped')}</span></div><p className="mt-3 text-xs text-[var(--muted)]">{getDate(insight)}</p></Card>
          })}</div>
          {!filtered.length ? <EmptyState title="No AI insights available." /> : null}
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-[var(--text)]">AI Suggestions</h2>
            {suggestionsLoading ? <LoadingState /> : null}
            <div className="grid gap-4 lg:grid-cols-2">
              {suggestions.map((suggestion, index) => <Card key={`${getId(suggestion)}-${index}`} className="page-animate opacity-0"><div className="flex flex-wrap gap-2"><Badge>{valueOf(suggestion, ['suggestionType'], 'Suggestion')}</Badge><Badge>{valueOf(suggestion, ['isAdopted', 'adopted'], false) ? 'Adopted' : 'Open'}</Badge></div><h3 className="mt-4 font-semibold text-[var(--text)]">{suggestionTitle(suggestion)}</h3><p className="mt-2 text-sm text-[var(--muted)]">{valueOf(suggestion, ['description'], 'No suggestion description returned by the backend yet.')}</p><div className="mt-4 grid gap-2 rounded-lg bg-slate-50 p-4 text-xs text-[var(--muted)] dark:bg-slate-900 sm:grid-cols-2"><span>Source: {valueOf(suggestion, ['sourceEmployeeName'], 'Not provided')}</span><span>Target: {valueOf(suggestion, ['targetEmployeeName'], 'Not provided')}</span><span>Sprint: {valueOf(suggestion, ['sprintNumber'], 'Not provided')}</span><span>Confidence: {formatConfidence(valueOf(suggestion, ['confidenceScore'], '-'))}</span></div><Button className="mt-4" variant="secondary" disabled={Boolean(valueOf(suggestion, ['isAdopted', 'adopted'], false))} onClick={() => handleAdoptSuggestion(suggestion)}>Adopt Suggestion</Button></Card>)}
            </div>
            {!suggestionsLoading && !suggestions.length ? <EmptyState title="No AI suggestions available." /> : null}
          </div>
        </>
      ) : null}
    </>
  )
}

export default AIInsightsPage
