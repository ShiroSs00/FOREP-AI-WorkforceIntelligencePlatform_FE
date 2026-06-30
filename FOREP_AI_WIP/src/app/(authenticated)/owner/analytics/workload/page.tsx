"use client";

import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RequireRole } from "@/auth/require-role";
import { getWorkspaceWorkload } from "@/api/analytics.api";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { WorkloadBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";

export default function WorkloadPage() {
  const query = useQuery({ queryKey: queryKeys.workload, queryFn: getWorkspaceWorkload });
  const rows = query.data ?? [];
  return <RequireRole role="OWNER"><PageHeader eyebrow="Mức tải công việc" title="Phân tích mức tải nhân viên" description="Mức tải là tín hiệu ước tính từ task mở, task đang vướng và task quá hạn. Hãy dùng để kiểm tra, không xem như kết luận tuyệt đối." />{query.isLoading ? <LoadingState rows={4} /> : null}{query.error ? <ErrorState title="Không thể tải mức tải công việc" error={query.error} onRetry={() => void query.refetch()} /> : null}{!query.isLoading && !query.error ? <div className="grid gap-5"><div className="grid gap-4 md:grid-cols-3"><StatCard label="Nhân viên có dữ liệu" value={rows.length} /><StatCard label="Tổng việc quá hạn" value={rows.reduce((sum, row) => sum + (row.overdueTasks ?? 0), 0)} tone={rows.some((row) => (row.overdueTasks ?? 0) > 0) ? "warning" : "neutral"} /><StatCard label="Tổng việc đang vướng" value={rows.reduce((sum, row) => sum + (row.blockedTasks ?? 0), 0)} tone={rows.some((row) => (row.blockedTasks ?? 0) > 0) ? "warning" : "neutral"} /></div><Card>{rows.length === 0 ? <EmptyState title="Chưa có dữ liệu mức tải" description="Khi backend có dữ liệu task và tiến độ, biểu đồ so sánh mức tải sẽ xuất hiện tại đây." /> : <div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={rows}><CartesianGrid strokeDasharray="3 3" stroke="#d9e2ec" /><XAxis dataKey="employeeName" /><YAxis /><Tooltip /><Bar dataKey="openTasks" fill="#0f766e" name="Việc mở" /><Bar dataKey="overdueTasks" fill="#d97706" name="Quá hạn" /></BarChart></ResponsiveContainer></div>}</Card><Card className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b border-border bg-surface-subtle text-xs font-bold tracking-[0.14em] text-muted-foreground"><th className="px-5 py-3">Nhân viên</th><th className="px-5 py-3">Mở</th><th className="px-5 py-3">Đang làm</th><th className="px-5 py-3">Đang vướng</th><th className="px-5 py-3">Quá hạn</th><th className="px-5 py-3">Mức tải</th></tr></thead><tbody>{rows.map((row) => <tr key={row.employeeId ?? row.employeeName} className="border-b border-border/70 last:border-0"><td className="px-5 py-4 font-bold">{row.employeeName ?? "Nhân viên"}</td><td className="px-5 py-4">{row.openTasks ?? 0}</td><td className="px-5 py-4">{row.inProgressTasks ?? 0}</td><td className="px-5 py-4">{row.blockedTasks ?? 0}</td><td className="px-5 py-4">{row.overdueTasks ?? 0}</td><td className="px-5 py-4"><WorkloadBadge value={row.workloadLevel} /></td></tr>)}</tbody></table></div></Card></div> : null}</RequireRole>;
}




