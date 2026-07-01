import { describe, expect, it } from "vitest";
import { loginSchema, registerWorkspaceSchema, toLoginPayload } from "@/features/auth/schemas";
import { employeeSchema, toEmployeePayload } from "@/features/employees/schemas";
import { dailyReportSchema } from "@/features/reports/schemas";
import { extractTasksSchema, progressSchema, taskSchema } from "@/features/tasks/schemas";

describe("form schemas", () => {
  it("validates login identifier for email or username", () => {
    expect(loginSchema.safeParse({ identifier: "owner@forep.vn", password: "secret" }).success).toBe(true);
    expect(loginSchema.safeParse({ identifier: "SE0001", password: "secret" }).success).toBe(true);
    expect(loginSchema.safeParse({ identifier: "", password: "secret" }).success).toBe(false);
    expect(loginSchema.safeParse({ identifier: "SE0001", password: "" }).success).toBe(false);
  });

  it("builds exact login payload", () => {
    expect(toLoginPayload({ identifier: "owner@forep.vn", password: "secret" })).toEqual({ email: "owner@forep.vn", password: "secret" });
    expect(toLoginPayload({ identifier: "SE0001", password: "secret" })).toEqual({ username: "SE0001", password: "secret" });
  });

  it("validates workspace short code", () => {
    expect(registerWorkspaceSchema.safeParse({ workspaceName: "Apex", shortCode: "se", ownerFullName: "Quan", ownerPassword: "123456" }).data?.shortCode).toBe("SE");
    expect(registerWorkspaceSchema.safeParse({ workspaceName: "Apex", shortCode: "S", ownerFullName: "Quan", ownerPassword: "123456" }).success).toBe(false);
    expect(registerWorkspaceSchema.safeParse({ workspaceName: "Apex", shortCode: "ABC", ownerFullName: "Quan", ownerPassword: "123456" }).success).toBe(false);
    expect(registerWorkspaceSchema.safeParse({ workspaceName: "Apex", shortCode: "A-", ownerFullName: "Quan", ownerPassword: "123456" }).success).toBe(false);
  });

  it("validates employee capability fields and excludes generated fields", () => {
    const result = employeeSchema.safeParse({ fullName: "Linh Nguyen", email: "linh@forep.vn", phone: "", jobTitle: "Engineer", seniorityLevel: "SENIOR", skillRating: 5, yearsOfExperience: 4, skills: "React" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(toEmployeePayload(result.data)).toEqual({ fullName: "Linh Nguyen", email: "linh@forep.vn", phone: undefined, jobTitle: "Engineer", seniorityLevel: "SENIOR", skillRating: 5, yearsOfExperience: 4, skills: "React", status: undefined });
      expect("username" in toEmployeePayload(result.data)).toBe(false);
      expect("employeeCode" in toEmployeePayload(result.data)).toBe(false);
      expect("initialPassword" in toEmployeePayload(result.data)).toBe(false);
    }
    expect(employeeSchema.safeParse({ fullName: "A", skillRating: 6 }).success).toBe(false);
    expect(employeeSchema.safeParse({ fullName: "A", yearsOfExperience: -1 }).success).toBe(false);
  });

  it("validates task payload", () => {
    expect(taskSchema.safeParse({ title: "Task", requirements: "Req", assigneeId: "550e8400-e29b-41d4-a716-446655440000", priority: "HIGH", deadline: "2026-06-29T10:00", estimatedHours: 2 }).success).toBe(true);
  });

  it("rejects invalid progress and completion below 100", () => {
    expect(progressSchema.safeParse({ progressPercent: 101, content: "Update", updateType: "PROGRESS" }).success).toBe(false);
    expect(progressSchema.safeParse({ progressPercent: 90, content: "Done", updateType: "COMPLETION" }).success).toBe(false);
  });

  it("validates daily report date and AI extraction", () => {
    expect(dailyReportSchema.safeParse({ reportDate: "2026-06-29", todayCompleted: "Done", currentWork: "Work" }).success).toBe(true);
    expect(extractTasksSchema.safeParse({ text: "Create onboarding task" }).success).toBe(true);
  });
});
