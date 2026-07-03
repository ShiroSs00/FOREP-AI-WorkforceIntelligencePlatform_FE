"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { RequireRole } from "@/auth/require-role";
import { createEmployee, listEmployees, resetEmployeePassword, updateEmployeeStatus } from "@/api/employees.api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, Select, TextArea } from "@/components/common/Field";
import { EmployeeCredentialsDialog } from "@/components/forms/EmployeeCredentialsDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, WorkloadBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
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
  phone: "",
  jobTitle: "",
  seniorityLevel: "" as const,
  skillRating: "" as const,
  yearsOfExperience: "" as const,
  skills: "",
};

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [seniority, setSeniority] = useState("");
  const [credentialEmployee, setCredentialEmployee] = useState<Employee | null>(null);
  const query = useQuery({ queryKey: queryKeys.employees, queryFn: listEmployees });
  const form = useForm<EmployeeInput, unknown, Values>({ resolver: zodResolver(employeeSchema), defaultValues });
  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: (employee) => {
      setCredentialEmployee(employee);
      toast.success("Đã thêm nhân viên");
      form.reset(defaultValues);
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees });
      void queryClient.invalidateQueries({ queryKey: queryKeys.ownerDashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.workload });
    },
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) => updateEmployeeStatus(id, status),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái nhân viên");
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees });
      void queryClient.invalidateQueries({ queryKey: queryKeys.ownerDashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.workload });
    },
  });
  const resetPasswordMutation = useMutation({
    mutationFn: resetEmployeePassword,
    onSuccess: (employee) => {
      toast.success("Đã reset mật khẩu nhân viên");
      setCredentialEmployee(employee);
    },
  });  const rows = useMemo(
    () =>
      (query.data ?? []).filter((employee) => {
        const haystack = `${employee.fullName} ${employee.email ?? ""} ${employee.phone ?? ""} ${employee.jobTitle ?? ""} ${employee.skills ?? ""}`.toLowerCase();
        return haystack.includes(search.toLowerCase()) && (!status || employee.status === status) && (!seniority || employee.seniorityLevel === seniority);
      }),
    [query.data, search, seniority, status],
  );

  return (
    <RequireRole role="OWNER">
      <PageHeader
        eyebrow="Nhân viên"
        title="Quản lý nhân viên"
        description="Thêm nhân viên, cập nhật năng lực chuyên môn và theo dõi trạng thái tài khoản trong workspace."
      />

      <div className="grid gap-5 xl:grid-cols-[460px_1fr]">
        <Card>
          <h2 className="text-lg font-black">Thêm nhân viên</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Nhập thông tin cơ bản và năng lực chuyên môn để tạo tài khoản nhân viên.</p>
          <form className="mt-4 grid gap-5" onSubmit={form.handleSubmit((values: Values) => createMutation.mutate(toEmployeePayload(values)))}>
            <section className="grid gap-3">
              <h3 className="text-sm font-black text-foreground">Thông tin cơ bản</h3>
              <Field label="Họ và tên" error={form.formState.errors.fullName?.message} {...form.register("fullName")} />
              <Field label="Email" type="email" optional error={form.formState.errors.email?.message} {...form.register("email")} />
              <Field label="Số điện thoại" optional {...form.register("phone")} />
            </section>
            <section className="grid gap-3">
              <h3 className="text-sm font-black text-foreground">Thông tin chuyên môn</h3>
              <Field label="Chức danh" optional {...form.register("jobTitle")} />
              <Select label="Cấp độ kinh nghiệm" optional error={form.formState.errors.seniorityLevel?.message} {...form.register("seniorityLevel")}>
                <option value="">Chưa chọn</option>
                {seniorityOptions.map((option) => <option key={option} value={option}>{seniorityLabel(option)}</option>)}
              </Select>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Số năm kinh nghiệm" type="number" min="0" optional error={form.formState.errors.yearsOfExperience?.message} {...form.register("yearsOfExperience")} />
                <Select label="Mức kỹ năng" optional error={form.formState.errors.skillRating?.message} {...form.register("skillRating")}>
                  <option value="">Chưa chọn</option>
                  {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}/5</option>)}
                </Select>
              </div>
              <TextArea label="Kỹ năng chuyên môn" optional helper="Ví dụ: React, Spring Boot, SQL" {...form.register("skills")} />
            </section>
            <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Đang thêm..." : "Thêm nhân viên"}</Button>
          </form>
          {createMutation.error ? <div className="mt-4"><ErrorState title="Không thể thêm nhân viên" error={createMutation.error} /></div> : null}
        </Card>

        <div className="grid gap-4">
          <Card>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Tìm kiếm nhân viên" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên, email, kỹ năng" />
              <Select label="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="">Tất cả</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Tạm ngưng</option>
                <option value="INVITED">Đã mời</option>
              </Select>
              <Select label="Cấp độ" value={seniority} onChange={(event) => setSeniority(event.target.value)}>
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
                <table className="w-full min-w-[1080px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-subtle text-xs font-bold tracking-[0.14em] text-muted-foreground">
                      <th className="px-5 py-3">Họ tên</th>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Tên đăng nhập</th>
                      <th className="px-5 py-3">Mã nhân viên</th>
                      <th className="px-5 py-3">Chức danh</th>
                      <th className="px-5 py-3">Cấp độ</th>
                      <th className="px-5 py-3">Trạng thái</th>
                      <th className="px-5 py-3">Mức tải</th>
                      <th className="px-5 py-3">Ngày tạo</th>
                      <th className="px-5 py-3">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((employee) => (
                      <tr key={employee.id} className="border-b border-border/70 last:border-0">
                        <td className="px-5 py-4"><Link href={`/owner/employees/${employee.id}`} className="font-bold text-foreground hover:text-primary">{employee.fullName}</Link></td>
                        <td className="px-5 py-4 text-muted-foreground">{employee.email ?? "—"}</td>
                        <td className="px-5 py-4 text-muted-foreground">{employee.username ?? "Chưa có"}</td>
                        <td className="px-5 py-4 text-muted-foreground">{employee.employeeCode ?? "Chưa có"}</td>
                        <td className="px-5 py-4 text-muted-foreground">{employee.jobTitle ?? "—"}</td>
                        <td className="px-5 py-4 text-muted-foreground">{seniorityLabel(employee.seniorityLevel)}</td>
                        <td className="px-5 py-4"><StatusBadge value={employee.status} /></td>
                        <td className="px-5 py-4">{employee.workloadLevel ? <WorkloadBadge value={employee.workloadLevel} /> : "—"}</td>
                        <td className="px-5 py-4 text-muted-foreground">{formatDate(employee.createdAt)}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => {
                                const next = employee.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                                if (next === "INACTIVE" && !window.confirm("Tạm ngưng nhân viên này? Nhân viên có thể không tiếp tục thao tác trong workspace.")) return;
                                statusMutation.mutate({ id: employee.id, status: next });
                              }}
                              disabled={statusMutation.isPending}
                            >
                              {employee.status === "ACTIVE" ? "Tạm ngưng" : "Kích hoạt"}
                            </Button>
                            <Button variant="secondary" disabled={resetPasswordMutation.isPending} onClick={() => window.confirm("Reset mật khẩu nhân viên này?") ? resetPasswordMutation.mutate(employee.id) : undefined}>Reset mật khẩu</Button>
                            <Link className="focus-ring rounded-control border border-border px-3 py-2.5 text-sm font-semibold hover:bg-surface-muted" href={`/owner/employees/${employee.id}`}>Chi tiết</Link>
                            <Link className="focus-ring rounded-control border border-border px-3 py-2.5 text-sm font-semibold hover:bg-surface-muted" href={`/owner/employees/${employee.id}`}>Xem workload</Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 lg:hidden">
                {rows.map((employee) => (
                  <div key={employee.id} className="rounded-control border border-border p-4">
                    <p className="font-bold text-foreground">{employee.fullName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{employee.email ?? "Chưa có email"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{employee.username ?? "Chưa có tên đăng nhập"} · {employee.employeeCode ?? "Chưa có mã"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{employee.jobTitle ?? "Chưa có chức danh"} · {seniorityLabel(employee.seniorityLevel)}</p>
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
                    description={(query.data ?? []).length === 0 ? "Thêm nhân viên để bắt đầu giao task và theo dõi tiến độ." : "Thử đổi từ khóa hoặc bộ lọc."}
                  />
                </div>
              ) : null}
            </Card>
          ) : null}
        </div>
      </div>
    <EmployeeCredentialsDialog employee={credentialEmployee} onClose={() => setCredentialEmployee(null)} />
    </RequireRole>
  );
}




