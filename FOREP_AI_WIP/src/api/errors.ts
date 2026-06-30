import axios from "axios";
import type { ApiFailure } from "@/types/api";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractBackendMessage(data: unknown): string | null {
  if (!isRecord(data)) return null;
  if (typeof data.message === "string") return data.message;
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const first = data.errors.find((item): item is Record<string, unknown> => isRecord(item));
    if (typeof first?.message === "string") return first.message;
  }
  return null;
}

export function normalizeApiError(error: unknown): ApiFailure {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return { message: "Backend đang khởi động hoặc chưa phản hồi kịp. Vui lòng thử lại.", details: error.message };
    }
    const status = error.response?.status;
    const backendMessage = extractBackendMessage(error.response?.data);
    if (status === 401) return { status, message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", details: error.response?.data };
    if (status === 403) return { status, message: "Bạn không có quyền thực hiện thao tác này.", details: error.response?.data };
    if (status === 404) return { status, message: "Chức năng này chưa có trên backend.", details: error.response?.data };
    if (status && status >= 500) return { status, message: backendMessage ?? "Backend đang lỗi. Vui lòng kiểm tra lại sau.", details: error.response?.data };
    if (status) return { status, message: backendMessage ?? "Yêu cầu không hợp lệ.", details: error.response?.data };
    return { message: "Không thể kết nối backend. Vui lòng kiểm tra CORS, mạng hoặc trạng thái server.", details: error.message };
  }
  if (error instanceof Error) return { message: error.message };
  return { message: "Đã xảy ra lỗi không xác định.", details: error };
}

export function getErrorMessage(error: unknown): string {
  return normalizeApiError(error).message;
}


