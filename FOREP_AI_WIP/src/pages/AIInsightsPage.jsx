import { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import SearchAndFilterBar from '../components/SearchAndFilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { useRole } from '../context/role.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { generateInsight, getAiRuntimeStatus, getInsightsByOrganization, getManagedTeamInsights, getMyInsights } from '../services/aiInsightService.js'
import { adoptSuggestion, getManagedTeamSuggestions, getSuggestionsByEmployee, getSuggestionsByOrganization } from '../services/aiSuggestionService.js'
import { extractBackendMessage, getDate, getId, valueOf } from '../services/responseNormalizer.js'

const pageCopy = {
  admin: ['AI Insights hệ thống', 'Admin xem trạng thái AI ở mức hệ thống, không can thiệp dữ liệu dự án.'],
  director: ['Gợi ý AI tổ chức', 'Insight toàn organization dựa trên dữ liệu đã đồng bộ và mapping.'],
  manager: ['Gợi ý AI cho team', 'Recommendation cho workload, bottleneck và rủi ro trong team/project được giao.'],
  employee: ['Phản hồi AI cá nhân', 'Insight cá nhân dựa trên công việc và contribution của bạn.'],
}

function insightTitle(insight) {
  return valueOf(insight, ['summary', 'title', 'insightType'], 'AI insight')
}

function suggestionTitle(suggestion) {
  return valueOf(suggestion, ['title', 'suggestionType', 'description'], 'AI recommendation')
}

function parseFullAnalysis(value) {
  if (!value) return null
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function AIInsightsPage() {
  const { selectedRole, accountContext } = useRole()
  const [search, setSearch] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [runtimeStatus, setRuntimeStatus] = useState(null)
  const [runtimeError, setRuntimeError] = useState('')

  const loadInsights = useCallback(() => {
    if (selectedRole === 'employee') return getMyInsights
    if (selectedRole === 'manager') return getManagedTeamInsights
    if (accountContext.organizationId) return () => getInsightsByOrganization(accountContext.organizationId)
    return () => Promise.resolve([])
  }, [selectedRole, accountContext.organizationId])()

  const loadSuggestions = useCallback(() => {
    if (selectedRole === 'employee') return accountContext.employeeId ? () => getSuggestionsByEmployee(accountContext.employeeId) : () => Promise.resolve([])
    if (selectedRole === 'manager') return getManagedTeamSuggestions
    if (accountContext.organizationId) return () => getSuggestionsByOrganization(accountContext.organizationId)
    return () => Promise.resolve([])
  }, [selectedRole, accountContext.employeeId, accountContext.organizationId])()

  const { data: insights, loading, error, apiPending, retry } = useServiceData(loadInsights, [selectedRole, accountContext.organizationId, accountContext.employeeId])
  const { data: suggestions, loading: suggestionsLoading, error: suggestionsError, retry: retrySuggestions } = useServiceData(loadSuggestions, [selectedRole, accountContext.organizationId, accountContext.employeeId])

  const filtered = useMemo(() => insights.filter((insight) => `${insightTitle(insight)} ${valueOf(insight, ['fullAnalysis', 'content', 'description'], '')}`.toLowerCase().includes(search.toLowerCase())), [insights, search])

  useEffect(() => {
    let active = true
    getAiRuntimeStatus()
      .then((status) => {
        if (active) setRuntimeStatus(status)
      })
      .catch((err) => {
        if (active) setRuntimeError(err.message)
      })
    return () => {
      active = false
    }
  }, [])

  const handleGenerateInsight = async () => {
    setActionError('')
    setActionMessage('')
    if (!accountContext.employeeId) {
      setActionError('Chưa có thông tin nhân viên để yêu cầu sinh insight.')
      return
    }
    try {
      const response = await generateInsight(accountContext.employeeId)
      setActionMessage(extractBackendMessage(response, 'Đã gửi yêu cầu sinh insight.'))
      retry()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const handleAdoptSuggestion = async (suggestion) => {
    setActionError('')
    setActionMessage('')
    try {
      const response = await adoptSuggestion(getId(suggestion))
      setActionMessage(extractBackendMessage(response, 'Đã ghi nhận recommendation.'))
      retrySuggestions()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <>
      <PageHeader title={pageCopy[selectedRole][0]} description={pageCopy[selectedRole][1]} action={selectedRole === 'employee' ? <Button disabled={!accountContext.employeeId} onClick={handleGenerateInsight}>Yêu cầu insight cá nhân</Button> : null} />
      {loading || suggestionsLoading ? <LoadingState message="Đang tải AI insight..." /> : null}
      {error ? <ErrorState title="Không tải được AI insight" description={error.message} onRetry={retry} /> : null}
      {suggestionsError ? <ErrorState title="Không tải được AI recommendation" description={suggestionsError.message} onRetry={retrySuggestions} /> : null}
      {apiPending ? <ErrorState description="API AI insight chưa sẵn sàng cho tài khoản hiện tại." onRetry={retry} /> : null}
      {actionMessage ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{actionMessage}</p> : null}
      {actionError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}

      <Card className="mb-5">
        <div className="grid gap-3 md:grid-cols-4">
          <div><p className="text-sm text-[var(--muted)]">Provider AI</p><p className="mt-1 font-semibold text-[var(--text)]">{valueOf(runtimeStatus, ['provider'], runtimeError || 'Chưa tải')}</p></div>
          <div><p className="text-sm text-[var(--muted)]">Model</p><p className="mt-1 font-semibold text-[var(--text)]">{valueOf(runtimeStatus, ['model'], '-')}</p></div>
          <div><p className="text-sm text-[var(--muted)]">API key</p><p className="mt-1 font-semibold text-[var(--text)]">{runtimeStatus ? (valueOf(runtimeStatus, ['apiKeyConfigured'], false) ? 'Đã cấu hình' : 'Chưa cấu hình') : '-'}</p></div>
          <div><p className="text-sm text-[var(--muted)]">RAG</p><p className="mt-1 font-semibold text-[var(--text)]">{runtimeStatus ? (valueOf(runtimeStatus, ['ragEnabled'], false) ? 'Bật' : 'Tắt') : '-'}</p></div>
        </div>
      </Card>

      {!loading && !error && !apiPending ? (
        <>
          <SearchAndFilterBar search={search} onSearchChange={setSearch} filters={[]} />
          <div className="grid gap-4 lg:grid-cols-2">{filtered.map((insight, index) => {
            const analysis = parseFullAnalysis(valueOf(insight, ['fullAnalysis'], null))
            const reasons = Array.isArray(analysis?.reasons) ? analysis.reasons : []
            const recommendations = Array.isArray(analysis?.recommendations) ? analysis.recommendations : []
            return <Card key={`${getId(insight)}-${index}`} className="page-animate opacity-0"><div className="flex flex-wrap gap-2"><Badge>{valueOf(insight, ['insightType', 'category'], 'Insight')}</Badge><Badge>{analysis?.riskLevel || valueOf(insight, ['severity'], 'Info')}</Badge></div><h2 className="mt-4 font-semibold text-[var(--text)]">{analysis?.summary || insightTitle(insight)}</h2><p className="mt-2 text-sm text-[var(--muted)]">{analysis ? 'Phân tích có cấu trúc từ backend AI.' : valueOf(insight, ['content', 'description', 'fullAnalysis'], 'Backend chưa trả nội dung phân tích.')}</p>{reasons.length ? <div className="mt-4"><p className="text-sm font-semibold text-[var(--text)]">Lý do</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">{reasons.map((item, reasonIndex) => <li key={reasonIndex}>{item}</li>)}</ul></div> : null}{recommendations.length ? <div className="mt-4"><p className="text-sm font-semibold text-[var(--text)]">Khuyến nghị</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">{recommendations.map((item, recommendationIndex) => <li key={recommendationIndex}>{item}</li>)}</ul></div> : null}<p className="mt-3 text-xs text-[var(--muted)]">{getDate(insight)}</p></Card>
          })}</div>
          {!filtered.length ? <EmptyState title="Chưa có AI insight." description="Insight sẽ xuất hiện sau khi dữ liệu Jira/GitHub được đồng bộ và mapping danh tính hoàn tất." /> : null}

          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-[var(--text)]">Recommendation</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {suggestions.map((suggestion, index) => <Card key={`${getId(suggestion)}-${index}`} className="page-animate opacity-0"><div className="flex flex-wrap gap-2"><Badge>{valueOf(suggestion, ['suggestionType'], 'Recommendation')}</Badge><Badge>{valueOf(suggestion, ['isAdopted', 'adopted'], false) ? 'Đã áp dụng' : 'Mở'}</Badge></div><h3 className="mt-4 font-semibold text-[var(--text)]">{suggestionTitle(suggestion)}</h3><p className="mt-2 text-sm text-[var(--muted)]">{valueOf(suggestion, ['description', 'content'], 'Backend chưa trả mô tả recommendation.')}</p><Button className="mt-4" variant="secondary" disabled={Boolean(valueOf(suggestion, ['isAdopted', 'adopted'], false))} onClick={() => handleAdoptSuggestion(suggestion)}>Ghi nhận recommendation</Button></Card>)}
            </div>
            {!suggestions.length ? <EmptyState title="Chưa có recommendation." /> : null}
          </div>
        </>
      ) : null}
    </>
  )
}

export default AIInsightsPage
