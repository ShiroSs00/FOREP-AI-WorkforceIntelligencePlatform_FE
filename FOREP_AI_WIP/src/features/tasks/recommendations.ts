import type { AssigneeRecommendation } from "@/types/domain";

export type RecommendationPresentation = {
  name: string;
  score: number | null;
  primaryReason: string;
  details: string[];
  isFallback: boolean;
  hasLimitedProfileData: boolean;
};

function cleanText(value?: string | null): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function comparable(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function uniqueExplanations(values: Array<string | undefined | null>): string[] {
  return values.reduce<string[]>((result, value) => {
    const text = cleanText(value);
    if (!text) return result;
    const normalized = comparable(text);
    const duplicate = result.some((existing) => {
      const existingNormalized = comparable(existing);
      return existingNormalized === normalized || existingNormalized.includes(normalized) || normalized.includes(existingNormalized);
    });
    if (!duplicate) result.push(text);
    return result;
  }, []);
}

export function getRecommendationPresentation(item: AssigneeRecommendation): RecommendationPresentation {
  const explanations = uniqueExplanations([item.reason, item.risk, item.roleFitReason]);
  const score = typeof item.score === "number" && Number.isFinite(item.score) ? item.score : null;

  return {
    name: cleanText(item.fullName) || cleanText(item.employeeName) || "Nhân viên chưa xác định",
    score,
    primaryReason: explanations[0] ?? "Backend chưa cung cấp giải thích cho gợi ý này.",
    details: explanations.slice(1),
    isFallback: item.source === "RULE_BASED_FALLBACK" || Boolean(item.aiProviderFailed),
    hasLimitedProfileData: !item.roleFit,
  };
}

export function sortRecommendations(items: AssigneeRecommendation[]): AssigneeRecommendation[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const leftScore = typeof left.item.score === "number" && Number.isFinite(left.item.score) ? left.item.score : Number.NEGATIVE_INFINITY;
      const rightScore = typeof right.item.score === "number" && Number.isFinite(right.item.score) ? right.item.score : Number.NEGATIVE_INFINITY;
      return rightScore - leftScore || left.index - right.index;
    })
    .map(({ item }) => item);
}

export function recommendationScoreWidth(score: number | null): number {
  if (score === null) return 0;
  return Math.min(100, Math.max(0, score));
}
