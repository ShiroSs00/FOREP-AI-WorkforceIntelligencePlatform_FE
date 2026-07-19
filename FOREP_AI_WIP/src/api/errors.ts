import axios from "axios";
import type { ApiFailure } from "@/types/api";
import { extractRequestId, isRecord } from "./response";

function extractBackendMessage(data: unknown): string | null {
  if (!isRecord(data)) return null;
  if (typeof data.message === "string") return data.message;
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const firstString = data.errors.find((item): item is string => typeof item === "string");
    if (firstString) return firstString;
    const first = data.errors.find((item): item is Record<string, unknown> => isRecord(item));
    if (typeof first?.message === "string") return first.message;
  }
  return null;
}

function extractFieldErrors(data: unknown): Record<string, string> | undefined {
  if (!isRecord(data) || !Array.isArray(data.errors)) return undefined;
  const entries = data.errors
    .filter((item): item is Record<string, unknown> => isRecord(item) && typeof item.field === "string" && typeof item.message === "string")
    .map((item) => [String(item.field), String(item.message)] as const);
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function extractCode(data: unknown): string | undefined {
  if (!isRecord(data) || !Array.isArray(data.errors)) return undefined;
  const first = data.errors.find((item): item is Record<string, unknown> => isRecord(item));
  return typeof first?.code === "string" ? first.code : undefined;
}

function parseRetryAfter(value: unknown): number | undefined {
  if (typeof value !== "string") return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return seconds;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return undefined;
  return Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
}

export function normalizeApiError(error: unknown): ApiFailure {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return { kind: "network", message: "Backend đang khởi động hoặc chưa phản hồi kịp. Vui lòng thử lại." };
    }
    const status = error.response?.status;
    const backendMessage = extractBackendMessage(error.response?.data);
    const details = error.response?.data;
    const fieldErrors = extractFieldErrors(details);
    const code = extractCode(details);
    const retryAfter = parseRetryAfter(error.response?.headers?.["retry-after"]);
    const headerRequestId = error.response?.headers?.["x-request-id"] ?? error.response?.headers?.["request-id"];
    const requestId = typeof headerRequestId === "string" && headerRequestId.trim() ? headerRequestId : extractRequestId(details);
    const common = { status, fieldErrors, code, requestId };
    if (status === 401) return { ...common, kind: "unauthenticated", message: backendMessage ?? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };
    if (status === 403) return { ...common, kind: "forbidden", message: backendMessage ?? "Bạn không có quyền thực hiện thao tác này." };
    if (status === 404) return { ...common, kind: "not-found", message: backendMessage ?? "Không tìm thấy dữ liệu được yêu cầu." };
    if (status === 409) return { ...common, kind: "conflict", message: backendMessage ?? "Thao tác có thể đã được một tiến trình khác hoàn tất. Vui lòng tải lại dữ liệu." };
    if (status === 422 || code === "BUSINESS_RULE_ERROR") return { ...common, kind: "business-rule", message: backendMessage ?? "Không thể hoàn tất do quy tắc nghiệp vụ." };
    if (status === 429 || code === "AI_RATE_LIMITED") return { ...common, kind: "rate-limited", message: backendMessage ?? "Hệ thống đang xử lý nhiều yêu cầu. Vui lòng thử lại sau.", code: code ?? "AI_RATE_LIMITED", retryAfter };
    if (status === 400) return { ...common, kind: "validation", message: backendMessage ?? "Dữ liệu chưa hợp lệ. Vui lòng kiểm tra các trường được đánh dấu." };
    if (status && status >= 500) return { ...common, kind: "server", message: backendMessage ?? "Backend đang lỗi. Vui lòng kiểm tra lại sau." };
    if (status) return { ...common, kind: "unknown", message: backendMessage ?? "Yêu cầu không hợp lệ." };
    return { kind: "network", message: "Không thể kết nối backend. Vui lòng kiểm tra mạng hoặc trạng thái server." };
  }
  if (error instanceof Error) return { kind: "unknown", message: error.message };
  return { kind: "unknown", message: "Đã xảy ra lỗi không xác định." };
}

export function getErrorMessage(error: unknown): string {
  return normalizeApiError(error).message;
}