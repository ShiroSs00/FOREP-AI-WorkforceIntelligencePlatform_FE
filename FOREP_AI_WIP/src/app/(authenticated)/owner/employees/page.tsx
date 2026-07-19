"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Plus, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { createEmployee, listEmployees, resetEmployeePassword, updateEmployeeStatus } from "@/api/employees.api";
import { listBusinessPositions, listDepartments } from "@/api/hr.api";
import { RequireRole } from "@/auth/require-role";
import { useAuthStore } from "@/auth/auth-store";
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
import { employeeLevelOptions, employeeSchema, employmentTypeOptions, seniorityOptions, toEmployeePayload, workingStatusOptions } from "@/features/employees/schemas";
import { seniorityLabel } from "@/lib/labels";
import { queryKeys } from "@/lib/query-keys";
import { hasPermission } from "@/lib/permissions";
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
  departmentId: "",
  jobPositionId: "",
  skillRating: undefined,
  yearsOfExperience: undefined,
  skills: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  personalSummary: "",
  employmentType: "",
  workingStatus: "WORKING",
  employeeLevel: "",
  monthlyWorkingCapacityHours: 168,
  mainExpertise: "",
  secondaryExpertise: "",
};

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canCreate = hasPermission(user, "EMPLOYEE_CREATE");
  const canUpdate = hasPermission(user, "EMPLOYEE_UPDATE");
  const canDeactivate = hasPermission(user, "EMPLOYEE_DEACTIVATE");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [seniority, setSeniority] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [workingStatus, setWorkingStatus] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [credentialEmployee, setCredentialEmployee] = useState<Employee | null>(null);
  const query = useQuery({ queryKey: queryKeys.employees, queryFn: listEmployees });
  const departmentsQuery = useQuery({ queryKey: queryKeys.departments(), queryFn: listDepartments });
  const positionsQuery = useQuery({ queryKey: queryKeys.businessPositions(), queryFn: () => listBusinessPositions() });
  const form = useForm<EmployeeInput, unknown, Values>({ resolver: zodResolver(employeeSchema), defaultValues });
  const selectedPositionId = useWatch({ control: form.control, name: "jobPositionId" });
  const selectedDepartmentId = useWatch({ control: form.control, name: "departmentId" });
  const selectedPosition = (positionsQuery.data ?? []).find((item) => item.id === selectedPositionId);
  const activeDepartments = (departmentsQuery.data ?? []).filter((item) => item.status === "ACTIVE" || item.id === selectedDepartmentId);
  const activePositions = (positionsQuery.data ?? []).filter((item) => item.status === "ACTIVE");

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
        return haystack.includes(search.toLowerCase())
          && (!status || employee.status === status)
          && (!seniority || employee.seniorityLevel === seniority)
          && (!role || employee.role === role)
          && (!department || employee.departmentId === department)
          && (!position || employee.jobPositionId === position)
          && (!workingStatus || employee.workingStatus === workingStatus);
      }),
    [department, position, query.data, role, search, seniority, status, workingStatus],
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
    <RequireRole allowedRoles={["OWNER", "BUSINESS_OWNER", "HR"]}>
      <PageHeader
        eyebrow="Nhân viên"
        title="Quản lý nhân viên"
        description="Quản lý tài khoản, chức danh và trạng thái nhân viên trong workspace."
        primaryAction={canCreate ? <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" aria-hidden="true" />Thêm nhân viên</Button> : undefined}
      />

      <Card className="mb-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2 xl:col-span-2">
          <Field label="Tìm kiếm" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tên, email, mã nhân viên..." />
          </div>
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
          <Select label="Vai trò hệ thống" value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }}>
            <option value="">Tất cả</option>
            <option value="BUSINESS_OWNER">Chủ workspace</option>
            <option value="HR">Nhân sự</option>
            <option value="EXECUTIVE">Điều hành</option>
            <option value="MANAGER">Quản lý</option>
            <option value="EMPLOYEE">Nhân viên</option>
          </Select>
          <Select label="Trạng thái làm việc" value={workingStatus} onChange={(event) => { setWorkingStatus(event.target.value); setPage(1); }}>
            <option value="">Tất cả</option>
            <option value="WORKING">Đang làm việc</option>
            <option value="ON_LEAVE">Đang nghỉ phép</option>
            <option value="RESIGNED">Đã nghỉ việc</option>
          </Select>
          <Select label="Phòng ban" value={department} onChange={(event) => { setDepartment(event.target.value); setPosition(""); setPage(1); }}>
            <option value="">Tất cả</option>
            {(departmentsQuery.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}{item.status === "INACTIVE" ? " · ngừng hoạt động" : ""}</option>)}
          </Select>
          <Select label="Vị trí nghiệp vụ" value={position} onChange={(event) => { setPosition(event.target.value); setPage(1); }}>
            <option value="">Tất cả</option>
            {(positionsQuery.data ?? []).filter((item) => !department || item.departmentId === department).map((item) => <option key={item.id} value={item.id}>{item.name}{item.status === "INACTIVE" ? " · ngừng hoạt động" : ""}</option>)}
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
                  <th className="w-[18%] px-5 py-3">Cơ cấu & quyền</th>
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
                      <p className="truncate font-semibold text-foreground">{employee.jobPositionName || employee.jobTitle || "Chưa có vị trí"}</p>
                      <p className="mt-1 truncate text-xs">{employee.departmentName || "Chưa có phòng ban"} · {employee.role}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-2">
                        <StatusBadge value={employee.status} />
                        {employee.workingStatus ? <StatusBadge value={employee.workingStatus} /> : null}
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
                          {canDeactivate ? <button className="rounded-control px-3 py-2 text-left text-sm font-semibold hover:bg-surface-muted" onClick={() => toggleStatus(employee)} disabled={statusMutation.isPending}>{employee.status === "ACTIVE" ? "Tạm ngưng" : "Kích hoạt"}</button> : null}
                          {canUpdate ? <button className="rounded-control px-3 py-2 text-left text-sm font-semibold hover:bg-surface-muted" onClick={() => window.confirm("Reset mật khẩu nhân viên này?") ? resetPasswordMutation.mutate(employee.id) : undefined} disabled={resetPasswordMutation.isPending}>Reset mật khẩu</button> : null}
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
                <div className="mt-4 flex flex-wrap gap-2"><Link className="focus-ring rounded-control border border-border px-3 py-2 text-sm font-semibold" href={`/owner/employees/${employee.id}`}>Chi tiết</Link>{canDeactivate ? <Button variant="secondary" className="min-h-9 px-3 py-2" onClick={() => toggleStatus(employee)}>{employee.status === "ACTIVE" ? "Tạm ngưng" : "Kích hoạt"}</Button> : null}</div>
              </article>
            ))}
          </div>

          {rows.length === 0 ? <div className="p-5"><EmptyState title={(query.data ?? []).length === 0 ? "Chưa có nhân viên" : "Không tìm thấy nhân viên phù hợp"} description={(query.data ?? []).length === 0 ? "Thêm nhân viên để bắt đầu giao việc." : "Thử đổi từ khóa hoặc bộ lọc."} /></div> : <Pagination page={currentPage} pageSize={pageSize} total={rows.length} onPageChange={setPage} />}
        </Card>
      ) : null}

      {createOpen && canCreate ? (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="create-employee-title" onMouseDown={(event) => event.target === event.currentTarget ? setCreateOpen(false) : undefined}>
          <Card className="my-auto w-full max-w-4xl p-0 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border px-5 py-4">
              <div><h2 id="create-employee-title" className="text-xl font-black">Thêm nhân viên</h2><p className="mt-1 text-sm text-muted-foreground">Tạo tài khoản với những thông tin cần thiết.</p></div>
              <button className="focus-ring rounded-control border border-border p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground" onClick={() => setCreateOpen(false)} aria-label="Đóng"><X className="h-4 w-4" /></button>
            </div>
            <form className="grid max-h-[78vh] gap-5 overflow-y-auto p-5" onSubmit={form.handleSubmit((values) => createMutation.mutate(toEmployeePayload(values)))}>
              <section className="grid gap-4"><h3 className="font-black">Thông tin tài khoản</h3><div className="grid gap-4 sm:grid-cols-2"><Field label="Họ và tên" required autoFocus error={form.formState.errors.fullName?.message} {...form.register("fullName")} /><Field label="Email" required type="email" error={form.formState.errors.email?.message} {...form.register("email")} /><Field label="Số điện thoại" {...form.register("phone")} /><Field label="Chức danh hiển thị" {...form.register("jobTitle")} /></div></section>
              <section className="grid gap-4 border-t border-border pt-5"><div><h3 className="font-black">Cơ cấu và quyền workspace</h3><p className="mt-1 text-sm text-muted-foreground">Vai trò hệ thống sẽ được xác định từ Nhóm quyền của Vị trí nghiệp vụ.</p></div><div className="grid gap-4 sm:grid-cols-2"><Select label="Vị trí nghiệp vụ" value={selectedPositionId ?? ""} onChange={(event) => { const id = event.target.value; form.setValue("jobPositionId", id, { shouldValidate: true }); const position = activePositions.find((item) => item.id === id); if (position) form.setValue("departmentId", position.departmentId, { shouldValidate: true }); }}><option value="">Chưa chọn</option>{activePositions.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.permissionGroup}</option>)}</Select><Select label="Phòng ban" disabled={Boolean(selectedPosition)} helper={selectedPosition ? "Được đồng bộ từ vị trí nghiệp vụ." : undefined} {...form.register("departmentId")}><option value="">Chưa chọn</option>{activeDepartments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></div>{departmentsQuery.error || positionsQuery.error ? <p className="text-sm font-semibold text-destructive">Không thể tải đầy đủ danh mục phòng ban hoặc vị trí nghiệp vụ.</p> : null}</section>
              <section className="grid gap-4 border-t border-border pt-5"><h3 className="font-black">Năng lực chuyên môn</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Select label="Cấp độ chuyên môn" error={form.formState.errors.seniorityLevel?.message} {...form.register("seniorityLevel")}><option value="">Chưa chọn</option>{seniorityOptions.map((option) => <option key={option} value={option}>{seniorityLabel(option)}</option>)}</Select><Select label="Cấp nhân viên" {...form.register("employeeLevel")}><option value="">Chưa chọn</option>{employeeLevelOptions.map((option) => <option key={option} value={option}>{option}</option>)}</Select><Field label="Số năm kinh nghiệm" type="number" min="0" {...form.register("yearsOfExperience")} /><Field label="Mức kỹ năng" type="number" min="1" max="5" {...form.register("skillRating")} /><Field label="Năng lực tháng (giờ)" type="number" min="1" {...form.register("monthlyWorkingCapacityHours")} /><Field label="Chuyên môn chính" {...form.register("mainExpertise")} /><Field label="Chuyên môn phụ" {...form.register("secondaryExpertise")} /><Field label="Kỹ năng" className="lg:col-span-2" {...form.register("skills")} /></div></section>
              <section className="grid gap-4 border-t border-border pt-5"><h3 className="font-black">Thông tin nhân sự</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field label="Ngày sinh" type="date" {...form.register("dateOfBirth")} /><Select label="Giới tính" {...form.register("gender")}><option value="">Chưa chọn</option><option value="MALE">Nam</option><option value="FEMALE">Nữ</option><option value="OTHER">Khác</option></Select><Select label="Loại hình làm việc" {...form.register("employmentType")}><option value="">Chưa chọn</option>{employmentTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</Select><Select label="Trạng thái làm việc" {...form.register("workingStatus")}>{workingStatusOptions.map((option) => <option key={option} value={option}>{option}</option>)}</Select><Field label="Địa chỉ" className="lg:col-span-2" {...form.register("address")} /></div><Field label="Tóm tắt cá nhân" {...form.register("personalSummary")} /></section>
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
