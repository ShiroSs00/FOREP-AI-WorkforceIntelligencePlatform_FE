import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import SearchAndFilterBar from '../components/SearchAndFilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import Input from '../components/ui/Input.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import Modal from '../components/ui/Modal.jsx'
import Select from '../components/ui/Select.jsx'
import Table from '../components/ui/Table.jsx'
import { useRole } from '../context/role.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { assessTask, createTask, deleteTask, getManagedTeamTasks, getMyTasks, getTasks, getTasksByProject, updateTask, updateTaskStatus } from '../services/taskService.js'
import { createTaskComment, deleteTaskComment, getTaskComments } from '../services/taskCommentService.js'
import { extractBackendMessage, getDate, getId, getName, getStatus, valueOf } from '../services/responseNormalizer.js'

const statusOptions = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'OVERDUE']
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const emptyTask = {
  title: '',
  description: '',
  priority: 'LOW',
  dueDate: '',
  estimatedHours: '',
  assigneeId: '',
  reporterId: '',
  projectId: '',
  teamId: '',
  sprintId: '',
  externalTicketRef: '',
  sprintNumber: '',
  storyPoints: '',
  difficultyScore: '',
  progressPercent: '',
  leadEvaluation: '',
  agentAssess: false,
}
const pageCopy = {
  admin: ['Platform task visibility', 'Review task records available to the platform role.'],
  manager: ['Team Tasks', 'Review and manage tasks for teams you manage.'],
  hr: ['People workflow tasks', 'Task visibility is limited for People Ops.'],
  employee: ['My Tasks', 'Review tasks assigned to your account.'],
}

function toTaskForm(task = emptyTask) {
  return {
    title: valueOf(task, ['title', 'name'], ''),
    description: valueOf(task, ['description'], ''),
    priority: valueOf(task, ['priority'], 'LOW'),
    dueDate: valueOf(task, ['dueDate'], '').slice(0, 10),
    estimatedHours: valueOf(task, ['estimatedHours'], ''),
    assigneeId: valueOf(task, ['assigneeId'], ''),
    reporterId: valueOf(task, ['reporterId'], ''),
    projectId: valueOf(task, ['projectId'], ''),
    teamId: valueOf(task, ['teamId'], ''),
    sprintId: valueOf(task, ['sprintId'], ''),
    externalTicketRef: valueOf(task, ['externalTicketRef'], ''),
    sprintNumber: valueOf(task, ['sprintNumber'], ''),
    storyPoints: valueOf(task, ['storyPoints'], ''),
    difficultyScore: valueOf(task, ['difficultyScore'], ''),
    progressPercent: valueOf(task, ['progressPercent'], ''),
    leadEvaluation: valueOf(task, ['leadEvaluation'], ''),
    agentAssess: Boolean(valueOf(task, ['agentAssess'], false)),
  }
}

function buildTaskPayload(form) {
  const optionalString = (value) => (value === '' || value === undefined || value === null ? undefined : value)
  return {
    title: form.title,
    description: form.description,
    priority: form.priority,
    dueDate: form.dueDate ? new Date(`${form.dueDate}T23:59:59`).toISOString() : undefined,
    estimatedHours: form.estimatedHours !== '' ? Number(form.estimatedHours) : undefined,
    assigneeId: optionalString(form.assigneeId),
    reporterId: optionalString(form.reporterId),
    projectId: optionalString(form.projectId),
    teamId: optionalString(form.teamId),
    sprintId: optionalString(form.sprintId),
    externalTicketRef: form.externalTicketRef || undefined,
    sprintNumber: form.sprintNumber !== '' ? Number(form.sprintNumber) : undefined,
    storyPoints: form.storyPoints !== '' ? Number(form.storyPoints) : undefined,
    difficultyScore: form.difficultyScore !== '' ? Number(form.difficultyScore) : undefined,
    progressPercent: form.progressPercent !== '' ? Number(form.progressPercent) : undefined,
    leadEvaluation: form.leadEvaluation || undefined,
    agentAssess: Boolean(form.agentAssess),
  }
}

function TaskPage() {
  const { selectedRole, accountContext } = useRole()
  const canCreateTask = ['admin', 'manager'].includes(selectedRole)
  const canEditTask = ['admin', 'manager'].includes(selectedRole)
  const canDeleteTask = ['admin', 'manager'].includes(selectedRole)
  const canChangeStatus = ['admin', 'manager', 'employee'].includes(selectedRole)
  const [projectScopeId, setProjectScopeId] = useState('')
  const loadTasks = () => {
    if (projectScopeId) return getTasksByProject(projectScopeId)
    if (selectedRole === 'manager') return getManagedTeamTasks()
    if (selectedRole === 'employee') return getMyTasks()
    if (accountContext.organizationId) return getTasks()
    return Promise.resolve([])
  }
  const { data: tasks, loading, error, apiPending, retry } = useServiceData(loadTasks, [selectedRole, projectScopeId, accountContext.organizationId])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [assignee, setAssignee] = useState('')
  const [sourceProvider, setSourceProvider] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [commentsTask, setCommentsTask] = useState(null)
  const [comments, setComments] = useState([])
  const [commentForm, setCommentForm] = useState({ content: '', authorId: '' })
  const [form, setForm] = useState(emptyTask)
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  const submitTask = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setActionError('')
    setActionMessage('')
    try {
      const payload = buildTaskPayload(form)
      const response = editingTask ? await updateTask(getId(editingTask), payload) : await createTask(payload)
      setActionMessage(extractBackendMessage(response, editingTask ? 'Task updated.' : 'Task created.'))
      setForm(emptyTask)
      setEditingTask(null)
      setModalOpen(false)
      retry()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const openCreate = () => {
    setEditingTask(null)
    setForm(emptyTask)
    setActionError('')
    setActionMessage('')
    setModalOpen(true)
  }

  const openEdit = (task) => {
    setEditingTask(task)
    setForm(toTaskForm(task))
    setActionError('')
    setActionMessage('')
    setModalOpen(true)
  }

  const openComments = async (task) => {
    setCommentsTask(task)
    setActionError('')
    setActionMessage('')
    try {
      setComments(await getTaskComments(getId(task)))
    } catch (err) {
      setActionError(err.message)
      setComments([])
    }
  }

  const addComment = async (event) => {
    event.preventDefault()
    if (!commentsTask) return
    setActionError('')
    setActionMessage('')
    try {
      const response = await createTaskComment(getId(commentsTask), {
        content: commentForm.content,
        authorId: commentForm.authorId,
      })
      setActionMessage(extractBackendMessage(response, 'Comment added.'))
      setCommentForm({ content: '', authorId: '' })
      setComments(await getTaskComments(getId(commentsTask)))
    } catch (err) {
      setActionError(err.message)
    }
  }

  const removeComment = async (comment) => {
    if (!commentsTask) return
    setActionError('')
    setActionMessage('')
    try {
      const response = await deleteTaskComment(getId(commentsTask), getId(comment))
      setActionMessage(extractBackendMessage(response, 'Comment deleted.'))
      setComments(await getTaskComments(getId(commentsTask)))
    } catch (err) {
      setActionError(err.message)
    }
  }

  const changeStatus = async (task, nextStatus) => {
    setActionError('')
    setActionMessage('')
    try {
      const response = await updateTaskStatus(getId(task), nextStatus)
      setActionMessage(extractBackendMessage(response, 'Task status updated.'))
      retry()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const runAssessment = async (task) => {
    setActionError('')
    setActionMessage('')
    try {
      const response = await assessTask(getId(task))
      setActionMessage(extractBackendMessage(response, 'Task assessment completed.'))
      retry()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const removeTask = async (task) => {
    setActionError('')
    setActionMessage('')
    try {
      const response = await deleteTask(getId(task))
      setActionMessage(extractBackendMessage(response, 'Task deleted.'))
      retry()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <>
      <PageHeader title={pageCopy[selectedRole][0]} description={pageCopy[selectedRole][1]} action={canCreateTask ? <Button onClick={openCreate}><Plus size={18} /> Create Task</Button> : null} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load tasks" description={error.message} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="Connect task APIs to display operational tasks." onRetry={retry} /> : null}
      {actionMessage ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{actionMessage}</p> : null}
      {actionError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
      {!loading && !error && !apiPending ? (
        <>
          <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <label>
              <span className="text-sm font-medium text-[var(--text)]">Project filter</span>
              <Input className="mt-2" placeholder="Paste Project UUID to load tasks by project" value={projectScopeId} onChange={(event) => setProjectScopeId(event.target.value)} />
            </label>
            <p className="mt-2 text-xs text-[var(--muted)]">Admin and HR task views load safely by project scope until the global task endpoint is stable.</p>
          </div>
          <SearchAndFilterBar
            search={search}
            onSearchChange={setSearch}
            filters={[
              { label: 'All statuses', value: status, onChange: setStatus, options: statusOptions },
              { label: 'All priorities', value: priority, onChange: setPriority, options: priorityOptions },
              { label: 'All assignees', value: assignee, onChange: setAssignee, options: [...new Set(tasks.map((task) => valueOf(task, ['assigneeName', 'assignee', 'assignedTo', 'employee', 'employeeName'], '')).filter(Boolean))] },
              { label: 'All sources', value: sourceProvider, onChange: setSourceProvider, options: ['INTERNAL', 'GITHUB', 'JIRA', 'GMAIL'] },
            ]}
          />
          <Table
            columns={['Task', 'Project', 'Assignee', 'Source', 'Commits', 'Priority', 'Status', 'Due date', 'Actions']}
            rows={filteredTasks}
            empty={<EmptyState title="No tasks found." description="No task records are available for the current role." />}
            renderRow={(task, index) => (
              <tr key={`${getId(task)}-${index}`}>
                <td className="px-4 py-4"><p className="font-semibold text-[var(--text)]">{getName(task)}</p><p className="mt-1 text-xs text-[var(--muted)]">{valueOf(task, ['description'], 'No description')}</p><p className="mt-1 text-xs text-[var(--muted)]">{valueOf(task, ['assessmentSummary'], '')}</p></td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(task, ['projectName', 'project'], 'No project')}</td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(task, ['assigneeName', 'assignee', 'assignedTo', 'employee', 'employeeName'], 'Not assigned')}</td>
                <td className="px-4 py-4"><Badge>{valueOf(task, ['sourceProvider'], 'INTERNAL')}</Badge><p className="mt-1 text-xs text-[var(--muted)]">{valueOf(task, ['externalTicketRef'], '')}</p></td>
                <td className="px-4 py-4 text-[var(--muted)]">
                  <p className="font-semibold text-[var(--text)]">{valueOf(task, ['githubCommitCount'], 0)}</p>
                  <p className="mt-1 text-xs">Score: {valueOf(task, ['githubCommitScore'], '-')}</p>
                </td>
                <td className="px-4 py-4"><Badge>{valueOf(task, ['priority'], 'Unknown')}</Badge></td>
                <td className="px-4 py-4">
                  {canChangeStatus ? <Select value={getStatus(task)} onChange={(event) => changeStatus(task, event.target.value)}>{statusOptions.map((item) => <option key={item}>{item}</option>)}</Select> : <Badge>{getStatus(task)}</Badge>}
                </td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(task, ['dueDate']) || getDate(task)}</td>
                <td className="px-4 py-4"><div className="flex flex-wrap gap-2">{canEditTask ? <Button variant="secondary" onClick={() => openEdit(task)}>Edit</Button> : null}{canEditTask ? <Button variant="secondary" onClick={() => runAssessment(task)}>Assess</Button> : null}<Button variant="ghost" onClick={() => openComments(task)}>Comments</Button>{canDeleteTask ? <Button variant="ghost" onClick={() => removeTask(task)}>Delete</Button> : null}</div></td>
              </tr>
            )}
          />
        </>
      ) : null}
      <Modal open={modalOpen} title={editingTask ? 'Update Task' : 'Create Task'} onClose={() => setModalOpen(false)}>
        <form onSubmit={submitTask} className="grid gap-4">
          <Input required placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <Input placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Assignee UUID" value={form.assigneeId} onChange={(event) => setForm({ ...form, assigneeId: event.target.value })} />
            <Input placeholder="Team UUID" value={form.teamId} onChange={(event) => setForm({ ...form, teamId: event.target.value })} />
            <Select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>{priorityOptions.map((item) => <option key={item}>{item}</option>)}</Select>
            <Input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
            <Input type="number" min="0" placeholder="Estimated hours" value={form.estimatedHours} onChange={(event) => setForm({ ...form, estimatedHours: event.target.value })} />
            <Input placeholder="Reporter UUID" value={form.reporterId} onChange={(event) => setForm({ ...form, reporterId: event.target.value })} />
            <Input placeholder="Project UUID" value={form.projectId} onChange={(event) => setForm({ ...form, projectId: event.target.value })} />
            <Input placeholder="Sprint UUID" value={form.sprintId} onChange={(event) => setForm({ ...form, sprintId: event.target.value })} />
            <Input placeholder="External ticket ref" value={form.externalTicketRef} onChange={(event) => setForm({ ...form, externalTicketRef: event.target.value })} />
            <Input type="number" min="0" placeholder="Sprint number" value={form.sprintNumber} onChange={(event) => setForm({ ...form, sprintNumber: event.target.value })} />
            <Input type="number" min="0" placeholder="Story points" value={form.storyPoints} onChange={(event) => setForm({ ...form, storyPoints: event.target.value })} />
            <Input type="number" min="0" placeholder="Difficulty score" value={form.difficultyScore} onChange={(event) => setForm({ ...form, difficultyScore: event.target.value })} />
            <Input type="number" min="0" max="100" placeholder="Progress percent" value={form.progressPercent} onChange={(event) => setForm({ ...form, progressPercent: event.target.value })} />
          </div>
          <Input placeholder="Lead evaluation" value={form.leadEvaluation} onChange={(event) => setForm({ ...form, leadEvaluation: event.target.value })} />
          <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] px-4 py-3 text-sm text-[var(--text)]">
            <input type="checkbox" checked={form.agentAssess} onChange={(event) => setForm({ ...form, agentAssess: event.target.checked })} />
            Agent assess after save
          </label>
          {actionError ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
          <div className="flex justify-end"><Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}</Button></div>
        </form>
      </Modal>
      <Modal open={Boolean(commentsTask)} title="Task Comments" onClose={() => setCommentsTask(null)}>
        <div className="grid gap-4">
          <div className="space-y-2">
            {comments.length ? comments.map((comment, index) => <div key={`${getId(comment)}-${index}`} className="rounded-lg border border-[var(--border)] p-3"><p className="text-sm text-[var(--text)]">{valueOf(comment, ['content', 'message', 'description'], 'No content')}</p><p className="mt-1 text-xs text-[var(--muted)]">{getDate(comment)}</p><Button variant="ghost" className="mt-2" onClick={() => removeComment(comment)}>Delete</Button></div>) : <EmptyState title="No comments yet." />}
          </div>
          <form onSubmit={addComment} className="grid gap-3">
            <Input required placeholder="Comment content" value={commentForm.content} onChange={(event) => setCommentForm({ ...commentForm, content: event.target.value })} />
            <Input required placeholder="Author UUID" value={commentForm.authorId} onChange={(event) => setCommentForm({ ...commentForm, authorId: event.target.value })} />
            <div className="flex justify-end"><Button type="submit">Add Comment</Button></div>
          </form>
        </div>
      </Modal>
    </>
  )
}

export default TaskPage
