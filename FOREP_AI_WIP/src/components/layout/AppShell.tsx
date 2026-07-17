"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, FileText, LogOut, Menu, Plus, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { logout } from "@/api/auth.api";
import { getCurrentWorkspace } from "@/api/workspace.api";
import { listNotifications } from "@/api/notifications.api";
import { useAuthStore } from "@/auth/auth-store";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { cn } from "@/lib/cn";
import { queryKeys } from "@/lib/query-keys";
import { getHomeForRole, normalizeRole } from "@/lib/role";
import { getNavigation } from "./nav";

function roleLabel(role?: string | null) {
  if (!role) return "Người dùng";
  const normalized = normalizeRole(role as import("@/types/domain").Role);
  if (normalized === "PLATFORM_ADMIN") return "Quản trị nền tảng";
  if (normalized === "BUSINESS_OWNER") return "Chủ doanh nghiệp";
  if (normalized === "HR") return "Nhân sự";
  if (normalized === "EXECUTIVE") return "Điều hành";
  if (normalized === "MANAGER") return "Quản lý";
  if (normalized === "SYSTEM") return "Hệ thống";
  return "Nhân viên";
}

function pageFallback(pathname: string) {
  const segment = pathname.split("/").filter(Boolean).at(-1);
  if (!segment) return "Tổng quan";
  return segment.replaceAll("-", " ");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [open, setOpen] = useState(false);
  const normalizedRole = user ? normalizeRole(user.role) : null;
  const nav = useMemo(() => getNavigation(user?.role), [user?.role]);
  const currentPage = [...nav].reverse().find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: listNotifications,
    enabled: Boolean(user) && normalizedRole !== "PLATFORM_ADMIN" && normalizedRole !== "SYSTEM",
  });
  const workspaceQuery = useQuery({
    queryKey: queryKeys.workspace,
    queryFn: getCurrentWorkspace,
    enabled: Boolean(user) && normalizedRole !== "PLATFORM_ADMIN" && normalizedRole !== "SYSTEM",
  });
  const unread = notificationsQuery.data?.filter((item) => !item.read).length ?? 0;
  const homeHref = user ? getHomeForRole(user.role) : "/login";
  const primaryAction =
    normalizedRole === "PLATFORM_ADMIN" || normalizedRole === "SYSTEM"
      ? { href: "/platform/registrations", label: "Duyệt hồ sơ", icon: FileText }
      : normalizedRole === "BUSINESS_OWNER"
        ? { href: "/owner/tasks/new", label: "Tạo task", icon: Plus }
        : normalizedRole === "MANAGER" || normalizedRole === "EXECUTIVE"
          ? { href: "/operations/tasks/new", label: "Tạo task", icon: Plus }
        : normalizedRole === "HR"
          ? { href: "/hr/employees", label: "Thêm nhân viên", icon: Plus }
          : { href: "/daily-reports/new", label: "Gửi báo cáo", icon: FileText };

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      router.replace("/login");
    },
  });

  const sidebar = (
    <aside className="flex h-full w-sidebar flex-col border-r border-border bg-sidebar">
      <div className="p-4">
        <Link
          href={homeHref}
          onClick={() => setOpen(false)}
          className="focus-ring flex items-center gap-3 rounded-card border border-border bg-surface p-3 transition-colors hover:bg-surface-muted"
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-control bg-primary font-black text-primary-foreground">F</div>
          <div className="min-w-0">
            <p className="truncate font-black text-foreground">{normalizedRole === "PLATFORM_ADMIN" ? "FOREP Admin" : workspaceQuery.data?.name ?? "FOREP EXE"}</p>
            <p className="truncate text-xs font-medium text-muted-foreground">{normalizedRole === "PLATFORM_ADMIN" ? "Vận hành nền tảng" : workspaceQuery.data?.shortCode ? `${workspaceQuery.data.shortCode} · ${roleLabel(user?.role)}` : roleLabel(user?.role)}</p>
          </div>
        </Link>
      </div>

      <nav className="app-scrollbar flex-1 space-y-1 overflow-y-auto px-3 pb-3" aria-label="Điều hướng chính">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "focus-ring flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground",
                active && "bg-sidebar-active text-primary",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
              {item.href === "/notifications" && unread > 0 ? (
                <span className="ml-auto min-w-6 rounded-full bg-red-50 px-2 py-0.5 text-center text-xs font-bold text-destructive ring-1 ring-red-200">
                  {unread}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 rounded-card bg-surface-muted p-3">
          <p className="truncate text-sm font-bold text-foreground">{user?.fullName ?? "Người dùng"}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email ?? roleLabel(user?.role)}</p>
        </div>
        <Button variant="ghost" className="w-full justify-start" onClick={() => window.confirm("Bạn muốn đăng xuất khỏi FOREP EXE?") ? logoutMutation.mutate() : undefined} disabled={logoutMutation.isPending}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Đăng xuất
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">{sidebar}</div>
      {open ? (
        <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="h-full" onClick={(event) => event.stopPropagation()}>
            <div className="flex h-full w-sidebar max-w-[86vw] flex-col">
              <div className="absolute left-[calc(min(18rem,86vw)-3.5rem)] top-4 z-10">
                <button className="focus-ring rounded-full bg-surface p-2 text-foreground shadow" onClick={() => setOpen(false)} aria-label="Đóng menu">
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              {sidebar}
            </div>
          </div>
        </div>
      ) : null}
      <div className="lg:pl-sidebar">
        <header className="sticky top-0 z-30 flex h-header items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button className="focus-ring rounded-control border border-border bg-surface p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Mở menu">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground">{roleLabel(user?.role)}</p>
              <p className="truncate font-black text-foreground">{currentPage?.label ?? pageFallback(pathname)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={primaryAction.href}
              className="focus-ring hidden min-h-10 items-center gap-2 rounded-control bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-teal-800 sm:inline-flex"
            >
              <primaryAction.icon className="h-4 w-4" aria-hidden="true" />
              {primaryAction.label}
            </Link>
            {normalizedRole !== "PLATFORM_ADMIN" && normalizedRole !== "SYSTEM" ? (
              <Link href="/notifications" className="focus-ring relative rounded-control border border-border bg-surface p-2.5 text-muted-foreground hover:text-foreground" aria-label={`${unread} thông báo chưa đọc`}>
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unread > 0 ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-destructive px-1 text-center text-xs font-bold text-white">{unread}</span> : null}
              </Link>
            ) : null}
            <Badge tone={normalizedRole === "PLATFORM_ADMIN" || normalizedRole === "SYSTEM" ? "amber" : normalizedRole === "BUSINESS_OWNER" ? "teal" : "blue"}>{roleLabel(user?.role)}</Badge>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}



