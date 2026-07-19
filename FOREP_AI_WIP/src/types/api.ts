export type ApiErrorItem = {
  code?: string;
  message?: string;
  field?: string | null;
};

export type ApiResponse<T> = {
  data: T | null;
  meta: Record<string, unknown>;
  errors: ApiErrorItem[];
  requestId?: string;
};

export type ApiFailureKind = "validation" | "unauthenticated" | "forbidden" | "not-found" | "conflict" | "business-rule" | "rate-limited" | "server" | "network" | "unknown";

export type ApiFailure = {
  status?: number;
  message: string;
  kind?: ApiFailureKind;
  code?: string;
  details?: unknown;
  fieldErrors?: Record<string, string>;
  retryAfter?: number;
  requestId?: string;
};

export type PageResult<T> = {
  items: T[];
  totalElements?: number;
  totalPages?: number;
  page?: number;
  size?: number;
};