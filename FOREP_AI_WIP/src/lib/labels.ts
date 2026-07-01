import type { SeniorityLevel, UserStatus, WorkloadLevel } from "@/types/domain";

export const seniorityLabels: Record<SeniorityLevel, string> = {
  INTERN: "Thực tập sinh",
  JUNIOR: "Junior",
  MIDDLE: "Middle",
  SENIOR: "Senior",
  LEAD: "Lead",
};

export const statusLabels: Record<UserStatus, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Tạm ngưng",
  INVITED: "Đã mời",
};

export const workloadLabels: Record<WorkloadLevel, string> = {
  NO_WORK: "Chưa có việc",
  LOW: "Tải thấp",
  NORMAL: "Bình thường",
  HIGH: "Tải cao",
  OVERLOADED: "Quá tải",
};

export function seniorityLabel(value?: SeniorityLevel | null): string {
  return value ? seniorityLabels[value] : "Chưa cập nhật";
}

export function ratingLabel(value?: number | null): string {
  return typeof value === "number" ? `${value}/5` : "Chưa cập nhật";
}
