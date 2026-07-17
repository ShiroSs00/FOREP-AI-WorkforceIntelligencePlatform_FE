"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getMonthlyWorkload } from "@/api/analytics.api";
import { RequireRole } from "@/auth/require-role";
import { Card } from "@/components/common/Card";
import { Field } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { ProgressBar } from "@/components/common/ProgressBar";
import { WorkloadBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";

export default function ManagerWorkloadPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const query = useQuery({ queryKey: queryKeys.monthlyWorkload(year, month), queryFn: () => getMonthlyWorkload(year, month) });

  return <RequireRole allowedRoles={["MANAGER", "EXECUTIVE", "BUSINESS_OWNER"]}>
    <PageHeader eyebrow="MỨC TẢI" title={`Workload tháng ${month}/${year}`} description="Giờ phân bổ, năng lực tháng và mức sử dụng do backend workspace tổng hợp." />
    <Card className="mb-5 grid gap-3 sm:grid-cols-2"><Field label="Tháng" type="number" min={1} max={12} value={month} onChange={(event) => setMonth(Number(event.target.value))} /><Field label="Năm" type="number" min={2020} max={2100} value={year} onChange={(event) => setYear(Number(event.target.value))} /></Card>
    {query.isLoading ? <LoadingState rows={4} /> : null}
    {query.error ? <ErrorState title="Không thể tải workload theo tháng" error={query.error} onRetry={() => void query.refetch()} /> : null}
    {!query.isLoading && !query.error ? query.data?.length ? <div className="grid gap-3 lg:grid-cols-2">{query.data.map((item, index) => {
      const allocated = item.allocatedHours ?? item.estimatedHours ?? 0;
      const capacity = item.capacityHours ?? 0;
      const utilization = item.utilizationRatio ?? (capacity > 0 ? allocated / capacity : 0);
      const percent = utilization <= 2 ? utilization * 100 : utilization;
      return <Card key={item.employeeId ?? index}><div className="flex items-start justify-between gap-3"><div><h2 className="font-black">{item.employeeName || item.fullName || "Nhân viên"}</h2><p className="mt-1 text-sm text-muted-foreground">{allocated}h đã phân bổ / {capacity || "—"}h năng lực</p></div>{item.workloadLevel ? <WorkloadBadge value={item.workloadLevel} /> : null}</div><div className="mt-4"><ProgressBar value={Math.min(100, Math.max(0, percent))} /></div><div className="mt-3 flex justify-between text-xs font-semibold text-muted-foreground"><span>Mức sử dụng</span><span>{Number.isFinite(percent) ? `${Math.round(percent)}%` : "—"}</span></div></Card>;
    })}</div> : <EmptyState title={`Chưa có dữ liệu tháng ${month}/${year}`} description="Backend chưa trả bản ghi workload cho kỳ đã chọn." /> : null}
  </RequireRole>;
}
