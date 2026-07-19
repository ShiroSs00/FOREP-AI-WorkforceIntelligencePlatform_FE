import { apiClient, workspacePath } from "./client";
import { normalizeArray, unwrapApiResponse } from "./response";
import type { BusinessOwnerDashboard, MonthlyWorkload, WorkloadRecord } from "@/types/domain";

export async function getOwnerDashboard(): Promise<BusinessOwnerDashboard> {
  const response = await apiClient.get(workspacePath("/business-owner/dashboard"));
  return unwrapApiResponse<BusinessOwnerDashboard>(response.data);
}

export async function getWorkspaceWorkload(): Promise<WorkloadRecord[]> {
  const response = await apiClient.get("/analytics/workload");
  return normalizeArray<WorkloadRecord>(response.data);
}

export async function getMonthlyWorkload(year: number, month: number): Promise<MonthlyWorkload[]> {
  const response = await apiClient.get(workspacePath("/workload/monthly"), { params: { year, month } });
  return normalizeArray<MonthlyWorkload>(response.data);
}
