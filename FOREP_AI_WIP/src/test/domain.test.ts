import { describe, expect, it } from "vitest";
import { paymentStatusLabel, registrationStatusLabel, roleFitLabel, seniorityLabel, workspaceStatusLabel } from "@/lib/labels";
import { canAccessEmployee, canAccessOwner, canAccessSystemAdmin, getHomeForRole, hasRole, normalizeRole } from "@/lib/role";
import { isTaskOverdue } from "@/lib/tasks";

describe("domain helpers", () => {
  it("redirects by role", () => {
    expect(getHomeForRole("SYSTEM_ADMIN")).toBe("/admin/dashboard");
    expect(getHomeForRole("OWNER")).toBe("/owner/dashboard");
    expect(getHomeForRole("EMPLOYEE")).toBe("/employee/home");
    expect(getHomeForRole("HR")).toBe("/hr/employees");
    expect(getHomeForRole("MANAGER")).toBe("/manager/tasks");
    expect(getHomeForRole("SYSTEM")).toBe("/forbidden");
  });

  it("normalizes legacy aliases for route permissions", () => {
    expect(normalizeRole("SYSTEM_ADMIN")).toBe("PLATFORM_ADMIN");
    expect(normalizeRole("OWNER")).toBe("BUSINESS_OWNER");
    expect(hasRole("OWNER", ["BUSINESS_OWNER"])).toBe(true);
    expect(hasRole("SYSTEM_ADMIN", ["PLATFORM_ADMIN"])).toBe(true);
  });

  it("checks role helpers", () => {
    expect(canAccessSystemAdmin("SYSTEM_ADMIN")).toBe(true);
    expect(canAccessOwner("OWNER")).toBe(true);
    expect(canAccessEmployee("EMPLOYEE")).toBe(true);
  });

  it("maps status labels", () => {
    expect(seniorityLabel("INTERN")).toBe("Thực tập sinh");
    expect(seniorityLabel(null)).toBe("Chưa cập nhật");
    expect(workspaceStatusLabel("PENDING_PAYMENT")).toBe("Chờ thanh toán");
    expect(paymentStatusLabel("CORRECTION_REQUESTED")).toBe("Cần bổ sung");
    expect(registrationStatusLabel("APPROVED")).toBe("Đã duyệt");
    expect(registrationStatusLabel("PAYMENT_CONFIRMED")).toBe("Đã xác nhận thanh toán");
    expect(paymentStatusLabel("CANCELLED")).toBe("Đã hủy");
    expect(roleFitLabel("STRONG")).toBe("Phù hợp cao");
  });

  it("detects overdue tasks only for active statuses", () => {
    const now = new Date("2026-06-29T10:00:00+07:00");
    expect(isTaskOverdue({ id: "1", title: "A", requirements: "R", deadline: "2026-06-28T10:00:00+07:00", status: "IN_PROGRESS" }, now)).toBe(true);
    expect(isTaskOverdue({ id: "1", title: "A", requirements: "R", deadline: "2026-06-28T10:00:00+07:00", status: "COMPLETED" }, now)).toBe(false);
  });
});

