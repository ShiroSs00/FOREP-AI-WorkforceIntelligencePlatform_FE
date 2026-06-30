import { z } from "zod";

export const dailyReportSchema = z.object({
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày phải có định dạng YYYY-MM-DD"),
  todayCompleted: z.string().trim().min(1, "Vui lòng nhập việc đã hoàn thành"),
  currentWork: z.string().trim().min(1, "Vui lòng nhập việc đang làm"),
  blockers: z.string().trim().optional(),
  tomorrowPlan: z.string().trim().optional(),
});


