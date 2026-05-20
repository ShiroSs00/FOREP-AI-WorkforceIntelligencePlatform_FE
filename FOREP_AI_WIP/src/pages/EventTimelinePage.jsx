import { useMemo, useState } from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SearchAndFilterBar from '../components/SearchAndFilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Badge from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { eventSeverities, eventSources, eventTypes } from '../constants/eventTypes.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { getEvents } from '../services/eventService.js'

function EventTimelinePage() {
  const { data: events, loading, error, apiPending } = useServiceData(getEvents, [])
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [source, setSource] = useState('')
  const [severity, setSeverity] = useState('')
  const filtered = useMemo(() => events.filter((event) => `${event.title} ${event.description} ${event.actor}`.toLowerCase().includes(search.toLowerCase()) && (!type || event.type === type) && (!source || event.source === source) && (!severity || event.severity === severity)), [events, search, type, source, severity])

  return (
    <AppLayout title="Events Timeline">
      <PageHeader title="Operational Event Timeline" description="Timeline UI prepared for backend event processing streams." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load events" description={error.message} /> : null}
      {apiPending ? <ErrorState description="Connect GET /api/events to display operational events." /> : null}
      {!loading && !error && !apiPending ? (
        <>
          <SearchAndFilterBar search={search} onSearchChange={setSearch} filters={[
            { label: 'All types', value: type, onChange: setType, options: eventTypes },
            { label: 'All sources', value: source, onChange: setSource, options: eventSources },
            { label: 'All severity', value: severity, onChange: setSeverity, options: eventSeverities },
          ]} />
          <div className="space-y-4">{filtered.map((event) => <Card key={event.id} className="page-animate opacity-0"><div className="flex flex-wrap gap-2"><Badge tone={event.severity}>{event.type}</Badge><Badge tone="Info">{event.source}</Badge></div><h2 className="mt-3 font-semibold text-[var(--text)]">{event.title}</h2><p className="mt-1 text-sm text-[var(--muted)]">{event.description}</p></Card>)}</div>
          {!filtered.length ? <EmptyState title="No events" description="Connect backend event processing to display the operational timeline." /> : null}
        </>
      ) : null}
    </AppLayout>
  )
}

export default EventTimelinePage
