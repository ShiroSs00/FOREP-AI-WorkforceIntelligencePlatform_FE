import { useMemo, useState } from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SearchAndFilterBar from '../components/SearchAndFilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Badge from '../components/ui/Badge.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import Table from '../components/ui/Table.jsx'
import { useServiceData } from '../hooks/useServiceData.js'
import { getAttendanceRecords } from '../services/attendanceService.js'

function AttendancePage() {
  const { data: records, loading, error, apiPending } = useServiceData(getAttendanceRecords, [])
  const [employee, setEmployee] = useState('')
  const [status, setStatus] = useState('')
  const [date, setDate] = useState('')
  const filtered = useMemo(() => records.filter((record) => (!employee || record.employee === employee) && (!status || record.status === status) && (!date || record.date === date)), [records, employee, status, date])

  return (
    <AppLayout title="Attendance">
      <PageHeader title="Attendance Records" description="Attendance table prepared for backend attendance APIs." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load attendance" description={error.message} /> : null}
      {apiPending ? <ErrorState description="Connect GET /api/attendance to display attendance records." /> : null}
      {!loading && !error && !apiPending ? (
        <>
          <SearchAndFilterBar search={date} onSearchChange={setDate} filters={[
            { label: 'All employees', value: employee, onChange: setEmployee, options: [...new Set(records.map((record) => record.employee))] },
            { label: 'All statuses', value: status, onChange: setStatus, options: ['Present', 'Late', 'Absent', 'Remote'] },
          ]} />
          <Table columns={['Employee', 'Date', 'Check in', 'Check out', 'Status']} rows={filtered} empty={<EmptyState title="No attendance records" />} renderRow={(record) => <tr key={record.id}><td className="px-4 py-4 font-semibold text-[var(--text)]">{record.employee}</td><td className="px-4 py-4 text-[var(--muted)]">{record.date}</td><td className="px-4 py-4 text-[var(--muted)]">{record.checkIn}</td><td className="px-4 py-4 text-[var(--muted)]">{record.checkOut}</td><td className="px-4 py-4"><Badge>{record.status}</Badge></td></tr>} />
        </>
      ) : null}
    </AppLayout>
  )
}

export default AttendancePage
