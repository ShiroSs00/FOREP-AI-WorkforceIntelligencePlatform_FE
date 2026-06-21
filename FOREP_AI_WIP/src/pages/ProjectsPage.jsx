import { useMemo, useState } from 'react'
import { FolderKanban, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import Input from '../components/ui/Input.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import Select from '../components/ui/Select.jsx'
import Table from '../components/ui/Table.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useRole } from '../context/role.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { getProjectsByOrganization, getProjectsByTeam } from '../services/projectService.js'
import { getId, getName, valueOf } from '../services/responseNormalizer.js'

function ProjectsPage() {
  const { selectedRole, accountContext } = useRole()
  const [scope, setScope] = useState(selectedRole === 'manager' ? 'team' : 'organization')
  const [organizationId, setOrganizationId] = useState(accountContext.organizationId ?? '')
  const [teamId, setTeamId] = useState(accountContext.teamId ?? '')
  const [search, setSearch] = useState('')

  const loadProjects = () => {
    if (scope === 'organization') return organizationId ? getProjectsByOrganization(organizationId) : Promise.resolve([])
    if (scope === 'team') return teamId ? getProjectsByTeam(teamId) : Promise.resolve([])
    return Promise.resolve([])
  }

  const { data: projects, loading, error, apiPending, retry } = useServiceData(loadProjects, [scope, organizationId, teamId])
  const filtered = useMemo(() => projects.filter((project) => [
    getName(project),
    valueOf(project, ['teamName'], ''),
    valueOf(project, ['organizationName'], ''),
    valueOf(project, ['githubRepository'], ''),
    valueOf(project, ['jiraProjectKey'], ''),
  ].join(' ').toLowerCase().includes(search.toLowerCase())), [projects, search])

  return (
    <>
      <PageHeader
        eyebrow="FOREP / Sức khỏe dự án"
        title="Sức khỏe dự án"
        description="Dữ liệu project read-only được đồng bộ từ Jira/GitHub/Internal theo phạm vi được phân quyền."
        action={<Button variant="secondary" onClick={retry}><RefreshCw size={16} />Làm mới</Button>}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"><FolderKanban size={18} /></span><div><p className="text-sm text-[var(--muted)]">Project trả về</p><p className="text-2xl font-bold text-[var(--text)]">{projects.length}</p></div></div></Card>
        <Card><p className="text-sm text-[var(--muted)]">Project active</p><p className="mt-2 text-2xl font-bold text-[var(--text)]">{projects.filter((project) => Boolean(valueOf(project, ['active'], false))).length}</p></Card>
        <Card><p className="text-sm text-[var(--muted)]">Nguồn đã kết nối</p><p className="mt-2 text-2xl font-bold text-[var(--text)]">{projects.filter((project) => valueOf(project, ['githubRepository'], '') || valueOf(project, ['jiraProjectKey'], '')).length}</p></Card>
      </div>

      <Card className="mb-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_170px_220px_220px] lg:items-end">
          <label><span className="text-sm font-medium text-[var(--text)]">Tìm kiếm</span><Input className="mt-2" placeholder="Tìm project, team, repository..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <label><span className="text-sm font-medium text-[var(--text)]">Phạm vi</span><Select className="mt-2" value={scope} onChange={(event) => setScope(event.target.value)}><option value="organization">Organization</option><option value="team">Team</option></Select></label>
          <label><span className="text-sm font-medium text-[var(--text)]">Organization ID</span><Input className="mt-2" placeholder="Organization UUID" value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} /></label>
          <label><span className="text-sm font-medium text-[var(--text)]">Team ID</span><Input className="mt-2" placeholder="Team UUID" value={teamId} onChange={(event) => setTeamId(event.target.value)} /></label>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">Không tạo/sửa/xóa project trong FOREP. Project đến từ backend và integration scope.</p>
      </Card>

      {loading ? <LoadingState message="Đang tải project..." /> : null}
      {error ? <ErrorState title="Không tải được project" description={error.message} status={error.status} details={error.details} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="Kết nối API project để hiển thị dữ liệu." onRetry={retry} /> : null}

      {!loading && !error && !apiPending ? (
        <Table
          columns={['Project', 'Team', 'Nguồn', 'Trạng thái']}
          rows={filtered}
          empty={<EmptyState title={organizationId || teamId ? 'Không có project trong phạm vi này.' : 'Nhập organization hoặc team ID để tải project.'} description="Project dùng API organization/team scoped, không dùng global list." />}
          renderRow={(project, index) => (
            <tr key={`${getId(project)}-${index}`}>
              <td className="px-4 py-4"><p className="font-semibold text-[var(--text)]">{getName(project)}</p><p className="mt-1 text-xs text-[var(--muted)]">{valueOf(project, ['description'], 'No description')}</p></td>
              <td className="px-4 py-4 text-[var(--muted)]">{valueOf(project, ['teamName', 'teamId'], 'No team')}</td>
              <td className="px-4 py-4 text-[var(--muted)]"><p>{valueOf(project, ['githubRepository'], 'No GitHub repo')}</p><p>{valueOf(project, ['jiraDomain'], '-')}/{valueOf(project, ['jiraProjectKey'], '-')}</p></td>
              <td className="px-4 py-4"><Badge tone={valueOf(project, ['active'], false) ? 'Success' : 'Info'}>{valueOf(project, ['active'], false) ? 'ACTIVE' : 'INACTIVE'}</Badge></td>
            </tr>
          )}
        />
      ) : null}
    </>
  )
}

export default ProjectsPage
