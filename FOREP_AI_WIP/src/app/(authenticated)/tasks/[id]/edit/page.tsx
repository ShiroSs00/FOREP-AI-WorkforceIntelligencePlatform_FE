"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getWorkspaceTask, updateWorkspaceTask } from "@/api/tasks.api";
import { RequirePermission } from "@/auth/require-permission";
import { PageHeader } from "@/components/common/PageHeader";
import { TaskForm } from "@/components/forms/TaskForm";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";

export default function EditTaskPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const client = useQueryClient();
  const task = useQuery({ queryKey: queryKeys.task(id), queryFn: () => getWorkspaceTask(id) });
  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateWorkspaceTask>[1]) => updateWorkspaceTask(id, payload),
    onSuccess: () => {
      toast.success("Đã cập nhật task");
      void client.invalidateQueries({ queryKey: queryKeys.task(id) });
      void client.invalidateQueries({ queryKey: queryKeys.tasks });
      void client.invalidateQueries({ queryKey: queryKeys.managerTasks });
      void client.invalidateQueries({ queryKey: queryKeys.workload });
      router.replace(`/tasks/${id}`);
    },
  });
  return <RequirePermission permissions={["TASK_CREATE", "TASK_ASSIGN"]} mode="any">
    <PageHeader eyebrow="Công việc" title="Chỉnh sửa task" description="Cập nhật nội dung, khách hàng, phân công và tài liệu theo dữ liệu backend." />
    {task.isLoading ? <LoadingState rows={6} /> : null}
    {task.error ? <ErrorState title="Không thể tải task" error={task.error} onRetry={() => void task.refetch()} /> : null}
    {mutation.error ? <div className="mb-5"><ErrorState title="Không thể cập nhật task" error={mutation.error} /></div> : null}
    {task.data ? <TaskForm initialValues={{ ...task.data, attachments: (task.data.attachments ?? []).map((item) => ({ fileName: item.fileName, fileUrl: item.fileUrl, contentType: item.contentType ?? undefined, fileSize: item.fileSize ?? undefined, attachmentType: item.attachmentType ?? undefined })) }} onSubmit={(payload) => mutation.mutate(payload)} submitLabel="Lưu thay đổi" pending={mutation.isPending} /> : null}
  </RequirePermission>;
}
