"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { hasAllPermissions, hasAnyPermission, type Permission } from "@/lib/permissions";
import { useAuthStore } from "./auth-store";

export function RequirePermission({ permissions, mode = "all", children }: { permissions: readonly Permission[]; mode?: "all" | "any"; children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const allowed = mode === "any" ? hasAnyPermission(user, permissions) : hasAllPermissions(user, permissions);

  useEffect(() => {
    if (user && !allowed) router.replace("/forbidden");
  }, [allowed, router, user]);

  if (!user || !allowed) return null;
  return <>{children}</>;
}
