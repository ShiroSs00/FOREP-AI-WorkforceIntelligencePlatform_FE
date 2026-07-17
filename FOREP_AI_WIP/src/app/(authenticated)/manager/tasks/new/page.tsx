"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createWorkspaceTask } from "@/api/tasks.api";
import { RequireRole } from "@/auth/require-role";
import { PageHeader } from "@/components/common/PageHeader";
import { TaskForm } from "@/components/forms/TaskForm";
import { queryKeys } from "@/lib/query-keys";

export default function ManagerCreateTaskPage() {
  const router = useRouter(); const client = useQueryClient();
  const mutation = useMutation({ mutationFn: createWorkspaceTask, onSuccess: (task) => { toast.success("Đã tạo công việc"); void client.invalidateQueries({ queryKey: queryKeys.managerTasks }); void client.invalidateQueries({ queryKey: queryKeys.tasks }); void client.invalidateQueries({ queryKey: queryKeys.workload }); router.push(`/tasks/${task.id}`); } });
  return <RequireRole allowedRoles={["MANAGER", "EXECUTIVE", "BUSINESS_OWNER"]}><PageHeader eyebrow="VẬN HÀNH" title="Tạo công việc" description="Hoàn thiện nội dung công việc trước, sau đó tiếp tục sang bước phân công." />{mutation.error ? <p className="mb-4 rounded-control bg-red-50 p-3 text-sm font-semibold text-destructive">Không thể tạo công việc. Vui lòng kiểm tra dữ liệu và thử lại.</p> : null}<TaskForm wizard onSubmit={(values) => mutation.mutate(values)} submitLabel="Tạo và giao việc" pending={mutation.isPending} /></RequireRole>;
}
