import {
  BarChart3,
  Bell,
  Bot,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileClock,
  FileText,
  Home,
  LayoutDashboard,
  MessageSquareText,
  Network,
  ReceiptText,
  ScrollText,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { Role } from "@/types/domain";
import { normalizeRole } from "@/lib/role";

export type NavItem = { href: string; label: string; icon: typeof Home };

export function getNavigation(role?: Role | null): NavItem[] {
  if (!role) return [];
  const normalized = normalizeRole(role);

  if (normalized === "PLATFORM_ADMIN" || normalized === "SYSTEM") {
    return [
      { href: "/platform/dashboard", label: "Tổng quan nền tảng", icon: LayoutDashboard },
      { href: "/platform/subscription-plans", label: "Gói dịch vụ", icon: CreditCard },
      { href: "/platform/registrations", label: "Hồ sơ đăng ký", icon: ClipboardCheck },
      { href: "/platform/payments", label: "Thanh toán", icon: ReceiptText },
      { href: "/platform/workspaces", label: "Workspace", icon: Building2 },
      { href: "/platform/feedback", label: "Phản hồi doanh nghiệp", icon: MessageSquareText },
      { href: "/platform/audit-logs", label: "Nhật ký hệ thống", icon: ScrollText },
      { href: "/platform/profile", label: "Tài khoản", icon: UserRound },
    ];
  }

  if (normalized === "BUSINESS_OWNER") {
    return [
      { href: "/owner/dashboard", label: "Tổng quan", icon: LayoutDashboard },
      { href: "/tasks", label: "Công việc", icon: ClipboardList },
      { href: "/operations/workload", label: "Mức tải công việc", icon: BarChart3 },
      { href: "/owner/ai", label: "Trung tâm AI", icon: Bot },
      { href: "/owner/ai-history", label: "Lịch sử AI", icon: FileClock },
      { href: "/owner/employee-report", label: "Bản nháp báo cáo AI", icon: FileText },
      { href: "/owner/employees", label: "Nhân viên", icon: UsersRound },
      { href: "/owner/departments", label: "Phòng ban", icon: Building2 },
      { href: "/owner/business-positions", label: "Vị trí nghiệp vụ", icon: BriefcaseBusiness },
      { href: "/daily-reports", label: "Báo cáo ngày", icon: FileText },
      { href: "/notifications", label: "Thông báo", icon: Bell },
      { href: "/owner/workspace", label: "Workspace", icon: Home },
    ];
  }

  if (normalized === "HR") {
    return [
      { href: "/hr/employees", label: "Nhân sự", icon: UsersRound },
      { href: "/hr/departments", label: "Phòng ban", icon: Building2 },
      { href: "/hr/business-positions", label: "Vị trí nghiệp vụ", icon: BriefcaseBusiness },
      { href: "/hr/ai-history", label: "Lịch sử AI", icon: FileClock },
      { href: "/hr/employee-report", label: "Bản nháp báo cáo AI", icon: FileText },
      { href: "/notifications", label: "Thông báo", icon: Bell },
    ];
  }

  if (normalized === "EXECUTIVE" || normalized === "MANAGER") {
    return [
      { href: "/operations/tasks", label: "Công việc", icon: ClipboardList },
      { href: "/operations/tasks/new", label: "Giao việc", icon: ClipboardCheck },
      { href: "/operations/workload", label: "Mức tải công việc", icon: BarChart3 },
      { href: "/operations/task-analysis", label: "Phân tích task", icon: Network },
      { href: "/operations/recommendations", label: "Gợi ý phân công", icon: Bot },
      { href: "/operations/ai-history", label: "Lịch sử AI", icon: FileClock },
      { href: "/operations/employee-report", label: "Bản nháp báo cáo AI", icon: FileText },
      { href: "/daily-reports", label: "Báo cáo ngày", icon: FileText },
      { href: "/notifications", label: "Thông báo", icon: Bell },
    ];
  }

  return [
    { href: "/employee/home", label: "Việc của tôi", icon: Home },
    { href: "/employee/reports", label: "Báo cáo ngày", icon: FileText },
    { href: "/notifications", label: "Thông báo", icon: Bell },
    { href: "/profile", label: "Hồ sơ", icon: UserRound },
  ];
}
