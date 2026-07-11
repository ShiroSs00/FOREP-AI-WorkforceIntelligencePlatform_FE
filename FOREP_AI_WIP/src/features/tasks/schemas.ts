import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Vui lòng nhập tiêu đề"),
  requirements: z.string().trim().min(1, "Vui lòng nhập yêu cầu"),
  description: z.string().trim().optional(),
  assignmentType: z.enum(["INDIVIDUAL", "TEAM"]).default("INDIVIDUAL"),
  assigneeId: z.string().optional(),
  teamLeaderId: z.string().optional(),
  teamMemberIds: z.array(z.string().uuid()).default([]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  deadline: z.string().min(1, "Vui lòng chọn hạn xử lý"),
  estimatedHours: z.coerce.number().min(1, "Số giờ phải từ 1 trở lên"),
}).superRefine((value, ctx) => {
  if (value.assignmentType === "INDIVIDUAL" && !z.string().uuid().safeParse(value.assigneeId).success) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["assigneeId"], message: "Cần chọn nhân viên hợp lệ" });
  }
  if (value.assignmentType === "TEAM" && !z.string().uuid().safeParse(value.teamLeaderId).success) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["teamLeaderId"], message: "Cần chọn trưởng nhóm hợp lệ" });
  }
});

export const progressSchema = z.object({
  progressPercent: z.coerce.number().int().min(0).max(100).optional(),
  content: z.string().trim().min(1, "Vui lòng nhập nội dung cập nhật"),
  updateType: z.enum(["PROGRESS", "BLOCKER", "COMPLETION"]),
  attachment: z.string().trim().optional(),
}).superRefine((value, ctx) => {
  if (value.updateType === "COMPLETION" && value.progressPercent !== undefined && value.progressPercent !== 100) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["progressPercent"], message: "Hoàn thành cần tiến độ 100%" });
  }
});

export const extractTasksSchema = z.object({
  text: z.string().trim().min(1, "Vui lòng nhập nội dung cần tách task"),
  defaultDeadline: z.string().optional(),
});
