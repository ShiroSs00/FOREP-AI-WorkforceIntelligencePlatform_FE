import { apiClient, workspacePath } from "./client";
import { normalizeArray, normalizeObject } from "./response";
import type { AiHistoryItem, AiResult, AiTaskAnalysis } from "@/types/domain";
import type { AnalyzeTaskRequest, EmployeeReportAiRequest, EstimateHoursRequest, RecommendationExplanationRequest, RecommendationResultExplanationRequest, WorkloadRiskExplanationRequest } from "@/types/requests";

export const workspaceAiPaths = {
  analyzeTask: workspacePath("/ai/tasks/analyze"),
  history: workspacePath("/ai-history"),
  explainRanking: workspacePath("/ai/recommendations/explain"),
  explainSelection: workspacePath("/ai/recommendations/result/explain"),
  estimateHours: workspacePath("/ai/tasks/estimate-hours"),
  workloadRisk: workspacePath("/ai/workload/risk"),
  employeeReport: workspacePath("/ai/employee-report"),
  ownerSummary: workspacePath("/ai/business-owner/operational-summary"),
} as const;

export type AiHistoryFilters = {
  function?: string;
  status?: string;
  from?: string;
  to?: string;
  caller?: string;
  limit?: number;
  offset?: number;
};

export async function analyzeWorkspaceTask(payload: AnalyzeTaskRequest): Promise<AiTaskAnalysis | null> {
  const response = await apiClient.post(workspaceAiPaths.analyzeTask, payload);
  return normalizeObject<AiTaskAnalysis>(response.data);
}

export async function listAiHistory(filters: AiHistoryFilters = {}): Promise<AiHistoryItem[]> {
  const response = await apiClient.get(workspaceAiPaths.history, { params: filters });
  return normalizeArray<AiHistoryItem>(response.data);
}

async function postAi(path: string, payload: unknown): Promise<AiResult | null> {
  const response = await apiClient.post(path, payload);
  return normalizeObject<AiResult>(response.data);
}

export const explainRecommendationRanking = (payload: RecommendationExplanationRequest) => postAi(workspaceAiPaths.explainRanking, payload);
export const explainRecommendationResult = (payload: RecommendationResultExplanationRequest) => postAi(workspaceAiPaths.explainSelection, payload);
export const estimateTaskHours = (payload: EstimateHoursRequest) => postAi(workspaceAiPaths.estimateHours, payload);
export const explainWorkloadRisk = (payload: WorkloadRiskExplanationRequest) => postAi(workspaceAiPaths.workloadRisk, payload);
export const generateEmployeeReportDraft = (payload: EmployeeReportAiRequest) => postAi(workspaceAiPaths.employeeReport, payload);

export async function getBusinessOwnerOperationalSummary(): Promise<AiResult | null> {
  const response = await apiClient.get(workspaceAiPaths.ownerSummary);
  return normalizeObject<AiResult>(response.data);
}
