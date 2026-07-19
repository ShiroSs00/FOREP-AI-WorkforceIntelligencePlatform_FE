import { describe, expect, it } from "vitest";
import { paymentStatusLabel, registrationStatusLabel, roleFitLabel, seniorityLabel, workspaceStatusLabel } from "@/lib/labels";
import { canAccessEmployee, canAccessOwner, canAccessSystemAdmin, getHomeForRole, hasRole, normalizeRole } from "@/lib/role";
import { canAccessRoute } from "@/lib/route-permissions";
import { isTaskOverdue } from "@/lib/tasks";
import { canAcceptTask, canApproveTaskCompletion, canEditTaskCustomerInfo, canReturnTask, canSubmitTaskCompletion, canUpdateTaskProgress } from "@/lib/task-permissions";
import { hasAnyPermission, hasPermission } from "@/lib/permissions";
import type { Task, User } from "@/types/domain";

describe("domain helpers", () => {
  it("redirects by role", () => {
    expect(getHomeForRole("SYSTEM_ADMIN")).toBe("/platform/dashboard");
    expect(getHomeForRole("OWNER")).toBe("/owner/dashboard");
    expect(getHomeForRole("EMPLOYEE")).toBe("/employee/home");
    expect(getHomeForRole("HR")).toBe("/hr/employees");
    expect(getHomeForRole("MANAGER")).toBe("/operations/tasks");
    expect(getHomeForRole("EXECUTIVE")).toBe("/operations/tasks");
    expect(getHomeForRole("SYSTEM")).toBe("/platform/dashboard");
  });

  it("normalizes legacy aliases for route permissions", () => {
    expect(normalizeRole("SYSTEM_ADMIN")).toBe("PLATFORM_ADMIN");
    expect(normalizeRole("OWNER")).toBe("BUSINESS_OWNER");
    expect(hasRole("OWNER", ["BUSINESS_OWNER"])).toBe(true);
    expect(hasRole("SYSTEM_ADMIN", ["PLATFORM_ADMIN"])).toBe(true);
  });

  it("checks role helpers", () => {
    expect(canAccessSystemAdmin("SYSTEM_ADMIN")).toBe(true);
    expect(canAccessOwner("OWNER")).toBe(true);
    expect(canAccessEmployee("EMPLOYEE")).toBe(true);
  });

  it("uses backend permissions instead of role-derived capabilities", () => {
    const permissions = ["TASK_VIEW", "TASK_ASSIGN", "TASK_APPROVE"];
    expect(hasPermission(permissions, "TASK_ASSIGN")).toBe(true);
    expect(hasAnyPermission(permissions, ["TASK_CREATE", "TASK_APPROVE"])).toBe(true);
    expect(hasPermission([], "TASK_UPDATE_OWN")).toBe(false);
  });

  it("guards route aliases and edit routes with backend permissions", () => {
    expect(canAccessRoute("/platform/dashboard", ["REVENUE_VIEW"])).toBe(true);
    expect(canAccessRoute("/platform/payment-qr-settings", ["REVENUE_VIEW"])).toBe(false);
    expect(canAccessRoute("/operations/tasks", ["TASK_VIEW"])).toBe(true);
    expect(canAccessRoute("/tasks/task-1/edit", ["TASK_VIEW"])).toBe(false);
    expect(canAccessRoute("/tasks/task-1/edit", ["TASK_ASSIGN"])).toBe(true);
    expect(canAccessRoute("/daily-reports", ["REPORT_SUBMIT"])).toBe(true);
    expect(canAccessRoute("/notifications", [])).toBe(false);
  });
  it("maps status labels", () => {
    expect(seniorityLabel("INTERN")).toBe("Thực tập sinh");
    expect(seniorityLabel(null)).toBe("Chưa cập nhật");
    expect(workspaceStatusLabel("PENDING_PAYMENT")).toBe("Chờ thanh toán");
    expect(paymentStatusLabel("CORRECTION_REQUESTED")).toBe("Cần bổ sung");
    expect(registrationStatusLabel("APPROVED")).toBe("Đã duyệt");
    expect(registrationStatusLabel("PAYMENT_CONFIRMED")).toBe("Đã xác nhận thanh toán");
    expect(registrationStatusLabel("ACTIVATED")).toBe("Workspace đã được kích hoạt");
    expect(paymentStatusLabel("CANCELLED")).toBe("Đã hủy");
    expect(roleFitLabel("STRONG")).toBe("Phù hợp cao");
  });

  it("detects overdue tasks only for active statuses", () => {
    const now = new Date("2026-06-29T10:00:00+07:00");
    expect(isTaskOverdue({ id: "1", title: "A", requirements: "R", deadline: "2026-06-28T10:00:00+07:00", status: "IN_PROGRESS" }, now)).toBe(true);
    expect(isTaskOverdue({ id: "1", title: "A", requirements: "R", deadline: "2026-06-28T10:00:00+07:00", status: "COMPLETED" }, now)).toBe(false);
    expect(isTaskOverdue({ id: "1", title: "A", requirements: "R", deadline: "2026-06-28T10:00:00+07:00", status: "SUBMITTED" }, now)).toBe(true);
  });

  it("limits customer information editing to owners, managers, assignees and team leaders", () => {
    const user = { id: "employee-1", role: "EMPLOYEE", permissions: ["TASK_UPDATE_OWN"] } as User;
    const individual = { id: "task-1", title: "A", requirements: "R", assigneeId: "employee-1", assignmentType: "INDIVIDUAL" } as Task;
    const team = { id: "task-2", title: "B", requirements: "R", assignmentType: "TEAM", participants: [{ id: "p-1", taskId: "task-2", employeeId: "employee-1", participantRole: "LEADER", leader: true, allocatedHours: 4, createdAt: "2026-01-01" }] } as Task;
    expect(canEditTaskCustomerInfo({ user, task: individual })).toBe(true);
    expect(canEditTaskCustomerInfo({ user, task: team })).toBe(true);
    expect(canEditTaskCustomerInfo({ user: { ...user, id: "member-2" }, task: team })).toBe(false);
    expect(canEditTaskCustomerInfo({ user: { ...user, role: "MANAGER", permissions: ["TASK_ASSIGN"] }, task: individual })).toBe(true);
  });

  it("enforces the production task workflow by participant and role", () => {
    const employee = { id: "user-1", employeeId: "employee-1", role: "EMPLOYEE", permissions: ["TASK_UPDATE_OWN"] } as User;
    const manager = { id: "manager-1", role: "MANAGER", permissions: ["TASK_ASSIGN", "TASK_APPROVE"] } as User;
    const hr = { id: "hr-1", role: "HR", permissions: [] as string[] } as User;
    const individual = { id: "task-1", title: "A", requirements: "R", assigneeId: "employee-1", assignmentType: "INDIVIDUAL", status: "ASSIGNED" } as Task;
    expect(canAcceptTask(employee, individual)).toBe(true);
    expect(canAcceptTask({ ...employee, employeeId: "other" }, individual)).toBe(false);
    expect(canUpdateTaskProgress(employee, { ...individual, status: "ACCEPTED" })).toBe(true);
    expect(canSubmitTaskCompletion(employee, { ...individual, status: "IN_PROGRESS" })).toBe(true);
    expect(canSubmitTaskCompletion(employee, { ...individual, status: "SUBMITTED" })).toBe(false);
    expect(canApproveTaskCompletion(manager, { ...individual, status: "SUBMITTED" })).toBe(true);
    expect(canReturnTask({ ...manager, role: "EXECUTIVE" }, { ...individual, status: "SUBMITTED" })).toBe(true);
    expect(canApproveTaskCompletion(employee, { ...individual, status: "SUBMITTED" })).toBe(false);
    expect(canReturnTask(hr, { ...individual, status: "SUBMITTED" })).toBe(false);
  });

  it("allows only a team leader to submit completion for a team task", () => {
    const leader = { id: "u-1", employeeId: "leader-1", role: "EMPLOYEE", permissions: ["TASK_UPDATE_OWN"] } as User;
    const member = { id: "u-2", employeeId: "member-1", role: "EMPLOYEE", permissions: ["TASK_UPDATE_OWN"] } as User;
    const teamTask = { id: "task-2", title: "B", requirements: "R", assignmentType: "TEAM", status: "IN_PROGRESS", participants: [
      { id: "p-1", taskId: "task-2", employeeId: "leader-1", participantRole: "LEADER", leader: true, allocatedHours: 8, createdAt: "2026-01-01" },
      { id: "p-2", taskId: "task-2", employeeId: "member-1", participantRole: "MEMBER", leader: false, allocatedHours: 4, createdAt: "2026-01-01" },
    ] } as Task;
    expect(canSubmitTaskCompletion(leader, teamTask)).toBe(true);
    expect(canSubmitTaskCompletion(member, teamTask)).toBe(false);
    expect(canUpdateTaskProgress(member, teamTask)).toBe(true);
  });
});

