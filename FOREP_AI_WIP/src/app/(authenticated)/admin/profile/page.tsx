"use client";

import { RequireRole } from "@/auth/require-role";
import { useAuthStore } from "@/auth/auth-store";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm";

function fallback(value?: string | null) {
  return value && value.trim() ? value : "Chưa cập nhật";
}

export default function AdminProfilePage() {
  const user = useAuthStore((state) => state.user);
  return (
    <RequireRole role="SYSTEM_ADMIN">
      <PageHeader eyebrow="SYSTEM ADMIN" title="Tài khoản quản trị" description="Thông tin tài khoản quản trị nền tảng và bảo mật đăng nhập." />
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <dl className="grid gap-5 sm:grid-cols-2">
            <div><dt className="text-sm font-semibold text-muted-foreground">Họ tên</dt><dd className="mt-1 font-bold text-foreground">{fallback(user?.fullName)}</dd></div>
            <div><dt className="text-sm font-semibold text-muted-foreground">Email</dt><dd className="mt-1 font-bold text-foreground">{fallback(user?.email)}</dd></div>
            <div><dt className="text-sm font-semibold text-muted-foreground">Tên đăng nhập</dt><dd className="mt-1 font-bold text-foreground">{fallback(user?.username)}</dd></div>
            <div><dt className="text-sm font-semibold text-muted-foreground">Vai trò</dt><dd className="mt-2"><Badge tone="amber">Quản trị nền tảng</Badge></dd></div>
            <div><dt className="text-sm font-semibold text-muted-foreground">Trạng thái</dt><dd className="mt-2"><StatusBadge value={user?.status} /></dd></div>
          </dl>
        </Card>
        <ChangePasswordForm />
      </div>
    </RequireRole>
  );
}
