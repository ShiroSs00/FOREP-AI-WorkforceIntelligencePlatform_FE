import axios from "axios";
import { getApiBaseUrl } from "@/lib/env";
import { clearAuthState, getAuthToken } from "@/auth/auth-store";
import { normalizeApiError } from "./errors";

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

const workspaceBaseUrl = getApiBaseUrl().replace(/\/api\/v1\/?$/, "/api/workspace");
export const workspaceApiClient = axios.create({
  baseURL: workspaceBaseUrl,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = typeof window === "undefined" ? null : getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

workspaceApiClient.interceptors.request.use((config) => {
  const token = typeof window === "undefined" ? null : getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalized = normalizeApiError(error);
    if (normalized.status === 401 && typeof window !== "undefined") {
      clearAuthState();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login?reason=session-expired");
      }
    }
    return Promise.reject(normalized);
  },
);

workspaceApiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalized = normalizeApiError(error);
    if (normalized.status === 401 && typeof window !== "undefined") {
      clearAuthState();
      if (!window.location.pathname.startsWith("/login")) window.location.assign("/login?reason=session-expired");
    }
    return Promise.reject(normalized);
  },
);


