"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { RequireRole } from "@/auth/require-role";
import { getEmployee, getEmployeeWorkload, resetEmployeePassword, updateEmployee } from "@/api/employees.api";
import { listBusinessPositions, listDepartments } from "@/api/hr.api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, Select, TextArea } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge, WorkloadBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmployeeCredentialsDialog } from "@/components/forms/EmployeeCredentialsDialog";
import { employeeLevelOptions, employeeSchema, employmentTypeOptions, seniorityOptions, toEmployeePayload, workingStatusOptions } from "@/features/employees/schemas";
import { ratingLabel, seniorityLabel } from "@/lib/labels";
import { queryKeys } from "@/lib/query-keys";
import type { Employee } from "@/types/domain";
import type { z } from "zod";

type EmployeeInput = z.input<typeof employeeSchema>;
type Values = z.output<typeof employeeSchema>;

const emptyValues: EmployeeInput = {
  fullName: "",
  email: "",
  phone: "",
  jobTitle: "",
  seniorityLevel: "" as const,
  skillRating: "" as const,
  yearsOfExperience: "" as const,
  skills: "",
  status: "ACTIVE" as const,
};

export default function EmployeeDetailPage() {
  const [showInitialPassword, setShowInitialPassword] = useState(false);
  const [resetCredential, setResetCredential] = useState<Employee | null>(null);
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const employeeQuery = useQuery({ queryKey: queryKeys.employee(params.id), queryFn: () => getEmployee(params.id) });
  const workloadQuery = useQuery({ queryKey: queryKeys.employeeWorkload(params.id), queryFn: () => getEmployeeWorkload(params.id) });
  const departmentsQuery = useQuery({ queryKey: queryKeys.departments(), queryFn: listDepartments });
  const positionsQuery = useQuery({ queryKey: queryKeys.businessPositions(), queryFn: () => listBusinessPositions() });
  const form = useForm<EmployeeInput, unknown, Values>({ resolver: zodResolver(employeeSchema), defaultValues: emptyValues });
  const selectedPositionId = useWatch({ control: form.control, name: "jobPositionId" });
  const selectedPosition = (positionsQuery.data ?? []).find((item) => item.id === selectedPositionId);

  useEffect(() => {
    if (!employeeQuery.data) return;
    form.reset({
      fullName: employeeQuery.data.fullName ?? "",
      email: employeeQuery.data.email ?? "",
      phone: employeeQuery.data.phone ?? "",
      jobTitle: employeeQuery.data.jobTitle ?? "",
      seniorityLevel: employeeQuery.data.seniorityLevel ?? "",
      skillRating: employeeQuery.data.skillRating ?? "",
      yearsOfExperience: employeeQuery.data.yearsOfExperience ?? "",
      skills: employeeQuery.data.skills ?? "",
      departmentId: employeeQuery.data.departmentId ?? "",
      jobPositionId: employeeQuery.data.jobPositionId ?? "",
      dateOfBirth: employeeQuery.data.dateOfBirth ?? "",
      gender: employeeQuery.data.gender ?? "",
      address: employeeQuery.data.address ?? "",
      personalSummary: employeeQuery.data.personalSummary ?? "",
      employmentType: employeeQuery.data.employmentType ?? "",
      workingStatus: employeeQuery.data.workingStatus ?? "WORKING",
      employeeLevel: employeeQuery.data.employeeLevel ?? "",
      monthlyWorkingCapacityHours: employeeQuery.data.monthlyWorkingCapacityHours ?? 168,
      mainExpertise: employeeQuery.data.mainExpertise ?? "",
      secondaryExpertise: employeeQuery.data.secondaryExpertise ?? "",
      status: employeeQuery.data.status ?? "ACTIVE",
    });
  }, [employeeQuery.data, form]);

  const mutation = useMutation({
    mutationFn: (values: Values) => updateEmployee(params.id, toEmployeePayload(values)),
    onSuccess: () => {
      toast.success("Đã cập nhật nhân viên");
      void queryClient.invalidateQueries({ queryKey: queryKeys.employee(params.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees });
      void queryClient.invalidateQueries({ queryKey: queryKeys.employeeWorkload(params.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.workload });
      void queryClient.invalidateQueries({ queryKey: queryKeys.ownerDashboard });
    },
  });
  const resetPasswordMutation = useMutation({
    mutationFn: resetEmployeePassword,
    onSuccess: (employee) => {
      toast.success("Đã reset mật khẩu nhân viên");
      setResetCredential(employee);
    },
  });

  return (
    <RequireRole allowedRoles={["OWNER", "BUSINESS_OWNER", "HR"]}>
      <PageHeader
        eyebrow="Nhân viên"
        title={employeeQuery.data?.fullName ?? "Chi tiết nhân viên"}
        description="Cập nhật hồ sơ, năng lực chuyên môn và xem nhanh mức tải công việc cá nhân."
        secondaryAction={<div className="flex flex-wrap gap-2"><Button variant="secondary" disabled={resetPasswordMutation.isPending || !employeeQuery.data?.id} onClick={() => employeeQuery.data?.id && window.confirm("Reset mật khẩu nhân viên này?") ? resetPasswordMutation.mutate(employeeQuery.data.id) : undefined}>Reset mật khẩu</Button><Link href="/owner/employees" className="focus-ring rounded-control border border-border px-4 py-2.5 text-sm font-semibold hover:bg-surface-muted">Quay lại</Link></div>}
      />
      {employeeQuery.isLoading ? <LoadingState rows={4} /> : null}
      {employeeQuery.error ? <ErrorState title="Không thể tải nhân viên" error={employeeQuery.error} onRetry={() => void employeeQuery.refetch()} /> : null}
      {employeeQuery.data ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <Card>
            <h2 className="text-lg font-black">Hồ sơ nhân viên</h2>
            <div className="mt-4 grid gap-3 rounded-control border border-border bg-surface-subtle p-4 md:grid-cols-3">
              <div><p className="text-xs font-bold tracking-[0.14em] text-muted-foreground">Tên đăng nhập</p><p className="mt-1 font-bold text-foreground">{employeeQuery.data.username ?? "Chưa có"}</p></div>
              <div><p className="text-xs font-bold tracking-[0.14em] text-muted-foreground">Mã nhân viên</p><p className="mt-1 font-bold text-foreground">{employeeQuery.data.employeeCode ?? "Chưa có"}</p></div>
              {employeeQuery.data.initialPassword ? <div><p className="text-xs font-bold tracking-[0.14em] text-muted-foreground">Mật khẩu ban đầu</p><button type="button" className="mt-1 font-bold text-primary" onClick={() => setShowInitialPassword((value) => !value)}>{showInitialPassword ? employeeQuery.data.initialPassword : "••••••••"}</button></div> : null}
            </div>
            <form className="mt-4 grid gap-6" onSubmit={form.handleSubmit((values: Values) => mutation.mutate(values))}>
              <section className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2"><h3 className="text-sm font-black text-foreground">Thông tin cơ bản</h3></div>
                <Field label="Họ và tên" {...form.register("fullName")} error={form.formState.errors.fullName?.message} />
                <Field label="Email" required {...form.register("email")} error={form.formState.errors.email?.message} />
                <Field label="Số điện thoại" optional {...form.register("phone")} />
                <Select label="Trạng thái" {...form.register("status")}>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Tạm ngưng</option>
                  <option value="INVITED">Đã mời</option>
                </Select>
              </section>
              <section className="grid gap-4 border-t border-border pt-5 md:grid-cols-2">
                <div className="md:col-span-2"><h3 className="text-sm font-black text-foreground">Cơ cấu và quyền workspace</h3><p className="mt-1 text-sm text-muted-foreground">Vai trò hệ thống được backend xác định từ Nhóm quyền của Vị trí nghiệp vụ.</p></div>
                <Select label="Vị trí nghiệp vụ" value={selectedPositionId ?? ""} onChange={(event) => { const id = event.target.value; form.setValue("jobPositionId", id); const position = (positionsQuery.data ?? []).find((item) => item.id === id); if (position) form.setValue("departmentId", position.departmentId); }}><option value="">Chưa chọn</option>{(positionsQuery.data ?? []).filter((item) => item.status === "ACTIVE" || item.id === employeeQuery.data.jobPositionId).map((item) => <option key={item.id} value={item.id}>{item.name} · {item.permissionGroup}</option>)}</Select>
                <Select label="Phòng ban" disabled={Boolean(selectedPosition)} helper={selectedPosition ? "Được đồng bộ từ vị trí nghiệp vụ." : undefined} {...form.register("departmentId")}><option value="">Chưa chọn</option>{(departmentsQuery.data ?? []).filter((item) => item.status === "ACTIVE" || item.id === employeeQuery.data.departmentId).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
                <div className="md:col-span-2 rounded-control bg-surface-muted p-3 text-sm"><strong>System role từ backend:</strong> {employeeQuery.data.role}</div>
              </section>
              <section className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2"><h3 className="text-sm font-black text-foreground">Thông tin chuyên môn</h3></div>
                <Field label="Chức danh" optional {...form.register("jobTitle")} />
                <Select label="Cấp độ kinh nghiệm" optional error={form.formState.errors.seniorityLevel?.message} {...form.register("seniorityLevel")}>
                  <option value="">Chưa chọn</option>
                  {seniorityOptions.map((option) => <option key={option} value={option}>{seniorityLabel(option)}</option>)}
                </Select>
                <Field label="Số năm kinh nghiệm" type="number" min="0" optional error={form.formState.errors.yearsOfExperience?.message} {...form.register("yearsOfExperience")} />
                <Select label="Mức kỹ năng" optional error={form.formState.errors.skillRating?.message} {...form.register("skillRating")}>
                  <option value="">Chưa chọn</option>
                  {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}/5</option>)}
                </Select>
                <div className="md:col-span-2"><TextArea label="Kỹ năng chuyên môn" optional {...form.register("skills")} /></div>
                <Field label="Chuyên môn chính" {...form.register("mainExpertise")} />
                <Field label="Chuyên môn phụ" {...form.register("secondaryExpertise")} />
                <Select label="Cấp nhân viên" {...form.register("employeeLevel")}><option value="">Chưa chọn</option>{employeeLevelOptions.map((option) => <option key={option} value={option}>{option}</option>)}</Select>
                <Field label="Năng lực tháng (giờ)" type="number" min="1" {...form.register("monthlyWorkingCapacityHours")} />
              </section>
              <section className="grid gap-4 border-t border-border pt-5 md:grid-cols-2"><div className="md:col-span-2"><h3 className="text-sm font-black">Thông tin nhân sự</h3></div><Field label="Ngày sinh" type="date" {...form.register("dateOfBirth")} /><Select label="Giới tính" {...form.register("gender")}><option value="">Chưa chọn</option><option value="MALE">Nam</option><option value="FEMALE">Nữ</option><option value="OTHER">Khác</option></Select><Select label="Loại hình làm việc" {...form.register("employmentType")}><option value="">Chưa chọn</option>{employmentTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</Select><Select label="Trạng thái làm việc" {...form.register("workingStatus")}>{workingStatusOptions.map((option) => <option key={option} value={option}>{option}</option>)}</Select><div className="md:col-span-2"><Field label="Địa chỉ" {...form.register("address")} /></div><div className="md:col-span-2"><TextArea label="Tóm tắt cá nhân" {...form.register("personalSummary")} /></div></section>
              <div className="flex justify-end">
                <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}</Button>
              </div>
            </form>
            {mutation.error ? <div className="mt-4"><ErrorState title="Không thể lưu nhân viên" error={mutation.error} /></div> : null}
          </Card>

          <div className="grid gap-4 self-start">
            {workloadQuery.isLoading ? <LoadingState rows={3} /> : null}
            {workloadQuery.error ? <ErrorState title="Không thể tải workload" error={workloadQuery.error} onRetry={() => void workloadQuery.refetch()} /> : null}
            {!workloadQuery.isLoading && !workloadQuery.error ? (
              <>
                <StatCard label="Việc mở" value={workloadQuery.data?.openTasks ?? 0} />
                <StatCard label="Quá hạn" value={workloadQuery.data?.overdueTasks ?? 0} tone={(workloadQuery.data?.overdueTasks ?? 0) > 0 ? "warning" : "neutral"} />
                <Card>
                  <p className="mb-2 text-sm font-semibold text-muted-foreground">Trạng thái tài khoản</p>
                  <StatusBadge value={employeeQuery.data.status} />
                  <p className="mb-2 mt-5 text-sm font-semibold text-muted-foreground">Mức tải ước tính</p>
                  <WorkloadBadge value={workloadQuery.data?.workloadLevel} />
                  <p className="mb-2 mt-5 text-sm font-semibold text-muted-foreground">Cấp độ</p>
                  <p className="font-bold text-foreground">{seniorityLabel(employeeQuery.data.seniorityLevel)}</p>
                  <p className="mb-2 mt-5 text-sm font-semibold text-muted-foreground">Mức kỹ năng</p>
                  <p className="font-bold text-foreground">{ratingLabel(employeeQuery.data.skillRating)}</p>
                  <p className="mb-2 mt-5 text-sm font-semibold text-muted-foreground">Kỹ năng</p>
                  <p className="text-sm leading-6 text-muted-foreground">{employeeQuery.data.skills || "Chưa cập nhật kỹ năng chuyên môn."}</p>
                </Card>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
      <EmployeeCredentialsDialog employee={resetCredential} onClose={() => setResetCredential(null)} />
    </RequireRole>
  );
}


