import { useMemo, useState } from 'react'
import { Building2, Globe2, MapPin, Plus, RefreshCw, ShieldCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import Input from '../components/ui/Input.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import Modal from '../components/ui/Modal.jsx'
import Table from '../components/ui/Table.jsx'
import { useRole } from '../context/role.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { createOrganization, deleteOrganization, getOrganizations, updateOrganization } from '../services/organizationService.js'
import { extractBackendMessage, getDate, getId, getName, valueOf } from '../services/responseNormalizer.js'

const emptyOrganization = {
  name: '',
  domain: '',
  logoUrl: '',
  latitude: '',
  longitude: '',
  allowedRadiusMeters: '',
}

function toOrganizationForm(organization = emptyOrganization) {
  return {
    name: valueOf(organization, ['name', 'organizationName'], ''),
    domain: valueOf(organization, ['domain'], ''),
    logoUrl: valueOf(organization, ['logoUrl'], ''),
    latitude: valueOf(organization, ['latitude'], ''),
    longitude: valueOf(organization, ['longitude'], ''),
    allowedRadiusMeters: valueOf(organization, ['allowedRadiusMeters'], ''),
  }
}

function buildOrganizationPayload(form) {
  return {
    name: form.name.trim(),
    domain: form.domain.trim() || undefined,
    logoUrl: form.logoUrl.trim() || undefined,
    latitude: form.latitude !== '' ? Number(form.latitude) : undefined,
    longitude: form.longitude !== '' ? Number(form.longitude) : undefined,
    allowedRadiusMeters: form.allowedRadiusMeters !== '' ? Number(form.allowedRadiusMeters) : undefined,
  }
}

function OrganizationsPage() {
  const { selectedRole } = useRole()
  const canManageOrganization = selectedRole === 'admin'
  const { data: organizations, loading, error, apiPending, retry } = useServiceData(getOrganizations, [])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingOrganization, setEditingOrganization] = useState(null)
  const [form, setForm] = useState(emptyOrganization)
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const filtered = useMemo(() => organizations.filter((organization) => {
    const content = `${getName(organization)} ${valueOf(organization, ['domain'], '')}`.toLowerCase()
    return content.includes(search.toLowerCase())
  }), [organizations, search])

  const openCreate = () => {
    setEditingOrganization(null)
    setForm(emptyOrganization)
    setActionError('')
    setActionMessage('')
    setModalOpen(true)
  }

  const openEdit = (organization) => {
    setEditingOrganization(organization)
    setForm(toOrganizationForm(organization))
    setActionError('')
    setActionMessage('')
    setModalOpen(true)
  }

  const submitOrganization = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setActionError('')
    setActionMessage('')
    try {
      const payload = buildOrganizationPayload(form)
      if (!payload.name) throw new Error('Organization name is required.')
      const response = editingOrganization ? await updateOrganization(getId(editingOrganization), payload) : await createOrganization(payload)
      setActionMessage(extractBackendMessage(response, editingOrganization ? 'Organization updated.' : 'Organization created.'))
      setForm(emptyOrganization)
      setModalOpen(false)
      retry()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const removeOrganization = async (organization) => {
    setActionError('')
    setActionMessage('')
    try {
      const response = await deleteOrganization(getId(organization))
      setActionMessage(extractBackendMessage(response, 'Organization deleted.'))
      if (getId(selected) === getId(organization)) setSelected(null)
      retry()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={`${selectedRole === 'manager' ? 'Manager' : 'Platform Admin'} / Organizations`}
        title="Organizations"
        description={canManageOrganization ? 'Manage tenant workspaces, domains and attendance location policy.' : 'View organization workspace information allowed for your account role.'}
        action={(
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={retry}><RefreshCw size={16} />Refresh</Button>
            {canManageOrganization ? <Button onClick={openCreate}><Plus size={16} />Create Organization</Button> : null}
          </div>
        )}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"><Building2 size={18} /></span>
            <div>
              <p className="text-sm text-[var(--muted)]">Organizations</p>
              <p className="text-2xl font-bold text-[var(--text)]">{organizations.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300"><Globe2 size={18} /></span>
            <div>
              <p className="text-sm text-[var(--muted)]">Domains</p>
              <p className="text-2xl font-bold text-[var(--text)]">{organizations.filter((item) => valueOf(item, ['domain'], '')).length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"><MapPin size={18} /></span>
            <div>
              <p className="text-sm text-[var(--muted)]">Location policies</p>
              <p className="text-2xl font-bold text-[var(--text)]">{organizations.filter((item) => valueOf(item, ['allowedRadiusMeters'], '')).length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-[var(--text)]">Organization records</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Search and inspect organization workspace records.</p>
          </div>
          <Input className="lg:max-w-xs" placeholder="Search organizations..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </Card>

      {loading ? <LoadingState message="Loading organizations..." /> : null}
      {error ? <ErrorState title="Unable to load organizations" description={error.message} status={error.status} details={error.details} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="Connect organization APIs to manage organizations." onRetry={retry} /> : null}
      {actionMessage ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{actionMessage}</p> : null}
      {actionError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}

      {!loading && !error && !apiPending ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <Table
            columns={canManageOrganization ? ['Organization', 'Domain', 'Check-in policy', 'Created', 'Actions'] : ['Organization', 'Domain', 'Check-in policy', 'Created']}
            rows={filtered}
            empty={<EmptyState title="No organizations from the backend yet." description="Create an organization or check that your admin account has organization access." />}
            renderRow={(organization, index) => (
              <tr key={`${getId(organization)}-${index}`} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900" onClick={() => setSelected(organization)}>
                <td className="px-4 py-4">
                  <p className="font-semibold text-[var(--text)]">{getName(organization)}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">ID: {getId(organization)}</p>
                </td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(organization, ['domain'], '-')}</td>
                <td className="px-4 py-4 text-[var(--muted)]">{valueOf(organization, ['allowedRadiusMeters'], '-')} m</td>
                <td className="px-4 py-4 text-[var(--muted)]">{getDate(organization)}</td>
                {canManageOrganization ? <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={(event) => { event.stopPropagation(); openEdit(organization) }}>Edit</Button>
                    <Button variant="ghost" onClick={(event) => { event.stopPropagation(); removeOrganization(organization) }}>Delete</Button>
                  </div>
                </td> : null}
              </tr>
            )}
          />

          <Card>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-sky-500" />
              <h2 className="font-semibold text-[var(--text)]">Organization detail</h2>
            </div>
            {selected ? (
              <dl className="mt-5 space-y-3 text-sm">
                {[
                  ['Name', getName(selected)],
                  ['Domain', valueOf(selected, ['domain'], '-')],
                  ['Logo URL', valueOf(selected, ['logoUrl'], '-')],
                  ['Latitude', valueOf(selected, ['latitude'], '-')],
                  ['Longitude', valueOf(selected, ['longitude'], '-')],
                  ['Allowed radius', `${valueOf(selected, ['allowedRadiusMeters'], '-')} m`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-[var(--border)] pb-2">
                    <dt className="text-[var(--muted)]">{label}</dt>
                    <dd className="max-w-[12rem] truncate font-medium text-[var(--text)]">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-[var(--muted)]">Select an organization to inspect the exact API fields.</p>
            )}
          </Card>
        </div>
      ) : null}

      <Modal open={modalOpen} title={editingOrganization ? 'Update Organization' : 'Create Organization'} onClose={() => setModalOpen(false)}>
        <form onSubmit={submitOrganization} className="grid gap-4">
          <Input required placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input placeholder="Domain" value={form.domain} onChange={(event) => setForm({ ...form, domain: event.target.value })} />
          <Input placeholder="Logo URL" value={form.logoUrl} onChange={(event) => setForm({ ...form, logoUrl: event.target.value })} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input type="number" step="any" placeholder="Latitude" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} />
            <Input type="number" step="any" placeholder="Longitude" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} />
            <Input type="number" min="0" placeholder="Allowed radius meters" value={form.allowedRadiusMeters} onChange={(event) => setForm({ ...form, allowedRadiusMeters: event.target.value })} />
          </div>
          {actionError ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingOrganization ? 'Update Organization' : 'Create Organization'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default OrganizationsPage
