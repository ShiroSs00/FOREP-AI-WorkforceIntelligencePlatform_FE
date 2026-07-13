"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { adjustTask, splitTask } from "@/api/ai.api";
import { addTaskAttachment, assignIndividual, assignTeam, cancelTask, getWorkspaceTask, listTaskAttachments, listTaskUpdates, updateTaskCustomerInfo, updateTaskProgress, updateTaskStatus } from "@/api/tasks.api";
import { listEmployees } from "@/api/employees.api";
import { useAuthStore } from "@/auth/auth-store";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, Select, TextArea } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { PriorityBadge, StatusBadge } from "@/components/common/StatusBadge";
import { ProgressBar } from "@/components/common/ProgressBar";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { progressSchema } from "@/features/tasks/schemas";
import { queryKeys } from "@/lib/query-keys";
import { formatDateTime, isTaskOverdue } from "@/lib/tasks";
import { normalizeRole } from "@/lib/role";
import { canEditTaskCustomerInfo, getTaskAssignmentType } from "@/lib/task-permissions";
import type { z } from "zod";

type ProgressInput = z.input<typeof progressSchema>;
type ProgressValues = z.output<typeof progressSchema>;
type StatusValue = "ASSIGNED" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED" | "CANCELLED";

const updateLabels: Record<string, string> = {
  PROGRESS: "Cập nhật tiến độ",
  BLOCKER: "Báo vướng mắc",
  COMPLETION: "Hoàn thành",
};

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const task = useQuery({ queryKey: queryKeys.task(params.id), queryFn: () => getWorkspaceTask(params.id) });
  const updates = useQuery({ queryKey: queryKeys.taskUpdates(params.id), queryFn: () => listTaskUpdates(params.id) });
  const attachments = useQuery({ queryKey: queryKeys.taskAttachments(params.id), queryFn: () => listTaskAttachments(params.id) });
  const employees = useQuery({ queryKey: queryKeys.employees, queryFn: listEmployees });
  const [attachment, setAttachment] = useState({ fileName: "", fileUrl: "", contentType: "", fileSize: "", attachmentType: "REFERENCE" as const });
  const [assignment, setAssignment] = useState({ type: "INDIVIDUAL" as "INDIVIDUAL" | "TEAM", individualId: "", leaderId: "", memberIds: [] as string[] });
  const [customerEditor, setCustomerEditor] = useState<{ customerPhone: string; customerEmail: string; customerDescription: string } | null>(null);
  const form = useForm<ProgressInput, unknown, ProgressValues>({
    resolver: zodResolver(progressSchema),
    defaultValues: { updateType: "PROGRESS", content: "", progressPercent: 0 },
  });

  const invalidateTaskSideEffects = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.task(params.id) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.taskUpdates(params.id) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    void queryClient.invalidateQueries({ queryKey: queryKeys.workload });
    void queryClient.invalidateQueries({ queryKey: queryKeys.ownerDashboard });
    void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    void queryClient.invalidateQueries({ queryKey: queryKeys.ai });
    void queryClient.invalidateQueries({ queryKey: queryKeys.taskRecommendation("individual") });
    void queryClient.invalidateQueries({ queryKey: queryKeys.taskRecommendation("team-leaders") });
    void queryClient.invalidateQueries({ queryKey: queryKeys.taskRecommendation("team-members") });
  };

  const progressMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ProgressValues }) => updateTaskProgress(id, values),
    onSuccess: () => {
      toast.success("Đã gửi cập nhật");
      form.reset({ updateType: "PROGRESS", content: "", progressPercent: task.data?.progressPercent ?? 0 });
      invalidateTaskSideEffects();
    },
  });
  const statusMutation = useMutation({
    mutationFn: (status: StatusValue) => updateTaskStatus(params.id, { status }),
    onSuccess: () => {
      toast.success("Đã đổi trạng thái task");
      invalidateTaskSideEffects();
    },
  });
  const cancelMutation = useMutation({
    mutationFn: () => cancelTask(params.id),
    onSuccess: () => {
      toast.success("Đã hủy task");
      invalidateTaskSideEffects();
    },
  });
  const splitMutation = useMutation({ mutationFn: () => splitTask(params.id) });
  const adjustMutation = useMutation({ mutationFn: () => adjustTask(params.id) });
  const attachmentMutation = useMutation({ mutationFn: () => addTaskAttachment(params.id, { fileName: attachment.fileName.trim(), fileUrl: attachment.fileUrl.trim(), contentType: attachment.contentType.trim() || undefined, fileSize: attachment.fileSize ? Number(attachment.fileSize) : undefined, attachmentType: attachment.attachmentType }), onSuccess: () => { toast.success("Đã thêm tệp đính kèm"); setAttachment({ fileName: "", fileUrl: "", contentType: "", fileSize: "", attachmentType: "REFERENCE" }); void queryClient.invalidateQueries({ queryKey: queryKeys.taskAttachments(params.id) }); } });
  const assignmentMutation = useMutation({ mutationFn: () => assignment.type === "INDIVIDUAL" ? assignIndividual(params.id, { employeeId: assignment.individualId }) : assignTeam(params.id, { teamLeaderId: assignment.leaderId, teamMemberIds: assignment.memberIds }), onSuccess: () => { toast.success("Đã cập nhật người nhận"); invalidateTaskSideEffects(); void queryClient.invalidateQueries({ queryKey: queryKeys.managerTasks }); } });
  const customerMutation = useMutation({ mutationFn: () => updateTaskCustomerInfo(params.id, { customerPhone: customerEditor?.customerPhone.trim() || undefined, customerEmail: customerEditor?.customerEmail.trim() || undefined, customerDescription: customerEditor?.customerDescription.trim() || undefined }), onSuccess: () => { toast.success("Đã cập nhật thông tin khách hàng"); setCustomerEditor(null); void queryClient.invalidateQueries({ queryKey: queryKeys.task(params.id) }); } });
  const currentTask = task.data;
  const terminal = currentTask?.status === "COMPLETED" || currentTask?.status === "CANCELLED";
  const normalizedRole = user ? normalizeRole(user.role) : null;
  const canManage = normalizedRole === "BUSINESS_OWNER" || normalizedRole === "MANAGER";
  const canEditCustomer = canEditTaskCustomerInfo({ user, task: currentTask });
  const employeeName = (id?: string | null) => (employees.data ?? []).find((item) => item.id === id)?.fullName ?? id ?? "—";
  const assignmentType = currentTask ? getTaskAssignmentType(currentTask) : "INDIVIDUAL";

  return (
    <>
      <PageHeader
        eyebrow="Chi tiết task"
        title={currentTask?.title ?? "Task"}
        description="Theo dõi yêu cầu, tiến độ, người nhận và toàn bộ lịch sử cập nhật."
        primaryAction={canManage && currentTask ? <Link className="focus-ring rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground" href={`/tasks/${params.id}/edit`}>Chỉnh sửa task</Link> : undefined}
        secondaryAction={<Link className="focus-ring rounded-control border border-border px-4 py-2.5 text-sm font-semibold hover:bg-surface-muted" href="/tasks">Quay lại danh sách</Link>}
      />
      {task.isLoading ? <LoadingState rows={4} /> : null}
      {task.error ? <ErrorState title="Không thể tải chi tiết task" error={task.error} onRetry={() => void task.refetch()} /> : null}
      {currentTask ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-5">
            <Card>
              <div className="flex flex-wrap items-center gap-2">
                {currentTask.priority ? <PriorityBadge value={currentTask.priority} /> : null}
                {currentTask.status ? <StatusBadge value={currentTask.status} /> : null}
                {isTaskOverdue(currentTask) ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-warning ring-1 ring-amber-200">Quá hạn</span> : null}
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground">Người nhận</p>
                  <p className="mt-1 font-bold text-foreground">{assignmentType === "TEAM" ? `Nhóm · ${currentTask.teamLeaderName ?? employeeName(currentTask.participants?.find((item) => item.leader || item.participantRole === "LEADER")?.employeeId)}` : currentTask.assigneeName ?? employeeName(currentTask.assigneeId)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground">Người tạo</p>
                  <p className="mt-1 font-bold text-foreground">{currentTask.creatorName ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground">Deadline</p>
                  <p className="mt-1 font-bold text-foreground">{formatDateTime(currentTask.deadline)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground">Thời gian ước tính</p>
                  <p className="mt-1 font-bold text-foreground">{currentTask.estimatedHours ?? "—"} giờ</p>
                </div>
              </div>
              <div className="mt-5"><ProgressBar value={currentTask.progressPercent} showLabel /></div>
            </Card>

            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-black">Thông tin khách hàng</h2><p className="mt-1 text-sm text-muted-foreground">Thông tin liên hệ và yêu cầu bổ sung gắn với task.</p></div>{canEditCustomer ? <Button variant="secondary" onClick={() => setCustomerEditor({ customerPhone: currentTask.customerPhone ?? "", customerEmail: currentTask.customerEmail ?? "", customerDescription: currentTask.customerDescription ?? "" })}>Sửa thông tin khách hàng</Button> : null}</div>
              <dl className="mt-4 grid gap-4 md:grid-cols-2"><div><dt className="text-xs font-bold text-muted-foreground">Số điện thoại</dt><dd className="mt-1 font-semibold">{currentTask.customerPhone || "Chưa cập nhật"}</dd></div><div><dt className="text-xs font-bold text-muted-foreground">Email</dt><dd className="mt-1 font-semibold">{currentTask.customerEmail || "Chưa cập nhật"}</dd></div><div className="md:col-span-2"><dt className="text-xs font-bold text-muted-foreground">Mô tả</dt><dd className="mt-1 whitespace-pre-wrap leading-6">{currentTask.customerDescription || "Chưa có mô tả khách hàng."}</dd></div></dl>
              {customerEditor ? <form className="mt-5 grid gap-3 rounded-control border border-border bg-surface-subtle p-4" onSubmit={(event) => { event.preventDefault(); customerMutation.mutate(); }}><div className="grid gap-3 md:grid-cols-2"><Field label="Số điện thoại" optional value={customerEditor.customerPhone} onChange={(event) => setCustomerEditor({ ...customerEditor, customerPhone: event.target.value })} /><Field label="Email" type="email" optional value={customerEditor.customerEmail} onChange={(event) => setCustomerEditor({ ...customerEditor, customerEmail: event.target.value })} /></div><TextArea label="Mô tả khách hàng" optional value={customerEditor.customerDescription} onChange={(event) => setCustomerEditor({ ...customerEditor, customerDescription: event.target.value })} /><div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setCustomerEditor(null)}>Đóng</Button><Button type="submit" disabled={customerMutation.isPending}>{customerMutation.isPending ? "Đang lưu..." : "Lưu thông tin"}</Button></div>{customerMutation.error ? <ErrorState title="Không thể cập nhật thông tin khách hàng" error={customerMutation.error} /> : null}</form> : null}
            </Card>

            <Card>
              <h2 className="text-lg font-black">Thông tin phân công</h2>
              {assignmentType === "INDIVIDUAL" ? <p className="mt-3 text-sm">Người nhận: <strong>{currentTask.assigneeName ?? employeeName(currentTask.assigneeId)}</strong></p> : <div className="mt-3 grid gap-3"><p className="text-sm">Trưởng nhóm: <strong>{currentTask.teamLeaderName ?? employeeName(currentTask.participants?.find((item) => item.leader || item.participantRole === "LEADER")?.employeeId)}</strong></p><div className="grid gap-2">{(currentTask.participants ?? []).filter((item) => item.participantRole === "MEMBER").map((participant) => <div key={participant.id} className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-border p-3"><span className="font-semibold">{employeeName(participant.employeeId)}</span><span className="text-xs text-muted-foreground">Thành viên · {participant.allocatedHours ?? 0} giờ phân bổ</span></div>)}{(currentTask.participants ?? []).filter((item) => item.participantRole === "MEMBER").length === 0 ? <p className="text-sm text-muted-foreground">Backend chưa trả danh sách thành viên.</p> : null}</div></div>}
            </Card>

            {(currentTask.difficulty || currentTask.requiredSkills || currentTask.requiredJobPositionId || currentTask.taskDomain || currentTask.projectId || currentTask.departmentId) ? <Card><h2 className="text-lg font-black">Yêu cầu phục vụ gợi ý</h2><dl className="mt-4 grid gap-4 md:grid-cols-2"><div><dt className="text-xs font-bold text-muted-foreground">Độ khó</dt><dd className="mt-1 font-semibold">{currentTask.difficulty ?? "—"}</dd></div><div><dt className="text-xs font-bold text-muted-foreground">Kỹ năng</dt><dd className="mt-1 font-semibold">{currentTask.requiredSkills || "—"}</dd></div><div><dt className="text-xs font-bold text-muted-foreground">Vị trí yêu cầu</dt><dd className="mt-1 font-semibold">{currentTask.requiredJobPositionName ?? currentTask.requiredJobPositionId ?? "—"}</dd></div><div><dt className="text-xs font-bold text-muted-foreground">Lĩnh vực</dt><dd className="mt-1 font-semibold">{currentTask.taskDomain || "—"}</dd></div><div><dt className="text-xs font-bold text-muted-foreground">Dự án</dt><dd className="mt-1 font-semibold">{currentTask.projectName ?? currentTask.projectId ?? "—"}</dd></div><div><dt className="text-xs font-bold text-muted-foreground">Phòng ban</dt><dd className="mt-1 font-semibold">{currentTask.departmentName ?? currentTask.departmentId ?? "—"}</dd></div></dl></Card> : null}

            <Card>
              <h2 className="text-lg font-black">Nội dung task</h2>
              <div className="mt-4 grid gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground">Yêu cầu</p>
                  <p className="mt-2 leading-7 text-foreground">{currentTask.requirements || "Chưa có yêu cầu chi tiết."}</p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground">Mô tả</p>
                  <p className="mt-2 leading-7 text-muted-foreground">{currentTask.description || "Không có mô tả bổ sung."}</p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-black">Tệp đính kèm</h2>
              {attachments.isLoading ? <LoadingState rows={2} /> : null}
              {attachments.error ? <ErrorState title="Không thể tải tệp đính kèm" error={attachments.error} onRetry={() => void attachments.refetch()} /> : null}
              {!attachments.isLoading && !attachments.error ? attachments.data?.length ? <div className="mt-4 grid gap-2">{attachments.data.map((item, index) => <a key={item.id ?? `${item.fileName}-${index}`} href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="rounded-control border border-border p-3 hover:bg-surface-muted"><p className="font-bold">{item.fileName}</p><p className="mt-1 text-xs text-muted-foreground">{{ REQUIREMENT: "Tài liệu yêu cầu", REFERENCE: "Tài liệu tham khảo", RESULT: "Kết quả", OTHER: "Khác" }[item.attachmentType ?? "OTHER"]} · {item.contentType || "Không rõ định dạng"} · {typeof item.fileSize === "number" ? `${item.fileSize.toLocaleString("vi-VN")} bytes` : "Không rõ dung lượng"}</p><p className="mt-1 text-xs text-muted-foreground">Tải lên bởi {item.uploadedBy || "—"} · {formatDateTime(item.createdAt ?? undefined)}</p></a>)}</div> : <EmptyState title="Chưa có tệp đính kèm" description="Backend chưa trả tệp nào cho công việc này." /> : null}
              {canManage ? <form className="mt-4 grid gap-3 rounded-control border border-border p-3" onSubmit={(event) => { event.preventDefault(); if (attachment.fileName.trim() && attachment.fileUrl.trim()) attachmentMutation.mutate(); }}><p className="font-bold">Thêm metadata tệp</p><Field label="Tên tệp" value={attachment.fileName} onChange={(event) => setAttachment({ ...attachment, fileName: event.target.value })} /><Field label="URL tệp" type="url" value={attachment.fileUrl} onChange={(event) => setAttachment({ ...attachment, fileUrl: event.target.value })} /><div className="grid gap-3 sm:grid-cols-2"><Field label="Content type" optional value={attachment.contentType} onChange={(event) => setAttachment({ ...attachment, contentType: event.target.value })} /><Field label="Dung lượng byte" type="number" optional value={attachment.fileSize} onChange={(event) => setAttachment({ ...attachment, fileSize: event.target.value })} /></div><Button type="submit" disabled={!attachment.fileName.trim() || !attachment.fileUrl.trim() || attachmentMutation.isPending}>{attachmentMutation.isPending ? "Đang thêm..." : "Thêm tệp"}</Button>{attachmentMutation.error ? <ErrorState title="Không thể thêm tệp" error={attachmentMutation.error} /> : null}</form> : null}
            </Card>

            <Card>
              <h2 className="text-lg font-black">Lịch sử cập nhật</h2>
              <div className="mt-4 grid gap-4">
                {updates.isLoading ? <LoadingState rows={3} /> : null}
                {updates.error ? <ErrorState title="Không thể tải lịch sử" error={updates.error} onRetry={() => void updates.refetch()} /> : null}
                {!updates.isLoading && !updates.error && (updates.data ?? []).length === 0 ? <EmptyState title="Chưa có cập nhật" description="Các lần cập nhật tiến độ sẽ xuất hiện theo thời gian tại đây." /> : null}
                {(updates.data ?? []).map((item) => (
                  <div key={item.id} className="relative rounded-control border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold text-foreground">{updateLabels[item.updateType] ?? item.updateType}</p>
                      <p className="text-xs font-semibold text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.createdByName ?? "Người cập nhật"} · {item.progressPercent ?? "—"}%</p>
                    <p className="mt-3 leading-6 text-foreground">{item.content}</p>
                    {item.attachment ? <p className="mt-2 text-sm font-semibold text-primary">Có tệp đính kèm</p> : null}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <aside className="grid gap-5 self-start xl:sticky xl:top-24">
            <Card>
              <h2 className="text-lg font-black">Cập nhật nhanh</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Gửi tiến độ, báo vướng mắc hoặc đánh dấu hoàn thành để owner nắm tình hình.</p>
              {terminal ? <p className="mt-3 rounded-control bg-surface-subtle px-3 py-2 text-sm font-semibold text-muted-foreground">Task đã đóng nên thao tác cập nhật bị giới hạn.</p> : null}
              <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                <Button variant="secondary" disabled={terminal} onClick={() => form.setValue("updateType", "PROGRESS", { shouldValidate: true })}>Cập nhật tiến độ</Button>
                <Button variant="secondary" disabled={terminal} onClick={() => form.setValue("updateType", "BLOCKER", { shouldValidate: true })}>Báo vướng mắc</Button>
                <Button variant="secondary" disabled={terminal} onClick={() => { form.setValue("updateType", "COMPLETION", { shouldValidate: true }); form.setValue("progressPercent", 100, { shouldValidate: true }); }}>Hoàn thành</Button>
              </div>
              <form
                className="mt-5 grid gap-3"
                onSubmit={form.handleSubmit((values) =>
                  progressMutation.mutate({
                    id: params.id,
                    values: { ...values, progressPercent: values.updateType === "COMPLETION" ? 100 : values.progressPercent, attachment: values.attachment || undefined },
                  }),
                )}
              >
                <Select label="Loại cập nhật" {...form.register("updateType")} disabled={terminal}>
                  <option value="PROGRESS">Cập nhật tiến độ</option>
                  <option value="BLOCKER">Báo vướng mắc</option>
                  <option value="COMPLETION">Hoàn thành</option>
                </Select>
                <Field label="Tiến độ (%)" type="number" min="0" max="100" {...form.register("progressPercent")} disabled={terminal} />
                <TextArea label="Nội dung cập nhật" error={form.formState.errors.content?.message} {...form.register("content")} disabled={terminal} />
                <Field label="Tệp đính kèm" optional {...form.register("attachment")} disabled={terminal} />
                <Button type="submit" disabled={terminal || progressMutation.isPending}>{progressMutation.isPending ? "Đang gửi..." : "Gửi cập nhật"}</Button>
              </form>
              {progressMutation.error ? <ErrorState title="Không thể gửi cập nhật" error={progressMutation.error} /> : null}
            </Card>

            {normalizedRole === "BUSINESS_OWNER" ? (
              <Card>
                <h2 className="text-lg font-black">AI hỗ trợ task</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">AI chỉ tạo gợi ý để owner xem xét. FOREP không tự tạo subtask hoặc tự đổi deadline.</p>
                <div className="mt-4 grid gap-3">
                  <Button variant="secondary" onClick={() => splitMutation.mutate()} disabled={splitMutation.isPending || currentTask.status === "CANCELLED"}>{splitMutation.isPending ? "Đang tách task..." : "Gợi ý tách task"}</Button>
                  <Button variant="secondary" onClick={() => adjustMutation.mutate()} disabled={adjustMutation.isPending || currentTask.status === "CANCELLED"}>{adjustMutation.isPending ? "Đang phân tích..." : "Gợi ý deadline / ưu tiên"}</Button>
                </div>
                {splitMutation.error ? <div className="mt-4"><ErrorState title="Không thể tách task bằng AI" error={splitMutation.error} /></div> : null}
                {splitMutation.data ? (
                  <div className="mt-4 grid gap-3">
                    {splitMutation.data.length === 0 ? <EmptyState title="AI chưa có gợi ý subtask" description="Backend không trả subtask phù hợp cho task này." /> : null}
                    {splitMutation.data.map((item, index) => (
                      <div key={`${item.title ?? "subtask"}-${index}`} className="rounded-control border border-border p-3">
                        <p className="font-bold text-foreground">{item.title ?? `Subtask ${index + 1}`}</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.requirements ?? item.description ?? "Chưa có mô tả chi tiết."}</p>
                        {typeof item.estimatedHours === "number" ? <p className="mt-2 text-xs font-semibold text-muted-foreground">Ước tính {item.estimatedHours} giờ</p> : null}
                      </div>
                    ))}
                  </div>
                ) : null}
                {adjustMutation.error ? <div className="mt-4"><ErrorState title="Không thể lấy gợi ý điều chỉnh" error={adjustMutation.error} /></div> : null}
                {adjustMutation.data ? (
                  <div className="mt-4 rounded-control border border-border p-3">
                    <p className="font-bold text-foreground">Gợi ý điều chỉnh</p>
                    <p className="mt-2 text-sm text-muted-foreground">Deadline: {formatDateTime(adjustMutation.data.suggestedDeadline)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Ưu tiên: {adjustMutation.data.suggestedPriority ?? "—"}</p>
                    <p className="mt-2 text-sm leading-6 text-foreground">{adjustMutation.data.reason ?? "Backend chưa trả lý do chi tiết."}</p>
                  </div>
                ) : null}
              </Card>
            ) : null}

            {canManage ? (
              <Card>
                <h2 className="text-lg font-black">Quản lý task</h2>
                <div className="mt-4 grid gap-3">
                  <Select label="Kiểu giao việc" value={assignment.type} onChange={(event) => setAssignment({ ...assignment, type: event.target.value as "INDIVIDUAL" | "TEAM" })}><option value="INDIVIDUAL">Cá nhân</option><option value="TEAM">Nhóm</option></Select>
                  {assignment.type === "INDIVIDUAL" ? <Select label="Người nhận" value={assignment.individualId} onChange={(event) => setAssignment({ ...assignment, individualId: event.target.value })}><option value="">Chọn nhân viên</option>{(employees.data ?? []).filter((item) => item.status === "ACTIVE").map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}</Select> : <><Select label="Trưởng nhóm" value={assignment.leaderId} onChange={(event) => setAssignment({ ...assignment, leaderId: event.target.value })}><option value="">Chọn trưởng nhóm</option>{(employees.data ?? []).filter((item) => item.status === "ACTIVE").map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}</Select><div className="grid gap-2 rounded-control border border-border p-3"><p className="text-sm font-bold">Thành viên</p>{(employees.data ?? []).filter((item) => item.status === "ACTIVE" && item.id !== assignment.leaderId).map((item) => <label key={item.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={assignment.memberIds.includes(item.id)} onChange={(event) => setAssignment({ ...assignment, memberIds: event.target.checked ? [...assignment.memberIds, item.id] : assignment.memberIds.filter((id) => id !== item.id) })} />{item.fullName}</label>)}</div></>}
                  <Button variant="secondary" disabled={assignmentMutation.isPending || (assignment.type === "INDIVIDUAL" ? !assignment.individualId : !assignment.leaderId)} onClick={() => window.confirm("Xác nhận giao lại công việc?") ? assignmentMutation.mutate() : undefined}>{assignmentMutation.isPending ? "Đang giao việc..." : "Giao lại"}</Button>
                  {assignmentMutation.error ? <ErrorState title="Không thể giao việc" error={assignmentMutation.error} /> : null}
                  <Select label="Đổi trạng thái" value={currentTask.status ?? "ASSIGNED"} onChange={(event) => statusMutation.mutate(event.target.value as StatusValue)} disabled={statusMutation.isPending || terminal}>
                    <option value="ASSIGNED">Đã giao</option>
                    <option value="IN_PROGRESS">Đang thực hiện</option>
                    <option value="BLOCKED">Đang vướng</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </Select>
                  {normalizedRole === "BUSINESS_OWNER" ? <Button variant="danger" onClick={() => (window.confirm("Bạn chắc chắn muốn hủy task này?") ? cancelMutation.mutate() : undefined)} disabled={cancelMutation.isPending || currentTask.status === "CANCELLED"}>Hủy task</Button> : null}
                </div>
              </Card>
            ) : null}
          </aside>
        </div>
      ) : null}
    </>
  );
}
