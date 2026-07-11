"use client";

import { useQuery } from "@tanstack/react-query";
import { listEmployees } from "@/api/employees.api";
import { RequireRole } from "@/auth/require-role";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";

export default function HrEmployeesPage() {
  const query = useQuery({ queryKey: queryKeys.hrEmployees, queryFn: listEmployees });
  return <RequireRole allowedRoles={["HR", "BUSINESS_OWNER"]}>
    <PageHeader eyebrow="NHÂN SỰ" title="Hồ sơ nhân viên" description="Thông tin nhân sự được trả về từ workspace hiện tại." />
    {query.isLoading ? <LoadingState rows={5} /> : null}
    {query.error ? <ErrorState title="Không thể tải hồ sơ nhân viên" error={query.error} onRetry={() => void query.refetch()} /> : null}
    {!query.isLoading && !query.error ? query.data?.length ? <div className="grid gap-3 lg:grid-cols-2">{query.data.map((employee) => <Card key={employee.id}><div className="flex items-start justify-between gap-3"><div><h2 className="font-black">{employee.fullName}</h2><p className="mt-1 text-sm text-muted-foreground">{employee.email || "Chưa có email"}</p><p className="mt-1 text-sm text-muted-foreground">{employee.jobTitle || "Chưa cập nhật vị trí"} · {employee.employeeCode || "Chưa có mã nhân viên"}</p></div><StatusBadge value={employee.status} /></div></Card>)}</div> : <EmptyState title="Chưa có hồ sơ nhân viên" description="Backend chưa trả dữ liệu nhân sự cho workspace này." /> : null}
  </RequireRole>;
}
