"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardOverview, getAdminFeedbackSummary, getAdminPaymentSummary, getAdminRevenueByPlan, getAdminRevenueMonthly, getAdminRevenueQuarterly, getAdminRevenueYearly, getAdminWorkspacesByPlan, getAdminWorkspacesByStatus, getPlatformAiSummary } from "@/api/admin.api";
import { RequirePermission } from "@/auth/require-permission";
import { useAuthStore } from "@/auth/auth-store";
import { AiSummaryCard } from "@/components/ai/AiSummaryCard";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { PaymentStatusBadge } from "@/components/common/StatusBadge";
import { DashboardSeriesCard } from "@/components/dashboard/DashboardSeriesCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { formatMoney } from "@/lib/plans";
import { queryKeys } from "@/lib/query-keys";
import { hasPermission } from "@/lib/permissions";
import { formatDateTime } from "@/lib/tasks";

function QuerySection({ loading, error, retry, children }: { loading: boolean; error: unknown; retry: () => void; children: React.ReactNode }) {
  if (loading) return <LoadingState rows={3} />;
  if (error) return <ErrorState title="Không thể tải khu vực dashboard" error={error} onRetry={retry} />;
  return <>{children}</>;
}

function displayNumber(value: unknown, currency = false): string {
  return currency ? formatMoney(typeof value === "number" ? value : 0) : (typeof value === "number" ? value : 0).toLocaleString("vi-VN");
}

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const overview = useQuery({ queryKey: queryKeys.adminDashboardOverview, queryFn: getAdminDashboardOverview });
  const monthly = useQuery({ queryKey: queryKeys.adminRevenue("monthly"), queryFn: getAdminRevenueMonthly });
  const quarterly = useQuery({ queryKey: queryKeys.adminRevenue("quarterly"), queryFn: getAdminRevenueQuarterly });
  const yearly = useQuery({ queryKey: queryKeys.adminRevenue("yearly"), queryFn: getAdminRevenueYearly });
  const byPlan = useQuery({ queryKey: queryKeys.adminRevenue("by-plan"), queryFn: getAdminRevenueByPlan });
  const workspacesByStatus = useQuery({ queryKey: queryKeys.adminWorkspaceCharts("status"), queryFn: getAdminWorkspacesByStatus });
  const workspacesByPlan = useQuery({ queryKey: queryKeys.adminWorkspaceCharts("plan"), queryFn: getAdminWorkspacesByPlan });
  const payments = useQuery({ queryKey: queryKeys.adminPaymentSummary, queryFn: getAdminPaymentSummary });
  const feedback = useQuery({ queryKey: queryKeys.adminFeedbackSummary, queryFn: getAdminFeedbackSummary });
  const canViewAiSummary = hasPermission(user, "AI_SUMMARY");
  const platformAi = useQuery({ queryKey: queryKeys.platformAiSummary, queryFn: getPlatformAiSummary, enabled: canViewAiSummary });
  const overviewCards = [
    ["Tổng workspace", overview.data?.totalWorkspaces], ["Đang hoạt động", overview.data?.activeWorkspaces], ["Tạm dừng", overview.data?.suspendedWorkspaces], ["Hết hạn", overview.data?.expiredWorkspaces], ["Workspace mới", overview.data?.newWorkspaces], ["Tổng người dùng", overview.data?.totalUsers], ["Doanh thu", overview.data?.totalRevenue ?? overview.data?.revenue, true], ["Tỷ lệ thanh toán thành công", overview.data?.paymentSuccessRate, false, "%"], ["Thanh toán lỗi", overview.data?.failedPayments], ["Chờ kiểm tra thủ công", overview.data?.pendingManualPayments], ["Điểm phản hồi TB", overview.data?.feedbackAverage], ["Lượt dùng AI", overview.data?.aiUsage],
  ] as const;
  const pendingPayments = payments.data?.pendingManualPaymentItems ?? payments.data?.pendingPayments ?? [];
  const recentFeedback = feedback.data?.recentFeedback ?? [];
  const feedbackSeries = feedback.data?.ratingChart?.series ?? feedback.data?.series;

  return <RequirePermission permissions={["REVENUE_VIEW"]}><PageHeader eyebrow="PLATFORM ADMIN" title="Tổng quan nền tảng" description="Mỗi khu vực tải độc lập từ endpoint dashboard backend; frontend không tổng hợp từ dữ liệu phân trang." />
    <div className="grid gap-5">
      <QuerySection loading={overview.isLoading} error={overview.error} retry={() => void overview.refetch()}>{overview.data ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{overviewCards.map(([label, value, currency, suffix]) => <Card key={label}><p className="text-sm font-semibold text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-black">{displayNumber(value, currency)}{suffix ?? ""}</p></Card>)}</div> : <EmptyState title="Chưa có tổng quan" description="Backend chưa trả dữ liệu overview." />}</QuerySection>
      <div className="grid gap-5 xl:grid-cols-2"><QuerySection loading={monthly.isLoading} error={monthly.error} retry={() => void monthly.refetch()}><DashboardSeriesCard title={monthly.data?.title ?? "Doanh thu theo tháng"} series={monthly.data?.series} valueKind="currency" /></QuerySection><QuerySection loading={quarterly.isLoading} error={quarterly.error} retry={() => void quarterly.refetch()}><DashboardSeriesCard title={quarterly.data?.title ?? "Doanh thu theo quý"} series={quarterly.data?.series} valueKind="currency" /></QuerySection><QuerySection loading={yearly.isLoading} error={yearly.error} retry={() => void yearly.refetch()}><DashboardSeriesCard title={yearly.data?.title ?? "Doanh thu theo năm"} series={yearly.data?.series} valueKind="currency" /></QuerySection><QuerySection loading={byPlan.isLoading} error={byPlan.error} retry={() => void byPlan.refetch()}><DashboardSeriesCard title={byPlan.data?.title ?? "Doanh thu theo gói"} series={byPlan.data?.series} valueKind="currency" /></QuerySection></div>
      <div className="grid gap-5 xl:grid-cols-2"><QuerySection loading={workspacesByStatus.isLoading} error={workspacesByStatus.error} retry={() => void workspacesByStatus.refetch()}><DashboardSeriesCard title={workspacesByStatus.data?.title ?? "Workspace theo trạng thái"} series={workspacesByStatus.data?.series} /></QuerySection><QuerySection loading={workspacesByPlan.isLoading} error={workspacesByPlan.error} retry={() => void workspacesByPlan.refetch()}><DashboardSeriesCard title={workspacesByPlan.data?.title ?? "Workspace theo gói"} series={workspacesByPlan.data?.series} /></QuerySection></div>
      <QuerySection loading={payments.isLoading} error={payments.error} retry={() => void payments.refetch()}>{payments.data ? <Card><h2 className="text-lg font-black">Tổng quan thanh toán</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[["Tổng giao dịch", payments.data.totalPayments], ["Thành công", payments.data.successfulPayments], ["Thất bại", payments.data.failedPayments], ["Chờ kiểm tra", payments.data.pendingManualPayments], ["Tỷ lệ thành công", payments.data.successRate, "%"]].map(([label, value, suffix]) => <div key={String(label)} className="rounded-control bg-surface-muted p-3"><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="mt-1 text-xl font-black">{displayNumber(value)}{suffix ?? ""}</p></div>)}</div>{pendingPayments.length ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-border"><th className="px-3 py-2">Mã</th><th className="px-3 py-2">Số tiền</th><th className="px-3 py-2">Trạng thái</th><th className="px-3 py-2">Tạo lúc</th></tr></thead><tbody>{pendingPayments.map((payment) => <tr key={payment.id} className="border-b border-border/70 last:border-0"><td className="px-3 py-3 font-semibold">{payment.paymentCode ?? payment.id}</td><td className="px-3 py-3">{formatMoney(payment.amount ?? 0)}</td><td className="px-3 py-3"><PaymentStatusBadge value={payment.status as import("@/types/domain").PaymentStatus} /></td><td className="px-3 py-3 text-muted-foreground">{formatDateTime(payment.createdAt ?? undefined)}</td></tr>)}</tbody></table></div> : <div className="mt-4"><EmptyState title="Không có thanh toán chờ kiểm tra" description="Backend không trả giao dịch thủ công đang chờ." /></div>}</Card> : <EmptyState title="Chưa có tổng quan thanh toán" description="Backend chưa trả dữ liệu." />}</QuerySection>
      <QuerySection loading={feedback.isLoading} error={feedback.error} retry={() => void feedback.refetch()}>{feedback.data ? <div className="grid gap-5 xl:grid-cols-2"><DashboardSeriesCard title={feedback.data.ratingChart?.title ?? "Phân bố điểm phản hồi"} series={feedbackSeries} /><Card><h2 className="text-lg font-black">Phản hồi gần đây</h2><p className="mt-1 text-sm text-muted-foreground">Điểm trung bình backend: <strong>{displayNumber(feedback.data.averageRating)}</strong> · Tổng {displayNumber(feedback.data.totalFeedback)}</p><div className="mt-4 grid gap-3">{recentFeedback.length ? recentFeedback.map((item, index) => <div key={item.id ?? index} className="rounded-control border border-border p-3"><p className="font-semibold">{item.title ?? item.businessName ?? item.workspaceName ?? "Phản hồi doanh nghiệp"}</p><p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{item.content ?? "Backend chưa trả nội dung."}</p></div>) : <EmptyState title="Chưa có phản hồi gần đây" description="Backend chưa trả danh sách phản hồi." />}</div></Card></div> : <EmptyState title="Chưa có tổng quan phản hồi" description="Backend chưa trả dữ liệu." />}</QuerySection>
      {canViewAiSummary ? <AiSummaryCard eyebrow="TÓM TẮT AI NỀN TẢNG" title="Tóm tắt AI toàn nền tảng" description="Chỉ hiển thị trong shell Platform Admin; AI giải thích dữ liệu, không tính chỉ số dashboard." data={platformAi.data} loading={platformAi.isLoading} error={platformAi.error} onRetry={() => void platformAi.refetch()} /> : null}
    </div>
  </RequirePermission>;
}
