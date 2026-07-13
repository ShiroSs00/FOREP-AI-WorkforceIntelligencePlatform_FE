"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Plus, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createEmployee, listEmployees, resetEmployeePassword, updateEmployeeStatus } from "@/api/employees.api";
import { RequireRole } from "@/auth/require-role";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, Select } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { StatusBadge, WorkloadBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmployeeCredentialsDialog } from "@/components/forms/EmployeeCredentialsDialog";
import { employeeSchema, seniorityOptions, toEmployeePayload } from "@/features/employees/schemas";
import { seniorityLabel } from "@/lib/labels";
import { queryKeys } from "@/lib/query-keys";
import { formatDate } from "@/lib/tasks";
import type { Employee, UserStatus } from "@/types/domain";
import type { z } from "zod";

type EmployeeInput = z.input<typeof employeeSchema>;
type Values = z.output<typeof employeeSchema>;

const defaultValues: EmployeeInput = {
  fullName: "",
  email: "",
  jobTitle: "",
  seniorityLevel: "" as const,
};

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [seniority, setSeniority] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [credentialEmployee, setCredentialEmployee] = useState<Employee | null>(null);
  const query = useQuery({ queryKey: queryKeys.employees, queryFn: listEmployees });
  const form = useForm<EmployeeInput, unknown, Values>({ resolver: zodResolver(employeeSchema), defaultValues });

  const invalidateEmployees = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    void queryClient.invalidateQueries({ queryKey: queryKeys.ownerDashboard });
    void queryClient.invalidateQueries({ queryKey: queryKeys.workload });
  };

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: (employee) => {
      setCreateOpen(false);
      setCredentialEmployee(employee);
      toast.success("Đã thêm nhân viên");
      form.reset(defaultValues);
      invalidateEmployees();
    },
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status: nextStatus }: { id: string; status: UserStatus }) => updateEmployeeStatus(id, nextStatus),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái nhân viên");
      invalidateEmployees();
    },
  });
  const resetPasswordMutation = useMutation({
    mutationFn: resetEmployeePassword,
    onSuccess: (employee) => {
      toast.success("Đã reset mật khẩu nhân viên");
      setCredentialEmployee(employee);
    },
  });

  const rows = useMemo(
    () =>
      (query.data ?? []).filter((employee) => {
        const haystack = `${employee.fullName} ${employee.email ?? ""} ${employee.username ?? ""} ${employee.employeeCode ?? ""} ${employee.jobTitle ?? ""}`.toLowerCase();
        return haystack.includes(search.toLowerCase()) && (!status || employee.status === status) && (!seniority || employee.seniorityLevel === seniority);
      }),
    [query.data, search, seniority, status],
  );
  const pageSize = 5;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize)));
  const pagedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleStatus = (employee: Employee) => {
    const next = employee.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    if (next === "INACTIVE" && !window.confirm("Tạm ngưng nhân viên này?")) return;
    statusMutation.mutate({ id: employee.id, status: next });
  };

  return (
    <RequireRole role="OWNER">
      <PageHeader
        eyebrow="Nhân viên"
        title="Quản lý nhân viên"
        description="Quản lý tài khoản, chức danh và trạng thái nhân viên trong workspace."
        primaryAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Thêm nhân viên
          </Button>
        }
      />

      <Card className="mb-5">
        <div className="grid gap-3 md:grid-cols-[minmax(260px,1fr)_220px_220px]">
          <Field label="Tìm kiếm" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tên, email, mã nhân viên..." />
          <Select label="Trạng thái" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
            <option value="">Tất cả</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Tạm ngưng</option>
            <option value="INVITED">Đã mời</option>
          </Select>
          <Select label="Cấp độ" value={seniority} onChange={(event) => { setSeniority(event.target.value); setPage(1); }}>
            <option value="">Tất cả</option>
            {seniorityOptions.map((option) => <option key={option} value={option}>{seniorityLabel(option)}</option>)}
          </Select>
        </div>
      </Card>

      {query.isLoading ? <LoadingState rows={5} /> : null}
      {query.error ? <ErrorState title="Không thể tải danh sách nhân viên" error={query.error} onRetry={() => void query.refetch()} /> : null}
      {!query.isLoading && !query.error ? (
        <Card className="p-0">
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[920px] table-fixed text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-subtle text-xs font-bold tracking-[0.12em] text-muted-foreground">
                  <th className="w-[27%] px-5 py-3">Nhân viên</th>
                  <th className="w-[18%] px-5 py-3">Tài khoản</th>
                  <th className="w-[18%] px-5 py-3">Chuyên môn</th>
                  <th className="w-[16%] px-5 py-3">Trạng thái</th>
                  <th className="w-[11%] px-5 py-3">Ngày tạo</th>
                  <th className="w-[10%] px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((employee) => (
                  <tr key={employee.id} className="border-b border-border/70 align-middle last:border-0 hover:bg-surface-subtle/60">
                    <td className="px-5 py-4">
                      <Link href={`/owner/employees/${employee.id}`} className="font-bold text-foreground hover:text-primary">{employee.fullName}</Link>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{employee.email || "Chưa có email"}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <p className="truncate">{employee.username || "Chưa có tên đăng nhập"}</p>
                      <p className="mt-1 text-xs">{employee.employeeCode || "Chưa có mã nhân viên"}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <p className="truncate font-semibold text-foreground">{employee.jobTitle || "Chưa cập nhật"}</p>
                      <p className="mt-1 text-xs">{seniorityLabel(employee.seniorityLevel)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-2">
                        <StatusBadge value={employee.status} />
                        {employee.workloadLevel ? <WorkloadBadge value={employee.workloadLevel} /> : null}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(employee.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <details className="relative inline-block text-left">
                        <summary className="focus-ring inline-flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-control border border-border bg-surface hover:bg-surface-muted" aria-label={`Thao tác với ${employee.fullName}`}>
                          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                        </summary>
                        <div className="absolute right-0 z-20 mt-2 grid w-48 gap-1 rounded-card border border-border bg-surface p-2 text-left shadow-xl">
                          <Link className="rounded-control px-3 py-2 text-sm font-semibold hover:bg-surface-muted" href={`/owner/employees/${employee.id}`}>Xem chi tiết</Link>
                          <button className="rounded-control px-3 py-2 text-left text-sm font-semibold hover:bg-surface-muted" onClick={() => toggleStatus(employee)} disabled={statusMutation.isPending}>{employee.status === "ACTIVE" ? "Tạm ngưng" : "Kích hoạt"}</button>
                          <button className="rounded-control px-3 py-2 text-left text-sm font-semibold hover:bg-surface-muted" onClick={() => window.confirm("Reset mật khẩu nhân viên này?") ? resetPasswordMutation.mutate(employee.id) : undefined} disabled={resetPasswordMutation.isPending}>Reset mật khẩu</button>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 lg:hidden">
            {pagedRows.map((employee) => (
              <article key={employee.id} className="rounded-control border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><p className="truncate font-bold">{employee.fullName}</p><p className="mt-1 truncate text-sm text-muted-foreground">{employee.email || "Chưa có email"}</p></div>
                  <StatusBadge value={employee.status} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{employee.jobTitle || "Chưa cập nhật chức danh"} · {seniorityLabel(employee.seniorityLevel)}</p>
                <div className="mt-4 flex flex-wrap gap-2"><Link className="focus-ring rounded-control border border-border px-3 py-2 text-sm font-semibold" href={`/owner/employees/${employee.id}`}>Chi tiết</Link><Button variant="secondary" className="min-h-9 px-3 py-2" onClick={() => toggleStatus(employee)}>{employee.status === "ACTIVE" ? "Tạm ngưng" : "Kích hoạt"}</Button></div>
              </article>
            ))}
          </div>

          {rows.length === 0 ? <div className="p-5"><EmptyState title={(query.data ?? []).length === 0 ? "Chưa có nhân viên" : "Không tìm thấy nhân viên phù hợp"} description={(query.data ?? []).length === 0 ? "Thêm nhân viên để bắt đầu giao việc." : "Thử đổi từ khóa hoặc bộ lọc."} /></div> : <Pagination page={currentPage} pageSize={pageSize} total={rows.length} onPageChange={setPage} />}
        </Card>
      ) : null}

      {createOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="create-employee-title" onMouseDown={(event) => event.target === event.currentTarget ? setCreateOpen(false) : undefined}>
          <Card className="my-auto w-full max-w-xl p-0 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border px-5 py-4">
              <div><h2 id="create-employee-title" className="text-xl font-black">Thêm nhân viên</h2><p className="mt-1 text-sm text-muted-foreground">Tạo tài khoản với những thông tin cần thiết.</p></div>
              <button className="focus-ring rounded-control border border-border p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground" onClick={() => setCreateOpen(false)} aria-label="Đóng"><X className="h-4 w-4" /></button>
            </div>
            <form className="grid gap-4 p-5" onSubmit={form.handleSubmit((values) => createMutation.mutate(toEmployeePayload(values)))}>
              <Field label="Họ và tên" required autoFocus error={form.formState.errors.fullName?.message} {...form.register("fullName")} />
              <Field label="Email" type="email" error={form.formState.errors.email?.message} {...form.register("email")} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Chức danh" {...form.register("jobTitle")} />
                <Select label="Cấp độ" error={form.formState.errors.seniorityLevel?.message} {...form.register("seniorityLevel")}>
                  <option value="">Chưa chọn</option>
                  {seniorityOptions.map((option) => <option key={option} value={option}>{seniorityLabel(option)}</option>)}
                </Select>
              </div>
              {createMutation.error ? <ErrorState title="Không thể thêm nhân viên" error={createMutation.error} /> : null}
              <div className="flex justify-end gap-3 border-t border-border pt-4"><Button variant="ghost" onClick={() => setCreateOpen(false)}>Hủy</Button><Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Đang thêm..." : "Thêm nhân viên"}</Button></div>
            </form>
          </Card>
        </div>
      ) : null}

      <EmployeeCredentialsDialog employee={credentialEmployee} onClose={() => setCredentialEmployee(null)} />
    </RequireRole>
  );
}
