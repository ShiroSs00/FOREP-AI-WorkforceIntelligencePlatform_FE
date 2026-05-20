import { useMemo, useState } from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SearchAndFilterBar from '../components/SearchAndFilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import Table from '../components/ui/Table.jsx'
import { useServiceData } from '../hooks/useServiceData.js'
import { approveLeaveRequest, getLeaveRequests, rejectLeaveRequest } from '../services/leaveService.js'

function LeavePage() {
  const { data: requests, loading, error, apiPending, setData } = useServiceData(getLeaveRequests, [])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const filtered = useMemo(() => requests.filter((request) => `${request.employee} ${request.reason}`.toLowerCase().includes(search.toLowerCase()) && (!status || request.status === status) && (!type || request.type === type)), [requests, search, status, type])

  const updateStatus = async (request, nextStatus) => {
    if (nextStatus === 'Approved') await approveLeaveRequest(request.id)
    else await rejectLeaveRequest(request.id)
    setData((current) => current.map((item) => (item.id === request.id ? { ...item, status: nextStatus } : item)))
  }

  return (
    <AppLayout title="Leave Requests">
      <PageHeader title="Leave Requests" description="Approval UI prepared for backend leave workflow APIs." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load leave requests" description={error.message} /> : null}
      {apiPending ? <ErrorState description="Connect GET /api/leave-requests to display leave workflows." /> : null}
      {!loading && !error && !apiPending ? (
        <>
          <SearchAndFilterBar search={search} onSearchChange={setSearch} filters={[
            { label: 'All statuses', value: status, onChange: setStatus, options: ['Pending', 'Approved', 'Rejected'] },
            { label: 'All types', value: type, onChange: setType, options: ['Annual Leave', 'Sick Leave', 'Remote Work', 'Personal Leave'] },
          ]} />
          <Table columns={['Employee', 'Type', 'Period', 'Status', 'Actions']} rows={filtered} empty={<EmptyState title="No leave requests" />} renderRow={(request) => <tr key={request.id}><td className="px-4 py-4 font-semibold text-[var(--text)]">{request.employee}</td><td className="px-4 py-4 text-[var(--muted)]">{request.type}</td><td className="px-4 py-4 text-[var(--muted)]">{request.from} to {request.to}</td><td className="px-4 py-4"><Badge>{request.status}</Badge></td><td className="px-4 py-4"><div className="flex gap-2"><Button variant="secondary" disabled={request.status !== 'Pending'} onClick={() => updateStatus(request, 'Approved')}>Approve</Button><Button variant="ghost" disabled={request.status !== 'Pending'} onClick={() => updateStatus(request, 'Rejected')}>Reject</Button></div></td></tr>} />
        </>
      ) : null}
    </AppLayout>
  )
}

export default LeavePage
