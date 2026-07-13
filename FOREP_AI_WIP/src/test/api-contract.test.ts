import { beforeEach, describe, expect, it } from "vitest";
import { API_PREFIX, adminPath, authenticatedPath, publicPath, workspacePath } from "@/api/client";
import { getRegistrationToken, removeRegistrationToken, saveRegistrationToken } from "@/lib/registration-session";
import { queryKeys } from "@/lib/query-keys";

describe("API routing contract", () => {
  it("uses one origin with explicit backend prefixes", () => {
    expect(authenticatedPath("/auth/me")).toBe("/api/v1/auth/me");
    expect(publicPath("/subscription-plans")).toBe("/api/public/subscription-plans");
    expect(adminPath("/payments")).toBe("/api/admin/payments");
    expect(workspacePath("/tasks")).toBe("/api/workspace/tasks");
    expect(Object.values(API_PREFIX)).not.toContain("/api/payment-callbacks");
  });

  it("separates public payment-code cache from internal payment-id cache", () => {
    expect(queryKeys.publicPaymentStatus("PAY-CODE")).toEqual(["public", "payments", "PAY-CODE"]);
    expect(queryKeys.adminPayment("payment-uuid")).toEqual(["admin", "payments", "payment-uuid"]);
  });
});

describe("public registration session", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("scopes the registration token by registration id", () => {
    saveRegistrationToken("reg-1", "secret-1");
    saveRegistrationToken("reg-2", "secret-2");
    expect(getRegistrationToken("reg-1")).toBe("secret-1");
    expect(getRegistrationToken("reg-2")).toBe("secret-2");
    removeRegistrationToken("reg-1");
    expect(getRegistrationToken("reg-1")).toBeNull();
    expect(getRegistrationToken("reg-2")).toBe("secret-2");
  });
});
