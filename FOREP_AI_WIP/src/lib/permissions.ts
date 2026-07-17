import type { CanonicalRole, Role } from "@/types/domain";
import { normalizeRole } from "./role";

export type Permission =
  | "platform:manage"
  | "workspace:manage"
  | "employees:read"
  | "employees:manage"
  | "hr-master:read"
  | "hr-master:manage"
  | "tasks:read"
  | "tasks:manage"
  | "tasks:progress"
  | "workload:read"
  | "ai:read"
  | "ai:history"
  | "reports:read"
  | "reports:write"
  | "notifications:read";

const matrix: Record<CanonicalRole, ReadonlySet<Permission>> = {
  PLATFORM_ADMIN: new Set(["platform:manage"]),
  SYSTEM: new Set(["platform:manage"]),
  BUSINESS_OWNER: new Set(["workspace:manage", "employees:read", "employees:manage", "hr-master:read", "tasks:read", "tasks:manage", "tasks:progress", "workload:read", "ai:read", "ai:history", "reports:read", "notifications:read"]),
  HR: new Set(["employees:read", "employees:manage", "hr-master:read", "hr-master:manage", "tasks:read", "ai:read", "ai:history", "reports:read", "notifications:read"]),
  EXECUTIVE: new Set(["employees:read", "tasks:read", "tasks:manage", "tasks:progress", "workload:read", "ai:read", "ai:history", "reports:read", "notifications:read"]),
  MANAGER: new Set(["employees:read", "tasks:read", "tasks:manage", "tasks:progress", "workload:read", "ai:read", "ai:history", "reports:read", "notifications:read"]),
  EMPLOYEE: new Set(["tasks:read", "tasks:progress", "reports:write", "notifications:read"]),
};

export function can(role: Role | null | undefined, permission: Permission): boolean {
  return Boolean(role && matrix[normalizeRole(role)].has(permission));
}

export const taskManagerRoles: Role[] = ["BUSINESS_OWNER", "EXECUTIVE", "MANAGER"];
export const aiHistoryRoles: Role[] = ["BUSINESS_OWNER", "HR", "EXECUTIVE", "MANAGER"];
