import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import SearchAndFilterBar from '../components/SearchAndFilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Badge from '../components/ui/Badge.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import Input from '../components/ui/Input.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import Table from '../components/ui/Table.jsx'
import { useRole } from '../context/role.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { checkIn, checkOut, getAttendanceByOrganization, getManagedTeamAttendance, getMyAttendanceHistory } from '../services/attendanceService.js'
import Button from '../components/ui/Button.jsx'
import { extractBackendMessage, getDate, getId, getStatus, valueOf } from '../services/responseNormalizer.js'

const pageCopy = {
  admin: ['Chấm công hệ thống', 'Admin không vận hành chấm công nghiệp vụ.'],
  director: ['Chấm công organization', 'Tổng quan attendance theo organization khi backend cho phép.'],
  manager: ['Chấm công team', 'Attendance records cho team được quản lý.'],
  employee: ['Chấm công của tôi', 'Xem lịch sử chấm công cá nhân.'],
}

function AttendancePage() {
  const { selectedRole, accountContext } = useRole()
  const organizationId = accountContext.organizationId
  const missingOrganizationContext = ['admin', 'director'].includes(selectedRole) && !organizationId
  const loadAttendance = () => {
    if (selectedRole === 'employee') return getMyAttendanceHistory()
    if (selectedRole === 'manager') return getManagedTeamAttendance()
    if (['admin', 'director'].includes(selectedRole) && organizationId) return getAttendanceByOrganization(organizationId)
    return Promise.resolve([])
  }
  const { data: records, loading, error, apiPending, retry } = useServiceData(loadAttendance, [selectedRole, organizationId])
  const [employee, setEmployee] = useState('')
  const [status, setStatus] = useState('')
  const [date, setDate] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [location, setLocation] = useState({ latitude: '', longitude: '' })
  const filtered = useMemo(() => records.filter((record) => {
    const employeeName = valueOf(record, ['employeeName', 'employee'], 'Unknown')
    const recordStatus = getStatus(record)
    const recordDate = valueOf(record, ['checkInDate', 'date'], getDate(record))
    return (!employee || employeeName === employee) && (!status || recordStatus === status) && (!date || recordDate === date)
  }), [records, employee, status, date])

  const submitAttendanceAction = async (action) => {
    setActionError('')
    setActionMessage('')
    const latitude = Number(location.latitude)
    const longitude = Number(location.longitude)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setActionError('Latitude and longitude are required for attendance check-in/check-out.')
      return
    }
    try {
      const response = await action({ latitude, longitude })
      setActionMessage(extractBackendMessage(response, action === checkIn ? 'Check-in completed.' : 'Check-out completed.'))
      retry()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const useBrowserLocation = () => {
    setActionError('')
    setActionMessage('')
    if (!navigator.geolocation) {
      setActionError('Browser location is not available. Enter latitude and longitude manually.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
        })
      },
      () => setActionError('Unable to read browser location. Enter latitude and longitude manually.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <>
      <PageHeader
        title={pageCopy[selectedRole][0]}
        description={pageCopy[selectedRole][1]}
        action={selectedRole === 'employee' ? <div className="flex gap-2"><Button variant="secondary" onClick={() => submitAttendanceAction(checkIn)}>Check In</Button><Button variant="ghost" onClick={() => submitAttendanceAction(checkOut)}>Check Out</Button></div> : null}
      />
      {selectedRole === 'employee' ? (
        <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label>
              <span className="text-sm font-medium text-[var(--text)]">Latitude</span>
              <Input className="mt-2" inputMode="decimal" placeholder="10.000000" value={location.latitude} onChange={(event) => setLocation({ ...location, latitude: event.target.value })} />
            </label>
            <label>
              <span className="text-sm font-medium text-[var(--text)]">Longitude</span>
              <Input className="mt-2" inputMode="decimal" placeholder="106.000000" value={location.longitude} onChange={(event) => setLocation({ ...location, longitude: event.target.value })} />
            </label>
            <Button variant="secondary" onClick={useBrowserLocation}>Use Browser Location</Button>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">Latitude and longitude are required for check-in and check-out.</p>
        </div>
      ) : null}
      {actionMessage ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{actionMessage}</p> : null}
      {actionError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load attendance" description={error.message} status={error.status} details={error.details} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="Connect attendance APIs to display attendance records." onRetry={retry} /> : null}
      {!loading && !error && !apiPending && missingOrganizationContext ? <EmptyState title="Required user or organization context is not available yet." description="Organization-scoped attendance will load after the backend provides organization context for the signed-in user." /> : null}
      {!loading && !error && !apiPending && !missingOrganizationContext ? (
        <>
          <SearchAndFilterBar search={date} onSearchChange={setDate} filters={[
            { label: 'All employees', value: employee, onChange: setEmployee, options: [...new Set(records.map((record) => valueOf(record, ['employeeName', 'employee'], '')).filter(Boolean))] },
            { label: 'All statuses', value: status, onChange: setStatus, options: [...new Set(records.map((record) => getStatus(record)).filter((item) => item && item !== 'Unknown'))] },
          ]} />
          <Table columns={['Employee', 'Date', 'Check in', 'Check out', 'Status']} rows={filtered} empty={<EmptyState title="No attendance records available." />} renderRow={(record, index) => <tr key={`${getId(record)}-${index}`}><td className="px-4 py-4 font-semibold text-[var(--text)]">{valueOf(record, ['employeeName', 'employee'], 'Unknown')}</td><td className="px-4 py-4 text-[var(--muted)]">{valueOf(record, ['checkInDate', 'date'], getDate(record))}</td><td className="px-4 py-4 text-[var(--muted)]">{valueOf(record, ['checkInTime', 'checkIn'], '-')}</td><td className="px-4 py-4 text-[var(--muted)]">{valueOf(record, ['checkOutTime', 'checkOut'], '-')}</td><td className="px-4 py-4"><Badge>{getStatus(record)}</Badge></td></tr>} />
        </>
      ) : null}
    </>
  )
}

export default AttendancePage
