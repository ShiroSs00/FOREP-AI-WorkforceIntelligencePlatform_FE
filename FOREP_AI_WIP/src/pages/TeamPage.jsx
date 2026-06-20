import { useEffect, useMemo, useState } from 'react'
import { GitBranch, Plus, RefreshCw, UserPlus, Users } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import Input from '../components/ui/Input.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import Modal from '../components/ui/Modal.jsx'
import Select from '../components/ui/Select.jsx'
import Table from '../components/ui/Table.jsx'
import { useRole } from '../context/role.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { approveMembership, assignEmployee, createTeam, deleteTeam, endActiveMembership, getMyManagedTeams, getTeamMembers, getTeams, getTeamsByOrganization, getTeamsManagedBy, requestTeamMembership, updateTeam } from '../services/teamService.js'
import { extractBackendMessage, getId, getName, valueOf } from '../services/responseNormalizer.js'

const emptyTeam = { name: '', description: '', organizationId: '', managerId: '' }

function toTeamForm(team = emptyTeam) {
  return {
    name: valueOf(team, ['name', 'teamName'], ''),
    description: valueOf(team, ['description'], ''),
    organizationId: valueOf(team, ['organizationId'], ''),
    managerId: valueOf(team, ['managerId'], ''),
  }
}

function optionalString(value) {
  return value === '' || value === undefined || value === null ? undefined : value
}

function buildTeamPayload(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    organizationId: optionalString(form.organizationId),
    managerId: optionalString(form.managerId),
  }
}

function TeamPage() {
  const { selectedRole, accountContext } = useRole()
  const canCreateTeam = ['admin', 'manager'].includes(selectedRole)
  const canEditTeam = ['admin', 'manager'].includes(selectedRole)
  const canDeleteTeam = selectedRole === 'admin'
  const canAssignEmployee = ['admin', 'manager'].includes(selectedRole)
  const [scope, setScope] = useState(selectedRole === 'manager' ? 'managed' : 'all')
  const [organizationId, setOrganizationId] = useState('')
  const [managerId, setManagerId] = useState('')
  const [search, setSearch] = useState('')

  const loadTeams = () => {
    if (scope === 'managed') return getMyManagedTeams()
    if (scope === 'organization') return organizationId ? getTeamsByOrganization(organizationId) : Promise.resolve([])
    if (scope === 'manager') return managerId ? getTeamsManagedBy(managerId) : Promise.resolve([])
    if (selectedRole === 'admin' && accountContext.organizationId) return getTeamsByOrganization(accountContext.organizationId)
    if (selectedRole === 'manager' && accountContext.managerId) return getTeamsManagedBy(accountContext.managerId)
    return getTeams()
  }

  const { data: teams, loading, error, apiPending, retry } = useServiceData(loadTeams, [selectedRole, scope, organizationId, managerId, accountContext.organizationId, accountContext.managerId])
  const [selected, setSelected] = useState(null)
  const [members, setMembers] = useState([])
  const [membersError, setMembersError] = useState('')
  const [membersLoading, setMembersLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const [form, setForm] = useState(emptyTeam)
  const [employeeId, setEmployeeId] = useState('')
  const [membershipId, setMembershipId] = useState('')
  const [endEmployeeId, setEndEmployeeId] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const filtered = useMemo(() => teams.filter((team) => {
    const content = `${getName(team)} ${valueOf(team, ['description'], '')} ${valueOf(team, ['managerName'], '')}`.toLowerCase()
    return content.includes(search.toLowerCase())
  }), [teams, search])

  useEffect(() => {
    let active = true
    if (!selected) return undefined
    getTeamMembers(getId(selected))
      .then((rows) => {
        if (active) setMembers(rows)
      })
      .catch((err) => {
        if (active) setMembersError(err.message)
      })
      .finally(() => {
        if (active) setMembersLoading(false)
      })
    return () => {
      active = false
    }
  }, [selected])

  const openCreate = () => {
    setEditingTeam(null)
    setForm(emptyTeam)
    setActionError('')
    setActionMessage('')
    setModalOpen(true)
  }

  const openEdit = (team) => {
    setEditingTeam(team)
    setForm(toTeamForm(team))
    setActionError('')
    setActionMessage('')
    setModalOpen(true)
  }

  const submitTeam = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setActionError('')
    setActionMessage('')
    try {
      const payload = buildTeamPayload(form)
      if (!payload.name) throw new Error('Team name is required.')
      const response = editingTeam ? await updateTeam(getId(editingTeam), payload) : await createTeam(payload)
      setActionMessage(extractBackendMessage(response, editingTeam ? 'Team updated.' : 'Team created.'))
      setModalOpen(false)
      setForm(emptyTeam)
      retry()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const removeTeam = async (team) => {
    setActionError('')
    setActionMessage('')
    try {
      const response = await deleteTeam(getId(team))
      setActionMessage(extractBackendMessage(response, 'Team deleted.'))
      if (getId(selected) === getId(team)) setSelected(null)
      retry()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const submitAssignEmployee = async () => {
    if (!selected || !employeeId) return
    setActionError('')
    setActionMessage('')
    setSubmitting(true)
    try {
      const response = await assignEmployee(getId(selected), { employeeId })
      setActionMessage(extractBackendMessage(response, 'Employee assigned to team.'))
      setEmployeeId('')
      setSelected({ ...selected })
      retry()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const requestMembership = async () => {
    if (!selected) return
    setActionError('')
    setActionMessage('')
    try {
      const response = await requestTeamMembership(getId(selected))
      setActionMessage(extractBackendMessage(response, 'Team membership request submitted.'))
    } catch (err) {
      setActionError(err.message)
    }
  }

  const approveTeamMembership = async () => {
    if (!membershipId) return
    setActionError('')
    setActionMessage('')
    try {
      const response = await approveMembership(membershipId)
      setActionMessage(extractBackendMessage(response, 'Membership approved.'))
      setMembershipId('')
      retry()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const endMembership = async () => {
    if (!endEmployeeId) return
    setActionError('')
    setActionMessage('')
    try {
      const response = await endActiveMembership(endEmployeeId)
      setActionMessage(extractBackendMessage(response, 'Active membership ended.'))
      setEndEmployeeId('')
      retry()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={`${selectedRole === 'manager' ? 'Manager' : 'Platform'} / Teams`}
        title="Team Management"
        description="Manage teams, team membership, ownership and organization scope."
        action={canCreateTeam ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={retry}><RefreshCw size={16} />Refresh</Button>
            <Button onClick={openCreate}><Plus size={16} />Create Team</Button>
          </div>
        ) : null}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"><GitBranch size={18} /></span>
            <div><p className="text-sm text-[var(--muted)]">Teams returned</p><p className="text-2xl font-bold text-[var(--text)]">{teams.length}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300"><Users size={18} /></span>
            <div><p className="text-sm text-[var(--muted)]">Selected members</p><p className="text-2xl font-bold text-[var(--text)]">{members.length}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"><UserPlus size={18} /></span>
            <div><p className="text-sm text-[var(--muted)]">Current scope</p><p className="text-lg font-bold capitalize text-[var(--text)]">{scope}</p></div>
          </div>
        </Card>
      </div>

      <Card className="mb-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px] lg:items-end">
          <label>
            <span className="text-sm font-medium text-[var(--text)]">Search</span>
            <Input className="mt-2" placeholder="Search team, manager, description..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <label>
            <span className="text-sm font-medium text-[var(--text)]">Scope</span>
            <Select className="mt-2" value={scope} onChange={(event) => setScope(event.target.value)}>
              <option value="all">All teams</option>
              <option value="managed">My managed teams</option>
              <option value="organization">Organization scope</option>
              <option value="manager">Manager scope</option>
            </Select>
          </label>
          <label>
            <span className="text-sm font-medium text-[var(--text)]">Organization ID</span>
            <Input className="mt-2" placeholder="For org scope" value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} />
          </label>
          <label>
            <span className="text-sm font-medium text-[var(--text)]">Manager ID</span>
            <Input className="mt-2" placeholder="For manager scope" value={managerId} onChange={(event) => setManagerId(event.target.value)} />
          </label>
        </div>
      </Card>

      {loading ? <LoadingState message="Loading teams..." /> : null}
      {error ? <ErrorState title="Unable to load teams" description={error.message} status={error.status} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="Connect team APIs to display team records." onRetry={retry} /> : null}
      {actionMessage ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{actionMessage}</p> : null}
      {actionError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}

      {!loading && !error && !apiPending ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <Table
            columns={['Team', 'Manager', 'Organization', 'Description', 'Actions']}
            rows={filtered}
            empty={<EmptyState title="No teams found." description="No team records are available for the selected scope." />}
            renderRow={(team, index) => (
              <tr key={`${getId(team)}-${index}`} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900" onClick={() => { setMembers([]); setMembersError(''); setMembersLoading(true); setSelected(team) }}>
                <td className="px-4 py-4"><p className="font-semibold text-[var(--text)]">{getName(team)}</p><p className="mt-1 text-xs text-[var(--muted)]">ID: {getId(team)}</p></td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(team, ['managerName'], 'Not assigned')}</td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(team, ['organizationName', 'organizationId'], 'Unknown')}</td>
                <td className="max-w-[16rem] truncate px-4 py-4 text-[var(--muted)]">{valueOf(team, ['description'], 'No description')}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    {canEditTeam ? <Button variant="secondary" onClick={(event) => { event.stopPropagation(); openEdit(team) }}>Edit</Button> : null}
                    {canDeleteTeam ? <Button variant="ghost" onClick={(event) => { event.stopPropagation(); removeTeam(team) }}>Delete</Button> : null}
                  </div>
                </td>
              </tr>
            )}
          />

          <Card>
            <h2 className="font-semibold text-[var(--text)]">Team detail</h2>
            {selected ? (
              <div className="mt-4 text-sm text-[var(--muted)]">
                <p className="font-semibold text-[var(--text)]">{getName(selected)}</p>
                <p className="mt-2">{valueOf(selected, ['description'], 'No description')}</p>
                <div className="mt-4 grid gap-2">
                  <p>Manager ID: {valueOf(selected, ['managerId'], 'Not returned')}</p>
                  <p>Organization ID: {valueOf(selected, ['organizationId'], 'Not returned')}</p>
                </div>
                <div className="mt-5 border-t border-[var(--border)] pt-4">
                  <p className="font-semibold text-[var(--text)]">Team members</p>
                  {membersLoading ? <p className="mt-2">Loading members...</p> : null}
                  {membersError ? <p className="mt-2 text-red-500">{membersError}</p> : null}
                  {members.length ? (
                    <div className="mt-3 space-y-2">
                      {members.map((member, index) => <p key={`${getId(member)}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">{getName(member)} - {valueOf(member, ['jobTitle', 'role'], 'Member')}</p>)}
                    </div>
                  ) : !membersLoading ? <p className="mt-2">No members found for this team.</p> : null}
                  {canAssignEmployee ? (
                    <div className="mt-4 flex gap-2">
                      <Input placeholder="Employee ID" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} />
                      <Button variant="secondary" onClick={submitAssignEmployee} disabled={submitting || !employeeId}>Assign</Button>
                    </div>
                  ) : null}
                  <div className="mt-4 grid gap-3 rounded-lg border border-[var(--border)] p-3">
                    <p className="font-semibold text-[var(--text)]">Membership actions</p>
                    {selectedRole === 'employee' ? <Button variant="secondary" onClick={requestMembership}>Request to join this team</Button> : null}
                    {['admin', 'manager'].includes(selectedRole) ? (
                      <>
                        <div className="flex gap-2">
                          <Input placeholder="Membership ID to approve" value={membershipId} onChange={(event) => setMembershipId(event.target.value)} />
                          <Button variant="secondary" onClick={approveTeamMembership} disabled={!membershipId}>Approve</Button>
                        </div>
                        <div className="flex gap-2">
                          <Input placeholder="Employee ID to end active membership" value={endEmployeeId} onChange={(event) => setEndEmployeeId(event.target.value)} />
                          <Button variant="ghost" onClick={endMembership} disabled={!endEmployeeId}>End active</Button>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : <p className="mt-4 text-sm text-[var(--muted)]">Select a team to preview members and assign employees.</p>}
          </Card>
        </div>
      ) : null}

      <Modal open={modalOpen} title={editingTeam ? 'Update Team' : 'Create Team'} onClose={() => setModalOpen(false)}>
        <form onSubmit={submitTeam} className="grid gap-4">
          <Input required placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Organization UUID" value={form.organizationId} onChange={(event) => setForm({ ...form, organizationId: event.target.value })} />
            <Input placeholder="Manager UUID" value={form.managerId} onChange={(event) => setForm({ ...form, managerId: event.target.value })} />
          </div>
          {actionError ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
          <div className="flex justify-end"><Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingTeam ? 'Update Team' : 'Create Team'}</Button></div>
        </form>
      </Modal>
    </>
  )
}

export default TeamPage
