import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ").optional().or(z.literal("")),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const registerWorkspaceSchema = z.object({
  workspaceName: z.string().trim().min(1, "Vui lòng nhập tên workspace"),
  address: z.string().trim().optional(),
  ownerFullName: z.string().trim().min(1, "Vui lòng nhập họ tên chủ workspace"),
  ownerEmail: z.string().trim().email("Email không hợp lệ").optional().or(z.literal("")),
  ownerPhone: z.string().trim().optional(),
  ownerPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});


