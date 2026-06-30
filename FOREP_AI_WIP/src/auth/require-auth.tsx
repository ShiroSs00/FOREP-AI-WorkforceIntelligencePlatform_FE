"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getCurrentUser } from "@/api/auth.api";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";
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


