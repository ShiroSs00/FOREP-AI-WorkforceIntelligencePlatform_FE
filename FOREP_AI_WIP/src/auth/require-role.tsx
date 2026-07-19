"use client";

import type { Role } from "@/types/domain";

/**
 * Legacy composition wrapper. Runtime authorization is enforced centrally by
 * RequireAuth + route-permissions and by permission-aware action checks.
 * Role props remain only so legacy page composition can migrate incrementally.
 */
export function RequireRole({ children }: { role?: Role; allowedRoles?: Role[]; children: React.ReactNode }) {
  return <>{children}</>;
}
