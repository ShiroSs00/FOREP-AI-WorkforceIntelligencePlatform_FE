export type ApiErrorItem = {
  code?: string;
  message?: string;
  field?: string | null;
};

export type ApiResponse<T> = {
  data: T | null;
  meta: Record<string, unknown>;
  errors: ApiErrorItem[];
};

export type ApiFailure = {
  status?: number;
  message: string;
  details?: unknown;
  fieldErrors?: Record<string, string>;
};

export type PageResult<T> = {
  items: T[];
  totalElements?: number;
  totalPages?: number;
  page?: number;
  size?: number;
};


