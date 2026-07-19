import { hasAllPermissions, hasAnyPermission, type Permission } from "./permissions";

type RouteRule = { prefix: string; permissions: readonly Permission[]; mode?: "all" | "any" };

const rules: readonly RouteRule[] = [
  { prefix: "/platform/payment-qr-settings", permissions: ["PAYMENT_QR_MANAGE"] },
  { prefix: "/admin/payment-qr-settings", permissions: ["PAYMENT_QR_MANAGE"] },
  { prefix: "/platform/subscription-plans", permissions: ["PACKAGE_MANAGE"] },
  { prefix: "/admin/subscription-plans", permissions: ["PACKAGE_MANAGE"] },
  { prefix: "/platform/registrations", permissions: ["WORKSPACE_MANAGE"] },
  { prefix: "/admin/registrations", permissions: ["WORKSPACE_MANAGE"] },
  { prefix: "/platform/workspaces", permissions: ["WORKSPACE_MANAGE"] },
  { prefix: "/admin/workspaces", permissions: ["WORKSPACE_MANAGE"] },
  { prefix: "/platform/payments", permissions: ["PAYMENT_HISTORY_VIEW"] },
  { prefix: "/admin/payments", permissions: ["PAYMENT_HISTORY_VIEW"] },
  { prefix: "/platform/feedback", permissions: ["FEEDBACK_MANAGE"] },
  { prefix: "/admin/feedback", permissions: ["FEEDBACK_MANAGE"] },
  { prefix: "/platform/audit-logs", permissions: ["AUDIT_LOG_VIEW"] },
  { prefix: "/admin/audit-logs", permissions: ["AUDIT_LOG_VIEW"] },
  { prefix: "/platform/dashboard", permissions: ["REVENUE_VIEW"] },
  { prefix: "/admin/dashboard", permissions: ["REVENUE_VIEW"] },
  { prefix: "/owner/tasks/new", permissions: ["TASK_CREATE"] },
  { prefix: "/operations/tasks/new", permissions: ["TASK_CREATE"] },
  { prefix: "/manager/tasks/new", permissions: ["TASK_CREATE"] },
  { prefix: "/owner/tasks", permissions: ["TASK_VIEW"] },
  { prefix: "/operations/tasks", permissions: ["TASK_VIEW"] },
  { prefix: "/manager/tasks", permissions: ["TASK_VIEW"] },
  { prefix: "/tasks", permissions: ["TASK_VIEW"] },
  { prefix: "/owner/employees", permissions: ["EMPLOYEE_VIEW"] },
  { prefix: "/hr/employees", permissions: ["EMPLOYEE_VIEW"] },
  { prefix: "/owner/departments", permissions: ["DEPARTMENT_VIEW"] },
  { prefix: "/hr/departments", permissions: ["DEPARTMENT_VIEW"] },
  { prefix: "/owner/business-positions", permissions: ["POSITION_VIEW"] },
  { prefix: "/hr/business-positions", permissions: ["POSITION_VIEW"] },
  { prefix: "/hr/job-positions", permissions: ["POSITION_VIEW"] },
  { prefix: "/operations/task-analysis", permissions: ["AI_ANALYZE"] },
  { prefix: "/operations/recommendations", permissions: ["AI_RECOMMENDATION"] },
  { prefix: "/manager/recommendations", permissions: ["AI_RECOMMENDATION"] },
  { prefix: "/owner/ai-history", permissions: ["AI_HISTORY"] },
  { prefix: "/hr/ai-history", permissions: ["AI_HISTORY"] },
  { prefix: "/operations/ai-history", permissions: ["AI_HISTORY"] },
  { prefix: "/owner/ai", permissions: ["AI_ANALYZE", "AI_RECOMMENDATION"], mode: "any" },
  { prefix: "/owner/employee-report", permissions: ["AI_RECOMMENDATION"] },
  { prefix: "/hr/employee-report", permissions: ["AI_RECOMMENDATION"] },
  { prefix: "/operations/employee-report", permissions: ["AI_RECOMMENDATION"] },
  { prefix: "/owner/dashboard", permissions: ["AI_SUMMARY"] },
  { prefix: "/owner/workspace", permissions: ["WORKSPACE_UPDATE", "SUBSCRIPTION_VIEW", "SUBSCRIPTION_UPGRADE", "SUBSCRIPTION_RENEW"], mode: "any" },
  { prefix: "/owner/analytics/workload", permissions: ["REPORT_VIEW"] },
  { prefix: "/operations/workload", permissions: ["REPORT_VIEW"] },
  { prefix: "/manager/workload", permissions: ["REPORT_VIEW"] },
  { prefix: "/daily-reports/new", permissions: ["REPORT_SUBMIT"] },
  { prefix: "/daily-reports", permissions: ["REPORT_VIEW", "REPORT_SUBMIT"], mode: "any" },
  { prefix: "/employee/reports", permissions: ["REPORT_VIEW", "REPORT_SUBMIT"], mode: "any" },
  { prefix: "/employee/home", permissions: ["TASK_VIEW"] },
  { prefix: "/employee/tasks", permissions: ["TASK_VIEW"] },
  { prefix: "/notifications", permissions: ["NOTIFICATION_VIEW"] },
];

export function canAccessRoute(pathname: string, permissions: readonly string[]): boolean {
  if (/^\/tasks\/[^/]+\/edit\/?$/.test(pathname)) return hasAnyPermission(permissions, ["TASK_CREATE", "TASK_ASSIGN"]);
  const rule = rules.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!rule) return true;
  return rule.mode === "any" ? hasAnyPermission(permissions, rule.permissions) : hasAllPermissions(permissions, rule.permissions);
}
