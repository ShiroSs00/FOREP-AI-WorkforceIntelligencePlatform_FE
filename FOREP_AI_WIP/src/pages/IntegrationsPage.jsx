import { useEffect, useMemo, useState } from 'react'
import { Cable, RefreshCw } from 'lucide-react'
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
import { getOAuth2LoginLinks, getOAuth2RedirectUrl } from '../services/authService.js'
import { connectIntegration, getIntegrationRuntimeStatus, getIntegrationSyncLogs, getIntegrationsByTeam, integrationProviders, syncIntegration } from '../services/integrationService.js'
import { extractBackendMessage, getDate, getId, valueOf } from '../services/responseNormalizer.js'

const emptyConnectForm = {
  teamId: '',
  projectId: '',
  provider: 'GITHUB',
  projectKey: '',
  jiraDomain: '',
  connectionKey: '',
}

function cleanPayload(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== '' && value !== undefined && value !== null))
}

function IntegrationsPage() {
  const { selectedRole, accountContext } = useRole()
  const canTriggerSync = ['director', 'manager'].includes(selectedRole)
  const teamId = accountContext.teamId ?? ''
  const [configs, setConfigs] = useState([])
  const [runtimeStatus, setRuntimeStatus] = useState(null)
  const [oauthLinks, setOauthLinks] = useState(null)
  const [syncLogs, setSyncLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [connectResult, setConnectResult] = useState(null)
  const [connectModalOpen, setConnectModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [connectForm, setConnectForm] = useState(emptyConnectForm)
  const [submitting, setSubmitting] = useState(false)

  const activeCount = useMemo(() => configs.filter((config) => Boolean(valueOf(config, ['isActive'], false))).length, [configs])
  const filteredConfigs = useMemo(() => configs.filter((config) => {
    const content = [
      valueOf(config, ['provider'], ''),
      valueOf(config, ['teamId'], ''),
      valueOf(config, ['projectId', 'projectName'], ''),
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
      const [configRows, runtime] = await Promise.all([
        getIntegrationsByTeam(teamId),
        getIntegrationRuntimeStatus().catch(() => null),
      ])
      setConfigs(configRows)
      setRuntimeStatus(runtime)
    } catch (err) {
      setConfigs([])
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const loadOAuthLinks = async () => {
    setActionError('')
    try {
      setOauthLinks(await getOAuth2LoginLinks())
    } catch (err) {
      setActionError(err.message)
      setOauthLinks(null)
    }
  }

  const openConnect = () => {
    setConnectForm({ ...emptyConnectForm, teamId })
    setConnectResult(null)
    setActionError('')
    setActionMessage('')
    setConnectModalOpen(true)
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

  const viewLogs = async (config) => {
    setActionError('')
    setActionMessage('')
    try {
      setSyncLogs(await getIntegrationSyncLogs(getId(config)))
    } catch (err) {
      setActionError(err.message)
      setSyncLogs([])
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadConfigs()
    }, 0)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <PageHeader
        eyebrow="FOREP / Trung tâm tích hợp"
        title="Trung tâm tích hợp"
        description="Kết nối Jira/GitHub để import project, issue, repository, commit, pull request và member ở chế độ read-only."
        action={(
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={loadConfigs}><RefreshCw size={16} />Làm mới</Button>
            <Button onClick={openConnect}>Kết nối Jira/GitHub</Button>
          </div>
        )}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"><Cable size={18} /></span>
          <div><p className="text-sm text-[var(--muted)]">Kết nối đã tải</p><p className="text-2xl font-bold text-[var(--text)]">{configs.length}</p></div>
          </div>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Kết nối đang bật</p>
          <p className="mt-2 text-2xl font-bold text-[var(--text)]">{activeCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Nguồn hỗ trợ</p>
          <p className="mt-2 text-lg font-bold text-[var(--text)]">{integrationProviders.join(', ')}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Trạng thái runtime</p>
          <p className="mt-2 text-lg font-bold text-[var(--text)]">{runtimeStatus ? `${valueOf(runtimeStatus, ['activeConfigCount'], 0)} bật / ${valueOf(runtimeStatus, ['failedConfigCount'], 0)} lỗi` : 'Chưa tải'}</p>
        </Card>
      </div>

      <Card className="mb-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-[var(--text)]">Kết nối bằng OAuth</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Dùng link do backend cung cấp để kết nối GitHub/Jira. Token không được lưu trong localStorage.</p>
          </div>
          <Button variant="secondary" onClick={loadOAuthLinks}>Tải link kết nối</Button>
        </div>
        {oauthLinks ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {['github', 'google', 'jira'].map((provider) => {
              const url = valueOf(oauthLinks, [provider, `${provider}Url`, `${provider}LoginUrl`], '')
              return (
                <a
                  key={provider}
                  className="rounded-lg border border-[var(--border)] bg-slate-50 px-4 py-3 text-sm font-semibold capitalize text-[var(--text)] transition-colors hover:border-sky-300 hover:text-sky-600 dark:bg-slate-900"
                  href={url || getOAuth2RedirectUrl(provider)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Kết nối {provider}
                  <span className="mt-1 block text-xs font-normal text-[var(--muted)]">Mở luồng xác thực từ backend</span>
                </a>
              )
            })}
          </div>
        ) : null}
      </Card>

      <Card className="mb-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <label>
            <span className="text-sm font-medium text-[var(--text)]">Tìm kiếm</span>
            <Input className="mt-2" placeholder="Tìm provider, project key, trạng thái..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <Button onClick={loadConfigs} disabled={!teamId}>Tải kết nối</Button>
        </div>
        {!teamId ? <p className="mt-3 text-sm text-[var(--muted)]">Chưa có team scope trong tài khoản hiện tại. FOREP sẽ tự tải kết nối sau khi backend trả team cho manager.</p> : null}
      </Card>

      {actionMessage ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{actionMessage}</p> : null}
      {actionError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
      {loading ? <LoadingState message="Đang tải kết nối..." /> : null}
      {error ? <ErrorState title="Không tải được dữ liệu tích hợp" description={error.message} onRetry={loadConfigs} /> : null}

      {!loading && !error ? (
        <Table
          columns={['Nguồn', 'Project', 'Đồng bộ', 'Trạng thái', 'Cập nhật', 'Hành động']}
          rows={filteredConfigs}
          empty={<EmptyState title={teamId ? 'Chưa có integration nào được kết nối.' : 'Chưa có team scope cho tài khoản này.'} description={teamId ? 'Manager có thể kết nối Jira/GitHub để bắt đầu import dữ liệu read-only.' : 'Backend cần trả team scope cho manager trước khi tải integration.'} />}
          renderRow={(config, index) => (
            <tr key={`${getId(config)}-${index}`}>
              <td className="px-4 py-4"><Badge>{valueOf(config, ['provider'], 'Unknown')}</Badge></td>
              <td className="px-4 py-4 text-[var(--muted)]"><p>{valueOf(config, ['projectName', 'projectId'], '-')}</p><p className="text-xs">{valueOf(config, ['projectKey'], '-')}</p></td>
              <td className="px-4 py-4"><Badge>{valueOf(config, ['lastSyncStatus'], 'Chưa đồng bộ')}</Badge><p className="mt-1 text-xs text-[var(--muted)]">{valueOf(config, ['lastSyncError'], '')}</p></td>
              <td className="px-4 py-4"><Badge tone={valueOf(config, ['isActive'], false) ? 'Success' : 'Warning'}>{valueOf(config, ['isActive'], false) ? 'Đang bật' : 'Tạm tắt'}</Badge></td>
              <td className="px-4 py-4 text-[var(--muted)]">{valueOf(config, ['updatedAt', 'createdAt'], getDate(config))}</td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {canTriggerSync ? <Button variant="secondary" onClick={() => syncConfig(config)}>Đồng bộ</Button> : null}
                  <Button variant="secondary" onClick={() => viewLogs(config)}>Nhật ký</Button>
                </div>
              </td>
            </tr>
          )}
        />
      ) : null}

      {syncLogs.length ? (
        <Card className="mt-5">
          <h2 className="font-semibold text-[var(--text)]">Lịch sử đồng bộ</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-[var(--muted)]"><tr><th className="py-2">Bắt đầu</th><th>Trạng thái</th><th>Nguồn</th><th>Thông báo</th><th>Kết quả</th><th>Kết thúc</th></tr></thead>
              <tbody>{syncLogs.map((log, index) => <tr key={`${getId(log)}-${index}`} className="border-t border-[var(--border)]"><td className="py-3 text-[var(--muted)]">{valueOf(log, ['startedAt'], '-')}</td><td><Badge>{valueOf(log, ['status'], 'UNKNOWN')}</Badge></td><td>{valueOf(log, ['provider'], '-')}</td><td className="text-[var(--muted)]">{valueOf(log, ['errorMessage', 'message'], '-')}</td><td className="text-[var(--muted)]">{valueOf(log, ['totalFetched'], 0)} fetched / {valueOf(log, ['totalCreated'], 0)} created / {valueOf(log, ['totalUpdated'], 0)} updated</td><td className="text-[var(--muted)]">{valueOf(log, ['finishedAt'], '-')}</td></tr>)}</tbody>
            </table>
          </div>
        </Card>
      ) : null}

      <Modal open={connectModalOpen} title="Kết nối Jira/GitHub" onClose={() => setConnectModalOpen(false)}>
        <form onSubmit={submitConnect} className="grid gap-4">
          <p className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-200">Kết nối này chỉ dùng để import dữ liệu read-only. FOREP không ghi ngược Jira/GitHub.</p>
          <Select value={connectForm.provider} onChange={(event) => setConnectForm({ ...connectForm, provider: event.target.value })}>
            {integrationProviders.map((provider) => <option key={provider}>{provider}</option>)}
          </Select>
          <Input required placeholder="Jira project key hoặc GitHub owner/repo" value={connectForm.projectKey} onChange={(event) => setConnectForm({ ...connectForm, projectKey: event.target.value })} />
          <Input placeholder="Jira domain, ví dụ company.atlassian.net" value={connectForm.jiraDomain} onChange={(event) => setConnectForm({ ...connectForm, jiraDomain: event.target.value })} />
          <Input required type="password" placeholder="Token/API key" value={connectForm.connectionKey} onChange={(event) => setConnectForm({ ...connectForm, connectionKey: event.target.value })} />
          {connectResult ? (
            <Card>
              <h3 className="font-semibold text-[var(--text)]">Kết quả kết nối</h3>
              <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                <p>Webhook: {String(valueOf(connectResult, ['webhookRegistered'], false))}</p>
                <p>Thông báo: {valueOf(connectResult, ['message'], '-')}</p>
              </div>
            </Card>
          ) : null}
          {actionError ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
          <div className="flex justify-end"><Button type="submit" disabled={submitting || !teamId}>{submitting ? 'Đang kết nối...' : 'Kết nối'}</Button></div>
        </form>
      </Modal>
    </>
  )
}

export default IntegrationsPage
