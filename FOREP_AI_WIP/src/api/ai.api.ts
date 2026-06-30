import { apiClient } from "./client";
import { normalizeArray, unwrapApiResponse } from "./response";
import type { AiSuggestion, BusinessSummary, DelayRisk, WorkloadRecord } from "@/types/domain";

export async function getWorkloadSummary(): Promise<WorkloadRecord[]> {
  const response = await apiClient.get("/ai/workload-summary");
  return normalizeArray<WorkloadRecord>(response.data);
}

export async function getDelayRisks(): Promise<DelayRisk[]> {
  const response = await apiClient.get("/ai/delay-risks");
  return normalizeArray<DelayRisk>(response.data);
}

export async function getBusinessSummary(period: "daily" | "weekly" | "monthly"): Promise<BusinessSummary> {
  const response = await apiClient.get(`/ai/business-summary/${period}`);
  return unwrapApiResponse<BusinessSummary>(response.data);
}

export async function listAiSuggestions(): Promise<AiSuggestion[]> {
  const response = await apiClient.get("/ai/suggestions");
  return normalizeArray<AiSuggestion>(response.data);
}

export async function updateAiSuggestionStatus(id: string, status: "ACCEPTED" | "REJECTED"): Promise<AiSuggestion> {
  const response = await apiClient.patch(`/ai/suggestions/${id}/status`, null, { params: { status } });
  return unwrapApiResponse<AiSuggestion>(response.data);
}


