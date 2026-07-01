"use client";

import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAuthStore } from "@/auth/auth-store";
import { ratingLabel, seniorityLabel } from "@/lib/labels";

function fallback(value?: string | null) {
  return value && value.trim() ? value : "Chưa cập nhật";
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role === "OWNER" ? "Chủ workspace" : "Nhân viên";
  return (
    <>
      <PageHeader eyebrow="Hồ sơ" title="Thông tin tài khoản" description="Thông tin tài khoản đang đăng nhập từ backend. Hồ sơ chỉ đọc vì Swagger chưa có endpoint cập nhật người dùng hiện tại." />
      <Card className="max-w-4xl">
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-sm font-semibold text-muted-foreground">Họ tên</dt><dd className="mt-1 font-bold text-foreground">{fallback(user?.fullName)}</dd></div>
          <div><dt className="text-sm font-semibold text-muted-foreground">Email</dt><dd className="mt-1 font-bold text-foreground">{fallback(user?.email)}</dd></div>
          <div><dt className="text-sm font-semibold text-muted-foreground">Số điện thoại</dt><dd className="mt-1 font-bold text-foreground">{fallback(user?.phone)}</dd></div>
          <div><dt className="text-sm font-semibold text-muted-foreground">Tên đăng nhập</dt><dd className="mt-1 font-bold text-foreground">{fallback(user?.username)}</dd></div>
          <div><dt className="text-sm font-semibold text-muted-foreground">Mã nhân viên</dt><dd className="mt-1 font-bold text-foreground">{fallback(user?.employeeCode)}</dd></div>
          <div><dt className="text-sm font-semibold text-muted-foreground">Vai trò</dt><dd className="mt-2"><Badge tone={user?.role === "OWNER" ? "teal" : "blue"}>{role}</Badge></dd></div>
          <div><dt className="text-sm font-semibold text-muted-foreground">Trạng thái tài khoản</dt><dd className="mt-2"><StatusBadge value={user?.status} /></dd></div>
          <div><dt className="text-sm font-semibold text-muted-foreground">Chức danh</dt><dd className="mt-1 font-bold text-foreground">{fallback(user?.jobTitle)}</dd></div>
          <div><dt className="text-sm font-semibold text-muted-foreground">Cấp độ</dt><dd className="mt-1 font-bold text-foreground">{seniorityLabel(user?.seniorityLevel)}</dd></div>
          <div><dt className="text-sm font-semibold text-muted-foreground">Mức kỹ năng</dt><dd className="mt-1 font-bold text-foreground">{ratingLabel(user?.skillRating)}</dd></div>
          <div><dt className="text-sm font-semibold text-muted-foreground">Số năm kinh nghiệm</dt><dd className="mt-1 font-bold text-foreground">{typeof user?.yearsOfExperience === "number" ? user.yearsOfExperience : "Chưa cập nhật"}</dd></div>
          <div className="sm:col-span-2"><dt className="text-sm font-semibold text-muted-foreground">Kỹ năng</dt><dd className="mt-1 font-bold leading-6 text-foreground">{fallback(user?.skills)}</dd></div>
        </dl>
      </Card>
    </>
  );
}
