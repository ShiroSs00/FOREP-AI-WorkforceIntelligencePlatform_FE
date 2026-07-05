import { z } from "zod";

export const shortCodeSchema = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập mã định danh")
  .length(2, "Mã định danh cần đúng 2 ký tự")
  .regex(/^[A-Za-z0-9]{2}$/, "Chỉ dùng chữ hoặc số")
  .transform((value) => value.toUpperCase());

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Vui lòng nhập tài khoản"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(8, "Mật khẩu mới tối thiểu 8 ký tự").max(72, "Mật khẩu mới tối đa 72 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const workspaceRegistrationSchema = z.object({
  businessName: z.string().trim().min(1, "Vui lòng nhập tên doanh nghiệp"),
  workspaceName: z.string().trim().min(1, "Vui lòng nhập tên workspace"),
  contactEmail: z.string().trim().email("Email liên hệ không hợp lệ"),
  contactPhone: z.string().trim().optional(),
  businessAddress: z.string().trim().optional(),
  representativeFullName: z.string().trim().min(1, "Vui lòng nhập họ tên người đại diện"),
  representativeEmail: z.string().trim().email("Email người đại diện không hợp lệ"),
  representativePhone: z.string().trim().optional(),
});

export const submitPaymentSchema = z.object({
  paymentProofUrl: z.string().trim().url("URL minh chứng thanh toán không hợp lệ"),
  paymentNote: z.string().trim().optional(),
});

export function toLoginPayload(values: z.output<typeof loginSchema>) {
  const identifier = values.identifier.trim();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  return isEmail ? { email: identifier, password: values.password } : { username: identifier, password: values.password };
}

export function toChangePasswordPayload(values: z.output<typeof changePasswordSchema>) {
  return { currentPassword: values.currentPassword, newPassword: values.newPassword };
}

export function toWorkspaceRegistrationPayload(values: z.output<typeof workspaceRegistrationSchema>) {
  return {
    businessName: values.businessName,
    workspaceName: values.workspaceName,
    contactEmail: values.contactEmail,
    ...(values.contactPhone ? { contactPhone: values.contactPhone } : {}),
    ...(values.businessAddress ? { businessAddress: values.businessAddress } : {}),
    representativeFullName: values.representativeFullName,
    representativeEmail: values.representativeEmail,
    ...(values.representativePhone ? { representativePhone: values.representativePhone } : {}),
  };
}
