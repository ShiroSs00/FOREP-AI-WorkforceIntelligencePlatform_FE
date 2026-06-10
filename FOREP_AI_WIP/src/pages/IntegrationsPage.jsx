import { useMemo, useState } from 'react'
import { Cable, Plus, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import Input from '../components/ui/Input.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import Modal from '../components/ui/Modal.jsx'
import Select from '../components/ui/Select.jsx'
import Table from '../components/ui/Table.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useRole } from '../context/role.js'
import { connectIntegration, createIntegration, deleteIntegration, getIntegrationsByTeam, integrationProviders, syncIntegration, updateIntegration } from '../services/integrationService.js'
import { extractBackendMessage, getDate, getId, valueOf } from '../services/responseNormalizer.js'

const emptyConfigForm = {
  teamId: '',
  provider: 'GITHUB',
  webhookSecret: '',
  accessToken: '',
  projectKey: '',
  isActive: true,
}

const emptyConnectForm = {
  teamId: '',
  provider: 'GITHUB',
  projectKey: '',
  connectionKey: '',
}

function toConfigForm(config = emptyConfigForm) {
  return {
    teamId: valueOf(config, ['teamId'], ''),
    provider: valueOf(config, ['provider'], 'GITHUB'),
    webhookSecret: '',
    accessToken: '',
    projectKey: valueOf(config, ['projectKey'], ''),
    isActive: Boolean(valueOf(config, ['isActive'], true)),
  }
}

function cleanPayload(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== '' && value !== undefined && value !== null))
}

function IntegrationsPage() {
  const { accountContext } = useRole()
  const [teamId, setTeamId] = useState(accountContext.teamId ?? '')
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [connectResult, setConnectResult] = useState(null)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [connectModalOpen, setConnectModalOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState(null)
  const [search, setSearch] = useState('')
  const [configForm, setConfigForm] = useState(emptyConfigForm)
  const [connectForm, setConnectForm] = useState(emptyConnectForm)
  const [submitting, setSubmitting] = useState(false)

  const activeCount = useMemo(() => configs.filter((config) => Boolean(valueOf(config, ['isActive'], false))).length, [configs])
  const filteredConfigs = useMemo(() => configs.filter((config) => {
    const content = [
      valueOf(config, ['provider'], ''),
      valueOf(config, ['teamId'], ''),
      valueOf(config, ['projectKey'], ''),
      valueOf(config, ['id'], ''),
    ].join(' ').toLowerCase()
    return content.includes(search.toLowerCase())
  }), [configs, search])

  const loadConfigs = async () => {
    setError(null)
    setActionError('')
    setActionMessage('')
    if (!teamId) {
      setConfigs([])
      return
    }
    setLoading(true)
    try {
      setConfigs(await getIntegrationsByTeam(teamId))
    } catch (err) {
      setConfigs([])
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingConfig(null)
    setConfigForm({ ...emptyConfigForm, teamId })
    setActionError('')
    setActionMessage('')
    setConfigModalOpen(true)
  }

  const openEdit = (config) => {
    setEditingConfig(config)
    setConfigForm(toConfigForm(config))
    setActionError('')
    setActionMessage('')
    setConfigModalOpen(true)
  }

  const openConnect = () => {
    setConnectForm({ ...emptyConnectForm, teamId })
    setConnectResult(null)
    setActionError('')
    setActionMessage('')
    setConnectModalOpen(true)
  }

  const submitConfig = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setActionError('')
    setActionMessage('')
    try {
      const payload = cleanPayload(configForm)
      const response = editingConfig ? await updateIntegration(getId(editingConfig), payload) : await createIntegration(payload)
      setActionMessage(extractBackendMessage(response, editingConfig ? 'Integration updated.' : 'Integration created.'))
      setConfigModalOpen(false)
      await loadConfigs()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const submitConnect = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setActionError('')
    setActionMessage('')
    setConnectResult(null)
    try {
      const response = await connectIntegration(cleanPayload(connectForm))
      setConnectResult(response)
      setActionMessage(extractBackendMessage(response, 'Integration connected.'))
      await loadConfigs()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const syncConfig = async (config) => {
    setActionError('')
    setActionMessage('')
    try {
      const response = await syncIntegration(getId(config))
      setActionMessage(extractBackendMessage(response, 'Integration sync started.'))
      await loadConfigs()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const removeConfig = async (config) => {
    setActionError('')
    setActionMessage('')
    try {
      const response = await deleteIntegration(getId(config))
      setActionMessage(extractBackendMessage(response, 'Integration deleted.'))
      await loadConfigs()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Platform / Integrations"
        title="Integration Management"
        description="Manage task integration configs and connect provider webhooks from the backend integration controller."
        action={(
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={loadConfigs}><RefreshCw size={16} />Refresh</Button>
            <Button variant="secondary" onClick={openConnect}>Connect Provider</Button>
            <Button onClick={openCreate}><Plus size={16} />Create Config</Button>
          </div>
        )}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"><Cable size={18} /></span>
            <div><p className="text-sm text-[var(--muted)]">Configs returned</p><p className="text-2xl font-bold text-[var(--text)]">{configs.length}</p></div>
          </div>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Active configs</p>
          <p className="mt-2 text-2xl font-bold text-[var(--text)]">{activeCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Supported providers</p>
          <p className="mt-2 text-lg font-bold text-[var(--text)]">{integrationProviders.join(', ')}</p>
        </Card>
      </div>

      <Card className="mb-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <label>
            <span className="text-sm font-medium text-[var(--text)]">Team ID</span>
            <Input className="mt-2" placeholder="Paste team UUID to load configs" value={teamId} onChange={(event) => setTeamId(event.target.value)} />
          </label>
          <label>
            <span className="text-sm font-medium text-[var(--text)]">Search</span>
            <Input className="mt-2" placeholder="Search provider, project, config..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <Button onClick={loadConfigs} disabled={!teamId}>Load Integrations</Button>
        </div>
      </Card>

      {actionMessage ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{actionMessage}</p> : null}
      {actionError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
      {loading ? <LoadingState message="Loading integration configs..." /> : null}
      {error ? <ErrorState title="Unable to load integrations" description={error.message} status={error.status} details={error.details} onRetry={loadConfigs} /> : null}

      {!loading && !error ? (
        <Table
          columns={['Provider', 'Team', 'Project', 'Active', 'Updated', 'Actions']}
          rows={filteredConfigs}
          empty={<EmptyState title={teamId ? 'No integrations found for this team.' : 'Enter a Team ID to load integrations.'} description="Integration configs from the backend will appear here for the selected team." />}
          renderRow={(config, index) => (
            <tr key={`${getId(config)}-${index}`}>
              <td className="px-4 py-4"><Badge>{valueOf(config, ['provider'], 'Unknown')}</Badge></td>
              <td className="px-4 py-4 text-[var(--muted)]">{valueOf(config, ['teamId'], '-')}</td>
              <td className="px-4 py-4 text-[var(--muted)]">{valueOf(config, ['projectKey'], '-')}</td>
              <td className="px-4 py-4"><Badge tone={valueOf(config, ['isActive'], false) ? 'Success' : 'Warning'}>{valueOf(config, ['isActive'], false) ? 'Active' : 'Inactive'}</Badge></td>
              <td className="px-4 py-4 text-[var(--muted)]">{valueOf(config, ['updatedAt', 'createdAt'], getDate(config))}</td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => syncConfig(config)}>Sync</Button>
                  <Button variant="secondary" onClick={() => openEdit(config)}>Edit</Button>
                  <Button variant="ghost" onClick={() => removeConfig(config)}>Delete</Button>
                </div>
              </td>
            </tr>
          )}
        />
      ) : null}

      <Modal open={configModalOpen} title={editingConfig ? 'Update Integration Config' : 'Create Integration Config'} onClose={() => setConfigModalOpen(false)}>
        <form onSubmit={submitConfig} className="grid gap-4">
          <Input required placeholder="Team UUID" value={configForm.teamId} onChange={(event) => setConfigForm({ ...configForm, teamId: event.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select value={configForm.provider} onChange={(event) => setConfigForm({ ...configForm, provider: event.target.value })}>
              {integrationProviders.map((provider) => <option key={provider}>{provider}</option>)}
            </Select>
            <Select value={String(configForm.isActive)} onChange={(event) => setConfigForm({ ...configForm, isActive: event.target.value === 'true' })}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </div>
          <Input required={!editingConfig} placeholder="Webhook secret" value={configForm.webhookSecret} onChange={(event) => setConfigForm({ ...configForm, webhookSecret: event.target.value })} />
          <Input placeholder="Access token" value={configForm.accessToken} onChange={(event) => setConfigForm({ ...configForm, accessToken: event.target.value })} />
          <Input placeholder="Project key" value={configForm.projectKey} onChange={(event) => setConfigForm({ ...configForm, projectKey: event.target.value })} />
          {actionError ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
          <div className="flex justify-end"><Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingConfig ? 'Update Config' : 'Create Config'}</Button></div>
        </form>
      </Modal>

      <Modal open={connectModalOpen} title="Connect Provider" onClose={() => setConnectModalOpen(false)}>
        <form onSubmit={submitConnect} className="grid gap-4">
          <Input required placeholder="Team UUID" value={connectForm.teamId} onChange={(event) => setConnectForm({ ...connectForm, teamId: event.target.value })} />
          <Select value={connectForm.provider} onChange={(event) => setConnectForm({ ...connectForm, provider: event.target.value })}>
            {integrationProviders.map((provider) => <option key={provider}>{provider}</option>)}
          </Select>
          <Input required placeholder="Project key" value={connectForm.projectKey} onChange={(event) => setConnectForm({ ...connectForm, projectKey: event.target.value })} />
          <Input required placeholder="Connection key" value={connectForm.connectionKey} onChange={(event) => setConnectForm({ ...connectForm, connectionKey: event.target.value })} />
          {connectResult ? (
            <Card>
              <h3 className="font-semibold text-[var(--text)]">Connection result</h3>
              <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                <p>Config ID: {valueOf(connectResult, ['configId'], '-')}</p>
                <p>Webhook registered: {String(valueOf(connectResult, ['webhookRegistered'], false))}</p>
                <p>Webhook URL: {valueOf(connectResult, ['webhookUrl'], '-')}</p>
                <p>Webhook secret: {valueOf(connectResult, ['webhookSecret'], '-')}</p>
                <p>Message: {valueOf(connectResult, ['message'], '-')}</p>
              </div>
            </Card>
          ) : null}
          {actionError ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
          <div className="flex justify-end"><Button type="submit" disabled={submitting}>{submitting ? 'Connecting...' : 'Connect Provider'}</Button></div>
        </form>
      </Modal>
    </>
  )
}

export default IntegrationsPage
