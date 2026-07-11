"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { recommendIndividuals, recommendTeamLeaders } from "@/api/tasks.api";
import { listEmployees } from "@/api/employees.api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, Select, TextArea } from "@/components/common/Field";
import { RoleFitBadge, WorkloadBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { taskSchema } from "@/features/tasks/schemas";
import { queryKeys } from "@/lib/query-keys";
import type { ApiFailure } from "@/types/api";
import type { CreateTaskRequest } from "@/types/requests";
import type { z } from "zod";

type TaskFormInput = z.input<typeof taskSchema>;
type TaskFormValues = z.output<typeof taskSchema>;

function toIsoWithTimezone(localValue: string): string {
  const date = new Date(localValue);
  if (!Number.isFinite(date.getTime())) return localValue;
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absolute = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const minutes = String(absolute % 60).padStart(2, "0");
  return `${localValue.length === 16 ? `${localValue}:00` : localValue}${sign}${hours}:${minutes}`;
}

export function TaskForm({
  initialValues,
  onSubmit,
  submitLabel,
  pending,
}: {
  initialValues?: Partial<CreateTaskRequest>;
  onSubmit: (values: CreateTaskRequest) => void;
  submitLabel: string;
  pending?: boolean;
}) {
  const employees = useQuery({ queryKey: queryKeys.employees, queryFn: listEmployees });
  const form = useForm<TaskFormInput, unknown, TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      requirements: initialValues?.requirements ?? "",
      description: initialValues?.description ?? "",
      assignmentType: initialValues?.assignmentType ?? "INDIVIDUAL",
      assigneeId: initialValues?.assigneeId ?? "",
      teamLeaderId: initialValues?.teamLeaderId ?? "",
      teamMemberIds: initialValues?.teamMemberIds ?? [],
      priority: initialValues?.priority ?? "MEDIUM",
      deadline: initialValues?.deadline ? initialValues.deadline.slice(0, 16) : "",
      estimatedHours: initialValues?.estimatedHours ?? 1,
    },
  });
  const values = useWatch({ control: form.control });
  const assignmentType = values.assignmentType ?? "INDIVIDUAL";
  const recommendation = useMutation({ mutationFn: assignmentType === "TEAM" ? recommendTeamLeaders : recommendIndividuals });
  const recommendationError = recommendation.error as ApiFailure | null;
  const watchedTitle = values.title ?? "";
  const watchedRequirements = values.requirements ?? "";
  const watchedDeadline = values.deadline ?? "";
  const selectedAssignee = values.assigneeId ?? "";

  return (
    <form
      className="grid gap-5"
      onSubmit={form.handleSubmit((data) =>
        onSubmit({
          ...data,
          deadline: toIsoWithTimezone(data.deadline),
          description: data.description || undefined,
          estimatedHours: data.estimatedHours,
          assigneeId: data.assignmentType === "INDIVIDUAL" ? data.assigneeId : undefined,
          teamLeaderId: data.assignmentType === "TEAM" ? data.teamLeaderId : undefined,
          teamMemberIds: data.assignmentType === "TEAM" ? data.teamMemberIds : undefined,
        }),
      )}
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-5">
          <Card>
            <h2 className="text-lg font-black">Thông tin task</h2>
            <p className="mt-1 text-sm text-muted-foreground">Viết ngắn gọn để người nhận hiểu việc cần làm và tiêu chí hoàn thành.</p>
            <div className="mt-4 grid gap-4">
              <Select label="Chế độ giao việc" {...form.register("assignmentType")}>
                <option value="INDIVIDUAL">Cá nhân</option>
                <option value="TEAM">Nhóm</option>
              </Select>
              <Field label="Tiêu đề" error={form.formState.errors.title?.message} {...form.register("title")} />
              <TextArea label="Yêu cầu" error={form.formState.errors.requirements?.message} {...form.register("requirements")} />
              <TextArea label="Mô tả" optional {...form.register("description")} />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-black">Kế hoạch</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Select label="Mức ưu tiên" {...form.register("priority")}>
                <option value="LOW">Thấp</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HIGH">Cao</option>
                <option value="CRITICAL">Khẩn cấp</option>
              </Select>
              <Field label="Deadline" type="datetime-local" error={form.formState.errors.deadline?.message} {...form.register("deadline")} />
              <Field label="Ước tính giờ" type="number" step="0.5" optional error={form.formState.errors.estimatedHours?.message} {...form.register("estimatedHours")} />
            </div>
          </Card>
        </div>

        <div className="grid gap-5 self-start">
          <Card>
            <h2 className="text-lg font-black">Giao việc</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Chọn người nhận trực tiếp hoặc dùng gợi ý AI để tham khảo workload trước khi giao.</p>
            <div className="mt-4 grid gap-4">
              {employees.isLoading ? <LoadingState label="Đang tải nhân viên..." rows={2} /> : null}
              {employees.error ? <ErrorState title="Không thể tải nhân viên" error={employees.error} onRetry={() => void employees.refetch()} /> : null}
              {!employees.isLoading && !employees.error ? (
                assignmentType === "INDIVIDUAL" ? <Select label="Người nhận" error={form.formState.errors.assigneeId?.message} {...form.register("assigneeId")}>
                  <option value="">Chọn nhân viên</option>
                  {(employees.data ?? []).filter((employee) => !employee.status || employee.status === "ACTIVE").map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
                </Select> : <>
                  <Select label="Trưởng nhóm" error={form.formState.errors.teamLeaderId?.message} {...form.register("teamLeaderId")}>
                    <option value="">Chọn trưởng nhóm</option>
                    {(employees.data ?? []).filter((employee) => !employee.status || employee.status === "ACTIVE").map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
                  </Select>
                  <div><p className="mb-2 text-sm font-bold">Thành viên nhóm</p><div className="grid gap-2 rounded-control border border-border p-3">{(employees.data ?? []).filter((employee) => employee.id !== values.teamLeaderId && (!employee.status || employee.status === "ACTIVE")).map((employee) => <label key={employee.id} className="flex items-center gap-2 text-sm"><input type="checkbox" value={employee.id} {...form.register("teamMemberIds")} />{employee.fullName}</label>)}</div></div>
                </>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                disabled={!watchedTitle || !watchedRequirements || !watchedDeadline || recommendation.isPending}
                onClick={() =>
                  recommendation.mutate({
                    title: watchedTitle,
                    requirements: watchedRequirements,
                    deadline: toIsoWithTimezone(watchedDeadline),
                    estimatedHours: typeof values.estimatedHours === "number" ? values.estimatedHours : undefined,
                  })
                }
              >
                {recommendation.isPending ? "AI đang phân tích..." : assignmentType === "TEAM" ? "Gợi ý trưởng nhóm" : "Gợi ý người nhận"}
              </Button>
            </div>
          </Card>

          <Card className="bg-slate-950 text-white">
            <p className="text-xs font-bold tracking-[0.18em] text-teal-300">AI GỢI Ý</p>
            <h2 className="mt-2 text-lg font-black">Chọn người phù hợp</h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">AI chỉ đưa ra khuyến nghị dựa trên dữ liệu hiện có. Owner vẫn là người quyết định cuối cùng.</p>
            {recommendation.error ? (
              <div className="mt-4">
                <ErrorState
                  title={recommendationError?.code === "AI_RATE_LIMITED" || recommendationError?.status === 429 ? "AI đang quá tải" : "Không thể lấy gợi ý"}
                  error={recommendation.error}
                />
              </div>
            ) : null}
            {recommendation.data ? (
              <div className="mt-4 grid gap-3">
                {recommendation.data.length === 0 ? <EmptyState title="AI chưa có gợi ý phù hợp" description="Thử bổ sung yêu cầu, deadline hoặc dữ liệu workload." /> : null}
                {recommendation.data.map((item) => (
                  <div key={item.employeeId ?? item.employeeName} className="rounded-control border border-white/10 bg-white/5 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold">{item.fullName ?? item.employeeName ?? item.employeeId ?? "Nhân viên"}</p>
                      <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold">Điểm {item.score ?? "—"}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2"><WorkloadBadge value={item.workloadLevel} /><RoleFitBadge value={item.roleFit} />{item.source === "RULE_BASED_FALLBACK" || item.aiProviderFailed ? <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">Phân tích dự phòng</span> : null}</div>
                    {item.requiredRole ? <p className="mt-2 text-xs font-semibold text-slate-300">Vai trò cần: {item.requiredRole}</p> : null}
                    {item.roleFitReason ? <p className="mt-1 text-xs leading-5 text-slate-400">{item.roleFitReason}</p> : null}
                    {item.source === "RULE_BASED_FALLBACK" || item.aiProviderFailed ? <p className="mt-2 rounded-control bg-amber-100/10 px-2 py-1 text-xs leading-5 text-amber-100">Dịch vụ AI tạm thời không phản hồi. Hệ thống đang hiển thị kết quả dựa trên quy tắc nghiệp vụ.{item.fallbackReason ? ` ${item.fallbackReason}` : ""}</p> : null}
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.reason ?? item.risk ?? "Backend chưa trả lý do chi tiết."}</p>
                    <Button
                      type="button"
                      className="mt-3 w-full"
                      variant={selectedAssignee === item.employeeId ? "secondary" : "primary"}
                      disabled={!item.employeeId}
                      onClick={() => item.employeeId ? form.setValue(assignmentType === "TEAM" ? "teamLeaderId" : "assigneeId", item.employeeId, { shouldValidate: true }) : undefined}
                    >
                      {selectedAssignee === item.employeeId ? "Đã chọn" : "Chọn người này"}
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="submit" disabled={pending} className="sm:min-w-36">
            {pending ? "Đang lưu..." : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

