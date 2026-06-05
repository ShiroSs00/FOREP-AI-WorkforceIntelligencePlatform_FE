import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import LoadingState from '../../components/ui/LoadingState.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import AIAnalystCard from '../../components/app/AIAnalystCard.jsx'
import PartialErrorNotice from '../../components/app/PartialErrorNotice.jsx'
import { getDisplayFields, getName, normalizeArray, normalizeObject, valueOf } from '../../services/responseNormalizer.js'

const previewKeys = ['title', 'summary', 'fullAnalysis', 'description', 'message', 'status', 'severity', 'createdAt']

function DashboardShell({ breadcrumb, title, subtitle, sections, analyst, resourceLabels = [], accent = 'blue', loadDashboard }) {
  const [loading, setLoading] = useState(Boolean(loadDashboard))
  const [error, setError] = useState(null)
  const [failures, setFailures] = useState([])
  const [loadedResources, setLoadedResources] = useState(0)
  const [resourceSummaries, setResourceSummaries] = useState([])
  const accentClass = {
    purple: 'text-purple-600 dark:text-purple-300',
    blue: 'text-sky-600 dark:text-sky-300',
    green: 'text-emerald-600 dark:text-emerald-300',
    cyan: 'text-cyan-600 dark:text-cyan-300',
  }[accent]

  useEffect(() => {
    if (!loadDashboard) return undefined
    let mounted = true

    loadDashboard()
      .then((results) => {
        if (!mounted) return
        const settled = Array.isArray(results) ? results : [{ status: 'fulfilled', value: results }]
        const failed = settled.filter((result) => result.status === 'rejected')
        const fulfilled = settled.filter((result) => result.status === 'fulfilled')
        setFailures(failed)
        setLoadedResources(fulfilled.length)
        setResourceSummaries(fulfilled.map((result, index) => {
          const rows = normalizeArray(result.value)
          const object = normalizeObject(result.value)
          const hasObject = object && typeof object === 'object' && Object.keys(object).length > 0 && !Array.isArray(object)
          return {
            label: resourceLabels[index] ?? `Resource ${index + 1}`,
            count: rows.length,
            hasObject,
            fields: hasObject ? getDisplayFields(object, ['totalUsers', 'activeUsers', 'totalTeams', 'totalOrganizations', 'totalTasks', 'completedTasks', 'employeeId', 'workloadScore', 'focusScore'], 6) : [],
            preview: rows.length ? rows.slice(0, 2) : object,
          }
        }))
        if (failed.length === settled.length) setError(failed[0]?.reason ?? new Error('Unable to load dashboard data.'))
      })
      .catch((err) => {
        if (mounted) setError(err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
    // Dashboard resources are provided by role dashboard modules; reload when the loader changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDashboard])

  return (
    <>
      <PageHeader eyebrow={breadcrumb} title={title} description={subtitle} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load dashboard" description={error.message} /> : null}
      {!loading && !error ? <PartialErrorNotice failures={failures} /> : null}
      {!loading && !error && loadedResources === 0 ? <EmptyState title="No dashboard data available." description="Role-scoped dashboard data will appear here when records are available." /> : null}
      {!loading && !error && loadedResources > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {resourceSummaries.map((resource) => (
            <Card key={resource.label}>
              <p className="text-sm font-medium text-[var(--muted)]">{resource.label}</p>
              <p className={`mt-3 text-lg font-semibold ${accentClass}`}>{resource.count ? `${resource.count} record${resource.count === 1 ? '' : 's'}` : resource.hasObject ? 'Backend response' : 'No records'}</p>
              {resource.fields.length ? (
                <dl className="mt-4 space-y-2">
                  {resource.fields.map((field) => (
                    <div key={field.key} className="flex items-center justify-between gap-3 text-sm">
                      <dt className="text-[var(--muted)]">{field.label}</dt>
                      <dd className="max-w-[9rem] truncate font-medium text-[var(--text)]">{field.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{resource.count ? 'Available for this role.' : 'No records available for this resource.'}</p>
              )}
            </Card>
          ))}
        </div>
      ) : null}
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="grid gap-5">
          {sections.map((section) => (
            <Card key={section.title}>
              <h2 className="font-semibold text-[var(--text)]">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{section.description}</p>
              {section.source ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{section.source}</p> : null}
              {section.items ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{section.items.map((item) => <p key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-[var(--muted)] dark:bg-slate-900">{item}</p>)}</div> : null}
              <div className="mt-4 grid gap-3">
                {resourceSummaries.flatMap((resource) => Array.isArray(resource.preview) ? resource.preview : []).slice(0, 3).map((item, index) => (
                  <div key={`${section.title}-${index}`} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                    <p className="text-sm font-semibold text-[var(--text)]">{getName(item)}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{valueOf(item, previewKeys, 'Backend API record')}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
        <AIAnalystCard {...analyst} />
      </div>
    </>
  )
}

export default DashboardShell
