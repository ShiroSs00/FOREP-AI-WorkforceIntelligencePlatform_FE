import { describe, expect, it } from "vitest";
import { extractToken, formatConfidence, normalizeArray, normalizeObject, normalizePage, safeParseJsonObject, unwrapApiResponse } from "@/api/response";
import { normalizeApiError } from "@/api/errors";
import axios from "axios";

const item = { id: "1", name: "A" };

describe("api response helpers", () => {
  it("unwraps standard data envelope", () => {
    expect(unwrapApiResponse<{ ok: boolean }>({ data: { ok: true }, meta: {}, errors: [] })).toEqual({ ok: true });
  });

  it("normalizes arrays from common shapes", () => {
    expect(normalizeArray([item])).toHaveLength(1);
    expect(normalizeArray({ data: [item] })).toHaveLength(1);
    expect(normalizeArray({ data: { content: [item] } })).toHaveLength(1);
    expect(normalizeArray({ payload: [item] })).toHaveLength(1);
  });

  it("normalizes objects", () => {
    expect(normalizeObject<{ id: string }>({ data: item })?.id).toBe("1");
  });

  it("normalizes page metadata", () => {
    expect(normalizePage({ data: { content: [item], totalElements: 1, totalPages: 1 } }).totalElements).toBe(1);
  });

  it("extracts nested token", () => {
    expect(extractToken({ result: { accessToken: "abc" } })).toBe("abc");
  });

  it("parses AI JSON safely and formats confidence", () => {
    expect(safeParseJsonObject('{"summary":"ok"}')?.summary).toBe("ok");
    expect(safeParseJsonObject("not json")).toBeNull();
    expect(formatConfidence(0.84)).toBe("84%");
    expect(formatConfidence(84)).toBe("84%");
  });

  it("normalizes AI rate limit errors", () => {
    const error = new axios.AxiosError("rate", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 429,
      statusText: "Too Many Requests",
      headers: { "retry-after": "12" },
      config: {} as never,
      data: { errors: [{ code: "AI_RATE_LIMITED", message: "Too many" }] },
    });
    const normalized = normalizeApiError(error);
    expect(normalized.code).toBe("AI_RATE_LIMITED");
    expect(normalized.retryAfter).toBe(12);
  });
});

