import { apiClient } from "./client";
import { normalizeArray, unwrapApiResponse } from "./response";
import type { OwnerDashboard, WorkloadRecord } from "@/types/domain";

export async function getOwnerDashboard(): Promise<OwnerDashboard> {
  const response = await apiClient.get("/analytics/owner-dashboard");
  return unwrapApiResponse<OwnerDashboard>(response.data);
}

export async function getWorkspaceWorkload(): Promise<WorkloadRecord[]> {
  const response = await apiClient.get("/analytics/workload");
  return normalizeArray<WorkloadRecord>(response.data);
}


