import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import SearchAndFilterBar from '../components/SearchAndFilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import Input from '../components/ui/Input.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import Select from '../components/ui/Select.jsx'
import Table from '../components/ui/Table.jsx'
import { useRole } from '../context/role.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { getManagedTeamTasks, getMyTasks, getTasksByEmployee, getTasksByOrganization, getTasksByProject, getTasksByReporter, getTasksBySprint, getTasksByStatus, getTasksByTeam } from '../services/taskService.js'
import { getTaskComments } from '../services/taskCommentService.js'
import { getDate, getId, getName, getStatus, valueOf } from '../services/responseNormalizer.js'

const statusOptions = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'OVERDUE']
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

const pageCopy = {
  admin: ['Task nghiệp vụ không khả dụng', 'Admin không vận hành task Jira/GitHub trong FOREP.'],
  director: ['Issue toàn tổ chức', 'Xem dữ liệu issue đã đồng bộ trong phạm vi organization.'],
  manager: ['Issue của team/project', 'Xem issue đã đồng bộ cho team hoặc project được phân quyền.'],
  employee: ['Issue của tôi', 'Xem issue/task được đồng bộ và liên quan tới tài khoản của bạn.'],
}

function initialScope(role) {
  if (role === 'employee') return 'my'
  if (role === 'manager') return 'managed'
  if (role === 'director') return 'organization'
  return 'project'
}

function TaskPage() {
  const { selectedRole, accountContext } = useRole()
  const [apiScope, setApiScope] = useState(initialScope(selectedRole))
  const [scopeValue, setScopeValue] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [assignee, setAssignee] = useState('')
  const [sourceProvider, setSourceProvider] = useState('')
  const [commentsTask, setCommentsTask] = useState(null)
  const [comments, setComments] = useState([])
  const [actionError, setActionError] = useState('')

  const loadTasks = () => {
    if (apiScope === 'my') return getMyTasks()
    if (apiScope === 'managed') return getManagedTeamTasks()
    if (apiScope === 'project') return scopeValue ? getTasksByProject(scopeValue) : Promise.resolve([])
    if (apiScope === 'team') return scopeValue ? getTasksByTeam(scopeValue) : Promise.resolve([])
    if (apiScope === 'status') return scopeValue ? getTasksByStatus(scopeValue) : Promise.resolve([])
    if (apiScope === 'sprint') return scopeValue ? getTasksBySprint(scopeValue) : Promise.resolve([])
    if (apiScope === 'reporter') return scopeValue ? getTasksByReporter(scopeValue) : Promise.resolve([])
    if (apiScope === 'organization') return scopeValue ? getTasksByOrganization(scopeValue) : accountContext.organizationId ? getTasksByOrganization(accountContext.organizationId) : Promise.resolve([])
    if (apiScope === 'employee') return scopeValue ? getTasksByEmployee(scopeValue) : Promise.resolve([])
    return Promise.resolve([])
  }

  const { data: tasks, loading, error, apiPending, retry } = useServiceData(loadTasks, [selectedRole, apiScope, scopeValue, accountContext.organizationId])

  const filteredTasks = useMemo(
    () => tasks.filter((task) => {
      const taskStatus = getStatus(task)
      const taskPriority = valueOf(task, ['priority'], 'Unknown')
      const assigneeName = valueOf(task, ['assigneeName', 'assignee', 'assignedTo', 'employee', 'employeeName'], 'Not assigned')
      const teamName = valueOf(task, ['teamName', 'team'], 'Unknown')
      const provider = valueOf(task, ['sourceProvider'], 'INTERNAL')
      const projectName = valueOf(task, ['projectName', 'project'], '')
      return `${getName(task)} ${assigneeName} ${teamName} ${projectName} ${valueOf(task, ['externalTicketRef'], '')}`.toLowerCase().includes(search.toLowerCase()) && (!status || taskStatus === status) && (!priority || taskPriority === priority) && (!assignee || assigneeName === assignee) && (!sourceProvider || provider === sourceProvider)
    }),
    [tasks, search, status, priority, assignee, sourceProvider],
  )

  const openComments = async (task) => {
    setCommentsTask(task)
    setComments([])
    setActionError('')
    try {
      setComments(await getTaskComments(getId(task)))
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <>
      <PageHeader title={pageCopy[selectedRole][0]} description={pageCopy[selectedRole][1]} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Không tải được issue/task" description={error.message} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="Kết nối API task để hiển thị dữ liệu issue đã đồng bộ." onRetry={retry} /> : null}
      {actionError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}

      {!loading && !error && !apiPending ? (
        <>
          <div className="mb-4 grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 lg:grid-cols-[220px_1fr_auto] lg:items-end">
            <label>
              <span className="text-sm font-medium text-[var(--text)]">Phạm vi dữ liệu</span>
              <Select className="mt-2" value={apiScope} onChange={(event) => { setApiScope(event.target.value); setScopeValue('') }}>
                <option value="my">Của tôi</option>
                <option value="managed">Team được quản lý</option>
                <option value="project">Project ID</option>
                <option value="team">Team ID</option>
                <option value="status">Status</option>
                <option value="sprint">Sprint ID</option>
                <option value="reporter">Reporter ID</option>
                <option value="organization">Organization ID</option>
                <option value="employee">Employee ID</option>
              </Select>
            </label>
            <label>
              <span className="text-sm font-medium text-[var(--text)]">Giá trị phạm vi</span>
              {apiScope === 'status' ? (
                <Select className="mt-2" value={scopeValue} onChange={(event) => setScopeValue(event.target.value)}>
                  <option value="">Chọn trạng thái</option>
                  {statusOptions.map((item) => <option key={item}>{item}</option>)}
                </Select>
              ) : (
                <Input className="mt-2" disabled={['my', 'managed'].includes(apiScope)} placeholder={['my', 'managed'].includes(apiScope) ? 'Không cần nhập UUID' : 'Dán UUID'} value={scopeValue} onChange={(event) => setScopeValue(event.target.value)} />
              )}
            </label>
            <Button variant="secondary" onClick={retry}>Tải dữ liệu</Button>
            <p className="text-xs text-[var(--muted)] lg:col-span-3">FOREP chỉ đọc issue/task đã đồng bộ từ Jira/GitHub/Internal. UI không tạo, sửa, xóa hoặc đổi trạng thái task.</p>
          </div>

          <SearchAndFilterBar
            search={search}
            onSearchChange={setSearch}
            filters={[
              { label: 'All statuses', value: status, onChange: setStatus, options: statusOptions },
              { label: 'All priorities', value: priority, onChange: setPriority, options: priorityOptions },
              { label: 'All assignees', value: assignee, onChange: setAssignee, options: [...new Set(tasks.map((task) => valueOf(task, ['assigneeName', 'assignee', 'assignedTo', 'employee', 'employeeName'], '')).filter(Boolean))] },
              { label: 'All sources', value: sourceProvider, onChange: setSourceProvider, options: ['INTERNAL', 'GITHUB', 'JIRA'] },
            ]}
          />

          <Table
            columns={['Issue', 'Project', 'Assignee', 'Source', 'Commits', 'Priority', 'Status', 'Due date', 'Chi tiết']}
            rows={filteredTasks}
            empty={<EmptyState title="Chưa có issue/task." description="Không có dữ liệu issue/task trong phạm vi hiện tại." />}
            renderRow={(task, index) => (
              <tr key={`${getId(task)}-${index}`}>
                <td className="px-4 py-4"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-[var(--text)]">{getName(task)}</p>{valueOf(task, ['externalDeleted'], false) ? <Badge tone="Warning">External deleted</Badge> : null}</div><p className="mt-1 text-xs text-[var(--muted)]">{valueOf(task, ['description'], 'No description')}</p><p className="mt-1 text-xs text-[var(--muted)]">{valueOf(task, ['assessmentSummary'], '')}</p></td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(task, ['projectName', 'project'], 'No project')}</td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(task, ['assigneeName', 'assignee', 'assignedTo', 'employee', 'employeeName'], 'Not assigned')}</td>
                <td className="px-4 py-4"><Badge>{valueOf(task, ['sourceProvider'], 'INTERNAL')}</Badge><p className="mt-1 text-xs text-[var(--muted)]">{valueOf(task, ['externalTicketRef'], '')}</p></td>
                <td className="px-4 py-4 text-[var(--muted)]"><p className="font-semibold text-[var(--text)]">{valueOf(task, ['githubCommitCount'], 0)}</p><p className="mt-1 text-xs">Score: {valueOf(task, ['githubCommitScore'], '-')}</p></td>
                <td className="px-4 py-4"><Badge>{valueOf(task, ['priority'], 'Unknown')}</Badge></td>
                <td className="px-4 py-4"><Badge>{getStatus(task)}</Badge></td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(task, ['dueDate']) || getDate(task)}</td>
                <td className="px-4 py-4"><Button variant="ghost" onClick={() => openComments(task)}>Xem comment</Button></td>
              </tr>
            )}
          />

          {commentsTask ? (
            <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-[var(--text)]">Comment task</h2>
                <Button variant="ghost" onClick={() => setCommentsTask(null)}>Đóng</Button>
              </div>
              <div className="mt-4 space-y-2">
                {comments.length ? comments.map((comment, index) => <div key={`${getId(comment)}-${index}`} className="rounded-lg border border-[var(--border)] p-3"><p className="text-sm text-[var(--text)]">{valueOf(comment, ['content', 'message', 'description'], 'No content')}</p><p className="mt-1 text-xs text-[var(--muted)]">{getDate(comment)}</p></div>) : <EmptyState title="Chưa có comment." />}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </>
  )
}

export default TaskPage
