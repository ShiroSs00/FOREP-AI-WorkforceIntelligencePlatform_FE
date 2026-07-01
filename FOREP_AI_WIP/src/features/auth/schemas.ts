import { z } from "zod";

export const shortCodeSchema = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập mã viết tắt tổ chức")
  .length(2, "Mã viết tắt cần đúng 2 ký tự")
  .regex(/^[A-Za-z0-9]{2}$/, "Chỉ dùng chữ hoặc số")
  .transform((value) => value.toUpperCase());

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Vui lòng nhập tài khoản"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const registerWorkspaceSchema = z.object({
  workspaceName: z.string().trim().min(1, "Vui lòng nhập tên workspace"),
  shortCode: shortCodeSchema,
  address: z.string().trim().optional(),
  ownerFullName: z.string().trim().min(1, "Vui lòng nhập họ tên chủ workspace"),
  ownerEmail: z.string().trim().email("Email không hợp lệ").optional().or(z.literal("")),
  ownerPhone: z.string().trim().optional(),
  ownerPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export function toLoginPayload(values: z.output<typeof loginSchema>) {
  const identifier = values.identifier.trim();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  return isEmail ? { email: identifier, password: values.password } : { username: identifier, password: values.password };
}
