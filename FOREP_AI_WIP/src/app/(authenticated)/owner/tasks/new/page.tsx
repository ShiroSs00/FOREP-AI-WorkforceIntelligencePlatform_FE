"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RequireRole } from "@/auth/require-role";
import { createWorkspaceTask } from "@/api/tasks.api";
import { TaskForm } from "@/components/forms/TaskForm";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/feedback/ErrorState";
import { queryKeys } from "@/lib/query-keys";
import type { CreateTaskRequest } from "@/types/requests";

export default function NewTaskPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createWorkspaceTask,
    onSuccess: (task) => {
      toast.success("Đã tạo task");
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      void queryClient.invalidateQueries({ queryKey: queryKeys.workload });
      router.replace(`/tasks/${task.id}`);
    },
  });
  return (
    <RequireRole role="OWNER">
      <PageHeader
        eyebrow="Công việc"
        title="Tạo task mới"
        description="Hoàn thiện nội dung task trước, sau đó tiếp tục sang bước giao việc cho cá nhân hoặc nhóm."
      />
      {mutation.error ? <div className="mb-5"><ErrorState title="Không thể tạo task" error={mutation.error} /></div> : null}
      <TaskForm wizard submitLabel="Tạo và giao task" pending={mutation.isPending} onSubmit={(values: CreateTaskRequest) => mutation.mutate(values)} />
    </RequireRole>
  );
}
