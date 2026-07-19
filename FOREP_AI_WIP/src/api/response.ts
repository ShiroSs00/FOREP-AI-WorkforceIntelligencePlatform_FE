import type { ApiResponse, PageResult } from "@/types/api";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstEnvelopeValue(payload: unknown): unknown {
  if (!isRecord(payload)) return payload;
  for (const key of ["data", "result", "payload"] as const) {
    if (key in payload) return payload[key];
  }
  return payload;
}

export function unwrapApiResponse<T>(payload: unknown): T {
  if (isRecord(payload) && "errors" in payload && Array.isArray(payload.errors) && payload.errors.length > 0) {
    const first = payload.errors.find((item): item is Record<string, unknown> => isRecord(item));
    const message = typeof first?.message === "string" ? first.message : "Yêu cầu không thành công";
    throw new Error(message);
  }

  return firstEnvelopeValue(payload) as T;
}

export function normalizeApiResponse<T>(payload: unknown): ApiResponse<T> {
  if (isRecord(payload) && ("data" in payload || "errors" in payload || "meta" in payload || "metadata" in payload)) {
    const meta = isRecord(payload.meta) ? payload.meta : isRecord(payload.metadata) ? payload.metadata : {};
    return {
      data: "data" in payload ? (payload.data as T | null) : null,
      meta,
      errors: Array.isArray(payload.errors) ? payload.errors : [],
      requestId: typeof meta.requestId === "string" ? meta.requestId : undefined,
    };
  }

  return { data: payload as T, meta: {}, errors: [] };
}

export function extractRequestId(payload: unknown): string | undefined {
  if (!isRecord(payload)) return undefined;
  const meta = isRecord(payload.meta) ? payload.meta : isRecord(payload.metadata) ? payload.metadata : undefined;
  if (typeof meta?.requestId === "string" && meta.requestId.trim()) return meta.requestId;
  return typeof payload.requestId === "string" && payload.requestId.trim() ? payload.requestId : undefined;
}

export function normalizeArray<T>(payload: unknown): T[] {
  const value = unwrapApiResponse<unknown>(payload);
  if (Array.isArray(value)) return value as T[];
  if (isRecord(value)) {
    for (const key of ["content", "items", "result", "payload", "data"] as const) {
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

function findStringDeep(payload: unknown, keys: readonly string[]): string | null {
  if (!isRecord(payload)) return null;
  for (const key of keys) {
    if (typeof payload[key] === "string") return payload[key];
  }
  for (const key of ["data", "result", "payload"] as const) {
    const nested = findStringDeep(payload[key], keys);
    if (nested) return nested;
  }
  return null;
}

export function extractToken(payload: unknown): string | null {
  return findStringDeep(payload, ["token", "accessToken", "jwt"]);
}

export function extractUser<T>(payload: unknown): T | null {
  const value = unwrapApiResponse<unknown>(payload);
  if (!isRecord(value)) return null;
  for (const key of ["user", "currentUser", "account"] as const) {
    if (isRecord(value[key])) return value[key] as T;
  }
  return value as T;
}

export function safeParseJsonObject(value: unknown): Record<string, unknown> | null {
  if (isRecord(value)) return value;
  if (typeof value !== "string" || value.trim().length === 0) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function toReadableText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (!isRecord(value)) return "Chưa có nội dung chi tiết.";
  const preferred = ["summary", "content", "description", "reason", "recommendedAction", "message", "title"];
  const lines = preferred
    .map((key) => value[key])
    .filter((item): item is string | number | boolean => ["string", "number", "boolean"].includes(typeof item))
    .map(String);
  return lines.length > 0 ? lines.join("\n") : "Backend đã trả dữ liệu, nhưng chưa có trường mô tả để hiển thị.";
}

export function formatConfidence(value?: number): string {
  if (value === undefined || Number.isNaN(value)) return "—";
  const normalized = value <= 1 ? value * 100 : value;
  return `${Math.round(normalized)}%`;
}
