import { describe, expect, it } from "vitest";
import { changePasswordSchema, loginSchema, submitPaymentSchema, toChangePasswordPayload, toLoginPayload, toWorkspaceRegistrationPayload, workspaceRegistrationSchema } from "@/features/auth/schemas";
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

  it("validates public workspace registration and excludes maxUsers", () => {
    const values = {
      businessName: "Apex",
      workspaceName: "Apex Ops",
      workspaceIdentifier: "se",
      contactEmail: "contact@forep.vn",
      contactPhone: "0900000000",
      subscriptionPlanId: "550e8400-e29b-41d4-a716-446655440000",
      ownerFullName: "Quan Ho",
      ownerEmail: "owner@forep.vn",
      ownerPassword: "12345678",
    };
    const result = workspaceRegistrationSchema.safeParse(values);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.workspaceIdentifier).toBe("SE");
      expect("maxUsers" in toWorkspaceRegistrationPayload(result.data)).toBe(false);
    }
    expect(workspaceRegistrationSchema.safeParse({ ...values, workspaceIdentifier: "S" }).success).toBe(false);
    expect(workspaceRegistrationSchema.safeParse({ ...values, workspaceIdentifier: "ABC" }).success).toBe(false);
    expect(workspaceRegistrationSchema.safeParse({ ...values, workspaceIdentifier: "A-" }).success).toBe(false);
  });

  it("validates payment and change password payloads", () => {
    expect(submitPaymentSchema.safeParse({ paymentProofUrl: "https://example.com/proof.png" }).success).toBe(true);
    const password = changePasswordSchema.safeParse({ currentPassword: "old-pass", newPassword: "new-pass-123", confirmPassword: "new-pass-123" });
    expect(password.success).toBe(true);
    if (password.success) expect(toChangePasswordPayload(password.data)).toEqual({ currentPassword: "old-pass", newPassword: "new-pass-123" });
    expect(changePasswordSchema.safeParse({ currentPassword: "old-pass", newPassword: "new-pass-123", confirmPassword: "different" }).success).toBe(false);
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

