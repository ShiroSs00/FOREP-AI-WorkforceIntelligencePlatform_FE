"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Plus } from "lucide-react";
import Link from "next/link";
import { getOwnerDashboard } from "@/api/analytics.api";
import { getBusinessOwnerOperationalSummary } from "@/api/workspace-ai.api";
import { RequirePermission } from "@/auth/require-permission";
import { useAuthStore } from "@/auth/auth-store";
import { AiSummaryCard } from "@/components/ai/AiSummaryCard";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DashboardSeriesCard } from "@/components/dashboard/DashboardSeriesCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { hasPermission } from "@/lib/permissions";
import { queryKeys } from "@/lib/query-keys";
import { formatDateTime } from "@/lib/tasks";
import type { DashboardOverviewPeriod, DashboardTaskRisk } from "@/types/domain";

const metricLabels: Array<[keyof DashboardOverviewPeriod, string]> = [
  ["completed", "Đã hoàn thành"], ["active", "Đang hoạt động"], ["overdue", "Quá hạn"], ["blocked", "Đang vướng"], ["submitted", "Chờ xác nhận"], ["missingDailyReports", "Thiếu báo cáo"], ["overloadedEmployees", "Nhân viên quá tải"], ["completionRate", "Tỷ lệ hoàn thành"],
];

function OverviewPeriod({ title, data }: { title: string; data?: DashboardOverviewPeriod }) {
  if (!data) return <Card><h2 className="text-lg font-black">{title}</h2><div className="mt-4"><EmptyState title="Chưa có số liệu" description="Backend chưa trả tổng quan cho giai đoạn này." /></div></Card>;
  return <Card><h2 className="text-lg font-black">{title}</h2><div className="mt-4 grid grid-cols-2 gap-3">{metricLabels.map(([key, label]) => { const fallbackKey = key === "missingDailyReports" ? "missingDailyReport" : key; const value = data[key] ?? data[fallbackKey as keyof DashboardOverviewPeriod] ?? 0; return <div key={key} className="rounded-control bg-surface-muted p-3"><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="mt-1 text-xl font-black">{key === "completionRate" ? `${value}%` : Number(value).toLocaleString("vi-VN")}</p></div>; })}</div></Card>;
}

function TaskRiskTable({ title, rows, emptyNote }: { title: string; rows?: DashboardTaskRisk[]; emptyNote: string }) {
  return <Card><div className="flex items-center gap-2"><AlertTriangle className="size-5 text-warning" aria-hidden="true" /><h2 className="text-lg font-black">{title}</h2></div>{rows?.length ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-border text-xs font-bold text-muted-foreground"><th className="px-3 py-2">Công việc</th><th className="px-3 py-2">Người phụ trách</th><th className="px-3 py-2">Deadline</th><th className="px-3 py-2">Tín hiệu</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.id ?? row.taskId ?? index} className="border-b border-border/70 last:border-0"><td className="px-3 py-3 font-semibold">{row.title ?? row.taskTitle ?? "Công việc"}</td><td className="px-3 py-3 text-muted-foreground">{row.assigneeName ?? "Chưa cập nhật"}</td><td className="px-3 py-3 text-muted-foreground">{formatDateTime(row.deadline ?? undefined)}</td><td className="px-3 py-3"><StatusBadge value={row.status ?? row.riskLevel ?? undefined} /><p className="mt-1 max-w-xs text-xs text-muted-foreground">{row.reason ?? row.blocker ?? "Backend chưa mô tả thêm."}</p></td></tr>)}</tbody></table></div> : <div className="mt-4"><EmptyState title="Không có mục cần hiển thị" description={emptyNote} /></div>}</Card>;
}

export default function OwnerDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const dashboard = useQuery({ queryKey: queryKeys.businessOwnerDashboard, queryFn: getOwnerDashboard });
  const aiSummary = useQuery({ queryKey: queryKeys.businessOwnerOperationalSummary, queryFn: getBusinessOwnerOperationalSummary });
  const data = dashboard.data;
  const note = data?.metadata?.note ?? data?.metadata?.emptyStateNote ?? "Dữ liệu sẽ xuất hiện khi workspace có hoạt động phù hợp.";
  const workloadGroups = data?.workloadInsight;

  return <RequirePermission permissions={["AI_SUMMARY"]}><PageHeader eyebrow="CHỦ WORKSPACE" title="Tổng quan vận hành" description="Số liệu vận hành do backend tổng hợp từ dữ liệu thật của workspace." primaryAction={hasPermission(user, "TASK_CREATE") ? <Link className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground" href="/owner/tasks/new"><Plus className="size-4" aria-hidden="true" />Tạo công việc</Link> : undefined} />
    {dashboard.isLoading ? <LoadingState rows={5} /> : null}
    {dashboard.error ? <ErrorState title="Không thể tải dashboard chủ doanh nghiệp" error={dashboard.error} onRetry={() => void dashboard.refetch()} /> : null}
    {!dashboard.isLoading && !dashboard.error && !data ? <EmptyState title="Chưa có dashboard" description={note} /> : null}
    {data ? <div className="grid gap-5">
      <div className="grid gap-4 xl:grid-cols-3"><OverviewPeriod title="Hôm nay" data={data.overviewCards?.today} /><OverviewPeriod title="Tuần này" data={data.overviewCards?.week} /><OverviewPeriod title="Tháng này" data={data.overviewCards?.month} /></div>
      <div className="grid gap-5 xl:grid-cols-2"><DashboardSeriesCard title={data.taskStatusChart?.title ?? "Trạng thái công việc"} series={data.taskStatusChart?.series} emptyNote={note} /><DashboardSeriesCard title={data.workloadDistributionChart?.title ?? "Phân bố mức tải"} series={data.workloadDistributionChart?.series} emptyNote={note} /></div>
      <div className="grid gap-5 xl:grid-cols-2"><Card><h2 className="text-lg font-black">Báo cáo ngày</h2><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><StatCard label="Kỳ vọng" value={data.dailyReportInsight?.expected ?? 0} /><StatCard label="Đã nhận" value={data.dailyReportInsight?.received ?? 0} /><StatCard label="Còn thiếu" value={data.dailyReportInsight?.missing ?? 0} tone="warning" /><StatCard label="Đã duyệt" value={data.dailyReportInsight?.reviewed ?? 0} tone="success" /></div><div className="mt-4 grid gap-2">{data.dailyReportInsight?.missingEmployees?.length ? data.dailyReportInsight.missingEmployees.map((employee, index) => <div key={employee.id ?? employee.employeeId ?? index} className="rounded-control border border-border px-3 py-2"><p className="font-semibold">{employee.fullName ?? employee.employeeName ?? "Nhân viên"}</p><p className="text-xs text-muted-foreground">{employee.departmentName ?? "Chưa có phòng ban"}</p></div>) : <EmptyState title="Không có báo cáo bị thiếu" description={note} />}</div></Card>
      <Card><h2 className="text-lg font-black">Mức tải nhân sự</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{[["Chưa có việc", workloadGroups?.idle], ["Tải nhẹ", workloadGroups?.light], ["Bình thường", workloadGroups?.normal], ["Tải cao", workloadGroups?.high], ["Quá tải", workloadGroups?.overloaded]].map(([label, employees]) => <div key={label as string} className="rounded-control bg-surface-muted p-3"><p className="text-sm font-semibold text-muted-foreground">{label as string}</p><p className="mt-1 text-2xl font-black">{Array.isArray(employees) ? employees.length : 0}</p>{Array.isArray(employees) && employees.length ? <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{employees.map((item) => item.fullName ?? item.employeeName).filter(Boolean).join(", ")}</p> : null}</div>)}</div></Card></div>
      <div className="grid gap-5 xl:grid-cols-2"><TaskRiskTable title="Rủi ro deadline" rows={data.deadlineRisks} emptyNote={note} /><TaskRiskTable title="Công việc đang vướng" rows={data.blockedTasks} emptyNote={note} /></div>
      <div className="grid gap-5 xl:grid-cols-2"><Card><h2 className="text-lg font-black">Hành động được đề xuất</h2><div className="mt-4 grid gap-3">{data.recommendedActions?.length ? data.recommendedActions.map((action, index) => <div key={index} className="rounded-control border border-border p-3"><p className="font-semibold">{typeof action === "string" ? action : action.title ?? action.action ?? "Hành động vận hành"}</p>{typeof action !== "string" && action.description ? <p className="mt-1 text-sm text-muted-foreground">{action.description}</p> : null}</div>) : <EmptyState title="Chưa có hành động đề xuất" description={note} />}</div></Card><Card className="bg-slate-950 text-white"><h2 className="text-lg font-black">Gợi ý AI đã lưu</h2><p className="mt-1 text-sm text-slate-300">Gợi ý hỗ trợ quyết định, không thay đổi số liệu dashboard.</p><div className="mt-4 grid gap-3">{data.aiRecommendations?.length ? data.aiRecommendations.map((item) => <div key={item.id} className="rounded-control border border-white/10 bg-white/5 p-3"><p className="font-semibold">{item.title ?? "Gợi ý vận hành"}</p><p className="mt-1 text-sm text-slate-300">{item.content ?? "Backend chưa trả nội dung chi tiết."}</p></div>) : <p className="rounded-control border border-white/10 p-4 text-sm text-slate-300">{note}</p>}</div></Card></div>
      <p className="text-xs text-muted-foreground">Nguồn: {data.metadata?.dataSource ?? "Backend FOREP"} · Tạo lúc {formatDateTime(data.metadata?.generatedAt)}</p>
    </div> : null}
    <div className="mt-5"><AiSummaryCard eyebrow="TÓM TẮT VẬN HÀNH AI" title="Tóm tắt dành cho chủ workspace" description="AI chỉ giải thích dữ liệu vận hành đã được backend tổng hợp." data={aiSummary.data} loading={aiSummary.isLoading} error={aiSummary.error} onRetry={() => void aiSummary.refetch()} /></div>
  </RequirePermission>;
}
