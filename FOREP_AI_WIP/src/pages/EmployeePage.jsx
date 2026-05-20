import { useMemo, useState } from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SearchAndFilterBar from '../components/SearchAndFilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Badge from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { useServiceData } from '../hooks/useServiceData.js'
import { getEmployees } from '../services/employeeService.js'

function EmployeePage() {
  const { data: employees, loading, error, apiPending } = useServiceData(getEmployees, [])
  const [search, setSearch] = useState('')
  const [team, setTeam] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const filtered = useMemo(() => employees.filter((employee) => `${employee.name} ${employee.role} ${employee.team}`.toLowerCase().includes(search.toLowerCase()) && (!team || employee.team === team) && (!role || employee.role === role) && (!status || employee.status === status)), [employees, search, team, role, status])

  return (
    <AppLayout title="Employees">
      <PageHeader title="Employee Directory" description="Employee profiles are ready for backend identity and workforce APIs." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load employees" description={error.message} /> : null}
      {apiPending ? <ErrorState description="Connect GET /api/employees to display employee records." /> : null}
      {!loading && !error && !apiPending ? (
        <>
          <SearchAndFilterBar search={search} onSearchChange={setSearch} filters={[
            { label: 'All teams', value: team, onChange: setTeam, options: [...new Set(employees.map((item) => item.team))] },
            { label: 'All roles', value: role, onChange: setRole, options: [...new Set(employees.map((item) => item.role))] },
            { label: 'All statuses', value: status, onChange: setStatus, options: ['Active', 'On Leave'] },
          ]} />
          <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <div className="grid gap-4 md:grid-cols-2">{filtered.map((employee) => <Card key={employee.id} className="page-animate cursor-pointer opacity-0" onClick={() => setSelected(employee)}><h2 className="font-semibold text-[var(--text)]">{employee.name}</h2><p className="mt-1 text-sm text-[var(--muted)]">{employee.role}</p><div className="mt-4 flex flex-wrap gap-2"><Badge>{employee.status}</Badge><Badge>{employee.team}</Badge></div></Card>)}</div>
            <Card className="page-animate opacity-0"><h2 className="font-semibold text-[var(--text)]">Employee Details</h2>{selected ? <div className="mt-4 space-y-2 text-sm text-[var(--muted)]"><p>{selected.name}</p><p>{selected.email}</p><p>{selected.role}</p><p>{selected.team}</p></div> : <p className="mt-4 text-sm text-[var(--muted)]">Select an employee to preview backend-ready detail content.</p>}</Card>
          </div>
          {!filtered.length ? <EmptyState title="No employees" description="Connect backend API to display employee records." /> : null}
        </>
      ) : null}
    </AppLayout>
  )
}

export default EmployeePage
