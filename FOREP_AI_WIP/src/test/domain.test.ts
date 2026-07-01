import { describe, expect, it } from "vitest";
import { seniorityLabel } from "@/lib/labels";
import { canAccessEmployee, canAccessOwner, getHomeForRole } from "@/lib/role";
import { isTaskOverdue } from "@/lib/tasks";

describe("domain helpers", () => {
  it("redirects by role", () => {
    expect(getHomeForRole("OWNER")).toBe("/owner/dashboard");
    expect(getHomeForRole("EMPLOYEE")).toBe("/employee/home");
  });

  it("checks role helpers", () => {
    expect(canAccessOwner("OWNER")).toBe(true);
    expect(canAccessEmployee("EMPLOYEE")).toBe(true);
  });

  it("maps seniority labels", () => {
    expect(seniorityLabel("INTERN")).toBe("Thực tập sinh");
    expect(seniorityLabel(null)).toBe("Chưa cập nhật");
  });

  it("detects overdue tasks only for active statuses", () => {
    const now = new Date("2026-06-29T10:00:00+07:00");
    expect(isTaskOverdue({ id: "1", title: "A", requirements: "R", deadline: "2026-06-28T10:00:00+07:00", status: "IN_PROGRESS" }, now)).toBe(true);
    expect(isTaskOverdue({ id: "1", title: "A", requirements: "R", deadline: "2026-06-28T10:00:00+07:00", status: "COMPLETED" }, now)).toBe(false);
  });
});
