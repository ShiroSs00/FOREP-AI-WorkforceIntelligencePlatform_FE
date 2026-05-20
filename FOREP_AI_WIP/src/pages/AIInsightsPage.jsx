import { useMemo, useState } from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SearchAndFilterBar from '../components/SearchAndFilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { useServiceData } from '../hooks/useServiceData.js'
import { getInsights } from '../services/aiInsightService.js'
import { useMocks } from '../services/apiClient.js'

function AIInsightsPage() {
  const { data: insights, loading, error, apiPending } = useServiceData(getInsights, [])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [severity, setSeverity] = useState('')
  const filtered = useMemo(() => insights.filter((insight) => `${insight.title} ${insight.description} ${insight.recommendation}`.toLowerCase().includes(search.toLowerCase()) && (!category || insight.category === category) && (!severity || insight.severity === severity)), [insights, search, category, severity])

  return (
    <AppLayout title="AI Insights">
      <PageHeader title="AI Insights" description="Insight UI prepared for FastAPI and Ollama-backed generation services." action={<Button disabled={!useMocks}>Generate Insight</Button>} />
      {!useMocks ? <ErrorState title="AI service is not connected yet." description="Connect POST /api/ai-insights/generate before enabling generation." /> : null}
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load insights" description={error.message} /> : null}
      {apiPending ? <ErrorState description="Connect GET /api/ai-insights to display generated insights." /> : null}
      {!loading && !error && !apiPending ? (
        <>
          <SearchAndFilterBar search={search} onSearchChange={setSearch} filters={[
            { label: 'All categories', value: category, onChange: setCategory, options: ['Workload', 'Burnout', 'Productivity', 'Workflow', 'Attendance'] },
            { label: 'All severity', value: severity, onChange: setSeverity, options: ['Low', 'Medium', 'High'] },
          ]} />
          <div className="grid gap-4 lg:grid-cols-2">{filtered.map((insight) => <Card key={insight.id} className="page-animate opacity-0"><div className="flex gap-2"><Badge>{insight.category}</Badge><Badge>{insight.severity}</Badge></div><h2 className="mt-4 font-semibold text-[var(--text)]">{insight.title}</h2><p className="mt-2 text-sm text-[var(--muted)]">{insight.description}</p><p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-[var(--text)] dark:bg-slate-900">{insight.recommendation}</p></Card>)}</div>
          {!filtered.length ? <EmptyState title="AI insights will appear here after analytics and AI services are connected." /> : null}
        </>
      ) : null}
    </AppLayout>
  )
}

export default AIInsightsPage
