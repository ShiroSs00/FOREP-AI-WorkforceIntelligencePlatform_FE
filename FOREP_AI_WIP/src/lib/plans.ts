import type { SubscriptionPlan } from "@/types/domain";

export function formatMoney(value?: number | null): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value ?? 0);
}

export function parseFeatures(value?: string | null): string[] {
  if (!value) return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    if (typeof parsed === "object" && parsed !== null) return Object.entries(parsed).map(([key, item]) => `${key}: ${String(item)}`);
  } catch {
    // Plain or delimited string from backend.
  }
  return trimmed.split(/[\n;,|]+/).map((item) => item.trim()).filter(Boolean);
}

export function planLimitText(plan: SubscriptionPlan): string {
  const parts = [`${plan.maxUsers} người dùng`, `${plan.durationDays} ngày`];
  if (typeof plan.maxWorkspaces === "number") parts.push(`${plan.maxWorkspaces} workspace`);
  if (typeof plan.aiUsageLimit === "number") parts.push(`${plan.aiUsageLimit} lượt AI`);
  return parts.join(" · ");
}
