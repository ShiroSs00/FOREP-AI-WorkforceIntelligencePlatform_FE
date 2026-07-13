"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listEmployees } from "@/api/employees.api";
import { RequireRole } from "@/auth/require-role";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";

export default function HrEmployeesPage() {
  const query = useQuery({ queryKey: queryKeys.hrEmployees, queryFn: listEmployees });
  const [page, setPage] = useState(1);
  const rows = query.data ?? [];
  const pageSize = 5;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize)));
  const pagedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return <RequireRole allowedRoles={["HR", "BUSINESS_OWNER"]}>
    <PageHeader eyebrow="NHÂN SỰ" title="Hồ sơ nhân viên" description="Thông tin nhân sự được trả về từ workspace hiện tại." />
    {query.isLoading ? <LoadingState rows={5} /> : null}
    {query.error ? <ErrorState title="Không thể tải hồ sơ nhân viên" error={query.error} onRetry={() => void query.refetch()} /> : null}
    {!query.isLoading && !query.error ? rows.length ? <Card className="p-0"><div className="grid gap-0">{pagedRows.map((employee) => <div key={employee.id} className="border-b border-border p-4 last:border-0"><div className="flex items-start justify-between gap-3"><div><h2 className="font-black">{employee.fullName}</h2><p className="mt-1 text-sm text-muted-foreground">{employee.email || "Chưa có email"}</p><p className="mt-1 text-sm text-muted-foreground">{employee.jobTitle || "Chưa cập nhật vị trí"} · {employee.employeeCode || "Chưa có mã nhân viên"}</p></div><StatusBadge value={employee.status} /></div></div>)}</div><Pagination page={currentPage} pageSize={pageSize} total={rows.length} onPageChange={setPage} /></Card> : <EmptyState title="Chưa có hồ sơ nhân viên" description="Backend chưa trả dữ liệu nhân sự cho workspace này." /> : null}
  </RequireRole>;
}
