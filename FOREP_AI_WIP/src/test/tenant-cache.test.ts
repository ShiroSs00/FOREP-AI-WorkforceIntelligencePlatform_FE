import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/auth/auth-store";
import { queryKeys, removeProtectedQueries } from "@/lib/query-keys";
import type { User } from "@/types/domain";

function user(id: string, workspaceId: string): User {
  return { id, workspaceId, fullName: id, email: `${id}@example.invalid`, phone: null, username: id, employeeCode: null, initialPassword: null, role: "EMPLOYEE", permissions: [], avatar: null, status: "ACTIVE", jobTitle: null, seniorityLevel: null, skillRating: null, yearsOfExperience: null, skills: null, createdAt: "2026-07-19T00:00:00Z", updatedAt: "2026-07-19T00:00:00Z" };
}

describe("tenant query cache isolation", () => {
  beforeEach(() => useAuthStore.setState({ user: null, token: null }));

  it("includes workspace identity in employee and task keys", () => {
    useAuthStore.setState({ user: user("user-a", "workspace-a") });
    const employeesA = queryKeys.employees;
    const tasksA = queryKeys.tasks;
    useAuthStore.setState({ user: user("user-b", "workspace-b") });
    expect(queryKeys.employees).not.toEqual(employeesA);
    expect(queryKeys.tasks).not.toEqual(tasksA);
    expect(queryKeys.employees).toContain("workspace-b");
  });

  it("removes protected tenant data while preserving public plan data", () => {
    const client = new QueryClient();
    useAuthStore.setState({ user: user("user-a", "workspace-a") });
    client.setQueryData(queryKeys.employees, [{ id: "employee-a" }]);
    client.setQueryData(queryKeys.publicSubscriptionPlans, [{ id: "plan-public" }]);
    removeProtectedQueries(client);
    expect(client.getQueryData(queryKeys.employees)).toBeUndefined();
    expect(client.getQueryData(queryKeys.publicSubscriptionPlans)).toEqual([{ id: "plan-public" }]);
  });
});