import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import SearchAndFilterBar from '../components/SearchAndFilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import Input from '../components/ui/Input.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import Modal from '../components/ui/Modal.jsx'
import Table from '../components/ui/Table.jsx'
import { useRole } from '../context/role.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { approveLeaveRequest, createLeaveRequest, getLeaveRequests, getManagedTeamLeaves, getMyLeaveHistory, rejectLeaveRequest } from '../services/leaveService.js'
import { extractBackendMessage, getId, getStatus, valueOf } from '../services/responseNormalizer.js'

const pageCopy = {
  admin: ['Leave Policy / Overview', 'Review leave requests across the platform scope.'],
  manager: ['Team Leave Requests', 'Review leave requests for teams you manage.'],
  hr: ['Leave Request Management', 'Review and process People Ops leave workflows.'],
  employee: ['My Leave Requests', 'Review and submit your leave requests.'],
}

function LeavePage() {
  const { selectedRole } = useRole()
  const canCreateLeave = ['employee', 'hr'].includes(selectedRole)
  const canApproveLeave = selectedRole === 'hr'
  const loadLeaves = () => {
    if (selectedRole === 'employee') return getMyLeaveHistory()
    if (selectedRole === 'manager') return getManagedTeamLeaves()
    return getLeaveRequests()
  }
  const { data: requests, loading, error, apiPending, retry } = useServiceData(loadLeaves, [selectedRole])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' })
  const filtered = useMemo(() => requests.filter((request) => {
    const employeeName = valueOf(request, ['employeeName', 'employee', 'requesterName'], 'Unknown')
    const leaveStatus = getStatus(request)
    return `${employeeName} ${valueOf(request, ['reason'], '')}`.toLowerCase().includes(search.toLowerCase()) && (!status || leaveStatus === status)
  }), [requests, search, status])

  const updateStatus = async (request, nextStatus) => {
    setActionError('')
    setActionMessage('')
    try {
      const response = nextStatus === 'APPROVED' ? await approveLeaveRequest(getId(request)) : await rejectLeaveRequest(getId(request))
      setActionMessage(extractBackendMessage(response, nextStatus === 'APPROVED' ? 'Leave request approved.' : 'Leave request rejected.'))
      retry()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const submitLeave = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setActionError('')
    setActionMessage('')
    try {
      const response = await createLeaveRequest({
        reason: form.reason,
        startDate: form.startDate,
        endDate: form.endDate,
      })
      setActionMessage(extractBackendMessage(response, 'Leave request submitted.'))
      setForm({ startDate: '', endDate: '', reason: '' })
      setModalOpen(false)
      retry()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title={pageCopy[selectedRole][0]} description={pageCopy[selectedRole][1]} action={canCreateLeave ? <Button variant="secondary" onClick={() => setModalOpen(true)}>Request Leave</Button> : null} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load leave requests" description={error.message} status={error.status} details={error.details} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="Connect leave APIs to display leave workflows." onRetry={retry} /> : null}
      {actionMessage ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{actionMessage}</p> : null}
      {actionError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
      {!loading && !error && !apiPending ? (
        <>
          <SearchAndFilterBar search={search} onSearchChange={setSearch} filters={[
            { label: 'All statuses', value: status, onChange: setStatus, options: [...new Set(requests.map((request) => getStatus(request)).filter((item) => item && item !== 'Unknown'))] },
          ]} />
          <Table columns={canApproveLeave ? ['Employee', 'Reason', 'Period', 'Status', 'Actions'] : ['Employee', 'Reason', 'Period', 'Status']} rows={filtered} empty={<EmptyState title="No leave requests available." />} renderRow={(request, index) => {
            const leaveStatus = getStatus(request)
            return <tr key={`${getId(request)}-${index}`}><td className="px-4 py-4 font-semibold text-[var(--text)]">{valueOf(request, ['employeeName', 'employee', 'requesterName'], 'Unknown')}</td><td className="px-4 py-4 text-[var(--muted)]">{valueOf(request, ['reason'], 'No reason')}</td><td className="px-4 py-4 text-[var(--muted)]">{valueOf(request, ['startDate', 'from'], '-')} to {valueOf(request, ['endDate', 'to'], '-')}</td><td className="px-4 py-4"><Badge>{leaveStatus}</Badge></td>{canApproveLeave ? <td className="px-4 py-4"><div className="flex gap-2"><Button variant="secondary" disabled={!['PENDING', 'Pending'].includes(leaveStatus)} onClick={() => updateStatus(request, 'APPROVED')}>Approve</Button><Button variant="ghost" disabled={!['PENDING', 'Pending'].includes(leaveStatus)} onClick={() => updateStatus(request, 'REJECTED')}>Reject</Button></div></td> : null}</tr>
          }} />
        </>
      ) : null}
      <Modal open={modalOpen} title="Request Leave" onClose={() => setModalOpen(false)}>
        <form onSubmit={submitLeave} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input type="date" required value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
            <Input type="date" required value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
          </div>
          <Input placeholder="Reason" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} />
          {actionError ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
          <div className="flex justify-end"><Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</Button></div>
        </form>
      </Modal>
    </>
  )
}

export default LeavePage
