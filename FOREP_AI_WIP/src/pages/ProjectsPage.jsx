import { useMemo, useState } from 'react'
import { FolderKanban, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import Input from '../components/ui/Input.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import Table from '../components/ui/Table.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useRole } from '../context/role.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { getProjectsByOrganization, getProjectsByTeam } from '../services/projectService.js'
import { getId, getName, valueOf } from '../services/responseNormalizer.js'

function ProjectsPage() {
  const { selectedRole, accountContext } = useRole()
  const [search, setSearch] = useState('')

  const loadProjects = () => {
    if (selectedRole === 'manager') return accountContext.teamId ? getProjectsByTeam(accountContext.teamId) : Promise.resolve([])
    if (['director', 'admin'].includes(selectedRole)) return accountContext.organizationId ? getProjectsByOrganization(accountContext.organizationId) : Promise.resolve([])
    return Promise.resolve([])
  }

  const { data: projects, loading, error, apiPending, retry } = useServiceData(loadProjects, [selectedRole, accountContext.organizationId, accountContext.teamId])
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
        eyebrow="FOREP / Dữ liệu import"
        title={selectedRole === 'manager' ? 'Dự án đã import' : 'Sức khỏe tổ chức'}
        description="Dữ liệu project read-only được đồng bộ từ Jira/GitHub theo phạm vi tài khoản. FOREP không tạo hoặc sửa project thủ công."
        action={<Button variant="secondary" onClick={retry}><RefreshCw size={16} />Làm mới</Button>}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"><FolderKanban size={18} /></span><div><p className="text-sm text-[var(--muted)]">Project trả về</p><p className="text-2xl font-bold text-[var(--text)]">{projects.length}</p></div></div></Card>
        <Card><p className="text-sm text-[var(--muted)]">Project đang hoạt động</p><p className="mt-2 text-2xl font-bold text-[var(--text)]">{projects.filter((project) => Boolean(valueOf(project, ['active'], false))).length}</p></Card>
        <Card><p className="text-sm text-[var(--muted)]">Nguồn đã kết nối</p><p className="mt-2 text-2xl font-bold text-[var(--text)]">{projects.filter((project) => valueOf(project, ['githubRepository'], '') || valueOf(project, ['jiraProjectKey'], '')).length}</p></Card>
      </div>

      <Card className="mb-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <label><span className="text-sm font-medium text-[var(--text)]">Tìm kiếm</span><Input className="mt-2" placeholder="Tìm project, team, repository..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <Button variant="secondary" onClick={retry}>Tải lại</Button>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">Scope được lấy từ tài khoản đăng nhập. Nếu chưa thấy dữ liệu, cần kết nối Jira/GitHub và hoàn tất sync/mapping.</p>
      </Card>

      {loading ? <LoadingState message="Đang tải project..." /> : null}
      {error ? <ErrorState title="Không tải được project" description={error.message} status={error.status} details={error.details} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="Kết nối API project để hiển thị dữ liệu." onRetry={retry} /> : null}

      {!loading && !error && !apiPending ? (
        <Table
          columns={['Project', 'Team', 'Nguồn', 'Trạng thái']}
          rows={filtered}
          empty={<EmptyState title="Chưa có project đã import." description="Project sẽ xuất hiện sau khi manager kết nối Jira/GitHub và chạy đồng bộ." />}
          renderRow={(project, index) => (
            <tr key={`${getId(project)}-${index}`}>
              <td className="px-4 py-4"><p className="font-semibold text-[var(--text)]">{getName(project)}</p><p className="mt-1 text-xs text-[var(--muted)]">{valueOf(project, ['description'], 'Chưa có mô tả')}</p></td>
              <td className="px-4 py-4 text-[var(--muted)]">{valueOf(project, ['teamName'], 'Chưa có team')}</td>
              <td className="px-4 py-4 text-[var(--muted)]"><p>{valueOf(project, ['githubRepository'], 'Chưa link repository')}</p><p>{valueOf(project, ['jiraProjectKey'], 'Chưa có Jira key')}</p></td>
              <td className="px-4 py-4"><Badge tone={valueOf(project, ['active'], false) ? 'Success' : 'Info'}>{valueOf(project, ['active'], false) ? 'ĐANG HOẠT ĐỘNG' : 'CHƯA HOẠT ĐỘNG'}</Badge></td>
            </tr>
          )}
        />
      ) : null}
    </>
  )
}

export default ProjectsPage
