"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Role } from "@/types/domain";
import { hasRole } from "@/lib/role";
import { useAuthStore } from "./auth-store";

export function RequireRole({ role, allowedRoles, children }: { role?: Role; allowedRoles?: Role[]; children: React.ReactNode }) {
  const router = useRouter();
  const userRole = useAuthStore((state) => state.user?.role);

  const configuredRoles = allowedRoles ?? (role ? [role] : []);
  const allowed = hasRole(userRole, configuredRoles);

  useEffect(() => {
    if (userRole && !allowed) router.replace("/forbidden");
  }, [allowed, router, userRole]);

  if (!userRole || !allowed) return null;
  return <>{children}</>;
}


