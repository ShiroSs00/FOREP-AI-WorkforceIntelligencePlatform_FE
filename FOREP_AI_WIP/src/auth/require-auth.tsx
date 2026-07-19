"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getCurrentUser } from "@/api/auth.api";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys, removeProtectedQueries } from "@/lib/query-keys";
import { canAccessRoute } from "@/lib/route-permissions";
import { useAuthStore } from "./auth-store";

function errorStatus(error: unknown): number | undefined {
  return typeof error === "object" && error !== null && "status" in error ? Number(error.status) : undefined;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { token, hydrated, setUser, clearAuth } = useAuthStore();

  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const currentUser = await getCurrentUser();
      const verifiedUser = { ...currentUser, permissions: Array.isArray(currentUser.permissions) ? currentUser.permissions : [] };
      setUser(verifiedUser);
      return verifiedUser;
    },
    enabled: hydrated && Boolean(token),
  });

  useEffect(() => {
    if (hydrated && !token) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, pathname, router, token]);

  useEffect(() => {
    const status = errorStatus(meQuery.error);
    if (status === 401) {
      clearAuth();
      removeProtectedQueries(queryClient);
      router.replace("/login?reason=session-expired");
    } else if (status === 403) {
      router.replace("/forbidden");
    }
  }, [clearAuth, meQuery.error, queryClient, router]);

  useEffect(() => {
    if (meQuery.data && !canAccessRoute(pathname, meQuery.data.permissions)) router.replace("/forbidden");
  }, [meQuery.data, pathname, router]);

  if (!hydrated || !token || meQuery.isLoading || !meQuery.data) {
    const status = errorStatus(meQuery.error);
    if (meQuery.error && status !== 401 && status !== 403) {
      return <main className="min-h-screen bg-background p-6"><ErrorState title="Không thể xác minh quyền truy cập" error={meQuery.error} onRetry={() => void meQuery.refetch()} /></main>;
    }
    return <main className="min-h-screen bg-background p-6"><LoadingState label="Đang kiểm tra phiên đăng nhập và quyền truy cập..." /></main>;
  }

  if (!canAccessRoute(pathname, meQuery.data.permissions)) return null;
  return <>{children}</>;
}
