import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import SearchAndFilterBar from '../components/SearchAndFilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import Input from '../components/ui/Input.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import Modal from '../components/ui/Modal.jsx'
import Select from '../components/ui/Select.jsx'
import Table from '../components/ui/Table.jsx'
import { useRole } from '../context/role.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { createSprint, deleteSprint, getActiveSprints, getSprints, updateSprint } from '../services/sprintService.js'
import { getId, getName, getStatus, valueOf } from '../services/responseNormalizer.js'

const emptySprint = {
  sprintNumber: '',
  name: '',
  startDate: '',
  endDate: '',
  committedStoryPoints: '',
  completedStoryPoints: '',
  velocityConfidence: '',
  status: 'PLANNING',
  organizationId: '',
}

function toSprintForm(sprint = emptySprint) {
  return {
    sprintNumber: valueOf(sprint, ['sprintNumber'], ''),
    name: valueOf(sprint, ['name', 'sprintName'], ''),
    startDate: valueOf(sprint, ['startDate'], ''),
    endDate: valueOf(sprint, ['endDate'], ''),
    committedStoryPoints: valueOf(sprint, ['committedStoryPoints'], ''),
    completedStoryPoints: valueOf(sprint, ['completedStoryPoints'], ''),
    velocityConfidence: valueOf(sprint, ['velocityConfidence'], ''),
    status: valueOf(sprint, ['status'], 'PLANNING'),
    organizationId: valueOf(sprint, ['organizationId'], ''),
  }
}

function buildSprintPayload(form) {
  return {
    sprintNumber: form.sprintNumber !== '' ? Number(form.sprintNumber) : undefined,
    name: form.name,
    startDate: form.startDate || undefined,
    endDate: form.endDate || undefined,
    committedStoryPoints: form.committedStoryPoints !== '' ? Number(form.committedStoryPoints) : undefined,
    completedStoryPoints: form.completedStoryPoints !== '' ? Number(form.completedStoryPoints) : undefined,
    velocityConfidence: form.velocityConfidence !== '' ? Number(form.velocityConfidence) : undefined,
    status: form.status,
    organizationId: form.organizationId || undefined,
  }
}

function SprintPage() {
  const { selectedRole } = useRole()
  const loadSprints = () => (selectedRole === 'manager' ? getActiveSprints() : getSprints())
  const { data: sprints, loading, error, apiPending, retry } = useServiceData(loadSprints, [selectedRole])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState(null)
  const [form, setForm] = useState(emptySprint)
  const [actionError, setActionError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const openCreate = () => {
    setEditingSprint(null)
    setForm(emptySprint)
    setActionError('')
    setModalOpen(true)
  }

  const openEdit = (sprint) => {
    setEditingSprint(sprint)
    setForm(toSprintForm(sprint))
    setActionError('')
    setModalOpen(true)
  }

  const submitSprint = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setActionError('')
    try {
      const payload = buildSprintPayload(form)
      if (editingSprint) await updateSprint(getId(editingSprint), payload)
      else await createSprint(payload)
      setModalOpen(false)
      setForm(emptySprint)
      retry()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const removeSprint = async (sprint) => {
    setActionError('')
    try {
      await deleteSprint(getId(sprint))
      retry()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const filteredSprints = useMemo(() => sprints.filter((sprint) => `${getName(sprint)} ${getStatus(sprint)} ${valueOf(sprint, ['organizationName', 'organizationId'], '')}`.toLowerCase().includes(search.toLowerCase())), [sprints, search])

  return (
    <>
      <PageHeader title="Sprints" description="Sprint planning, velocity confidence and story point records." action={<Button variant="secondary" onClick={openCreate}>Create Sprint</Button>} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load sprints" description={error.message} status={error.status} details={error.details} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="Connect sprint APIs to display sprint records." onRetry={retry} /> : null}
      {actionError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
      {!loading && !error && !apiPending ? (
        <>
          <SearchAndFilterBar search={search} onSearchChange={setSearch} filters={[]} />
          <Table
            columns={['Sprint', 'Status', 'Period', 'Story Points', 'Velocity Confidence', 'Organization', 'Actions']}
            rows={filteredSprints}
            empty={<EmptyState title="No sprints available." />}
            renderRow={(sprint, index) => (
              <tr key={`${getId(sprint)}-${index}`}>
                <td className="px-4 py-4 font-semibold text-[var(--text)]">{getName(sprint)}</td>
                <td className="px-4 py-4 text-[var(--muted)]">{getStatus(sprint)}</td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(sprint, ['startDate'], '-')} to {valueOf(sprint, ['endDate'], '-')}</td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(sprint, ['completedStoryPoints'], '0')} / {valueOf(sprint, ['committedStoryPoints'], '0')}</td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(sprint, ['velocityConfidence'], '-')}</td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(sprint, ['organizationName', 'organizationId'], '-')}</td>
                <td className="px-4 py-4"><div className="flex gap-2"><Button variant="secondary" onClick={() => openEdit(sprint)}>Edit</Button><Button variant="ghost" onClick={() => removeSprint(sprint)}>Delete</Button></div></td>
              </tr>
            )}
          />
        </>
      ) : null}
      <Modal open={modalOpen} title={editingSprint ? 'Update Sprint' : 'Create Sprint'} onClose={() => setModalOpen(false)}>
        <form onSubmit={submitSprint} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input type="number" min="0" placeholder="Sprint number" value={form.sprintNumber} onChange={(event) => setForm({ ...form, sprintNumber: event.target.value })} />
            <Input required placeholder="Sprint name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <Input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
            <Input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
            <Input type="number" min="0" placeholder="Committed story points" value={form.committedStoryPoints} onChange={(event) => setForm({ ...form, committedStoryPoints: event.target.value })} />
            <Input type="number" min="0" placeholder="Completed story points" value={form.completedStoryPoints} onChange={(event) => setForm({ ...form, completedStoryPoints: event.target.value })} />
            <Input type="number" min="0" step="any" placeholder="Velocity confidence" value={form.velocityConfidence} onChange={(event) => setForm({ ...form, velocityConfidence: event.target.value })} />
            <Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{['PLANNING', 'ACTIVE', 'COMPLETED'].map((status) => <option key={status}>{status}</option>)}</Select>
            <Input placeholder="Organization UUID" value={form.organizationId} onChange={(event) => setForm({ ...form, organizationId: event.target.value })} />
          </div>
          {actionError ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
          <div className="flex justify-end"><Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingSprint ? 'Update Sprint' : 'Create Sprint'}</Button></div>
        </form>
      </Modal>
    </>
  )
}

export default SprintPage
