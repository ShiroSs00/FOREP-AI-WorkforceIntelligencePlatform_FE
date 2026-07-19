export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  const status = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : 0;
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  if ([400, 401, 403, 404, 409, 422, 429].includes(status) || code === "AI_RATE_LIMITED" || code === "BUSINESS_RULE_ERROR") return false;
  return failureCount < 1;
}