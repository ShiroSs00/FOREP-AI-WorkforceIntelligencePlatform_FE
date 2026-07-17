import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/api/client";
import { acceptTask, approveTaskCompletion, returnTaskForRevision, submitTaskCompletion } from "@/api/tasks.api";
import { workspaceAiPaths } from "@/api/workspace-ai.api";

describe("production task workflow API", () => {
  afterEach(() => vi.restoreAllMocks());

  it("uses dedicated endpoints and exact request bodies", async () => {
    const patch = vi.spyOn(apiClient, "patch").mockResolvedValue({ data: { data: { id: "task-1", title: "Task", requirements: "R" } } });
    await acceptTask("task-1");
    await submitTaskCompletion("task-1", { content: "Đã hoàn thành", attachment: "https://example.com/result" });
    await approveTaskCompletion("task-1");
    await returnTaskForRevision("task-1", { reason: "Cần bổ sung kiểm thử" });
    expect(patch).toHaveBeenNthCalledWith(1, "/api/workspace/tasks/task-1/accept");
    expect(patch).toHaveBeenNthCalledWith(2, "/api/workspace/tasks/task-1/submit-completion", { content: "Đã hoàn thành", attachment: "https://example.com/result" });
    expect(patch).toHaveBeenNthCalledWith(3, "/api/workspace/tasks/task-1/approve-completion");
    expect(patch).toHaveBeenNthCalledWith(4, "/api/workspace/tasks/task-1/return", { reason: "Cần bổ sung kiểm thử" });
  });

  it("uses only workspace AI helper paths", () => {
    expect(workspaceAiPaths.explainRanking).toBe("/api/workspace/ai/recommendations/explain");
    expect(workspaceAiPaths.explainSelection).toBe("/api/workspace/ai/recommendations/result/explain");
    expect(workspaceAiPaths.estimateHours).toBe("/api/workspace/ai/tasks/estimate-hours");
    expect(workspaceAiPaths.workloadRisk).toBe("/api/workspace/ai/workload/risk");
    expect(workspaceAiPaths.employeeReport).toBe("/api/workspace/ai/employee-report");
    expect(workspaceAiPaths.ownerSummary).toBe("/api/workspace/ai/business-owner/operational-summary");
  });
});
