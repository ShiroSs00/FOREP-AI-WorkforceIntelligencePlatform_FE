import type { ApiResponse, PageResult } from "@/types/api";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function unwrapApiResponse<T>(payload: unknown): T {
  if (isRecord(payload) && "errors" in payload && Array.isArray(payload.errors) && payload.errors.length > 0) {
    const first = payload.errors.find((item): item is Record<string, unknown> => isRecord(item));
    const message = typeof first?.message === "string" ? first.message : "Yêu cầu không thành công";
    throw new Error(message);
  }

  if (isRecord(payload) && "data" in payload) {
    return payload.data as T;
  }

  return payload as T;
}

export function normalizeApiResponse<T>(payload: unknown): ApiResponse<T> {
  if (isRecord(payload) && "data" in payload) {
    return {
      data: payload.data as T | null,
      meta: isRecord(payload.meta) ? payload.meta : {},
      errors: Array.isArray(payload.errors) ? payload.errors : [],
    };
  }

  return { data: payload as T, meta: {}, errors: [] };
}

export function normalizeArray<T>(payload: unknown): T[] {
  const value = unwrapApiResponse<unknown>(payload);
  if (Array.isArray(value)) return value as T[];
  if (isRecord(value)) {
    for (const key of ["content", "items", "result", "payload"] as const) {
      const nested = value[key];
      if (Array.isArray(nested)) return nested as T[];
    }
  }
  return [];
}

export function normalizeObject<T>(payload: unknown): T | null {
  const value = unwrapApiResponse<unknown>(payload);
  return isRecord(value) ? (value as T) : null;
}

export function normalizePage<T>(payload: unknown): PageResult<T> {
  const value = unwrapApiResponse<unknown>(payload);
  if (Array.isArray(value)) return { items: value as T[] };
  if (!isRecord(value)) return { items: [] };
  const items = Array.isArray(value.content) ? value.content : Array.isArray(value.items) ? value.items : [];
  return {
    items: items as T[],
    totalElements: typeof value.totalElements === "number" ? value.totalElements : typeof value.total === "number" ? value.total : undefined,
    totalPages: typeof value.totalPages === "number" ? value.totalPages : undefined,
    page: typeof value.number === "number" ? value.number : typeof value.page === "number" ? value.page : undefined,
    size: typeof value.size === "number" ? value.size : undefined,
  };
}

export function extractToken(payload: unknown): string | null {
  const value = unwrapApiResponse<unknown>(payload);
  if (!isRecord(value)) return null;
  for (const key of ["token", "accessToken", "jwt"] as const) {
    if (typeof value[key] === "string") return value[key];
  }
  return null;
}

export function extractUser<T>(payload: unknown): T | null {
  const value = unwrapApiResponse<unknown>(payload);
  if (!isRecord(value)) return null;
  if (isRecord(value.user)) return value.user as T;
  return value as T;
}


