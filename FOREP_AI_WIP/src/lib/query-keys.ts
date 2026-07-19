import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { useAuthStore } from "@/auth/auth-store";

const currentWorkspaceId = () => useAuthStore.getState().user?.workspaceId ?? "no-workspace";
const workspaceKey = (...parts: readonly unknown[]) => ["workspace", currentWorkspaceId(), ...parts] as const;

export function isProtectedQueryKey(key: QueryKey): boolean {
  return key[0] === "workspace" || key[0] === "admin" || key[0] === "auth";
}

export function removeProtectedQueries(client: QueryClient): void {
  client.removeQueries({ predicate: (query) => isProtectedQueryKey(query.queryKey) });
}

export const queryKeys = {
  me: ["auth", "me"] as const,
  get workspace() { return workspaceKey("current"); },
  publicSubscriptionPlans: ["public", "subscription-plans"] as const,
  activeSubscriptionPlans: ["public", "subscription-plans", "active"] as const,
  workspaceRegistration: (id?: string) => ["public", "workspace-registration", id ?? "current"] as const,
  publicPaymentStatus: (paymentCode: string) => ["public", "payments", paymentCode] as const,
  payment: (paymentCode: string) => ["public", "payments", paymentCode] as const,
  adminPayments: (filters?: Record<string, unknown>) => ["admin", "payments", filters ?? {}] as const,
  adminPayment: (paymentId: string) => ["admin", "payments", paymentId] as const,
  adminAuditLogs: (filters?: Record<string, unknown>) => ["admin", "audit-logs", filters ?? {}] as const,
  adminMonitoring: ["admin", "monitoring"] as const,
  get businessOwnerDashboard() { return workspaceKey("dashboard", "business-owner"); },
  adminDashboardOverview: ["admin", "dashboard", "overview"] as const,
  adminRevenue: (period: "monthly" | "quarterly" | "yearly" | "by-plan") => ["admin", "dashboard", "revenue", period] as const,
  adminWorkspaceCharts: (kind?: "status" | "plan") => ["admin", "dashboard", "workspaces", kind ?? "all"] as const,
  adminPaymentSummary: ["admin", "dashboard", "payments"] as const,
  adminFeedbackSummary: ["admin", "dashboard", "feedback"] as const,
  adminPaymentQrSettings: ["admin", "payment-qr-settings"] as const,
  adminWorkspaces: ["admin", "workspaces"] as const,
  adminWorkspaceDetail: (id: string) => ["admin", "workspaces", id] as const,
  adminBusinessOwners: (workspaceId: string) => ["admin", "workspaces", workspaceId, "business-owners"] as const,
  adminSubscriptionPlans: ["admin", "subscription-plans"] as const,
  adminWorkspaceRegistrations: ["admin", "workspace-registrations"] as const,
  adminBusinessFeedback: ["admin", "business-feedback"] as const,
  get employees() { return workspaceKey("employees"); },
  employee: (id: string) => workspaceKey("employees", id),
  employeeWorkload: (id: string) => workspaceKey("analytics", "employees", id, "workload"),
  get employeeImports() { return workspaceKey("employees", "imports"); },
  employeeImport: (batchId: string) => workspaceKey("employees", "imports", batchId),
  get tasks() { return workspaceKey("tasks"); },
  task: (id: string) => workspaceKey("tasks", id),
  taskUpdates: (id: string) => workspaceKey("tasks", id, "updates"),
  taskAttachments: (id: string) => workspaceKey("tasks", id, "attachments"),
  taskRecommendation: (kind: "individual" | "team-leaders" | "team-members") => workspaceKey("tasks", "recommendations", kind),
  aiRecommendationExplanation: (signature: string, kind: string) => workspaceKey("ai", "recommendation-explanation", signature, kind),
  aiSelectionExplanation: (signature: string) => workspaceKey("ai", "selection-explanation", signature),
  aiEstimatedHours: (signature: string) => workspaceKey("ai", "estimated-hours", signature),
  aiWorkloadRisk: (employeeId: string, period: string) => workspaceKey("ai", "workload-risk", employeeId, period),
  aiEmployeeReport: (employeeId: string, period: string) => workspaceKey("ai", "employee-report", employeeId, period),
  get hrEmployees() { return workspaceKey("hr", "employees"); },
  departments: (filters?: Record<string, unknown>) => workspaceKey("hr", "departments", filters ?? {}),
  department: (id: string) => workspaceKey("hr", "departments", id),
  businessPositions: (filters?: Record<string, unknown>) => workspaceKey("hr", "business-positions", filters ?? {}),
  businessPosition: (id: string) => workspaceKey("hr", "business-positions", id),
  get hrJobPositions() { return workspaceKey("hr", "job-positions"); },
  get managerTasks() { return workspaceKey("manager", "tasks"); },
  monthlyWorkload: (year: number, month: number) => workspaceKey("workload", "monthly", year, month),
  get groupRecommendations() { return workspaceKey("ai", "recommendations", "group"); },
  get reports() { return workspaceKey("daily-reports"); },
  get notifications() { return workspaceKey("notifications"); },
  get ownerDashboard() { return workspaceKey("dashboard", "business-owner"); },
  get workload() { return workspaceKey("analytics", "workload"); },
  get ai() { return workspaceKey("ai"); },
  aiSection: (section: string) => workspaceKey("ai", section),
  get aiHistoryRoot() { return workspaceKey("ai", "history"); },
  aiHistory: (filters?: Record<string, unknown>) => workspaceKey("ai", "history", filters ?? {}),
  taskAnalysis: (taskId = "draft") => workspaceKey("ai", "task-analysis", taskId),
  get businessOwnerOperationalSummary() { return workspaceKey("ai", "business-owner-operational-summary"); },
  platformAiSummary: ["admin", "ai", "platform-summary"] as const,
};