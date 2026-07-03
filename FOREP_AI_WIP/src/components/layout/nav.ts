import { BarChart3, Bell, Bot, Building2, ClipboardCheck, ClipboardList, CreditCard, FileText, Home, LayoutDashboard, MessageSquareText, UserRound, UsersRound } from "lucide-react";
import type { Role } from "@/types/domain";

export type NavItem = { href: string; label: string; icon: typeof Home };

export function getNavigation(role?: Role | null): NavItem[] {
  if (role === "SYSTEM_ADMIN") {
    return [
      { href: "/admin/dashboard", label: "Tổng quan nền tảng", icon: LayoutDashboard },
      { href: "/admin/workspaces", label: "Workspace", icon: Building2 },
      { href: "/admin/registrations", label: "Hồ sơ đăng ký", icon: ClipboardCheck },
      { href: "/admin/subscription-plans", label: "Gói dịch vụ", icon: CreditCard },
      { href: "/admin/feedback", label: "Phản hồi doanh nghiệp", icon: MessageSquareText },
      { href: "/admin/profile", label: "Tài khoản", icon: UserRound },
    ];
  }

  if (role === "OWNER") {
    return [
      { href: "/owner/dashboard", label: "Tổng quan", icon: LayoutDashboard },
      { href: "/tasks", label: "Công việc", icon: ClipboardList },
      { href: "/owner/employees", label: "Nhân viên", icon: UsersRound },
      { href: "/owner/analytics/workload", label: "Mức tải công việc", icon: BarChart3 },
      { href: "/owner/ai", label: "AI", icon: Bot },
      { href: "/daily-reports", label: "Báo cáo ngày", icon: FileText },
      { href: "/notifications", label: "Thông báo", icon: Bell },
      { href: "/owner/workspace", label: "Workspace", icon: Home },
    ];
  }

  return [
    { href: "/employee/home", label: "Việc của tôi", icon: Home },
    { href: "/employee/reports", label: "Báo cáo ngày", icon: FileText },
    { href: "/notifications", label: "Thông báo", icon: Bell },
    { href: "/profile", label: "Hồ sơ", icon: UserRound },
  ];
}

