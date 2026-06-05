import { useMemo, useState } from 'react'
import { RefreshCw, ShieldCheck, UsersRound } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import Input from '../components/ui/Input.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import Table from '../components/ui/Table.jsx'
import { useServiceData } from '../hooks/useServiceData.js'
import { getEmployees } from '../services/employeeService.js'
import { getId, getName, valueOf } from '../services/responseNormalizer.js'

function UsersPage() {
  const { data: users, loading, error, apiPending, retry } = useServiceData(getEmployees, [])
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => users.filter((user) => {
    const content = [
      getName(user),
      valueOf(user, ['email'], ''),
      valueOf(user, ['role', 'jobTitle'], ''),
      valueOf(user, ['department'], ''),
    ].join(' ').toLowerCase()
    return content.includes(search.toLowerCase())
  }), [users, search])

  return (
    <>
      <PageHeader
        eyebrow="Platform Admin / Users"
        title="Users"
        description="Admin user visibility currently uses account-linked employee records because a dedicated users module is not exposed yet."
        action={<Button variant="secondary" onClick={retry}><RefreshCw size={16} />Refresh</Button>}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300"><UsersRound size={18} /></span>
            <div><p className="text-sm text-[var(--muted)]">Account records</p><p className="text-2xl font-bold text-[var(--text)]">{users.length}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"><ShieldCheck size={18} /></span>
            <div><p className="text-sm text-[var(--muted)]">RBAC source</p><p className="text-lg font-bold text-[var(--text)]">Backend JWT / auth</p></div>
          </div>
        </Card>
      </div>

      <Card className="mb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-[var(--text)]">User records</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">No fake users are generated here. Rows are mapped safely from EmployeeResponse fields.</p>
          </div>
          <Input className="lg:max-w-xs" placeholder="Search users..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </Card>

      {loading ? <LoadingState message="Loading users..." /> : null}
      {error ? <ErrorState title="Unable to load users" description={error.message} status={error.status} details={error.details} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="Connect user APIs to display account records." onRetry={retry} /> : null}
      {!loading && !error && !apiPending ? (
        <Table
          columns={['User', 'Role', 'Department', 'Team', 'Status']}
          rows={filtered}
          empty={<EmptyState title="No users available." description="The current account may not have access to employee/user records." />}
          renderRow={(user, index) => (
            <tr key={`${getId(user)}-${index}`}>
              <td className="px-4 py-4">
                <p className="font-semibold text-[var(--text)]">{getName(user)}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{valueOf(user, ['email'], 'No email')}</p>
              </td>
              <td className="px-4 py-4 text-[var(--muted)]">{valueOf(user, ['role', 'jobTitle'], 'Unknown')}</td>
              <td className="px-4 py-4 text-[var(--muted)]">{valueOf(user, ['department'], '-')}</td>
              <td className="px-4 py-4 text-[var(--muted)]">{valueOf(user, ['teamName', 'teamId'], '-')}</td>
              <td className="px-4 py-4 text-[var(--muted)]">{valueOf(user, ['status', 'accountStatus'], '-')}</td>
            </tr>
          )}
        />
      ) : null}
    </>
  )
}

export default UsersPage
