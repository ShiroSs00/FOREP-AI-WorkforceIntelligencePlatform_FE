import type { Role } from "@/types/domain";

export function getHomeForRole(role: Role): string {
  return role === "OWNER" ? "/owner/dashboard" : "/employee/home";
}

export function canAccessOwner(role?: Role | null): boolean {
  return role === "OWNER";
}

export function canAccessEmployee(role?: Role | null): boolean {
  return role === "EMPLOYEE";
}


