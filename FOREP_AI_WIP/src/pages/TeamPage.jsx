import { useState } from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { useServiceData } from '../hooks/useServiceData.js'
import { getTeams } from '../services/teamService.js'

function TeamPage() {
  const { data: teams, loading, error, apiPending } = useServiceData(getTeams, [])
  const [selected, setSelected] = useState(null)

  return (
    <AppLayout title="Teams">
      <PageHeader title="Team Management" description="Team cards and detail panels prepared for backend organization data." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load teams" description={error.message} /> : null}
      {apiPending ? <ErrorState description="Connect GET /api/teams to display team records." /> : null}
      {!loading && !error && !apiPending ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="grid gap-4 lg:grid-cols-2">{teams.map((team) => <Card key={team.id} className="page-animate cursor-pointer opacity-0" onClick={() => setSelected(team)}><h2 className="text-lg font-semibold text-[var(--text)]">{team.name}</h2><p className="mt-2 text-sm text-[var(--muted)]">Manager: {team.manager}</p><p className="mt-4 text-sm leading-6 text-[var(--muted)]">{team.description}</p></Card>)}</div>
          <Card className="page-animate opacity-0"><h2 className="font-semibold text-[var(--text)]">Team Detail</h2>{selected ? <div className="mt-4 text-sm text-[var(--muted)]"><p>{selected.description}</p><p className="mt-3">Members: {selected.members?.join(', ')}</p></div> : <p className="mt-4 text-sm text-[var(--muted)]">Select a team to preview team details.</p>}</Card>
        </div>
      ) : null}
      {!loading && !error && !apiPending && !teams.length ? <EmptyState title="No teams" description="Connect backend API to display team records." /> : null}
    </AppLayout>
  )
}

export default TeamPage
