import { z } from "zod";
import { shortCodeSchema } from "@/features/auth/schemas";

const optionalText = z.string().trim().optional().or(z.literal(""));
const optionalNumber = z.coerce.number().optional().or(z.literal(""));

export const workspaceStatuses = ["PENDING_PAYMENT", "ACTIVE", "INACTIVE", "SUSPENDED", "EXPIRED"] as const;
export const paymentStatuses = ["PENDING", "SUCCESS", "FAILED", "EXPIRED", "CONFIRMED", "REJECTED", "CORRECTION_REQUESTED"] as const;
export const registrationStatuses = ["PENDING_PLAN_SELECTION", "PENDING_PAYMENT", "SUBMITTED", "PAYMENT_PENDING", "PAYMENT_SUBMITTED", "APPROVED", "REJECTED", "ACTIVE"] as const;
export const planStatuses = ["ACTIVE", "INACTIVE"] as const;

export const subscriptionPlanSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên gói"),
  price: z.coerce.number().min(0, "Giá không được âm"),
  durationDays: z.coerce.number().int().min(1, "Thời hạn phải lớn hơn 0"),
  maxUsers: z.coerce.number().int().min(1, "Số người dùng phải lớn hơn 0"),
  maxWorkspaces: optionalNumber,
  aiUsageLimit: optionalNumber,
  features: optionalText,
  status: z.enum(planStatuses),
});

export const adminWorkspaceSchema = z.object({
  businessName: z.string().trim().min(1, "Vui lòng nhập tên doanh nghiệp"),
  workspaceName: z.string().trim().min(1, "Vui lòng nhập tên workspace"),
  workspaceIdentifier: shortCodeSchema,
  contactEmail: z.string().trim().email("Email không hợp lệ"),
  contactPhone: z.string().trim().min(1, "Vui lòng nhập số điện thoại"),
  businessAddress: optionalText,
  subscriptionPlanId: z.string().uuid("Vui lòng chọn gói"),
  maxUsers: optionalNumber,
  activationDate: optionalText,
  expirationDate: optionalText,
  status: z.enum(workspaceStatuses),
});

export const businessOwnerSchema = z.object({
  fullName: z.string().trim().min(1, "Vui lòng nhập họ tên"),
  email: z.string().trim().email("Email không hợp lệ"),
  username: optionalText,
  temporaryPassword: optionalText,
  phone: optionalText,
  status: z.enum(["ACTIVE", "INACTIVE", "INVITED"]),
});

export const reviewNoteSchema = z.object({ note: optionalText });
export const feedbackReviewSchema = z.object({ supportNote: optionalText });

export function cleanOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function cleanOptionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}
