"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RequireRole } from "@/auth/require-role";
import { createTask } from "@/api/tasks.api";
import { TaskForm } from "@/components/forms/TaskForm";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/feedback/ErrorState";
import { queryKeys } from "@/lib/query-keys";
import type { CreateTaskRequest } from "@/types/requests";

export default function NewTaskPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: (task) => {
      toast.success("Đã tạo task");
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      router.replace(`/tasks/${task.id}`);
    },
  });
  return (
    <RequireRole role="OWNER">
      <PageHeader
        eyebrow="Công việc"
        title="Tạo task mới"
        description="Nhập yêu cầu rõ ràng, chọn deadline và dùng AI recommendation nếu cần tham khảo người nhận phù hợp."
      />
      {mutation.error ? <div className="mb-5"><ErrorState title="Không thể tạo task" error={mutation.error} /></div> : null}
      <TaskForm submitLabel="Tạo task" pending={mutation.isPending} onSubmit={(values: CreateTaskRequest) => mutation.mutate(values)} />
    </RequireRole>
  );
}
