import type { ApiFailure } from "@/types/api";
import { Button } from "@/components/common/Button";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalize(error: ApiFailure | Error | unknown): ApiFailure {
  if (isRecord(error) && typeof error.message === "string") {
    return {
      message: error.message,
      status: typeof error.status === "number" ? error.status : undefined,
      details: error.details,
    };
  }
  if (error instanceof Error) return { message: error.message };
  return { message: "Hệ thống chưa phản hồi. Vui lòng thử lại." };
}

function friendlyMessage(failure: ApiFailure): string {
  if (failure.status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (failure.status === 403) return "Tài khoản hiện tại không có quyền xem hoặc thực hiện thao tác này.";
  if (failure.status === 404) return "Chức năng này chưa khả dụng trên hệ thống.";
  if (failure.status && failure.status >= 500) return "Backend đang gặp lỗi khi xử lý yêu cầu. Bạn có thể thử lại sau ít phút.";
  return failure.message || "Không thể kết nối tới hệ thống. Vui lòng thử lại.";
}

export function ErrorState({
  title = "Không thể tải dữ liệu",
  error,
  onRetry,
}: {
  title?: string;
  error: ApiFailure | Error | unknown;
  onRetry?: () => void;
}) {
  const failure = normalize(error);
  const details = failure.details ? JSON.stringify(failure.details, null, 2) : undefined;
  return (
    <div className="rounded-card border border-amber-200 bg-amber-50 p-5 text-amber-950">
      <h3 className="font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6">{friendlyMessage(failure)}</p>
      {failure.status ? <p className="mt-1 text-xs font-semibold">Mã lỗi: {failure.status}</p> : null}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {onRetry ? <Button variant="secondary" onClick={onRetry}>Thử lại</Button> : null}
        {details ? (
          <details className="text-xs">
            <summary className="cursor-pointer font-semibold">Xem chi tiết kỹ thuật</summary>
            <pre className="app-scrollbar mt-2 max-h-48 overflow-auto rounded-xl bg-white/75 p-3 text-left">{details}</pre>
          </details>
        ) : null}
      </div>
    </div>
  );
}
