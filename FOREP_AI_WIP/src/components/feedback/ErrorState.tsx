"use client";

import { useState } from "react";
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
      kind: typeof error.kind === "string" ? error.kind as ApiFailure["kind"] : undefined,
      code: typeof error.code === "string" ? error.code : undefined,
      fieldErrors: isRecord(error.fieldErrors) ? Object.fromEntries(Object.entries(error.fieldErrors).filter((entry): entry is [string, string] => typeof entry[1] === "string")) : undefined,
      requestId: typeof error.requestId === "string" ? error.requestId : undefined,
    };
  }
  if (error instanceof Error) return { message: error.message };
  return { message: "Hệ thống chưa phản hồi. Vui lòng thử lại." };
}

function fallbackMessage(failure: ApiFailure): string {
  if (failure.message) return failure.message;
  if (failure.status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (failure.status === 403) return "Tài khoản hiện tại không có quyền xem hoặc thực hiện thao tác này.";
  if (failure.status === 404) return "Không tìm thấy dữ liệu được yêu cầu.";
  if (failure.status === 409) return "Thao tác có thể đã được tiến trình khác hoàn tất. Vui lòng tải lại dữ liệu.";
  if (failure.status && failure.status >= 500) return "Backend đang gặp lỗi khi xử lý yêu cầu. Bạn có thể thử lại sau ít phút.";
  return "Không thể kết nối tới hệ thống. Vui lòng thử lại.";
}

export function ErrorState({
  title = "Không thể tải dữ liệu",
  error,
  onRetry,
  guidance,
}: {
  title?: string;
  error: ApiFailure | Error | unknown;
  onRetry?: () => void;
  guidance?: string;
}) {
  const failure = normalize(error);
  const [copied, setCopied] = useState(false);
  const fieldErrors = Object.entries(failure.fieldErrors ?? {});

  return (
    <div className="rounded-card border border-amber-200 bg-amber-50 p-5 text-amber-950" role="alert">
      <h3 className="font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6">{fallbackMessage(failure)}</p>
      {guidance ? <p className="mt-2 text-sm leading-6 text-amber-900">{guidance}</p> : null}
      {fieldErrors.length > 0 ? <ul className="mt-3 list-disc pl-5 text-sm">{fieldErrors.map(([field, message]) => <li key={field}><strong>{field}:</strong> {message}</li>)}</ul> : null}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {onRetry ? <Button variant="secondary" onClick={onRetry}>Thử lại</Button> : null}
        {failure.requestId ? (
          <details className="text-xs">
            <summary className="cursor-pointer font-semibold">Mã yêu cầu hỗ trợ</summary>
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-control bg-white/75 p-2">
              <code className="break-all" translate="no">{failure.requestId}</code>
              <Button variant="ghost" className="min-h-9 px-3 py-1.5 text-xs" onClick={async () => { await navigator.clipboard.writeText(failure.requestId ?? ""); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }}>{copied ? "Đã sao chép" : "Sao chép"}</Button>
            </div>
          </details>
        ) : null}
      </div>
    </div>
  );
}