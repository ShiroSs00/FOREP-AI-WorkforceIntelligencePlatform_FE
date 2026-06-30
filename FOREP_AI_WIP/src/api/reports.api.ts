import { apiClient } from "./client";
import { normalizeArray, unwrapApiResponse } from "./response";
import type { DailyReport } from "@/types/domain";
import type { DailyReportRequest } from "@/types/requests";

export async function listDailyReports(): Promise<DailyReport[]> {
  const response = await apiClient.get("/daily-reports");
  return normalizeArray<DailyReport>(response.data);
}

export async function createDailyReport(payload: DailyReportRequest): Promise<DailyReport> {
  const response = await apiClient.post("/daily-reports", payload);
  return unwrapApiResponse<DailyReport>(response.data);
}

export async function getDailyReport(id: string): Promise<DailyReport> {
  const response = await apiClient.get(`/daily-reports/${id}`);
  return unwrapApiResponse<DailyReport>(response.data);
}

export async function reviewDailyReport(id: string): Promise<DailyReport> {
  const response = await apiClient.patch(`/daily-reports/${id}/review`);
  return unwrapApiResponse<DailyReport>(response.data);
}


