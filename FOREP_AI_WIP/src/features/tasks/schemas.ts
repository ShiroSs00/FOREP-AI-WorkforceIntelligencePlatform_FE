import { z } from "zod";
import type { CreateTaskRequest } from "@/types/requests";

const optionalText = z.string().trim().optional();
const optionalUuid = z.union([z.literal(""), z.string().uuid()]).optional();

export const taskAttachmentSchema = z.object({
  fileName: z.string().trim(),
  fileUrl: z.string().trim(),
  contentType: optionalText,
  fileSize: z.preprocess((value) => value === "" || value === null ? undefined : value, z.coerce.number().int().nonnegative().optional()),
  attachmentType: z.enum(["REQUIREMENT", "REFERENCE", "RESULT", "OTHER"]).default("REFERENCE"),
}).superRefine((value, ctx) => {
  const hasAttachmentData = Boolean(value.fileName || value.fileUrl || value.contentType || value.fileSize !== undefined);
  if (!hasAttachmentData) return;
  if (!value.fileName) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fileName"], message: "Vui lòng nhập tên tài liệu" });
  if (!value.fileUrl) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fileUrl"], message: "Vui lòng nhập URL tài liệu" });
  } else if (!z.string().url().safeParse(value.fileUrl).success) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fileUrl"], message: "URL tài liệu không hợp lệ" });
  }
});

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Vui lòng nhập tiêu đề"),
  requirements: z.string().trim().min(1, "Vui lòng nhập yêu cầu"),
  description: optionalText,
  customerPhone: optionalText,
  customerEmail: z.union([z.literal(""), z.string().trim().email("Email khách hàng không hợp lệ")]).optional(),
  customerDescription: optionalText,
  assignmentType: z.enum(["INDIVIDUAL", "TEAM"]).default("INDIVIDUAL"),
  assigneeId: optionalUuid,
  teamLeaderId: optionalUuid,
  teamMemberIds: z.array(z.string().uuid()).default([]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  deadline: z.string().min(1, "Vui lòng chọn hạn xử lý"),
  startDate: optionalText,
  estimatedHours: z.coerce.number().min(1, "Số giờ phải từ 1 trở lên"),
  difficulty: z.union([z.literal(""), z.coerce.number().int().min(1).max(5)]).optional(),
  requiredSkills: optionalText,
  requiredJobPositionId: optionalUuid,
  taskDomain: optionalText,
  projectId: optionalUuid,
  departmentId: optionalUuid,
  attachments: z.array(taskAttachmentSchema).default([]),
}).superRefine((value, ctx) => {
  if (value.assignmentType === "INDIVIDUAL" && !z.string().uuid().safeParse(value.assigneeId).success) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["assigneeId"], message: "Cần chọn nhân viên hợp lệ" });
  }
  if (value.assignmentType === "TEAM" && !z.string().uuid().safeParse(value.teamLeaderId).success) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["teamLeaderId"], message: "Cần chọn trưởng nhóm hợp lệ" });
  }
  if (value.teamLeaderId && value.teamMemberIds.includes(value.teamLeaderId)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["teamMemberIds"], message: "Trưởng nhóm không thể đồng thời là thành viên" });
  }
  if (new Set(value.teamMemberIds).size !== value.teamMemberIds.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["teamMemberIds"], message: "Danh sách thành viên đang bị trùng" });
  }
  if (value.startDate && value.deadline && new Date(value.deadline) < new Date(value.startDate)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["deadline"], message: "Deadline phải sau ngày bắt đầu" });
  }
});

type TaskValues = z.output<typeof taskSchema>;

const textOrUndefined = (value?: string) => value?.trim() || undefined;

export function toTaskPayload(data: TaskValues, toIso: (value: string) => string): CreateTaskRequest {
  const common = {
    title: data.title,
    requirements: data.requirements,
    description: textOrUndefined(data.description),
    customerPhone: textOrUndefined(data.customerPhone),
    customerEmail: textOrUndefined(data.customerEmail),
    customerDescription: textOrUndefined(data.customerDescription),
    assignmentType: data.assignmentType,
    priority: data.priority,
    deadline: toIso(data.deadline),
    startDate: data.startDate ? toIso(data.startDate) : undefined,
    estimatedHours: data.estimatedHours,
    difficulty: data.difficulty === "" || data.difficulty === undefined ? undefined : data.difficulty,
    requiredSkills: textOrUndefined(data.requiredSkills),
    requiredJobPositionId: data.requiredJobPositionId || undefined,
    taskDomain: textOrUndefined(data.taskDomain),
    projectId: data.projectId || undefined,
    departmentId: data.departmentId || undefined,
    attachments: data.attachments.filter((item) => item.fileName || item.fileUrl || item.contentType || item.fileSize !== undefined).map((item) => ({
      fileName: item.fileName,
      fileUrl: item.fileUrl,
      contentType: textOrUndefined(item.contentType),
      fileSize: item.fileSize,
      attachmentType: item.attachmentType,
    })),
  } satisfies Omit<CreateTaskRequest, "assigneeId" | "teamLeaderId" | "teamMemberIds">;

  return data.assignmentType === "INDIVIDUAL"
    ? { ...common, assigneeId: data.assigneeId || undefined }
    : { ...common, teamLeaderId: data.teamLeaderId || undefined, teamMemberIds: data.teamMemberIds };
}

export const customerInfoSchema = z.object({
  customerPhone: optionalText,
  customerEmail: z.union([z.literal(""), z.string().trim().email("Email khách hàng không hợp lệ")]).optional(),
  customerDescription: optionalText,
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
