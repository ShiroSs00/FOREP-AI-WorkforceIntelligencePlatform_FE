import { describe, expect, it } from "vitest";
import { normalizeArray, normalizeObject, normalizePage, unwrapApiResponse } from "@/api/response";

const item = { id: "1", name: "A" };

describe("api response helpers", () => {
  it("unwraps standard data envelope", () => {
    expect(unwrapApiResponse<{ ok: boolean }>({ data: { ok: true }, meta: {}, errors: [] })).toEqual({ ok: true });
  });

  it("normalizes arrays from common shapes", () => {
    expect(normalizeArray([item])).toHaveLength(1);
    expect(normalizeArray({ data: [item] })).toHaveLength(1);
    expect(normalizeArray({ data: { content: [item] } })).toHaveLength(1);
  });

  it("normalizes objects", () => {
    expect(normalizeObject<{ id: string }>({ data: item })?.id).toBe("1");
  });

  it("normalizes page metadata", () => {
    expect(normalizePage({ data: { content: [item], totalElements: 1, totalPages: 1 } }).totalElements).toBe(1);
  });
});


