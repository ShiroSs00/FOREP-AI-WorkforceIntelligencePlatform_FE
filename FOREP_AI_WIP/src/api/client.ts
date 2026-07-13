import axios from "axios";
import { clearAuthState, getAuthToken } from "@/auth/auth-store";
import { getApiOrigin } from "@/lib/env";
import { normalizeApiError } from "./errors";

export const API_PREFIX = {
  authenticated: "/api/v1",
  public: "/api/public",
  admin: "/api/admin",
  workspace: "/api/workspace",
} as const;

function join(prefix: string, path: string): string {
  return `${prefix}${path.startsWith("/") ? path : `/${path}`}`;
}

export const authenticatedPath = (path: string) => join(API_PREFIX.authenticated, path);
export const publicPath = (path: string) => join(API_PREFIX.public, path);
export const adminPath = (path: string) => join(API_PREFIX.admin, path);
export const workspacePath = (path: string) => join(API_PREFIX.workspace, path);

export const apiClient = axios.create({ baseURL: getApiOrigin(), timeout: 15000, headers: { "Content-Type": "application/json" } });

apiClient.interceptors.request.use((config) => {
  const originalUrl = config.url ?? "";
  config.url = originalUrl.startsWith("/api/") ? originalUrl : authenticatedPath(originalUrl);
  const publicRequest = config.url.startsWith(API_PREFIX.public);
  const token = typeof window === "undefined" || publicRequest ? null : getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  else delete config.headers.Authorization;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalized = normalizeApiError(error);
    const requestUrl = axios.isAxiosError(error) ? error.config?.url ?? "" : "";
    if (normalized.status === 401 && typeof window !== "undefined" && !requestUrl.startsWith(API_PREFIX.public)) {
      clearAuthState();
      if (!window.location.pathname.startsWith("/login")) window.location.assign("/login?reason=session-expired");
    }
    return Promise.reject(normalized);
  },
);
