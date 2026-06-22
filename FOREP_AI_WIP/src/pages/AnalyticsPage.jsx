import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import SearchAndFilterBar from '../components/SearchAndFilterBar.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { useRole } from '../context/role.js'
import { useServiceData } from '../hooks/useServiceData.js'
import { getAnalyticsDashboard, getManagedTeamsWorkloadHistory, getMyWorkloadHistory, getOrganizationWorkloadHistory } from '../services/analyticsService.js'
import { getDate, getId, getName, getStatus, valueOf } from '../services/responseNormalizer.js'

const pageCopy = {
  admin: ['Phân tích hệ thống', 'Tổng quan dữ liệu hệ thống và trạng thái phân tích ở mức platform.'],
  director: ['Phân tích tổ chức', 'Sức khỏe dự án, workload team, GitHub signal và insight trong tổ chức.'],
  manager: ['Phân tích team', 'Workload, issue aging, overdue issue và signal kỹ thuật trong phạm vi team/project được giao.'],
  employee: ['Workload cá nhân', 'Workload và AI feedback liên quan đến dữ liệu cá nhân của bạn.'],
}

function resolveAnalyticsLoader(selectedRole, accountContext) {
  if (selectedRole === 'employee') return getMyWorkloadHistory
  if (selectedRole === 'manager') return getManagedTeamsWorkloadHistory
  if (accountContext.organizationId) return () => getOrganizationWorkloadHistory(accountContext.organizationId)
  return () => Promise.resolve([])
}

function AnalyticsPage() {
  const { selectedRole, accountContext } = useRole()
  const [search, setSearch] = useState('')
  const loadAnalytics = useMemo(() => resolveAnalyticsLoader(selectedRole, accountContext), [selectedRole, accountContext])
  const { data: analytics, loading, error, apiPending, retry } = useServiceData(loadAnalytics, [selectedRole, accountContext.organizationId, accountContext.teamId, accountContext.employeeId])
  const { data: dashboard, loading: dashboardLoading, error: dashboardError, retry: retryDashboard } = useServiceData(getAnalyticsDashboard, [selectedRole])

  const filteredAnalytics = useMemo(() => analytics.filter((item) => `${getName(item)} ${getStatus(item)} ${valueOf(item, ['summary', 'description', 'content'], '')}`.toLowerCase().includes(search.toLowerCase())), [analytics, search])

  return (
    <>
      <PageHeader title={pageCopy[selectedRole][0]} description={pageCopy[selectedRole][1]} />

      {dashboardLoading || loading ? <LoadingState message="Đang tải dữ liệu phân tích..." /> : null}
      {dashboardError ? <ErrorState title="Không tải được dashboard phân tích" description={dashboardError.message} onRetry={retryDashboard} /> : null}
      {error ? <ErrorState title="Không tải được dữ liệu phân tích" description={error.message} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="API phân tích chưa sẵn sàng cho tài khoản hiện tại." onRetry={retry} /> : null}

      {!dashboardLoading && !dashboardError && dashboard ? (
        <div className="mb-6 grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card><p className="text-sm text-[var(--muted)]">Tổng task/issue</p><p className="mt-2 text-2xl font-bold text-[var(--text)]">{valueOf(dashboard, ['totalTasks'], 0)}</p></Card>
            <Card><p className="text-sm text-[var(--muted)]">Đã hoàn tất</p><p className="mt-2 text-2xl font-bold text-[var(--text)]">{valueOf(dashboard, ['completedTasks'], 0)}</p></Card>
            <Card><p className="text-sm text-[var(--muted)]">Quá hạn</p><p className="mt-2 text-2xl font-bold text-[var(--text)]">{valueOf(dashboard, ['overdueTasks'], 0)}</p></Card>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="font-semibold text-[var(--text)]">Phân bố rủi ro burnout</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Dữ liệu được tính từ backend analytics, không nhập thủ công trong FE.</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {['NONE', 'WATCH', 'MEDIUM', 'HIGH'].map((risk) => <div key={risk} className="rounded-lg border border-[var(--border)] p-3"><p className="text-xs tracking-[0.16em] text-[var(--muted)]">{risk}</p><p className="mt-2 text-xl font-bold text-[var(--text)]">{dashboard?.burnoutRiskCount?.[risk] ?? dashboard?.burnoutRiskDistribution?.[risk] ?? 0}</p></div>)}
              </div>
            </Card>
            <Card>
              <h2 className="font-semibold text-[var(--text)]">Tóm tắt AI</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Tổng insight: {dashboard?.aiInsightSummary?.totalInsights ?? 0}</p>
              <div className="mt-3 space-y-2">
                {(dashboard?.aiInsightSummary?.latestSummaries ?? []).slice(0, 3).map((summary, index) => <p key={index} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-[var(--text)] dark:bg-slate-900">{summary}</p>)}
                {!(dashboard?.aiInsightSummary?.latestSummaries ?? []).length ? <p className="text-sm text-[var(--muted)]">Chưa có insight AI từ backend.</p> : null}
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {!loading && !error && !apiPending && !analytics.length ? (
        <EmptyState title="Chưa có dữ liệu phân tích." description={selectedRole === 'employee' ? 'Dữ liệu workload cá nhân sẽ xuất hiện sau khi backend đồng bộ và mapping tài khoản.' : 'Dữ liệu phân tích sẽ xuất hiện sau khi Jira/GitHub được kết nối, đồng bộ và xác nhận mapping.'} />
      ) : null}

      {!loading && !error && !apiPending && analytics.length ? (
        <>
          <SearchAndFilterBar search={search} onSearchChange={setSearch} filters={[]} />
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredAnalytics.map((item, index) => <Card key={`${getId(item)}-${index}`} className="page-animate opacity-0"><h2 className="font-semibold text-[var(--text)]">{getName(item)}</h2><p className="mt-2 text-sm text-[var(--muted)]">Trạng thái: {getStatus(item)}</p><p className="mt-2 text-sm text-[var(--muted)]">Thời gian: {getDate(item)}</p><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{valueOf(item, ['summary', 'description', 'content'], 'Bản ghi phân tích từ backend.')}</p></Card>)}
          </div>
          {!filteredAnalytics.length ? <EmptyState title="Không có dữ liệu khớp tìm kiếm." /> : null}
        </>
      ) : null}
    </>
  )
}

export default AnalyticsPage
