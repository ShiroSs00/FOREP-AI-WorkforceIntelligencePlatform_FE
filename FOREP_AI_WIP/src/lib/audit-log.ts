import { isRecord, safeParseJsonObject } from "@/api/response";

export type AuditMetadataEntry = { key: string; value: string };
const SENSITIVE_KEY = /(password|secret|token|authorization|credential|signature|provider.*(?:request|response)|rawpayload)/i;

export function safeAuditMetadata(value: unknown): AuditMetadataEntry[] {
  const record = isRecord(value) ? value : safeParseJsonObject(value);
  if (!record) return [];
  return Object.entries(record).flatMap(([key, item]) => {
    if (SENSITIVE_KEY.test(key) || item === null || item === undefined) return [];
    if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
      const text = String(item).trim();
      return text ? [{ key, value: text.slice(0, 500) }] : [];
    }
    return [{ key, value: "Dữ liệu lồng nhau đã được ẩn khỏi giao diện." }];
  });
}