import { apiClient } from "./client";
import { unwrapApiResponse } from "./response";
import type { User } from "@/types/domain";
import type { LoginRequest, RegisterWorkspaceRequest } from "@/types/requests";

export type LoginResult = { token?: string; accessToken?: string; jwt?: string; user?: User };

export async function login(payload: LoginRequest): Promise<LoginResult> {
  const response = await apiClient.post("/auth/login", payload);
  return unwrapApiResponse<LoginResult>(response.data);
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get("/auth/me");
  return unwrapApiResponse<User>(response.data);
}

export async function registerWorkspace(payload: RegisterWorkspaceRequest): Promise<unknown> {
  const response = await apiClient.post("/workspaces/register", payload);
  return unwrapApiResponse<unknown>(response.data);
}


