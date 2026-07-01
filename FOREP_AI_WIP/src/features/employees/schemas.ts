import { z } from "zod";

export const seniorityOptions = ["INTERN", "JUNIOR", "MIDDLE", "SENIOR", "LEAD"] as const;

export const employeeSchema = z.object({
  fullName: z.string().trim().min(1, "Vui lòng nhập họ tên"),
  email: z.string().trim().email("Email không hợp lệ").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  jobTitle: z.string().trim().optional(),
  seniorityLevel: z.enum(seniorityOptions).optional().or(z.literal("")),
  skillRating: z.coerce.number().int("Mức kỹ năng phải là số nguyên").min(1, "Mức kỹ năng từ 1 đến 5").max(5, "Mức kỹ năng từ 1 đến 5").optional().or(z.literal("")),
  yearsOfExperience: z.coerce.number().int("Số năm kinh nghiệm phải là số nguyên").min(0, "Số năm kinh nghiệm không được âm").optional().or(z.literal("")),
  skills: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "INVITED"]).optional(),
});

export function toEmployeePayload(values: z.output<typeof employeeSchema>) {
  return {
    fullName: values.fullName,
    email: values.email || undefined,
    phone: values.phone || undefined,
    jobTitle: values.jobTitle || undefined,
    seniorityLevel: values.seniorityLevel || undefined,
    skillRating: values.skillRating === "" ? undefined : values.skillRating,
    yearsOfExperience: values.yearsOfExperience === "" ? undefined : values.yearsOfExperience,
    skills: values.skills || undefined,
    status: values.status,
  };
}
