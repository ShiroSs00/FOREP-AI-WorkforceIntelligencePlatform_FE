import { apiClient } from "./client";
import { unwrapApiResponse } from "./response";
import type { Workspace } from "@/types/domain";
import type { UpdateWorkspaceRequest } from "@/types/requests";

export async function getCurrentWorkspace(): Promise<Workspace> {
  const response = await apiClient.get("/workspaces/current");
  return unwrapApiResponse<Workspace>(response.data);
}

export async function updateCurrentWorkspace(payload: UpdateWorkspaceRequest): Promise<Workspace> {
  const response = await apiClient.put("/workspaces/current", payload);
  return unwrapApiResponse<Workspace>(response.data);
}


