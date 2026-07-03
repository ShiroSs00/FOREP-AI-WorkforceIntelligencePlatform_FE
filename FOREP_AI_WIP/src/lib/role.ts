import type { Role } from "@/types/domain";

export function getHomeForRole(role: Role): string {
  if (role === "SYSTEM_ADMIN") return "/admin/dashboard";
  return role === "OWNER" ? "/owner/dashboard" : "/employee/home";
}

export function canAccessSystemAdmin(role?: Role | null): boolean {
  return role === "SYSTEM_ADMIN";
}

export function canAccessOwner(role?: Role | null): boolean {
  return role === "OWNER";
}

export function canAccessEmployee(role?: Role | null): boolean {
  return role === "EMPLOYEE";
}
