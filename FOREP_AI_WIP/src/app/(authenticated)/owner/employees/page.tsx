"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { RequireRole } from "@/auth/require-role";
import { createEmployee, listEmployees, updateEmployeeStatus } from "@/api/employees.api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, WorkloadBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { employeeSchema } from "@/features/employees/schemas";
import { queryKeys } from "@/lib/query-keys";
import type { z } from "zod";

type Values = z.infer<typeof employeeSchema>;

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: queryKeys.employees, queryFn: listEmployees });
  const form = useForm<Values>({ resolver: zodResolver(employeeSchema), defaultValues: { fullName: "", email: "", phone: "" } });
  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      toast.success("Đã thêm nhân viên");
      form.reset();
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    },
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "INACTIVE" | "INVITED" }) => updateEmployeeStatus(id, status),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.employees }),
  });
  const rows = useMemo(
    () => (query.data ?? []).filter((employee) => `${employee.fullName} ${employee.email ?? ""} ${employee.phone ?? ""}`.toLowerCase().includes(search.toLowerCase())),
    [query.data, search],
  );

  return (
    <RequireRole role="OWNER">
      <PageHeader
        eyebrow="Nhân viên"
        title="Quản lý nhân viên"
        description="Thêm nhân viên, theo dõi trạng thái tài khoản và mở hồ sơ khi cần xem chi tiết workload."
      />

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <Card>
          <h2 className="text-lg font-black">Thêm nhân viên</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Tạo tài khoản nhân viên trong workspace. Backend sẽ xử lý quyền và thông tin đăng nhập.</p>
          <form
            className="mt-4 grid gap-3"
            onSubmit={form.handleSubmit((values) => createMutation.mutate({ fullName: values.fullName, email: values.email || undefined, phone: values.phone || undefined }))}
          >
            <Field label="Họ tên" error={form.formState.errors.fullName?.message} {...form.register("fullName")} />
            <Field label="Email" type="email" optional error={form.formState.errors.email?.message} {...form.register("email")} />
            <Field label="Số điện thoại" optional {...form.register("phone")} />
            <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Đang thêm..." : "Thêm nhân viên"}</Button>
          </form>
          {createMutation.error ? <div className="mt-4"><ErrorState title="Không thể thêm nhân viên" error={createMutation.error} /></div> : null}
        </Card>

        <div className="grid gap-4">
          <Card>
            <Field label="Tìm kiếm nhân viên" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên, email hoặc số điện thoại" />
          </Card>
          {query.isLoading ? <LoadingState rows={5} /> : null}
          {query.error ? <ErrorState title="Không thể tải danh sách nhân viên" error={query.error} onRetry={() => void query.refetch()} /> : null}
          {!query.isLoading && !query.error ? (
            <Card className="p-0">
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-subtle text-xs font-bold tracking-[0.14em] text-muted-foreground">
                      <th className="px-5 py-3">Nhân viên</th>
                      <th className="px-5 py-3">Liên hệ</th>
                      <th className="px-5 py-3">Trạng thái</th>
                      <th className="px-5 py-3">Mức tải</th>
                      <th className="px-5 py-3">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((employee) => (
                      <tr key={employee.id} className="border-b border-border/70 last:border-0">
                        <td className="px-5 py-4">
                          <Link href={`/owner/employees/${employee.id}`} className="font-bold text-foreground hover:text-primary">{employee.fullName}</Link>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{employee.email ?? employee.phone ?? "Chưa có thông tin"}</td>
                        <td className="px-5 py-4"><StatusBadge value={employee.status} /></td>
                        <td className="px-5 py-4">{employee.workloadLevel ? <WorkloadBadge value={employee.workloadLevel} /> : "—"}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => {
                                const next = employee.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                                if (next === "INACTIVE" && !window.confirm("Tạm ngưng nhân viên này? Nhân viên có thể không tiếp tục thao tác trong workspace.")) return;
                                statusMutation.mutate({ id: employee.id, status: next });
                              }}
                            >
                              {employee.status === "ACTIVE" ? "Tạm ngưng" : "Kích hoạt"}
                            </Button>
                            <Link className="focus-ring rounded-control border border-border px-3 py-2.5 text-sm font-semibold hover:bg-surface-muted" href={`/owner/employees/${employee.id}`}>Chi tiết</Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 md:hidden">
                {rows.map((employee) => (
                  <div key={employee.id} className="rounded-control border border-border p-4">
                    <p className="font-bold text-foreground">{employee.fullName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{employee.email ?? employee.phone ?? "Chưa có thông tin liên hệ"}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusBadge value={employee.status} />
                      {employee.workloadLevel ? <WorkloadBadge value={employee.workloadLevel} /> : null}
                    </div>
                    <Link className="mt-4 inline-flex text-sm font-bold text-primary" href={`/owner/employees/${employee.id}`}>Mở hồ sơ</Link>
                  </div>
                ))}
              </div>

              {rows.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    title={(query.data ?? []).length === 0 ? "Chưa có nhân viên" : "Không tìm thấy nhân viên phù hợp"}
                    description={(query.data ?? []).length === 0 ? "Thêm nhân viên để bắt đầu giao task và theo dõi tiến độ." : "Thử đổi từ khóa tìm kiếm."}
                  />
                </div>
              ) : null}
            </Card>
          ) : null}
        </div>
      </div>
    </RequireRole>
  );
}
