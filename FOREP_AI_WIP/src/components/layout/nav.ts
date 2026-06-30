import { BarChart3, Bell, Bot, ClipboardList, FileText, Home, LayoutDashboard, UserRound, UsersRound } from "lucide-react";
import type { Role } from "@/types/domain";

export type NavItem = { href: string; label: string; icon: typeof Home };

export function getNavigation(role?: Role | null): NavItem[] {
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
