import { useMemo, useState } from 'react'
import { BriefcaseBusiness, RefreshCw, ShieldCheck, Users } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Badge from '../components/ui/Badge.jsx'
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
import { deleteEmployee, getEmployees, getEmployeesByOrganization, getEmployeesByTeam, getProfile, updateEmployee } from '../services/employeeService.js'
import { getId, getName, valueOf } from '../services/responseNormalizer.js'

const pageCopy = {
  admin: ['Users / Employees Directory', 'Manage account-linked employee profiles.'],
  manager: ['Team Members', 'Use team scope when a team id is available, or list employee records allowed by the backend.'],
  hr: ['Employee Directory', 'Review workforce profiles for People Ops workflows.'],
  employee: ['My Profile', 'Employee accounts can view personal profile data.'],
}

const emptyForm = {
  firstName: '',
  lastName: '',
  jobTitle: '',
  phoneNumber: '',
  teamId: '',
  department: '',
  avatarInitials: '',
}

function toEmployeeForm(employee) {
  return {
    firstName: valueOf(employee, ['firstName'], ''),
    lastName: valueOf(employee, ['lastName'], ''),
    jobTitle: valueOf(employee, ['jobTitle'], ''),
    phoneNumber: valueOf(employee, ['phoneNumber'], ''),
    teamId: valueOf(employee, ['teamId'], ''),
    department: valueOf(employee, ['department'], ''),
    avatarInitials: valueOf(employee, ['avatarInitials'], ''),
  }
}

function optionalString(value) {
  return value === '' || value === undefined || value === null ? undefined : value
}

function buildEmployeePayload(form) {
  return {
    firstName: form.firstName.trim() || undefined,
    lastName: form.lastName.trim() || undefined,
    jobTitle: form.jobTitle.trim() || undefined,
    phoneNumber: form.phoneNumber.trim() || undefined,
    teamId: optionalString(form.teamId),
    department: form.department.trim() || undefined,
    avatarInitials: form.avatarInitials.trim() || undefined,
  }
}

function EmployeePage() {
  const { selectedRole, accountContext } = useRole()
  const canEditEmployee = ['admin', 'hr', 'employee'].includes(selectedRole)
  const canDeleteEmployee = selectedRole === 'admin'
  const [scope, setScope] = useState(selectedRole === 'employee' ? 'profile' : 'all')
  const [teamId, setTeamId] = useState('')
  const [organizationId, setOrganizationId] = useState('')
  const [search, setSearch] = useState('')

  const loadEmployees = async () => {
    if (scope === 'profile') {
      const profile = await getProfile()
      return profile ? [profile] : []
    }
    if (scope === 'team') return teamId ? getEmployeesByTeam(teamId) : []
    if (scope === 'organization') return organizationId ? getEmployeesByOrganization(organizationId) : []
    if (selectedRole === 'manager' && accountContext.teamId) return getEmployeesByTeam(accountContext.teamId)
    if (['admin', 'hr'].includes(selectedRole) && accountContext.organizationId) return getEmployeesByOrganization(accountContext.organizationId)
    return getEmployees()
  }

  const { data: employees, loading, error, apiPending, retry } = useServiceData(loadEmployees, [selectedRole, scope, teamId, organizationId, accountContext.teamId, accountContext.organizationId])
  const [selected, setSelected] = useState(null)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [actionError, setActionError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const filtered = useMemo(() => employees.filter((employee) => {
    const content = [
      getName(employee),
      valueOf(employee, ['email'], ''),
      valueOf(employee, ['jobTitle'], ''),
      valueOf(employee, ['teamName'], ''),
      valueOf(employee, ['department'], ''),
      valueOf(employee, ['role'], ''),
    ].join(' ').toLowerCase()
    return content.includes(search.toLowerCase())
  }), [employees, search])

  const openEdit = (employee) => {
    setEditingEmployee(employee)
    setForm(toEmployeeForm(employee))
    setActionError('')
  }

  const submitEmployee = async (event) => {
    event.preventDefault()
    if (!editingEmployee) return
    setSubmitting(true)
    setActionError('')
    try {
      await updateEmployee(getId(editingEmployee), buildEmployeePayload(form))
      setEditingEmployee(null)
      retry()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const removeEmployee = async (employee) => {
    setActionError('')
    try {
      await deleteEmployee(getId(employee))
      if (getId(selected) === getId(employee)) setSelected(null)
      retry()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={pageCopy[selectedRole][0]}
        title={pageCopy[selectedRole][0]}
        description={pageCopy[selectedRole][1]}
        action={<Button variant="secondary" onClick={retry}><RefreshCw size={16} />Refresh</Button>}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"><Users size={18} /></span>
            <div><p className="text-sm text-[var(--muted)]">Employees returned</p><p className="text-2xl font-bold text-[var(--text)]">{employees.length}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300"><BriefcaseBusiness size={18} /></span>
            <div><p className="text-sm text-[var(--muted)]">Departments</p><p className="text-2xl font-bold text-[var(--text)]">{new Set(employees.map((item) => valueOf(item, ['department'], '')).filter(Boolean)).size}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"><ShieldCheck size={18} /></span>
            <div><p className="text-sm text-[var(--muted)]">Current scope</p><p className="text-lg font-bold capitalize text-[var(--text)]">{scope}</p></div>
          </div>
        </Card>
      </div>

      <Card className="mb-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px] lg:items-end">
          <label>
            <span className="text-sm font-medium text-[var(--text)]">Search</span>
            <Input className="mt-2" placeholder="Search name, email, role, team..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <label>
            <span className="text-sm font-medium text-[var(--text)]">Scope</span>
            <Select className="mt-2" value={scope} onChange={(event) => setScope(event.target.value)}>
              <option value="all">All employees</option>
              <option value="profile">My profile</option>
              <option value="team">Team scope</option>
              <option value="organization">Organization scope</option>
            </Select>
          </label>
          <label>
            <span className="text-sm font-medium text-[var(--text)]">Team ID</span>
            <Input className="mt-2" placeholder="For team scope" value={teamId} onChange={(event) => setTeamId(event.target.value)} />
          </label>
          <label>
            <span className="text-sm font-medium text-[var(--text)]">Organization ID</span>
            <Input className="mt-2" placeholder="For org scope" value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} />
          </label>
        </div>
      </Card>

      {loading ? <LoadingState message="Loading employees..." /> : null}
      {error ? <ErrorState title="Unable to load employees" description={error.message} status={error.status} details={error.details} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="Connect employee APIs to display employee records." onRetry={retry} /> : null}
      {actionError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}

      {!loading && !error && !apiPending ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <Table
            columns={['Employee', 'Role', 'Team', 'Workload', 'Risk', 'Actions']}
            rows={filtered}
            empty={<EmptyState title="No employees are available for this scope." description="No employee records are available for the selected role and scope." />}
            renderRow={(employee, index) => (
              <tr key={`${getId(employee)}-${index}`} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900" onClick={() => setSelected(employee)}>
                <td className="px-4 py-4">
                  <p className="font-semibold text-[var(--text)]">{getName(employee)}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{valueOf(employee, ['email'], 'No email')}</p>
                </td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(employee, ['jobTitle', 'role'], 'Unknown')}</td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(employee, ['teamName', 'teamId'], 'No team')}</td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(employee, ['workloadScore'], '-')}</td>
                <td className="px-4 py-4"><Badge>{valueOf(employee, ['burnoutRisk'], 'Unknown')}</Badge></td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    {canEditEmployee ? <Button variant="secondary" onClick={(event) => { event.stopPropagation(); openEdit(employee) }}>Edit</Button> : null}
                    {canDeleteEmployee ? <Button variant="ghost" onClick={(event) => { event.stopPropagation(); removeEmployee(employee) }}>Delete</Button> : null}
                  </div>
                </td>
              </tr>
            )}
          />

          <Card>
            <h2 className="font-semibold text-[var(--text)]">Employee detail</h2>
            {selected ? (
              <dl className="mt-5 space-y-3 text-sm">
                {[
                  ['Name', getName(selected)],
                  ['Email', valueOf(selected, ['email'], 'Unknown')],
                  ['Role', valueOf(selected, ['role'], 'Unknown')],
                  ['Job title', valueOf(selected, ['jobTitle'], 'Unknown')],
                  ['Department', valueOf(selected, ['department'], 'No department')],
                  ['Phone', valueOf(selected, ['phoneNumber'], 'No phone')],
                  ['Team', valueOf(selected, ['teamName', 'teamId'], 'No team')],
                  ['Workload score', valueOf(selected, ['workloadScore'], '-')],
                  ['Burnout risk', valueOf(selected, ['burnoutRisk'], '-')],
                  ['Contribution score', valueOf(selected, ['contributionScore'], '-')],
                  ['Focus score', valueOf(selected, ['focusScore'], '-')],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-[var(--border)] pb-2">
                    <dt className="text-[var(--muted)]">{label}</dt>
                    <dd className="max-w-[12rem] truncate font-medium text-[var(--text)]">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : <p className="mt-4 text-sm text-[var(--muted)]">Select an employee to inspect real EmployeeResponse fields.</p>}
          </Card>
        </div>
      ) : null}

      <Modal open={Boolean(editingEmployee)} title="Update Employee" onClose={() => setEditingEmployee(null)}>
        <form onSubmit={submitEmployee} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="First name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
            <Input placeholder="Last name" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
            <Input placeholder="Job title" value={form.jobTitle} onChange={(event) => setForm({ ...form, jobTitle: event.target.value })} />
            <Input placeholder="Phone number" value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} />
            <Input placeholder="Team UUID" value={form.teamId} onChange={(event) => setForm({ ...form, teamId: event.target.value })} />
            <Input placeholder="Department" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} />
            <Input placeholder="Avatar initials" value={form.avatarInitials} onChange={(event) => setForm({ ...form, avatarInitials: event.target.value })} />
          </div>
          {actionError ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
          <div className="flex justify-end"><Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Update Employee'}</Button></div>
        </form>
      </Modal>
    </>
  )
}

export default EmployeePage
