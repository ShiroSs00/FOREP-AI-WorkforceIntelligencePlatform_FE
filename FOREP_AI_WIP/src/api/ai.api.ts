import { apiClient } from "./client";
import { normalizeArray, normalizeObject, unwrapApiResponse } from "./response";
import type {
  ActionSuggestion,
  AiSuggestion,
  BusinessSummary,
  DailyReportInsight,
  DelayRisk,
  ExtractedTaskSuggestion,
  MissingReportInsight,
  TaskAdjustment,
  TaskSplitSuggestion,
  WorkloadRecord,
} from "@/types/domain";
import type { ExtractTasksRequest } from "@/types/requests";

export async function getWorkloadSummary(): Promise<WorkloadRecord[]> {
  const response = await apiClient.get("/ai/workload-summary");
  return normalizeArray<WorkloadRecord>(response.data);
}

export async function getDelayRisks(): Promise<DelayRisk[]> {
  const response = await apiClient.get("/ai/delay-risks");
  return normalizeArray<DelayRisk>(response.data);
}

export async function getActionSuggestions(): Promise<ActionSuggestion[]> {
  const response = await apiClient.get("/ai/action-suggestions");
  return normalizeArray<ActionSuggestion>(response.data);
}

export async function getDailyReportInsights(): Promise<DailyReportInsight | null> {
  const response = await apiClient.get("/ai/daily-reports/insights");
  return normalizeObject<DailyReportInsight>(response.data);
}

export async function getMissingReports(): Promise<MissingReportInsight[]> {
  const response = await apiClient.get("/ai/daily-reports/missing");
  return normalizeArray<MissingReportInsight>(response.data);
}

export async function getBusinessSummary(period: "daily" | "weekly" | "monthly"): Promise<BusinessSummary> {
  const response = await apiClient.get(`/ai/business-summary/${period}`);
  return unwrapApiResponse<BusinessSummary>(response.data);
}

export async function extractTasks(payload: ExtractTasksRequest): Promise<ExtractedTaskSuggestion[]> {
  const response = await apiClient.post("/ai/tasks/extract", payload);
  return normalizeArray<ExtractedTaskSuggestion>(response.data);
}

export async function splitTask(id: string): Promise<TaskSplitSuggestion[]> {
  const response = await apiClient.post(`/ai/tasks/${id}/split`);
  return normalizeArray<TaskSplitSuggestion>(response.data);
}

export async function adjustTask(id: string): Promise<TaskAdjustment | null> {
  const response = await apiClient.post(`/ai/tasks/${id}/adjust`);
  return normalizeObject<TaskAdjustment>(response.data);
}

export async function listAiSuggestions(): Promise<AiSuggestion[]> {
  const response = await apiClient.get("/ai/suggestions");
  return normalizeArray<AiSuggestion>(response.data);
}

export async function updateAiSuggestionStatus(id: string, status: "ACCEPTED" | "REJECTED"): Promise<AiSuggestion> {
  const response = await apiClient.patch(`/ai/suggestions/${id}/status`, null, { params: { status } });
  return unwrapApiResponse<AiSuggestion>(response.data);
}
