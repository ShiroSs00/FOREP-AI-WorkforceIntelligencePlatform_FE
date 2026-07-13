"use client";

import { useQuery } from "@tanstack/react-query";
import { getWorkspaceWorkload } from "@/api/analytics.api";
import { RequireRole } from "@/auth/require-role";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { WorkloadBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";
import type { WorkloadRecord } from "@/types/domain";

function employeeName(row: WorkloadRecord): string {
  return row.employeeName ?? row.fullName ?? row.userFullName ?? row.userName ?? row.name ?? row.employee?.fullName ?? row.employee?.name ?? (row.employeeId ? `Nhân viên ${row.employeeId.slice(0, 8)}` : "Chưa rõ nhân viên");
}

export default function WorkloadPage() {
  const query = useQuery({ queryKey: queryKeys.workload, queryFn: getWorkspaceWorkload });
  const rows = query.data ?? [];
  const maxTasks = Math.max(1, ...rows.map((row) => Math.max(row.openTasks ?? 0, row.overdueTasks ?? 0)));
  return <RequireRole role="OWNER">
    <PageHeader eyebrow="Mức tải công việc" title="Phân tích mức tải nhân viên" description="Mức tải là tín hiệu ước tính từ task mở, task đang vướng và task quá hạn. Hãy dùng để kiểm tra, không xem như kết luận tuyệt đối." />
    {query.isLoading ? <LoadingState rows={4} /> : null}
    {query.error ? <ErrorState title="Không thể tải mức tải công việc" error={query.error} onRetry={() => void query.refetch()} /> : null}
    {!query.isLoading && !query.error ? <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3"><StatCard label="Nhân viên có dữ liệu" value={rows.length} /><StatCard label="Tổng việc quá hạn" value={rows.reduce((sum, row) => sum + (row.overdueTasks ?? 0), 0)} tone={rows.some((row) => (row.overdueTasks ?? 0) > 0) ? "warning" : "neutral"} /><StatCard label="Tổng việc đang vướng" value={rows.reduce((sum, row) => sum + (row.blockedTasks ?? 0), 0)} tone={rows.some((row) => (row.blockedTasks ?? 0) > 0) ? "warning" : "neutral"} /></div>
      <Card><h2 className="text-lg font-black">So sánh công việc đang mở</h2><p className="mt-1 text-sm text-muted-foreground">Thanh xanh: việc mở · thanh cam: việc quá hạn</p>{rows.length === 0 ? <EmptyState title="Chưa có dữ liệu mức tải" description="Khi backend có dữ liệu task và tiến độ, biểu đồ sẽ xuất hiện tại đây." /> : <div className="mt-5 grid gap-4">{rows.map((row, index) => { const name = employeeName(row); const open = row.openTasks ?? 0; const overdue = row.overdueTasks ?? 0; return <div key={row.employeeId ?? `${name}-${index}`} className="grid gap-2 sm:grid-cols-[180px_1fr_64px]"><p className="truncate text-sm font-bold" title={name}>{name}</p><div className="grid gap-1"><div className="h-3 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-teal-600" style={{ width: `${Math.max(open > 0 ? 4 : 0, (open / maxTasks) * 100)}%` }} /></div><div className="h-2 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.max(overdue > 0 ? 4 : 0, (overdue / maxTasks) * 100)}%` }} /></div></div><p className="text-right text-sm font-semibold">{open} mở</p></div>})}</div>}</Card>
      <Card className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b border-border bg-surface-subtle text-xs font-bold tracking-[0.14em] text-muted-foreground"><th className="px-5 py-3">Nhân viên</th><th className="px-5 py-3">Mở</th><th className="px-5 py-3">Đang làm</th><th className="px-5 py-3">Đang vướng</th><th className="px-5 py-3">Quá hạn</th><th className="px-5 py-3">Mức tải</th></tr></thead><tbody>{rows.map((row, index) => { const name = employeeName(row); return <tr key={row.employeeId ?? `${name}-${index}`} className="border-b border-border/70 last:border-0"><td className="px-5 py-4 font-bold">{name}</td><td className="px-5 py-4">{row.openTasks ?? 0}</td><td className="px-5 py-4">{row.inProgressTasks ?? 0}</td><td className="px-5 py-4">{row.blockedTasks ?? 0}</td><td className="px-5 py-4">{row.overdueTasks ?? 0}</td><td className="px-5 py-4"><WorkloadBadge value={row.workloadLevel} /></td></tr>})}</tbody></table></div></Card>
    </div> : null}
  </RequireRole>;
}
