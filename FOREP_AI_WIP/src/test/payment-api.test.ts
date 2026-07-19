import { afterEach, describe, expect, it, vi } from "vitest";
import { listPaymentQrSettings, updatePaymentQrSetting } from "@/api/admin.api";
import { apiClient } from "@/api/client";
import { createRegistrationPayment } from "@/api/public.api";

const qrPayload = {
  qrCodeUrl: "https://cdn.example.com/payment-qr.png",
  paymentUrl: "https://momo.example.com/pay",
  deeplink: "momo://pay",
  enabled: true,
};

describe("payment API contracts", () => {
  afterEach(() => vi.restoreAllMocks());

  it("normalizes keyed QR settings returned by the admin endpoint", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { data: { MOMO: qrPayload, BANK_TRANSFER: { qrCodeUrl: "https://cdn.example.com/bank.png", enabled: false } } },
    });

    const settings = await listPaymentQrSettings();
    expect(get).toHaveBeenCalledWith("/api/admin/payment-qr-settings");
    expect(settings.map((item) => item.paymentMethod)).toEqual(["MOMO", "BANK_TRANSFER"]);
  });

  it("sends the exact Swagger JSON body when updating a QR setting", async () => {
    const put = vi.spyOn(apiClient, "put").mockResolvedValue({ data: { data: { paymentMethod: "MOMO", ...qrPayload } } });
    await updatePaymentQrSetting("MOMO", qrPayload);
    expect(put).toHaveBeenCalledWith("/api/admin/payment-qr-settings/MOMO", qrPayload);
  });

  it("creates a public payment with only paymentMethod and the registration token query", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({ data: { data: { paymentCode: "PAY-1", paymentMethod: "MOMO", status: "PENDING" } } });
    await createRegistrationPayment("registration-1", "MOMO", "secret-token");
    expect(post).toHaveBeenCalledWith(
      "/api/public/workspace-registrations/registration-1/payments",
      { paymentMethod: "MOMO" },
      { params: { token: "secret-token" } },
    );
  });
});