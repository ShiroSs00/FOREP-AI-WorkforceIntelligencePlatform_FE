import type { CanonicalRole, Role } from "@/types/domain";

export function normalizeRole(role: Role): CanonicalRole {
  if (role === "SYSTEM_ADMIN") return "PLATFORM_ADMIN";
  if (role === "OWNER") return "BUSINESS_OWNER";
  return role;
}

export function getHomeForRole(role: Role): string {
  const normalized = normalizeRole(role);
  if (normalized === "PLATFORM_ADMIN") return "/admin/dashboard";
  if (normalized === "BUSINESS_OWNER") return "/owner/dashboard";
  if (normalized === "HR") return "/hr/employees";
  if (normalized === "MANAGER") return "/manager/tasks";
  if (normalized === "EMPLOYEE") return "/employee/home";
  return "/forbidden";
}

export function canAccessSystemAdmin(role?: Role | null): boolean {
  return role ? normalizeRole(role) === "PLATFORM_ADMIN" : false;
}

export function canAccessOwner(role?: Role | null): boolean {
  return role ? normalizeRole(role) === "BUSINESS_OWNER" : false;
}

export function canAccessEmployee(role?: Role | null): boolean {
  return role === "EMPLOYEE";
}

export function hasRole(role: Role | null | undefined, allowedRoles: Role[]): boolean {
  return Boolean(role && allowedRoles.some((allowed) => normalizeRole(allowed) === normalizeRole(role)));
}
