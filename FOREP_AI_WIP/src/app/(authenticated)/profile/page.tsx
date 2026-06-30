"use client";

import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAuthStore } from "@/auth/auth-store";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role === "OWNER" ? "Chủ workspace" : "Nhân viên";
  return (
    <>
      <PageHeader eyebrow="Hồ sơ" title="Thông tin tài khoản" description="Thông tin tài khoản đang đăng nhập. Các thay đổi hồ sơ sẽ được mở khi backend hỗ trợ cập nhật người dùng." />
      <Card className="max-w-3xl">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-muted-foreground">Họ tên</dt>
            <dd className="mt-1 font-bold text-foreground">{user?.fullName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-muted-foreground">Email</dt>
            <dd className="mt-1 font-bold text-foreground">{user?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-muted-foreground">Vai trò</dt>
            <dd className="mt-2"><Badge tone={user?.role === "OWNER" ? "teal" : "blue"}>{role}</Badge></dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-muted-foreground">Trạng thái tài khoản</dt>
            <dd className="mt-2"><StatusBadge value={user?.status} /></dd>
          </div>
        </dl>
      </Card>
    </>
  );
}
