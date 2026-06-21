import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, Building2, CheckCircle2, GitBranch, RefreshCw, ShieldCheck, Users } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import LoadingState from '../../components/ui/LoadingState.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { getAdminDashboard } from '../../services/dashboardService.js'
import { normalizeObject } from '../../services/responseNormalizer.js'

function formatNumber(value) {
  if (value === undefined || value === null || value === '') return '-'
  return Number.isFinite(Number(value)) ? Number(value).toLocaleString() : String(value)
}

function getMetric(data, key) {
  return data?.[key] ?? 0
}

function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboard, setDashboard] = useState({})

  const applyDashboard = useCallback((response) => {
    setDashboard(normalizeObject(response))
  }, [])

  const loadDashboard = useCallback(() => {
    setLoading(true)
    setError(null)
    getAdminDashboard()
      .then(applyDashboard)
      .catch((err) => {
        setError(err)
        setDashboard({})
      })
      .finally(() => {
        setLoading(false)
      })
  }, [applyDashboard])

  useEffect(() => {
    let active = true
    getAdminDashboard()
      .then((response) => {
        if (active) applyDashboard(response)
      })
      .catch((err) => {
        if (active) {
          setError(err)
          setDashboard({})
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [applyDashboard])

  const metrics = useMemo(() => ([
    { label: 'Total users', value: getMetric(dashboard, 'totalUsers'), icon: Users },
    { label: 'Active users', value: getMetric(dashboard, 'activeUsers'), icon: ShieldCheck },
    { label: 'Teams', value: getMetric(dashboard, 'totalTeams'), icon: GitBranch },
    { label: 'Organizations', value: getMetric(dashboard, 'totalOrganizations'), icon: Building2 },
    { label: 'Tasks', value: getMetric(dashboard, 'totalTasks'), icon: Activity },
    { label: 'Completed tasks', value: getMetric(dashboard, 'completedTasks'), icon: CheckCircle2 },
  ]), [dashboard])

  const hasDashboardData = Object.keys(dashboard).length > 0
  const riskDistribution = dashboard.burnoutRiskDistribution && typeof dashboard.burnoutRiskDistribution === 'object'
    ? dashboard.burnoutRiskDistribution
    : {}

  return (
    <>
      <PageHeader
        eyebrow="Platform Admin / Dashboard"
        title="Tổng quan hệ thống"
        description="Tổng quan quản trị hệ thống, tổ chức, tài khoản và trạng thái nền tảng."
        action={(
          <Button variant="secondary" onClick={loadDashboard} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </Button>
        )}
      />

      {loading ? <LoadingState message="Loading admin dashboard..." /> : null}
      {!loading && error ? (
        <ErrorState
          title="Unable to load admin dashboard"
          message={error.message}
          status={error.status}
          details={error.details ? JSON.stringify(error.details, null, 2) : undefined}
          onRetry={loadDashboard}
        />
      ) : null}
      {!loading && !error && !hasDashboardData ? (
        <EmptyState
          title="No admin dashboard data available."
          description="The admin dashboard will appear when your admin account has platform data available."
        />
      ) : null}

      {!loading && !error && hasDashboardData ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metrics.map((metric) => {
              const Icon = metric.icon
              return (
                <Card key={metric.label}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--muted)]">{metric.label}</p>
                      <p className="mt-3 text-3xl font-bold text-[var(--text)]">{formatNumber(metric.value)}</p>
                    </div>
                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
                      <Icon size={20} />
                    </span>
                  </div>
                </Card>
              )
            })}
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-[var(--text)]">Burnout risk distribution</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">Risk buckets returned for the current platform scope.</p>
                </div>
                <Badge tone="Info">Live data</Badge>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {Object.entries(riskDistribution).length ? Object.entries(riskDistribution).map(([risk, count]) => (
                  <div key={risk} className="rounded-lg border border-[var(--border)] bg-slate-50 p-4 dark:bg-slate-900">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{risk}</p>
                    <p className="mt-2 text-2xl font-bold text-[var(--text)]">{formatNumber(count)}</p>
                  </div>
                )) : (
                  <p className="text-sm text-[var(--muted)]">No burnout risk distribution returned.</p>
                )}
              </div>
            </Card>

            <Card>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0ea5e9]">Quản trị hệ thống</p>
              <h2 className="mt-3 text-xl font-semibold text-[var(--text)]">Phạm vi chức năng Admin</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Admin quản lý tổ chức, tài khoản, cấu hình hệ thống, runtime status, audit log và notification hệ thống. Admin không vận hành task/team/project như Manager.
              </p>
              <div className="mt-5 grid gap-3">
                {[
                  ['Tổ chức', 'Quản lý organization và thông tin cấu hình ở mức hệ thống.'],
                  ['Tài khoản', 'Quản lý tài khoản người dùng khi backend cho phép.'],
                  ['Cấu hình hệ thống', 'Kiểm tra provider, runtime status và thiết lập nền tảng.'],
                  ['Nhật ký hệ thống', 'Theo dõi audit log và sự kiện quản trị.'],
                ].map(([label, description]) => (
                  <div key={label} className="rounded-lg border border-[var(--border)] bg-slate-50 p-3 dark:bg-slate-900">
                    <p className="font-semibold text-[var(--text)]">{label}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </>
  )
}

export default AdminDashboard
