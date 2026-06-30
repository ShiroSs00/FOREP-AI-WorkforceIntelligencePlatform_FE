"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { RequireRole } from "@/auth/require-role";
import { getEmployee, getEmployeeWorkload, updateEmployee } from "@/api/employees.api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, Select } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge, WorkloadBadge } from "@/components/common/StatusBadge";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { employeeSchema } from "@/features/employees/schemas";
import { queryKeys } from "@/lib/query-keys";
import type { z } from "zod";

type Values = z.infer<typeof employeeSchema>;

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const employeeQuery = useQuery({ queryKey: queryKeys.employee(params.id), queryFn: () => getEmployee(params.id) });
  const workloadQuery = useQuery({ queryKey: ["employees", params.id, "workload"], queryFn: () => getEmployeeWorkload(params.id) });
  const form = useForm<Values>({ resolver: zodResolver(employeeSchema), defaultValues: { fullName: "", email: "", phone: "", status: "ACTIVE" } });
  useEffect(() => {
    if (employeeQuery.data) form.reset(employeeQuery.data);
  }, [employeeQuery.data, form]);
  const mutation = useMutation({
    mutationFn: (values: Values) => updateEmployee(params.id, values),
    onSuccess: () => {
      toast.success("Đã cập nhật nhân viên");
      void queryClient.invalidateQueries({ queryKey: queryKeys.employee(params.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    },
  });
  return (
    <RequireRole role="OWNER">
      <PageHeader
        eyebrow="Nhân viên"
        title={employeeQuery.data?.fullName ?? "Chi tiết nhân viên"}
        description="Cập nhật thông tin tài khoản và xem nhanh mức tải công việc cá nhân."
        secondaryAction={<Link href="/owner/employees" className="focus-ring rounded-control border border-border px-4 py-2.5 text-sm font-semibold hover:bg-surface-muted">Quay lại</Link>}
      />
      {employeeQuery.isLoading ? <LoadingState rows={4} /> : null}
      {employeeQuery.error ? <ErrorState title="Không thể tải nhân viên" error={employeeQuery.error} onRetry={() => void employeeQuery.refetch()} /> : null}
      {employeeQuery.data ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <Card>
            <h2 className="text-lg font-black">Thông tin tài khoản</h2>
            <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
              <Field label="Họ tên" {...form.register("fullName")} error={form.formState.errors.fullName?.message} />
              <Field label="Email" optional {...form.register("email")} />
              <Field label="Số điện thoại" optional {...form.register("phone")} />
              <Select label="Trạng thái" {...form.register("status")}>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Tạm ngưng</option>
                <option value="INVITED">Đã mời</option>
              </Select>
              <div className="md:col-span-2 flex justify-end">
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
                </Card>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </RequireRole>
  );
}
