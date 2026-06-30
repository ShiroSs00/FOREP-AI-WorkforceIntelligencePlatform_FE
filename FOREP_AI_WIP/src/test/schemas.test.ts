import { describe, expect, it } from "vitest";
import { loginSchema, registerWorkspaceSchema } from "@/features/auth/schemas";
import { dailyReportSchema } from "@/features/reports/schemas";
import { progressSchema, taskSchema } from "@/features/tasks/schemas";

describe("form schemas", () => {
  it("validates login", () => {
    expect(loginSchema.safeParse({ email: "owner@forep.vn", password: "secret" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "bad", password: "" }).success).toBe(false);
  });

  it("validates workspace registration", () => {
    expect(registerWorkspaceSchema.safeParse({ workspaceName: "Apex", ownerFullName: "Quan", ownerPassword: "123456" }).success).toBe(true);
  });

  it("validates task payload", () => {
    expect(taskSchema.safeParse({ title: "Task", requirements: "Req", assigneeId: "550e8400-e29b-41d4-a716-446655440000", priority: "HIGH", deadline: "2026-06-29T10:00", estimatedHours: 2 }).success).toBe(true);
  });

  it("rejects invalid progress", () => {
    expect(progressSchema.safeParse({ progressPercent: 101, content: "", updateType: "PROGRESS" }).success).toBe(false);
  });

  it("validates daily report date", () => {
    expect(dailyReportSchema.safeParse({ reportDate: "2026-06-29", todayCompleted: "Done", currentWork: "Work" }).success).toBe(true);
  });
});


