import { z } from "zod";

export const employeeSchema = z.object({
  fullName: z.string().trim().min(1, "Vui lòng nhập họ tên"),
  email: z.string().trim().email("Email không hợp lệ").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "INVITED"]).optional(),
});


