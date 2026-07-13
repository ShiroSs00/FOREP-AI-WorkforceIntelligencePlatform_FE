import { BarChart3, Bell, Bot, BriefcaseBusiness, Building2, ClipboardCheck, ClipboardList, CreditCard, FileText, Home, LayoutDashboard, MessageSquareText, ReceiptText, ScrollText, UserRound, UsersRound } from "lucide-react";
import type { Role } from "@/types/domain";
import { normalizeRole } from "@/lib/role";

export type NavItem = { href: string; label: string; icon: typeof Home };

export function getNavigation(role?: Role | null): NavItem[] {
  if (!role || normalizeRole(role) === "SYSTEM") return [];
  const normalized = normalizeRole(role);
  if (normalized === "PLATFORM_ADMIN") {
    return [
      { href: "/admin/dashboard", label: "Tổng quan nền tảng", icon: LayoutDashboard },
      { href: "/admin/workspaces", label: "Workspace", icon: Building2 },
      { href: "/admin/registrations", label: "Hồ sơ đăng ký", icon: ClipboardCheck },
      { href: "/admin/payments", label: "Thanh toán", icon: ReceiptText },
      { href: "/admin/subscription-plans", label: "Gói dịch vụ", icon: CreditCard },
      { href: "/admin/audit-logs", label: "Nhật ký hệ thống", icon: ScrollText },
      { href: "/admin/feedback", label: "Phản hồi doanh nghiệp", icon: MessageSquareText },
      { href: "/admin/profile", label: "Tài khoản", icon: UserRound },
    ];
  }

  if (normalized === "BUSINESS_OWNER") {
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

  if (normalized === "HR") {
    return [
      { href: "/hr/employees", label: "Nhân sự", icon: UsersRound },
      { href: "/hr/job-positions", label: "Vị trí công việc", icon: BriefcaseBusiness },
      { href: "/notifications", label: "Thông báo", icon: Bell },
      { href: "/profile", label: "Hồ sơ", icon: UserRound },
    ];
  }

  if (normalized === "MANAGER") {
    return [
      { href: "/manager/tasks", label: "Công việc", icon: ClipboardList },
      { href: "/manager/tasks/new", label: "Giao việc", icon: ClipboardCheck },
      { href: "/manager/workload", label: "Workload theo tháng", icon: BarChart3 },
      { href: "/manager/recommendations", label: "Gợi ý phân công", icon: Bot },
      { href: "/notifications", label: "Thông báo", icon: Bell },
      { href: "/profile", label: "Hồ sơ", icon: UserRound },
    ];
  }

  return [
    { href: "/employee/home", label: "Việc của tôi", icon: Home },
    { href: "/employee/reports", label: "Báo cáo ngày", icon: FileText },
    { href: "/notifications", label: "Thông báo", icon: Bell },
    { href: "/profile", label: "Hồ sơ", icon: UserRound },
  ];
}

