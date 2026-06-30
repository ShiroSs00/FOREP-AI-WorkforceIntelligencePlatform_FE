"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { cancelTask, getTask, listTaskUpdates, updateTaskProgress, updateTaskStatus } from "@/api/tasks.api";
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
  const task = useQuery({ queryKey: queryKeys.task(params.id), queryFn: () => getTask(params.id) });
  const updates = useQuery({ queryKey: queryKeys.taskUpdates(params.id), queryFn: () => listTaskUpdates(params.id) });
  const form = useForm<ProgressInput, unknown, ProgressValues>({
    resolver: zodResolver(progressSchema),
    defaultValues: { updateType: "PROGRESS", content: "", progressPercent: 0 },
  });
  const progressMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ProgressValues }) => updateTaskProgress(id, values),
    onSuccess: () => {
      toast.success("Đã gửi cập nhật");
      form.reset({ updateType: "PROGRESS", content: "", progressPercent: task.data?.progressPercent ?? 0 });
      void queryClient.invalidateQueries({ queryKey: queryKeys.task(params.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.taskUpdates(params.id) });
    },
  });
  const statusMutation = useMutation({
    mutationFn: (status: StatusValue) => updateTaskStatus(params.id, { status }),
    onSuccess: () => {
      toast.success("Đã đổi trạng thái task");
      void queryClient.invalidateQueries({ queryKey: queryKeys.task(params.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
  const cancelMutation = useMutation({
    mutationFn: () => cancelTask(params.id),
    onSuccess: () => {
      toast.success("Đã hủy task");
      void queryClient.invalidateQueries({ queryKey: queryKeys.task(params.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
  const currentTask = task.data;

  return (
    <>
      <PageHeader
        eyebrow="Chi tiết task"
        title={currentTask?.title ?? "Task"}
        description="Theo dõi yêu cầu, tiến độ, người nhận và toàn bộ lịch sử cập nhật."
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
                  <p className="mt-1 font-bold text-foreground">{currentTask.assigneeName ?? "Chưa giao"}</p>
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
              <div className="mt-5">
                <ProgressBar value={currentTask.progressPercent} showLabel />
              </div>
            </Card>

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
              <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                <Button variant="secondary" onClick={() => form.setValue("updateType", "PROGRESS", { shouldValidate: true })}>Cập nhật tiến độ</Button>
                <Button variant="secondary" onClick={() => form.setValue("updateType", "BLOCKER", { shouldValidate: true })}>Báo vướng mắc</Button>
                <Button variant="secondary" onClick={() => { form.setValue("updateType", "COMPLETION", { shouldValidate: true }); form.setValue("progressPercent", 100, { shouldValidate: true }); }}>Hoàn thành</Button>
              </div>
              <form className="mt-5 grid gap-3" onSubmit={form.handleSubmit((values) => progressMutation.mutate({ id: params.id, values }))}>
                <Select label="Loại cập nhật" {...form.register("updateType")}>
                  <option value="PROGRESS">Cập nhật tiến độ</option>
                  <option value="BLOCKER">Báo vướng mắc</option>
                  <option value="COMPLETION">Hoàn thành</option>
                </Select>
                <Field label="Tiến độ (%)" type="number" min="0" max="100" {...form.register("progressPercent")} />
                <TextArea label="Nội dung cập nhật" error={form.formState.errors.content?.message} {...form.register("content")} />
                <Field label="Tệp đính kèm" optional {...form.register("attachment")} />
                <Button type="submit" disabled={progressMutation.isPending}>{progressMutation.isPending ? "Đang gửi..." : "Gửi cập nhật"}</Button>
              </form>
              {progressMutation.error ? <ErrorState title="Không thể gửi cập nhật" error={progressMutation.error} /> : null}
            </Card>

            {user?.role === "OWNER" ? (
              <Card>
                <h2 className="text-lg font-black">Quản lý task</h2>
                <div className="mt-4 grid gap-3">
                  <Select label="Đổi trạng thái" value={currentTask.status ?? "ASSIGNED"} onChange={(event) => statusMutation.mutate(event.target.value as StatusValue)}>
                    <option value="ASSIGNED">Đã giao</option>
                    <option value="IN_PROGRESS">Đang thực hiện</option>
                    <option value="BLOCKED">Đang vướng</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </Select>
                  <Button
                    variant="danger"
                    onClick={() => (window.confirm("Bạn chắc chắn muốn hủy task này?") ? cancelMutation.mutate() : undefined)}
                    disabled={cancelMutation.isPending}
                  >
                    Hủy task
                  </Button>
                </div>
              </Card>
            ) : null}
          </aside>
        </div>
      ) : null}
    </>
  );
}
