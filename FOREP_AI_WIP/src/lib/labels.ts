import type {
  PaymentStatus,
  RegistrationStatus,
  RoleFit,
  SeniorityLevel,
  UserStatus,
  WorkloadLevel,
  WorkspaceStatus,
} from "@/types/domain";

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

export const workspaceStatusLabels: Record<WorkspaceStatus, string> = {
  PENDING_PAYMENT: "Chờ thanh toán",
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Chưa kích hoạt",
  SUSPENDED: "Tạm dừng",
  EXPIRED: "Hết hạn",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "Đang chờ thanh toán",
  SUCCESS: "Thanh toán thành công",
  FAILED: "Thanh toán thất bại",
  EXPIRED: "Đã hết hạn",
  CANCELLED: "Đã hủy",
  CONFIRMED: "Đã xác nhận",
  REJECTED: "Bị từ chối",
  CORRECTION_REQUESTED: "Cần bổ sung",
};

export const registrationStatusLabels: Record<RegistrationStatus, string> = {
  PENDING_PLAN_SELECTION: "Chờ chọn gói",
  PENDING_PAYMENT: "Chờ thanh toán",
  PAYMENT_CONFIRMED: "Đã xác nhận thanh toán",
  SUBMITTED: "Đã gửi hồ sơ",
  PAYMENT_PENDING: "Chờ thanh toán",
  PAYMENT_SUBMITTED: "Đã gửi thanh toán",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  CANCELLED: "Đã hủy",
  ACTIVE: "Đang hoạt động",
};

export const roleFitLabels: Record<RoleFit, string> = {
  STRONG: "Phù hợp cao",
  PARTIAL: "Phù hợp một phần",
  UNCERTAIN: "Chưa đủ dữ liệu",
};

export function seniorityLabel(value?: SeniorityLevel | null): string {
  return value ? seniorityLabels[value] : "Chưa cập nhật";
}

export function ratingLabel(value?: number | null): string {
  return typeof value === "number" ? `${value}/5` : "Chưa cập nhật";
}

export function workspaceStatusLabel(value?: WorkspaceStatus | null): string {
  return value ? workspaceStatusLabels[value] : "Chưa cập nhật";
}

export function paymentStatusLabel(value?: PaymentStatus | null): string {
  return value ? paymentStatusLabels[value] : "Chưa cập nhật";
}

export function registrationStatusLabel(value?: RegistrationStatus | null): string {
  return value ? registrationStatusLabels[value] : "Chưa cập nhật";
}

export function roleFitLabel(value?: RoleFit | null): string {
  return value ? roleFitLabels[value] : "Chưa đủ dữ liệu";
}
