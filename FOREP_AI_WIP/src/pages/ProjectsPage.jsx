import { useMemo, useState } from 'react'
import { FolderKanban, Plus, RefreshCw } from 'lucide-react'
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
import Badge from '../components/ui/Badge.jsx'
import { useRole } from '../context/role.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { createProject, deleteProject, getProjects, getProjectsByOrganization, getProjectsByTeam, updateProject } from '../services/projectService.js'
import { extractBackendMessage, getId, getName, valueOf } from '../services/responseNormalizer.js'

const emptyProject = {
  name: '',
  description: '',
  active: true,
  organizationId: '',
  teamId: '',
  githubRepository: '',
  jiraDomain: '',
  jiraProjectKey: '',
}

function toProjectForm(project = emptyProject) {
  return {
    name: valueOf(project, ['name', 'projectName'], ''),
    description: valueOf(project, ['description'], ''),
    active: Boolean(valueOf(project, ['active'], true)),
    organizationId: valueOf(project, ['organizationId'], ''),
    teamId: valueOf(project, ['teamId'], ''),
    githubRepository: valueOf(project, ['githubRepository'], ''),
    jiraDomain: valueOf(project, ['jiraDomain'], ''),
    jiraProjectKey: valueOf(project, ['jiraProjectKey'], ''),
  }
}

function cleanProjectPayload(form) {
  const payload = {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    active: Boolean(form.active),
    organizationId: form.organizationId || undefined,
    teamId: form.teamId || undefined,
    githubRepository: form.githubRepository.trim() || undefined,
    jiraDomain: form.jiraDomain.trim() || undefined,
    jiraProjectKey: form.jiraProjectKey.trim() || undefined,
  }
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined && value !== ''))
}

function ProjectsPage() {
  const { selectedRole, accountContext } = useRole()
  const canManage = ['admin', 'manager'].includes(selectedRole)
  const [scope, setScope] = useState(selectedRole === 'manager' ? 'team' : 'all')
  const [organizationId, setOrganizationId] = useState(accountContext.organizationId ?? '')
  const [teamId, setTeamId] = useState(accountContext.teamId ?? '')
  const [search, setSearch] = useState('')
  const loadProjects = () => {
    if (scope === 'organization') return organizationId ? getProjectsByOrganization(organizationId) : Promise.resolve([])
    if (scope === 'team') return teamId ? getProjectsByTeam(teamId) : Promise.resolve([])
    return getProjects()
  }
  const { data: projects, loading, error, apiPending, retry } = useServiceData(loadProjects, [scope, organizationId, teamId])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [form, setForm] = useState(emptyProject)
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const filtered = useMemo(() => projects.filter((project) => {
    const content = [
      getName(project),
      valueOf(project, ['teamName'], ''),
      valueOf(project, ['organizationName'], ''),
      valueOf(project, ['githubRepository'], ''),
      valueOf(project, ['jiraProjectKey'], ''),
    ].join(' ').toLowerCase()
    return content.includes(search.toLowerCase())
  }), [projects, search])

  const openCreate = () => {
    setEditingProject(null)
    setForm({ ...emptyProject, organizationId, teamId })
    setActionError('')
    setActionMessage('')
    setModalOpen(true)
  }

  const openEdit = (project) => {
    setEditingProject(project)
    setForm(toProjectForm(project))
    setActionError('')
    setActionMessage('')
    setModalOpen(true)
  }

  const submitProject = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setActionError('')
    setActionMessage('')
    try {
      const payload = cleanProjectPayload(form)
      if (!payload.name) throw new Error('Project name is required.')
      if (!payload.organizationId) throw new Error('Organization UUID is required.')
      if (!payload.teamId) throw new Error('Team UUID is required.')
      const response = editingProject ? await updateProject(getId(editingProject), payload) : await createProject(payload)
      setActionMessage(extractBackendMessage(response, editingProject ? 'Project updated.' : 'Project created.'))
      setModalOpen(false)
      setForm(emptyProject)
      retry()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const removeProject = async (project) => {
    setActionError('')
    setActionMessage('')
    try {
      const response = await deleteProject(getId(project))
      setActionMessage(extractBackendMessage(response, 'Project deleted.'))
      retry()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="FOREP / Projects"
        title="Project Management"
        description="Projects connect teams, GitHub repositories, Jira project keys and task workflow."
        action={(
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={retry}><RefreshCw size={16} />Refresh</Button>
            {canManage ? <Button onClick={openCreate}><Plus size={16} />Create Project</Button> : null}
          </div>
        )}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"><FolderKanban size={18} /></span><div><p className="text-sm text-[var(--muted)]">Projects returned</p><p className="text-2xl font-bold text-[var(--text)]">{projects.length}</p></div></div></Card>
        <Card><p className="text-sm text-[var(--muted)]">Active projects</p><p className="mt-2 text-2xl font-bold text-[var(--text)]">{projects.filter((project) => Boolean(valueOf(project, ['active'], false))).length}</p></Card>
        <Card><p className="text-sm text-[var(--muted)]">Connected sources</p><p className="mt-2 text-2xl font-bold text-[var(--text)]">{projects.filter((project) => valueOf(project, ['githubRepository'], '') || valueOf(project, ['jiraProjectKey'], '')).length}</p></Card>
      </div>

      <Card className="mb-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_170px_220px_220px] lg:items-end">
          <label><span className="text-sm font-medium text-[var(--text)]">Search</span><Input className="mt-2" placeholder="Search project, team, repository..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <label><span className="text-sm font-medium text-[var(--text)]">Scope</span><Select className="mt-2" value={scope} onChange={(event) => setScope(event.target.value)}><option value="all">All projects</option><option value="organization">Organization</option><option value="team">Team</option></Select></label>
          <label><span className="text-sm font-medium text-[var(--text)]">Organization ID</span><Input className="mt-2" placeholder="Organization UUID" value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} /></label>
          <label><span className="text-sm font-medium text-[var(--text)]">Team ID</span><Input className="mt-2" placeholder="Team UUID" value={teamId} onChange={(event) => setTeamId(event.target.value)} /></label>
        </div>
      </Card>

      {loading ? <LoadingState message="Loading projects..." /> : null}
      {error ? <ErrorState title="Unable to load projects" description={error.message} status={error.status} details={error.details} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="Connect project APIs to display project records." onRetry={retry} /> : null}
      {actionMessage ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{actionMessage}</p> : null}
      {actionError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}

      {!loading && !error && !apiPending ? (
        <Table
          columns={['Project', 'Team', 'Sources', 'Status', 'Actions']}
          rows={filtered}
          empty={<EmptyState title="No projects returned from the backend." description="Create a project or adjust the selected scope." />}
          renderRow={(project, index) => (
            <tr key={`${getId(project)}-${index}`}>
              <td className="px-4 py-4"><p className="font-semibold text-[var(--text)]">{getName(project)}</p><p className="mt-1 text-xs text-[var(--muted)]">{valueOf(project, ['description'], 'No description')}</p></td>
              <td className="px-4 py-4 text-[var(--muted)]">{valueOf(project, ['teamName', 'teamId'], 'No team')}</td>
              <td className="px-4 py-4 text-[var(--muted)]"><p>{valueOf(project, ['githubRepository'], 'No GitHub repo')}</p><p>{valueOf(project, ['jiraDomain'], '-')}/{valueOf(project, ['jiraProjectKey'], '-')}</p></td>
              <td className="px-4 py-4"><Badge tone={valueOf(project, ['active'], false) ? 'Success' : 'Info'}>{valueOf(project, ['active'], false) ? 'ACTIVE' : 'INACTIVE'}</Badge></td>
              <td className="px-4 py-4"><div className="flex gap-2">{canManage ? <Button variant="secondary" onClick={() => openEdit(project)}>Edit</Button> : null}{canManage ? <Button variant="ghost" onClick={() => removeProject(project)}>Delete</Button> : null}</div></td>
            </tr>
          )}
        />
      ) : null}

      <Modal open={modalOpen} title={editingProject ? 'Update Project' : 'Create Project'} onClose={() => setModalOpen(false)}>
        <form onSubmit={submitProject} className="grid gap-4">
          <Input required placeholder="Project name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input required placeholder="Organization UUID" value={form.organizationId} onChange={(event) => setForm({ ...form, organizationId: event.target.value })} />
            <Input required placeholder="Team UUID" value={form.teamId} onChange={(event) => setForm({ ...form, teamId: event.target.value })} />
            <Input placeholder="GitHub repository, e.g. org/repo" value={form.githubRepository} onChange={(event) => setForm({ ...form, githubRepository: event.target.value })} />
            <Input placeholder="Jira domain" value={form.jiraDomain} onChange={(event) => setForm({ ...form, jiraDomain: event.target.value })} />
            <Input placeholder="Jira project key" value={form.jiraProjectKey} onChange={(event) => setForm({ ...form, jiraProjectKey: event.target.value })} />
            <Select value={String(form.active)} onChange={(event) => setForm({ ...form, active: event.target.value === 'true' })}><option value="true">Active</option><option value="false">Inactive</option></Select>
          </div>
          {actionError ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
          <div className="flex justify-end"><Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}</Button></div>
        </form>
      </Modal>
    </>
  )
}

export default ProjectsPage
