"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Role } from "@/types/domain";
import { useAuthStore } from "./auth-store";

export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter();
  const userRole = useAuthStore((state) => state.user?.role);

  useEffect(() => {
    if (userRole && userRole !== role) router.replace("/forbidden");
  }, [role, router, userRole]);

  if (!userRole || userRole !== role) return null;
  return <>{children}</>;
}


