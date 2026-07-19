import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

export function invalidateAdminLifecycleQueries(client: QueryClient, workspaceId?: string): void {
  void client.invalidateQueries({ queryKey: queryKeys.adminWorkspaces });
  if (workspaceId) void client.invalidateQueries({ queryKey: queryKeys.adminWorkspaceDetail(workspaceId) });
  void client.invalidateQueries({ queryKey: queryKeys.adminDashboardOverview });
  void client.invalidateQueries({ queryKey: ["admin", "dashboard", "revenue"] });
  void client.invalidateQueries({ queryKey: ["admin", "dashboard", "workspaces"] });
  void client.invalidateQueries({ queryKey: queryKeys.adminPaymentSummary });
  void client.invalidateQueries({ queryKey: queryKeys.adminWorkspaceRegistrations });
  void client.invalidateQueries({ queryKey: ["admin", "payments"] });
}
