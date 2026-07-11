"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getMonthlyWorkload } from "@/api/analytics.api";
import { RequireRole } from "@/auth/require-role";
import { Card } from "@/components/common/Card";
import { Field } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";

export default function ManagerWorkloadPage() {
  const now = new Date(); const [year, setYear] = useState(now.getFullYear()); const [month, setMonth] = useState(now.getMonth() + 1);
  const query = useQuery({ queryKey: queryKeys.monthlyWorkload(year, month), queryFn: () => getMonthlyWorkload(year, month) });
  return <RequireRole allowedRoles={["MANAGER", "BUSINESS_OWNER", "HR"]}><PageHeader eyebrow="WORKLOAD" title={`Workload tháng ${month}/${year}`} description="Dữ liệu phân tích theo tháng do backend tổng hợp." /><Card className="mb-5 grid gap-3 sm:grid-cols-2"><Field label="Tháng" type="number" min={1} max={12} value={month} onChange={(event) => setMonth(Number(event.target.value))} /><Field label="Năm" type="number" min={2020} max={2100} value={year} onChange={(event) => setYear(Number(event.target.value))} /></Card>
  {query.isLoading ? <LoadingState rows={4} /> : null}{query.error ? <ErrorState title="Không thể tải workload theo tháng" error={query.error} onRetry={() => void query.refetch()} /> : null}{!query.isLoading && !query.error ? query.data?.length ? <div className="grid gap-3 lg:grid-cols-2">{query.data.map((item, index) => <Card key={item.employeeId ?? index}><h2 className="font-black">{item.employeeName || item.fullName || "Nhân viên"}</h2><div className="mt-3 grid grid-cols-2 gap-2 text-sm"><p>Được giao: <strong>{item.assignedTasks ?? item.openTasks ?? 0}</strong></p><p>Hoàn thành: <strong>{item.completedTasks ?? 0}</strong></p><p>Quá hạn: <strong>{item.overdueTasks ?? 0}</strong></p><p>Điểm tải: <strong>{item.workloadScore ?? "—"}</strong></p></div></Card>)}</div> : <EmptyState title={`Chưa có dữ liệu tháng ${month}/${year}`} description="Backend chưa trả bản ghi workload cho kỳ đã chọn." /> : null}</RequireRole>;
}
