import axios from "axios";
import { describe, expect, it } from "vitest";
import { normalizeApiError } from "@/api/errors";
import { normalizeApiResponse } from "@/api/response";
import { safeAuditMetadata } from "@/lib/audit-log";
import { shouldRetryQuery } from "@/lib/query-policy";
import { getSafeReturnTo } from "@/lib/safe-return-to";

describe("frontend security contracts", () => {
  it("preserves response metadata request ID without leaking the envelope", () => {
    const result = normalizeApiResponse<{ ok: boolean }>({ data: { ok: true }, meta: { requestId: "request-support-1", timestamp: "2026-07-19T00:00:00Z" }, errors: [] });
    expect(result.data).toEqual({ ok: true });
    expect(result.requestId).toBe("request-support-1");
  });

  it("classifies conflicts and extracts request ID from the response header", () => {
    const error = new axios.AxiosError("conflict", "ERR_BAD_REQUEST", undefined, undefined, { status: 409, statusText: "Conflict", headers: { "x-request-id": "request-support-2" }, config: {} as never, data: { errors: [{ code: "CONFLICT", message: "Batch đã được xác nhận" }] } });
    expect(normalizeApiError(error)).toMatchObject({ kind: "conflict", message: "Batch đã được xác nhận", requestId: "request-support-2" });
  });

  it("allows only safe internal return paths", () => {
    expect(getSafeReturnTo("/tasks/task-1?tab=updates")).toBe("/tasks/task-1?tab=updates");
    expect(getSafeReturnTo("https://example.com/steal")).toBeNull();
    expect(getSafeReturnTo("//example.com/steal")).toBeNull();
    expect(getSafeReturnTo("javascript:alert(1)")).toBeNull();
    expect(getSafeReturnTo("%E0%A4%A")).toBeNull();
    expect(getSafeReturnTo("%2F%2Fevil.example/path")).toBeNull();
  });

  it("retries only one eligible GET failure and never retries classified client errors", () => {
    expect(shouldRetryQuery(0, { status: 503 })).toBe(true);
    expect(shouldRetryQuery(1, { status: 503 })).toBe(false);
    expect(shouldRetryQuery(0, { status: 401 })).toBe(false);
    expect(shouldRetryQuery(0, { status: 409 })).toBe(false);
    expect(shouldRetryQuery(0, { code: "BUSINESS_RULE_ERROR" })).toBe(false);
  });

  it("removes credential-like audit metadata and never renders nested raw payloads", () => {
    expect(safeAuditMetadata({ action: "UPDATE", accessToken: "hidden", providerResponse: { raw: true }, count: 2 })).toEqual([
      { key: "action", value: "UPDATE" },
      { key: "count", value: "2" },
    ]);
  });
});