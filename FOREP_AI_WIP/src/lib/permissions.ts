import type { User } from "@/types/domain";

export type Permission =
  | "REVENUE_VIEW"
  | "PACKAGE_MANAGE"
  | "WORKSPACE_MANAGE"
  | "PAYMENT_HISTORY_VIEW"
  | "PAYMENT_CONFIRM"
  | "PAYMENT_QR_MANAGE"
  | "FEEDBACK_MANAGE"
  | "AUDIT_LOG_VIEW"
  | "AI_SUMMARY"
  | "WORKSPACE_UPDATE"
  | "SUBSCRIPTION_VIEW"
  | "SUBSCRIPTION_UPGRADE"
  | "SUBSCRIPTION_RENEW"
  | "EMPLOYEE_VIEW"
  | "EMPLOYEE_CREATE"
  | "EMPLOYEE_UPDATE"
  | "EMPLOYEE_DEACTIVATE"
  | "DEPARTMENT_VIEW"
  | "DEPARTMENT_MANAGE"
  | "POSITION_VIEW"
  | "POSITION_MANAGE"
  | "TASK_VIEW"
  | "TASK_CREATE"
  | "TASK_ASSIGN"
  | "TASK_APPROVE"
  | "TASK_UPDATE_OWN"
  | "AI_ANALYZE"
  | "AI_RECOMMENDATION"
  | "AI_HISTORY"
  | "REPORT_VIEW"
  | "REPORT_SUBMIT"
  | "REPORT_REVIEW"
  | "NOTIFICATION_VIEW";

type PermissionSource = Pick<User, "permissions"> | readonly string[] | null | undefined;

function permissionSet(source: PermissionSource): ReadonlySet<string> {
  const values: readonly string[] = source == null
    ? []
    : Array.isArray(source)
      ? source
      : (source as Pick<User, "permissions">).permissions;
  return new Set(values.filter((value) => typeof value === "string" && value.length > 0));
}

export function hasPermission(source: PermissionSource, permission: Permission | string): boolean {
  return permissionSet(source).has(permission);
}

export function hasAnyPermission(source: PermissionSource, permissions: readonly (Permission | string)[]): boolean {
  if (permissions.length === 0) return true;
  const available = permissionSet(source);
  return permissions.some((permission) => available.has(permission));
}

export function hasAllPermissions(source: PermissionSource, permissions: readonly (Permission | string)[]): boolean {
  const available = permissionSet(source);
  return permissions.every((permission) => available.has(permission));
}
