import { describe, expect, it } from "vitest";
import { getHomeForRole } from "@/lib/role";
import { isTaskOverdue } from "@/lib/tasks";

describe("domain helpers", () => {
  it("redirects by role", () => {
    expect(getHomeForRole("OWNER")).toBe("/owner/dashboard");
    expect(getHomeForRole("EMPLOYEE")).toBe("/employee/home");
  });

  it("detects overdue tasks only for active statuses", () => {
    const now = new Date("2026-06-29T10:00:00+07:00");
    expect(isTaskOverdue({ id: "1", title: "A", requirements: "R", deadline: "2026-06-28T10:00:00+07:00", status: "IN_PROGRESS" }, now)).toBe(true);
    expect(isTaskOverdue({ id: "1", title: "A", requirements: "R", deadline: "2026-06-28T10:00:00+07:00", status: "COMPLETED" }, now)).toBe(false);
  });
});


