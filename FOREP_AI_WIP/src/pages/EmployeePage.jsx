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
import Table from '../components/ui/Table.jsx'
import { useRole } from '../context/role.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { deleteEmployee, getEmployees, getEmployeesByOrganization, getEmployeesByTeam, getProfile, updateEmployee } from '../services/employeeService.js'
import { extractBackendMessage, getId, getName, valueOf } from '../services/responseNormalizer.js'

const pageCopy = {
  admin: ['Tài khoản / nhân sự', 'Quản trị tài khoản ở mức hệ thống khi backend cho phép.'],
  director: ['Nhân sự organization', 'Xem nhân sự trong organization theo quyền được cấp.'],
  manager: ['Thành viên team', 'Xem nhân sự trong team/project được phân quyền.'],
  employee: ['Hồ sơ của tôi', 'Nhân viên chỉ xem dữ liệu hồ sơ cá nhân.'],
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
  const canEditEmployee = false
  const canDeleteEmployee = false
  const [search, setSearch] = useState('')

  const loadEmployees = async () => {
    if (selectedRole === 'employee') {
      const profile = await getProfile()
      return profile ? [profile] : []
    }
    if (selectedRole === 'manager' && accountContext.teamId) return getEmployeesByTeam(accountContext.teamId)
    if (['admin', 'director'].includes(selectedRole) && accountContext.organizationId) return getEmployeesByOrganization(accountContext.organizationId)
    return getEmployees()
  }

  const { data: employees, loading, error, apiPending, retry } = useServiceData(loadEmployees, [selectedRole, accountContext.teamId, accountContext.organizationId])
  const [selected, setSelected] = useState(null)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
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
    setActionMessage('')
  }

  const submitEmployee = async (event) => {
    event.preventDefault()
    if (!editingEmployee) return
    setSubmitting(true)
    setActionError('')
    setActionMessage('')
    try {
      const response = await updateEmployee(getId(editingEmployee), buildEmployeePayload(form))
      setActionMessage(extractBackendMessage(response, 'Employee updated.'))
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
    setActionMessage('')
    try {
      const response = await deleteEmployee(getId(employee))
      setActionMessage(extractBackendMessage(response, 'Employee deleted.'))
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
        action={<Button variant="secondary" onClick={retry}><RefreshCw size={16} />Làm mới</Button>}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"><Users size={18} /></span>
            <div><p className="text-sm text-[var(--muted)]">Nhân viên trả về</p><p className="text-2xl font-bold text-[var(--text)]">{employees.length}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300"><BriefcaseBusiness size={18} /></span>
            <div><p className="text-sm text-[var(--muted)]">Phòng ban</p><p className="text-2xl font-bold text-[var(--text)]">{new Set(employees.map((item) => valueOf(item, ['department'], '')).filter(Boolean)).size}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"><ShieldCheck size={18} /></span>
            <div><p className="text-sm text-[var(--muted)]">Phạm vi hiện tại</p><p className="text-lg font-bold text-[var(--text)]">{selectedRole === 'manager' ? 'Team được quản lý' : selectedRole === 'employee' ? 'Cá nhân' : 'Tổ chức'}</p></div>
          </div>
        </Card>
      </div>

      <Card className="mb-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <label>
            <span className="text-sm font-medium text-[var(--text)]">Tìm kiếm</span>
            <Input className="mt-2" placeholder="Tìm tên, email, vai trò, team..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <Button variant="secondary" onClick={retry}>Tải lại</Button>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">Phạm vi dữ liệu lấy từ tài khoản đăng nhập. Manager xem nhân viên trong team, Director/Admin xem theo tổ chức, Employee xem hồ sơ cá nhân.</p>
      </Card>

      {loading ? <LoadingState message="Đang tải nhân viên..." /> : null}
      {error ? <ErrorState title="Không tải được nhân viên" description={error.message} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="API nhân viên chưa sẵn sàng." onRetry={retry} /> : null}
      {actionMessage ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{actionMessage}</p> : null}
      {actionError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}

      {!loading && !error && !apiPending ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <Table
            columns={['Nhân viên', 'Vai trò', 'Team', 'Workload', 'Rủi ro', 'Hành động']}
            rows={filtered}
            empty={<EmptyState title="Chưa có nhân viên trong phạm vi này." description="Dữ liệu sẽ xuất hiện sau khi tài khoản, mapping và tổ chức được backend trả về." />}
            renderRow={(employee, index) => (
              <tr key={`${getId(employee)}-${index}`} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900" onClick={() => setSelected(employee)}>
                <td className="px-4 py-4">
                  <p className="font-semibold text-[var(--text)]">{getName(employee)}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{valueOf(employee, ['email'], 'Chưa có email')}</p>
                </td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(employee, ['jobTitle', 'role'], 'Chưa rõ')}</td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(employee, ['teamName'], 'Chưa có team')}</td>
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
            <h2 className="font-semibold text-[var(--text)]">Chi tiết nhân viên</h2>
            {selected ? (
              <dl className="mt-5 space-y-3 text-sm">
                {[
                  ['Tên', getName(selected)],
                  ['Email', valueOf(selected, ['email'], 'Unknown')],
                  ['Vai trò', valueOf(selected, ['role'], 'Unknown')],
                  ['Chức danh', valueOf(selected, ['jobTitle'], 'Unknown')],
                  ['Phòng ban', valueOf(selected, ['department'], 'Chưa có phòng ban')],
                  ['Số điện thoại', valueOf(selected, ['phoneNumber'], 'Chưa có số điện thoại')],
                  ['Team', valueOf(selected, ['teamName'], 'Chưa có team')],
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
            ) : <p className="mt-4 text-sm text-[var(--muted)]">Chọn một nhân viên để xem chi tiết.</p>}
          </Card>
        </div>
      ) : null}

      <Modal open={Boolean(editingEmployee)} title="Cập nhật nhân viên" onClose={() => setEditingEmployee(null)}>
        <form onSubmit={submitEmployee} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="First name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
            <Input placeholder="Last name" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
            <Input placeholder="Job title" value={form.jobTitle} onChange={(event) => setForm({ ...form, jobTitle: event.target.value })} />
            <Input placeholder="Phone number" value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} />
            <Input placeholder="Department" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} />
            <Input placeholder="Avatar initials" value={form.avatarInitials} onChange={(event) => setForm({ ...form, avatarInitials: event.target.value })} />
          </div>
          {actionError ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
          <div className="flex justify-end"><Button type="submit" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Cập nhật'}</Button></div>
        </form>
      </Modal>
    </>
  )
}

export default EmployeePage
