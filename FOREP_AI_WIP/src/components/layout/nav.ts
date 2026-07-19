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
  QrCode,
  ReceiptText,
  ScrollText,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { User } from "@/types/domain";
import { hasAllPermissions, hasAnyPermission, type Permission } from "@/lib/permissions";
import { normalizeRole } from "@/lib/role";

export type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  requiredPermissions?: readonly Permission[];
  permissionMode?: "all" | "any";
};

function visibleNavigation(items: NavItem[], user: Pick<User, "permissions">): NavItem[] {
  return items.filter((item) => {
    if (!item.requiredPermissions?.length) return true;
    return item.permissionMode === "any"
      ? hasAnyPermission(user, item.requiredPermissions)
      : hasAllPermissions(user, item.requiredPermissions);
  });
}

export function getNavigation(user?: Pick<User, "role" | "permissions"> | null): NavItem[] {
  if (!user) return [];
  const normalized = normalizeRole(user.role);
  let items: NavItem[];

  if (normalized === "PLATFORM_ADMIN" || normalized === "SYSTEM") {
    items = [
      { href: "/platform/dashboard", label: "Tổng quan nền tảng", icon: LayoutDashboard, requiredPermissions: ["REVENUE_VIEW"] },
      { href: "/platform/subscription-plans", label: "Gói dịch vụ", icon: CreditCard, requiredPermissions: ["PACKAGE_MANAGE"] },
      { href: "/platform/registrations", label: "Hồ sơ đăng ký", icon: ClipboardCheck, requiredPermissions: ["WORKSPACE_MANAGE"] },
      { href: "/platform/payments", label: "Thanh toán", icon: ReceiptText, requiredPermissions: ["PAYMENT_HISTORY_VIEW"] },
      { href: "/platform/payment-qr-settings", label: "Cấu hình QR thanh toán", icon: QrCode, requiredPermissions: ["PAYMENT_QR_MANAGE"] },
      { href: "/platform/workspaces", label: "Workspace", icon: Building2, requiredPermissions: ["WORKSPACE_MANAGE"] },
      { href: "/platform/feedback", label: "Phản hồi doanh nghiệp", icon: MessageSquareText, requiredPermissions: ["FEEDBACK_MANAGE"] },
      { href: "/platform/audit-logs", label: "Nhật ký hệ thống", icon: ScrollText, requiredPermissions: ["AUDIT_LOG_VIEW"] },
      { href: "/platform/profile", label: "Tài khoản", icon: UserRound },
    ];
  } else if (normalized === "BUSINESS_OWNER") {
    items = [
      { href: "/owner/dashboard", label: "Tổng quan", icon: LayoutDashboard, requiredPermissions: ["AI_SUMMARY"] },
      { href: "/tasks", label: "Công việc", icon: ClipboardList, requiredPermissions: ["TASK_VIEW"] },
      { href: "/operations/workload", label: "Mức tải công việc", icon: BarChart3, requiredPermissions: ["REPORT_VIEW"] },
      { href: "/owner/ai", label: "Trung tâm AI", icon: Bot, requiredPermissions: ["AI_ANALYZE", "AI_RECOMMENDATION"], permissionMode: "any" },
      { href: "/owner/ai-history", label: "Lịch sử AI", icon: FileClock, requiredPermissions: ["AI_HISTORY"] },
      { href: "/owner/employee-report", label: "Bản nháp báo cáo AI", icon: FileText, requiredPermissions: ["AI_RECOMMENDATION"] },
      { href: "/owner/employees", label: "Nhân viên", icon: UsersRound, requiredPermissions: ["EMPLOYEE_VIEW"] },
      { href: "/owner/departments", label: "Phòng ban", icon: Building2, requiredPermissions: ["DEPARTMENT_VIEW"] },
      { href: "/owner/business-positions", label: "Vị trí nghiệp vụ", icon: BriefcaseBusiness, requiredPermissions: ["POSITION_VIEW"] },
      { href: "/daily-reports", label: "Báo cáo ngày", icon: FileText, requiredPermissions: ["REPORT_VIEW", "REPORT_SUBMIT"], permissionMode: "any" },
      { href: "/notifications", label: "Thông báo", icon: Bell, requiredPermissions: ["NOTIFICATION_VIEW"] },
      { href: "/owner/workspace", label: "Workspace", icon: Home, requiredPermissions: ["WORKSPACE_UPDATE", "SUBSCRIPTION_VIEW", "SUBSCRIPTION_UPGRADE", "SUBSCRIPTION_RENEW"], permissionMode: "any" },
    ];
  } else if (normalized === "HR") {
    items = [
      { href: "/hr/employees", label: "Nhân sự", icon: UsersRound, requiredPermissions: ["EMPLOYEE_VIEW"] },
      { href: "/hr/departments", label: "Phòng ban", icon: Building2, requiredPermissions: ["DEPARTMENT_VIEW"] },
      { href: "/hr/business-positions", label: "Vị trí nghiệp vụ", icon: BriefcaseBusiness, requiredPermissions: ["POSITION_VIEW"] },
      { href: "/hr/ai-history", label: "Lịch sử AI", icon: FileClock, requiredPermissions: ["AI_HISTORY"] },
      { href: "/hr/employee-report", label: "Bản nháp báo cáo AI", icon: FileText, requiredPermissions: ["AI_RECOMMENDATION"] },
      { href: "/daily-reports", label: "Báo cáo ngày", icon: FileText, requiredPermissions: ["REPORT_VIEW", "REPORT_SUBMIT"], permissionMode: "any" },
      { href: "/notifications", label: "Thông báo", icon: Bell, requiredPermissions: ["NOTIFICATION_VIEW"] },
    ];
  } else if (normalized === "EXECUTIVE" || normalized === "MANAGER") {
    items = [
      { href: "/operations/tasks", label: "Công việc", icon: ClipboardList, requiredPermissions: ["TASK_VIEW"] },
      { href: "/operations/tasks/new", label: "Giao việc", icon: ClipboardCheck, requiredPermissions: ["TASK_CREATE"] },
      { href: "/operations/workload", label: "Mức tải công việc", icon: BarChart3, requiredPermissions: ["REPORT_VIEW"] },
      { href: "/operations/task-analysis", label: "Phân tích task", icon: Network, requiredPermissions: ["AI_ANALYZE"] },
      { href: "/operations/recommendations", label: "Gợi ý phân công", icon: Bot, requiredPermissions: ["AI_RECOMMENDATION"] },
      { href: "/operations/ai-history", label: "Lịch sử AI", icon: FileClock, requiredPermissions: ["AI_HISTORY"] },
      { href: "/operations/employee-report", label: "Bản nháp báo cáo AI", icon: FileText, requiredPermissions: ["AI_RECOMMENDATION"] },
      { href: "/daily-reports", label: "Báo cáo ngày", icon: FileText, requiredPermissions: ["REPORT_VIEW", "REPORT_SUBMIT"], permissionMode: "any" },
      { href: "/notifications", label: "Thông báo", icon: Bell, requiredPermissions: ["NOTIFICATION_VIEW"] },
    ];
  } else {
    items = [
      { href: "/employee/home", label: "Việc của tôi", icon: Home, requiredPermissions: ["TASK_VIEW"] },
      { href: "/employee/reports", label: "Báo cáo ngày", icon: FileText, requiredPermissions: ["REPORT_VIEW", "REPORT_SUBMIT"], permissionMode: "any" },
      { href: "/notifications", label: "Thông báo", icon: Bell, requiredPermissions: ["NOTIFICATION_VIEW"] },
      { href: "/profile", label: "Hồ sơ", icon: UserRound },
    ];
  }

  return visibleNavigation(items, user);
}
