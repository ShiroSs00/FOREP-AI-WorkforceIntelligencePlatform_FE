import { apiClient } from "./client";
import { unwrapApiResponse } from "./response";
import type { User } from "@/types/domain";
import type { ChangePasswordRequest, LoginRequest } from "@/types/requests";

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

export async function changePassword(payload: ChangePasswordRequest): Promise<unknown> {
  const response = await apiClient.patch("/auth/change-password", payload);
  return unwrapApiResponse<unknown>(response.data);
}


