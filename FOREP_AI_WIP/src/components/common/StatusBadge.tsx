import type { PaymentStatus, RegistrationStatus, RoleFit, TaskPriority, TaskStatus, UserStatus, WorkloadLevel, WorkspaceStatus } from "@/types/domain";
import { paymentStatusLabels, registrationStatusLabels, roleFitLabels, workspaceStatusLabels } from "@/lib/labels";
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

const workspaceTone: Record<WorkspaceStatus, Tone> = {
  PENDING_PAYMENT: "amber",
  ACTIVE: "green",
  INACTIVE: "neutral",
  SUSPENDED: "red",
  EXPIRED: "red",
};

const paymentTone: Record<PaymentStatus, Tone> = {
  PENDING: "amber",
  CONFIRMED: "green",
  REJECTED: "red",
  CORRECTION_REQUESTED: "amber",
};

const registrationTone: Record<RegistrationStatus, Tone> = {
  SUBMITTED: "blue",
  PAYMENT_PENDING: "amber",
  PAYMENT_SUBMITTED: "amber",
  APPROVED: "green",
  REJECTED: "red",
};

const roleFitTone: Record<RoleFit, Tone> = {
  STRONG: "green",
  PARTIAL: "amber",
  UNCERTAIN: "neutral",
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

export function WorkspaceStatusBadge({ value }: { value?: WorkspaceStatus }) {
  return <Badge tone={value ? workspaceTone[value] : "neutral"}>{value ? workspaceStatusLabels[value] : "Chưa cập nhật"}</Badge>;
}

export function PaymentStatusBadge({ value }: { value?: PaymentStatus }) {
  return <Badge tone={value ? paymentTone[value] : "neutral"}>{value ? paymentStatusLabels[value] : "Chưa cập nhật"}</Badge>;
}

export function RegistrationStatusBadge({ value }: { value?: RegistrationStatus }) {
  return <Badge tone={value ? registrationTone[value] : "neutral"}>{value ? registrationStatusLabels[value] : "Chưa cập nhật"}</Badge>;
}

export function RoleFitBadge({ value }: { value?: RoleFit | null }) {
  return <Badge tone={value ? roleFitTone[value] : "neutral"}>{value ? roleFitLabels[value] : "Chưa đủ dữ liệu"}</Badge>;
}
