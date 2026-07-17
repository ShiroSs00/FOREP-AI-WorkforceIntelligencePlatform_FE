import { describe, expect, it } from "vitest";
import { publicApiPaths } from "@/api/public.api";
import { changePasswordSchema, loginSchema, submitPaymentSchema, toChangePasswordPayload, toLoginPayload, toWorkspaceRegistrationPayload, workspaceRegistrationSchema } from "@/features/auth/schemas";
import { employeeSchema, toEmployeePayload } from "@/features/employees/schemas";
import { dailyReportSchema } from "@/features/reports/schemas";
import { extractTasksSchema, progressSchema, taskSchema, toTaskPayload } from "@/features/tasks/schemas";
import { workspaceTaskPaths } from "@/api/tasks.api";
import { getPaymentIdFromRegistration, isTerminalPaymentStatus, paymentPollingInterval, shouldPollPayment } from "@/lib/payments";

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

  it("validates staged public workspace registration and excludes plan, owner and payment fields", () => {
    const values = {
      businessName: "Apex",
      workspaceName: "Apex Ops",
      contactEmail: "contact@forep.vn",
      contactPhone: "0900000000",
      businessAddress: "",
      representativeFullName: "Quan Ho",
      representativeEmail: "owner@forep.vn",
      representativePhone: "",
    };
    const result = workspaceRegistrationSchema.safeParse(values);
    expect(result.success).toBe(true);
    if (result.success) {
      const payload = toWorkspaceRegistrationPayload(result.data);
      expect(payload).toEqual({
        businessName: "Apex",
        workspaceName: "Apex Ops",
        contactEmail: "contact@forep.vn",
        contactPhone: "0900000000",
        representativeFullName: "Quan Ho",
        representativeEmail: "owner@forep.vn",
      });
      expect("subscriptionPlanId" in payload).toBe(false);
      expect("maxUsers" in payload).toBe(false);
      expect("ownerPassword" in payload).toBe(false);
      expect("paymentProofUrl" in payload).toBe(false);
    }
    expect(workspaceRegistrationSchema.safeParse({ ...values, representativeEmail: "bad-email" }).success).toBe(false);
  });

  it("uses staged payment endpoints and terminal status helpers", () => {
    expect(publicApiPaths.subscriptionPlans).toBe("/api/public/subscription-plans");
    expect(publicApiPaths.selectPlan("reg-1")).toBe("/api/public/workspace-registrations/reg-1/select-plan");
    expect(publicApiPaths.createPayment("reg-1")).toBe("/api/public/workspace-registrations/reg-1/payments");
    expect(publicApiPaths.paymentStatus("PAY-001")).toBe("/api/public/payments/PAY-001/status");
    expect(shouldPollPayment("PENDING")).toBe(true);
    expect(shouldPollPayment("PROCESSING")).toBe(true);
    expect(shouldPollPayment("MANUAL_REVIEW")).toBe(true);
    expect(paymentPollingInterval("MANUAL_REVIEW")).toBe(15000);
    expect(isTerminalPaymentStatus("SUCCESS")).toBe(true);
    expect(isTerminalPaymentStatus("FAILED")).toBe(true);
    expect(isTerminalPaymentStatus("EXPIRED")).toBe(true);
    expect(isTerminalPaymentStatus("CANCELLED")).toBe(true);
    expect(isTerminalPaymentStatus("REFUNDED")).toBe(true);
    expect(getPaymentIdFromRegistration({ id: "reg-1", latestPaymentId: "pay-1" } as never)).toBe("pay-1");
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
      const payload = toEmployeePayload(result.data);
      expect(payload).toMatchObject({ fullName: "Linh Nguyen", email: "linh@forep.vn", phone: undefined, jobTitle: "Engineer", seniorityLevel: "SENIOR", skillRating: 5, yearsOfExperience: 4, skills: "React", status: undefined });
      expect("username" in payload).toBe(false);
      expect("employeeCode" in payload).toBe(false);
      expect("initialPassword" in payload).toBe(false);
      expect("role" in payload).toBe(false);
    }
    expect(employeeSchema.safeParse({ fullName: "A", skillRating: 6 }).success).toBe(false);
    expect(employeeSchema.safeParse({ fullName: "A", yearsOfExperience: -1 }).success).toBe(false);
  });

  it("validates task payload", () => {
    expect(taskSchema.safeParse({ title: "Task", requirements: "Req", assigneeId: "550e8400-e29b-41d4-a716-446655440000", priority: "HIGH", deadline: "2026-06-29T10:00", estimatedHours: 2 }).success).toBe(true);
    expect(taskSchema.safeParse({ title: "Task nhóm", requirements: "Req", assignmentType: "TEAM", teamLeaderId: "550e8400-e29b-41d4-a716-446655440000", teamMemberIds: ["550e8400-e29b-41d4-a716-446655440001"], deadline: "2026-06-29T10:00", estimatedHours: 2 }).success).toBe(true);
    expect(taskSchema.safeParse({ title: "Task nhóm", requirements: "Req", assignmentType: "TEAM", deadline: "2026-06-29T10:00", estimatedHours: 2 }).success).toBe(false);
  });

  it("builds assignment-specific task payloads without stale fields", () => {
    const base = { title: "Task", requirements: "Req", priority: "MEDIUM" as const, deadline: "2026-06-29T10:00", estimatedHours: 2, description: "", customerEmail: "", teamMemberIds: [], attachments: [] };
    const individual = taskSchema.parse({ ...base, assignmentType: "INDIVIDUAL", assigneeId: "550e8400-e29b-41d4-a716-446655440000" });
    const individualPayload = toTaskPayload(individual, (value) => value);
    expect(individualPayload.assigneeId).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect("teamLeaderId" in individualPayload).toBe(false);
    expect("teamMemberIds" in individualPayload).toBe(false);

    const team = taskSchema.parse({ ...base, assignmentType: "TEAM", teamLeaderId: "550e8400-e29b-41d4-a716-446655440001", teamMemberIds: ["550e8400-e29b-41d4-a716-446655440002"] });
    const teamPayload = toTaskPayload(team, (value) => value);
    expect(teamPayload.teamLeaderId).toBe("550e8400-e29b-41d4-a716-446655440001");
    expect(teamPayload.teamMemberIds).toHaveLength(1);
    expect("assigneeId" in teamPayload).toBe(false);
  });

  it("ignores a completely blank optional attachment row", () => {
    const result = taskSchema.parse({
      title: "Task",
      requirements: "Req",
      assignmentType: "INDIVIDUAL",
      assigneeId: "550e8400-e29b-41d4-a716-446655440000",
      priority: "MEDIUM",
      deadline: "2026-06-29T10:00",
      estimatedHours: 2,
      attachments: [{ fileName: "", fileUrl: "", contentType: "", attachmentType: "REFERENCE" }],
    });
    expect(toTaskPayload(result, (value) => value).attachments).toEqual([]);
    expect(taskSchema.safeParse({ ...result, attachments: [{ fileName: "Tài liệu", fileUrl: "", attachmentType: "REFERENCE" }] }).success).toBe(false);
  });

  it("uses deployed workspace task aliases", () => {
    expect(workspaceTaskPaths.assignIndividual("task-1")).toBe("/api/workspace/tasks/task-1/assign-individual");
    expect(workspaceTaskPaths.assignTeam("task-1")).toBe("/api/workspace/tasks/task-1/assign-team");
    expect(workspaceTaskPaths.customerInfo("task-1")).toBe("/api/workspace/tasks/task-1/customer-info");
    expect(workspaceTaskPaths.recommendTeamLeaders).toBe("/api/workspace/ai/recommendations/team-leaders");
    expect(workspaceTaskPaths.recommendTeamMembers).toBe("/api/workspace/ai/recommendations/team-members");
    expect(workspaceTaskPaths.accept("task-1")).toBe("/api/workspace/tasks/task-1/accept");
    expect(workspaceTaskPaths.submitCompletion("task-1")).toBe("/api/workspace/tasks/task-1/submit-completion");
    expect(workspaceTaskPaths.approveCompletion("task-1")).toBe("/api/workspace/tasks/task-1/approve-completion");
    expect(workspaceTaskPaths.returnForRevision("task-1")).toBe("/api/workspace/tasks/task-1/return");
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
