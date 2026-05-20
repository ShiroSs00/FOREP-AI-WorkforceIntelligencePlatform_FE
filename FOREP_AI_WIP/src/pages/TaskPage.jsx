import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import AppLayout from '../layouts/AppLayout.jsx'
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
import { useServiceData } from '../hooks/useServiceData.js'
import { createTask, getTasks, updateTaskStatus } from '../services/taskService.js'

const emptyTask = { title: '', description: '', assignee: '', team: '', priority: 'Medium', status: 'Todo', dueDate: '' }

function TaskPage() {
  const { data: tasks, loading, error, apiPending, setData } = useServiceData(getTasks, [])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [assignee, setAssignee] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyTask)

  const filteredTasks = useMemo(
    () => tasks.filter((task) => `${task.title} ${task.assignee} ${task.team}`.toLowerCase().includes(search.toLowerCase()) && (!status || task.status === status) && (!priority || task.priority === priority) && (!assignee || task.assignee === assignee)),
    [tasks, search, status, priority, assignee],
  )

  const submitTask = async (event) => {
    event.preventDefault()
    const created = await createTask(form)
    setData((current) => [created, ...current])
    setForm(emptyTask)
    setModalOpen(false)
  }

  const changeStatus = async (task, nextStatus) => {
    await updateTaskStatus(task.id, nextStatus)
    setData((current) => current.map((item) => (item.id === task.id ? { ...item, status: nextStatus } : item)))
  }

  return (
    <AppLayout title="Tasks">
      <PageHeader title="Task Management" description="Backend-ready task table for workflow operations." action={<Button onClick={() => setModalOpen(true)}><Plus size={18} /> Create Task</Button>} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load tasks" description={error.message} /> : null}
      {apiPending ? <ErrorState description="Connect GET /api/tasks to display operational tasks." /> : null}
      {!loading && !error && !apiPending ? (
        <>
          <SearchAndFilterBar
            search={search}
            onSearchChange={setSearch}
            filters={[
              { label: 'All statuses', value: status, onChange: setStatus, options: ['Todo', 'In Progress', 'Completed', 'Overdue'] },
              { label: 'All priorities', value: priority, onChange: setPriority, options: ['Low', 'Medium', 'High'] },
              { label: 'All assignees', value: assignee, onChange: setAssignee, options: [...new Set(tasks.map((task) => task.assignee).filter(Boolean))] },
            ]}
          />
          <Table
            columns={['Task', 'Assignee', 'Team', 'Priority', 'Status', 'Due date']}
            rows={filteredTasks}
            empty={<EmptyState title="No tasks" description="Connect backend API to display workflow tasks." />}
            renderRow={(task) => (
              <tr key={task.id}>
                <td className="px-4 py-4"><p className="font-semibold text-[var(--text)]">{task.title}</p><p className="mt-1 text-xs text-[var(--muted)]">{task.description}</p></td>
                <td className="px-4 py-4 text-[var(--muted)]">{task.assignee}</td>
                <td className="px-4 py-4 text-[var(--muted)]">{task.team}</td>
                <td className="px-4 py-4"><Badge>{task.priority}</Badge></td>
                <td className="px-4 py-4"><Select value={task.status} onChange={(event) => changeStatus(task, event.target.value)}>{['Todo', 'In Progress', 'Completed', 'Overdue'].map((item) => <option key={item}>{item}</option>)}</Select></td>
                <td className="px-4 py-4 text-[var(--muted)]">{task.dueDate}</td>
              </tr>
            )}
          />
        </>
      ) : null}
      <Modal open={modalOpen} title="Create Task" onClose={() => setModalOpen(false)}>
        <form onSubmit={submitTask} className="grid gap-4">
          <Input required placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <Input placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Assignee" value={form.assignee} onChange={(event) => setForm({ ...form, assignee: event.target.value })} />
            <Input placeholder="Team" value={form.team} onChange={(event) => setForm({ ...form, team: event.target.value })} />
            <Select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>{['Low', 'Medium', 'High'].map((item) => <option key={item}>{item}</option>)}</Select>
            <Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{['Todo', 'In Progress', 'Completed', 'Overdue'].map((item) => <option key={item}>{item}</option>)}</Select>
            <Input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
          </div>
          <div className="flex justify-end"><Button type="submit">Submit to Task API</Button></div>
        </form>
      </Modal>
    </AppLayout>
  )
}

export default TaskPage
