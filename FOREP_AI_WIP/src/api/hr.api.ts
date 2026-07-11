import { workspaceApiClient } from "./client";
import { normalizeArray, unwrapApiResponse } from "./response";
import type { JobPosition } from "@/types/domain";
import type { JobPositionRequest } from "@/types/requests";

export async function listJobPositions(): Promise<JobPosition[]> {
  const response = await workspaceApiClient.get("/hr/job-positions");
  return normalizeArray<JobPosition>(response.data);
}

export async function createJobPosition(payload: JobPositionRequest): Promise<JobPosition> {
  const response = await workspaceApiClient.post("/hr/job-positions", payload);
  return unwrapApiResponse<JobPosition>(response.data);
}

export async function updateJobPosition(id: string, payload: JobPositionRequest): Promise<JobPosition> {
  const response = await workspaceApiClient.put(`/hr/job-positions/${id}`, payload);
  return unwrapApiResponse<JobPosition>(response.data);
}

export async function updateJobPositionStatus(id: string, status: "ACTIVE" | "INACTIVE"): Promise<JobPosition> {
  const response = await workspaceApiClient.patch(`/hr/job-positions/${id}/status`, undefined, { params: { status } });
  return unwrapApiResponse<JobPosition>(response.data);
}
