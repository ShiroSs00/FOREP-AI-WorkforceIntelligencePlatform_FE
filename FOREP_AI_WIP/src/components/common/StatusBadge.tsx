import type { TaskPriority, TaskStatus, UserStatus, WorkloadLevel } from "@/types/domain";
import { Badge } from "./Badge";

type Tone = "neutral" | "blue" | "green" | "amber" | "red" | "teal";

const taskStatus: Record<TaskStatus, { label: string; tone: Tone }> = {
  ASSIGNED: { label: "Đã giao", tone: "neutral" },
  IN_PROGRESS: { label: "Đang thực hiện", tone: "blue" },
  BLOCKED: { label: "Đang vướng", tone: "amber" },
  COMPLETED: { label: "Hoàn thành", tone: "green" },
  CANCELLED: { label: "Đã hủy", tone: "neutral" },
};

const priority: Record<TaskPriority, { label: string; tone: Tone }> = {
  LOW: { label: "Thấp", tone: "neutral" },
  MEDIUM: { label: "Trung bình", tone: "blue" },
  HIGH: { label: "Cao", tone: "amber" },
  CRITICAL: { label: "Khẩn cấp", tone: "red" },
};

const userStatus: Record<UserStatus, { label: string; tone: Tone }> = {
  ACTIVE: { label: "Đang hoạt động", tone: "green" },
  INACTIVE: { label: "Tạm ngưng", tone: "neutral" },
  INVITED: { label: "Đã mời", tone: "blue" },
};

const workload: Record<WorkloadLevel, { label: string; tone: Tone }> = {
  NO_WORK: { label: "Chưa có việc", tone: "neutral" },
  LOW: { label: "Tải thấp", tone: "green" },
  NORMAL: { label: "Bình thường", tone: "blue" },
  HIGH: { label: "Tải cao", tone: "amber" },
  OVERLOADED: { label: "Quá tải", tone: "red" },
};

function fallback(value?: string) {
  return value ? value.replaceAll("_", " ").toLowerCase() : "Chưa rõ";
}

export function StatusBadge({ value }: { value?: TaskStatus | UserStatus | string }) {
  const config = value ? taskStatus[value as TaskStatus] ?? userStatus[value as UserStatus] : undefined;
  return <Badge tone={config?.tone ?? "neutral"}>{config?.label ?? fallback(value)}</Badge>;
}

export function PriorityBadge({ value }: { value?: TaskPriority }) {
  const config = value ? priority[value] : undefined;
  return <Badge tone={config?.tone ?? "neutral"}>{config?.label ?? "Trung bình"}</Badge>;
}

export function WorkloadBadge({ value }: { value?: WorkloadLevel | string }) {
  const config = value ? workload[value as WorkloadLevel] : undefined;
  return <Badge tone={config?.tone ?? "neutral"}>{config?.label ?? fallback(value)}</Badge>;
}
