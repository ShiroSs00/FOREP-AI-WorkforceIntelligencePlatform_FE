"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getCurrentUser } from "@/api/auth.api";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";
import { normalizeRole } from "@/lib/role";
import { useAuthStore } from "./auth-store";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { token, user, hydrated, setUser, clearAuth } = useAuthStore();

  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: getCurrentUser,
    enabled: hydrated && Boolean(token),
  });

  useEffect(() => {
    if (!hydrated) return;
    if (!token) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, pathname, router, token]);

  useEffect(() => {
    if (meQuery.data) setUser(meQuery.data);
  }, [meQuery.data, setUser]);

  useEffect(() => {
    const role = meQuery.data?.role ?? user?.role;
    if (!role) return;
    const normalized = normalizeRole(role);
    const namespace = pathname.split("/").filter(Boolean)[0];
    const allowedNamespaces = normalized === "PLATFORM_ADMIN" || normalized === "SYSTEM"
      ? ["platform", "admin"]
      : normalized === "BUSINESS_OWNER"
        ? ["owner"]
        : normalized === "HR"
          ? ["hr"]
          : normalized === "EXECUTIVE" || normalized === "MANAGER"
            ? ["operations", "manager"]
            : normalized === "EMPLOYEE"
              ? ["employee"]
              : [];
    const protectedNamespaces = ["platform", "admin", "owner", "hr", "operations", "manager", "employee"];
    if (protectedNamespaces.includes(namespace) && !allowedNamespaces.includes(namespace)) router.replace("/forbidden");
  }, [meQuery.data?.role, pathname, router, user?.role]);

  useEffect(() => {
    const status = typeof meQuery.error === "object" && meQuery.error !== null && "status" in meQuery.error ? Number(meQuery.error.status) : undefined;
    if (status === 401) {
      clearAuth();
      queryClient.clear();
      router.replace("/login?reason=session-expired");
    }
  }, [clearAuth, meQuery.error, queryClient, router]);

  if (!hydrated || !token || (meQuery.isLoading && !user)) {
    return <main className="min-h-screen bg-slate-50 p-6"><LoadingState label="Đang kiểm tra phiên đăng nhập..." /></main>;
  }

  return <>{children}</>;
}


