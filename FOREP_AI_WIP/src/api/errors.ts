import axios from "axios";
import type { ApiFailure } from "@/types/api";
import { isRecord } from "./response";

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

export function normalizeApiError(error: unknown): ApiFailure {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return { message: "Backend đang khởi động hoặc chưa phản hồi kịp. Vui lòng thử lại.", details: error.message };
    }
    const status = error.response?.status;
    const backendMessage = extractBackendMessage(error.response?.data);
    const details = error.response?.data;
    const fieldErrors = extractFieldErrors(details);
    const code = extractCode(details);
    if (status === 401) return { status, message: backendMessage ?? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", details, fieldErrors, code };
    if (status === 403) return { status, message: backendMessage ?? "Bạn không có quyền thực hiện thao tác này.", details, fieldErrors, code };
    if (status === 404) return { status, message: backendMessage ?? "Chức năng này chưa có trên backend.", details, fieldErrors, code };
    if (status && status >= 500) return { status, message: backendMessage ?? "Backend đang lỗi. Vui lòng kiểm tra lại sau.", details, fieldErrors, code };
    if (status) return { status, message: backendMessage ?? "Yêu cầu không hợp lệ.", details, fieldErrors, code };
    return { message: "Không thể kết nối backend. Vui lòng kiểm tra mạng, CORS hoặc trạng thái server.", details: error.message };
  }
  if (error instanceof Error) return { message: error.message };
  return { message: "Đã xảy ra lỗi không xác định.", details: error };
}

export function getErrorMessage(error: unknown): string {
  return normalizeApiError(error).message;
}
