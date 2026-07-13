"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getWorkspaceWorkload } from "@/api/analytics.api";
import { RequireRole } from "@/auth/require-role";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { Select } from "@/components/common/Field";
import { StatCard } from "@/components/common/StatCard";
import { WorkloadBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";
import type { WorkloadLevel, WorkloadRecord } from "@/types/domain";

type SortKey = "risk-desc" | "overdue-desc" | "open-desc" | "name-asc";

const workloadRank: Record<WorkloadLevel, number> = { OVERLOADED: 5, HIGH: 4, NORMAL: 3, LOW: 2, NO_WORK: 1 };

function employeeName(row: WorkloadRecord): string {
  return row.employeeName ?? row.fullName ?? row.userFullName ?? row.userName ?? row.name ?? row.employee?.fullName ?? row.employee?.name ?? (row.employeeId ? `Nhân viên ${row.employeeId.slice(0, 8)}` : "Chưa rõ nhân viên");
}

function rowScore(row: WorkloadRecord): number {
  if (typeof row.workloadScore === "number") return Math.max(0, Math.min(100, row.workloadScore));
  if (typeof row.estimatedWorkload === "number") return Math.max(0, Math.min(100, row.estimatedWorkload));
  return Math.min(100, (row.openTasks ?? 0) * 10 + (row.inProgressTasks ?? 0) * 5 + (row.blockedTasks ?? 0) * 20 + (row.overdueTasks ?? 0) * 15);
}

function DonutChart({ high, normal, available }: { high: number; normal: number; available: number }) {
  const total = Math.max(1, high + normal + available);
  const highEnd = (high / total) * 100;
  const normalEnd = highEnd + (normal / total) * 100;
  return <div className="grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
    <div className="relative mx-auto grid aspect-square w-40 place-items-center rounded-full" style={{ background: `conic-gradient(#f59e0b 0 ${highEnd}%, #0f766e ${highEnd}% ${normalEnd}%, #38bdf8 ${normalEnd}% 100%)` }} aria-label={`Mức tải cao ${high}, bình thường ${normal}, còn khả dụng ${available}`}>
      <div className="grid h-24 w-24 place-items-center rounded-full bg-surface text-center"><div><p className="text-2xl font-black">{high + normal + available}</p><p className="text-xs font-semibold text-muted-foreground">nhân viên</p></div></div>
    </div>
    <div className="grid gap-3">
      {[["Tải cao", high, "bg-amber-500"], ["Bình thường", normal, "bg-teal-700"], ["Còn khả dụng", available, "bg-sky-400"]].map(([label, value, color]) => <div key={String(label)} className="flex items-center justify-between gap-3 rounded-control border border-border p-3"><span className="flex items-center gap-2 text-sm font-semibold"><span className={`h-2.5 w-2.5 rounded-full ${color}`} />{label}</span><strong>{value}</strong></div>)}
    </div>
  </div>;
}

export default function WorkloadPage() {
  const query = useQuery({ queryKey: queryKeys.workload, queryFn: getWorkspaceWorkload });
  const [sort, setSort] = useState<SortKey>("risk-desc");
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const sortedRows = useMemo(() => [...rows].sort((a, b) => {
    if (sort === "name-asc") return employeeName(a).localeCompare(employeeName(b), "vi");
    if (sort === "open-desc") return (b.openTasks ?? 0) - (a.openTasks ?? 0);
    if (sort === "overdue-desc") return (b.overdueTasks ?? 0) - (a.overdueTasks ?? 0) || (b.openTasks ?? 0) - (a.openTasks ?? 0);
    return (workloadRank[b.workloadLevel ?? "NO_WORK"] - workloadRank[a.workloadLevel ?? "NO_WORK"]) || rowScore(b) - rowScore(a);
  }), [rows, sort]);
  const maxTasks = Math.max(1, ...rows.map((row) => Math.max(row.openTasks ?? 0, row.overdueTasks ?? 0)));
  const high = rows.filter((row) => row.workloadLevel === "HIGH" || row.workloadLevel === "OVERLOADED").length;
  const normal = rows.filter((row) => row.workloadLevel === "NORMAL").length;
  const available = rows.filter((row) => row.workloadLevel === "LOW" || row.workloadLevel === "NO_WORK" || !row.workloadLevel).length;
  const totalOpen = rows.reduce((sum, row) => sum + (row.openTasks ?? 0), 0);
  const totalInProgress = rows.reduce((sum, row) => sum + (row.inProgressTasks ?? 0), 0);
  const totalBlocked = rows.reduce((sum, row) => sum + (row.blockedTasks ?? 0), 0);
  const totalOverdue = rows.reduce((sum, row) => sum + (row.overdueTasks ?? 0), 0);
  const signalMax = Math.max(1, totalOpen, totalInProgress, totalBlocked, totalOverdue);

  return <RequireRole role="OWNER">
    <PageHeader eyebrow="Mức tải công việc" title="Phân tích mức tải nhân viên" description="Mức tải là tín hiệu ước tính từ task mở, task đang vướng và task quá hạn. Hãy dùng để kiểm tra, không xem như kết luận tuyệt đối." />
    {query.isLoading ? <LoadingState rows={4} /> : null}
    {query.error ? <ErrorState title="Không thể tải mức tải công việc" error={query.error} onRetry={() => void query.refetch()} /> : null}
    {!query.isLoading && !query.error ? <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard label="Nhân viên có dữ liệu" value={rows.length} /><StatCard label="Tổng việc đang mở" value={totalOpen} tone="info" /><StatCard label="Tổng việc quá hạn" value={totalOverdue} tone={totalOverdue > 0 ? "warning" : "neutral"} /><StatCard label="Nhân viên tải cao" value={high} tone={high > 0 ? "warning" : "neutral"} /></div>

      {rows.length === 0 ? <Card><EmptyState title="Chưa có dữ liệu mức tải" description="Khi backend có dữ liệu task và tiến độ, các biểu đồ sẽ xuất hiện tại đây." /></Card> : <>
        <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <Card><h2 className="text-lg font-black">So sánh công việc đang mở</h2><p className="mt-1 text-sm text-muted-foreground">Thanh xanh: việc mở · thanh cam: việc quá hạn</p><div className="mt-5 grid gap-4">{sortedRows.map((row, index) => { const name = employeeName(row); const open = row.openTasks ?? 0; const overdue = row.overdueTasks ?? 0; return <Link href={`/tasks?assignee=${encodeURIComponent(row.employeeId ?? name)}`} key={row.employeeId ?? `${name}-${index}`} className="focus-ring grid gap-2 rounded-control p-1 hover:bg-surface-muted sm:grid-cols-[180px_1fr_64px]"><p className="truncate text-sm font-bold" title={name}>{name}</p><div className="grid gap-1"><div className="h-3 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-teal-600" style={{ width: `${Math.max(open > 0 ? 4 : 0, (open / maxTasks) * 100)}%` }} /></div><div className="h-2 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.max(overdue > 0 ? 4 : 0, (overdue / maxTasks) * 100)}%` }} /></div></div><p className="text-right text-sm font-semibold">{open} mở</p></Link>})}</div></Card>
          <Card><h2 className="text-lg font-black">Phân bố mức tải</h2><p className="mt-1 text-sm text-muted-foreground">Nhóm nhân viên theo tín hiệu mức tải hiện tại.</p><div className="mt-5"><DonutChart high={high} normal={normal} available={available} /></div></Card>
        </div>

        <Card><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="text-lg font-black">Tín hiệu công việc toàn workspace</h2><p className="mt-1 text-sm text-muted-foreground">So sánh quy mô các tín hiệu đang cần theo dõi.</p></div><div className="w-full lg:w-72"><Select label="Sắp xếp bảng nhân viên" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}><option value="risk-desc">Mức tải cao trước</option><option value="overdue-desc">Quá hạn nhiều trước</option><option value="open-desc">Việc mở nhiều trước</option><option value="name-asc">Tên A–Z</option></Select></div></div><div className="mt-6 grid h-56 grid-cols-4 items-end gap-3 border-b border-border px-2 sm:gap-6">{[["Mở", totalOpen, "bg-teal-600"], ["Đang làm", totalInProgress, "bg-sky-500"], ["Đang vướng", totalBlocked, "bg-red-500"], ["Quá hạn", totalOverdue, "bg-amber-500"]].map(([label, value, color]) => <div key={String(label)} className="grid h-full grid-rows-[1fr_auto] items-end gap-2 text-center"><div className="flex h-full items-end justify-center"><div className={`w-full max-w-24 rounded-t-control ${color}`} style={{ height: `${Math.max(Number(value) > 0 ? 8 : 0, (Number(value) / signalMax) * 100)}%` }}><span className="-translate-y-7 inline-block text-sm font-black text-foreground">{value}</span></div></div><p className="pb-2 text-xs font-bold text-muted-foreground sm:text-sm">{label}</p></div>)}</div></Card>

        <Card className="p-0"><div className="flex items-center gap-2 border-b border-border px-5 py-4"><ArrowUpDown className="h-4 w-4 text-primary" /><p className="font-bold">Chi tiết theo nhân viên</p></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-border bg-surface-subtle text-xs font-bold tracking-[0.14em] text-muted-foreground"><th className="px-5 py-3">Nhân viên</th><th className="px-5 py-3">Mở</th><th className="px-5 py-3">Đang làm</th><th className="px-5 py-3">Đang vướng</th><th className="px-5 py-3">Quá hạn</th><th className="px-5 py-3">Điểm tải</th><th className="px-5 py-3">Mức tải</th></tr></thead><tbody>{sortedRows.map((row, index) => { const name = employeeName(row); return <tr key={row.employeeId ?? `${name}-${index}`} className="border-b border-border/70 last:border-0"><td className="px-5 py-4"><Link href={`/tasks?assignee=${encodeURIComponent(row.employeeId ?? name)}`} className="inline-flex items-center gap-2 font-bold hover:text-primary">{name}<ArrowRight className="h-3.5 w-3.5" /></Link></td><td className="px-5 py-4">{row.openTasks ?? 0}</td><td className="px-5 py-4">{row.inProgressTasks ?? 0}</td><td className="px-5 py-4">{row.blockedTasks ?? 0}</td><td className="px-5 py-4">{row.overdueTasks ?? 0}</td><td className="px-5 py-4">{rowScore(row)}</td><td className="px-5 py-4"><WorkloadBadge value={row.workloadLevel} /></td></tr>})}</tbody></table></div></Card>
      </>}
    </div> : null}
  </RequireRole>;
}
