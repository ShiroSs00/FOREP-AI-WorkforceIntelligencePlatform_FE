import type { PaymentMethod, PaymentStatus, PaymentTransaction, WorkspaceRegistration } from "@/types/domain";

export const terminalPaymentStatuses = ["SUCCESS", "FAILED", "EXPIRED", "CANCELLED", "CONFIRMED", "REJECTED"] as const;

export function isTerminalPaymentStatus(status?: string | null): boolean {
  return !!status && terminalPaymentStatuses.includes(status as (typeof terminalPaymentStatuses)[number]);
}

export function shouldPollPayment(status?: string | null): boolean {
  return !isTerminalPaymentStatus(status);
}

export function paymentMethodLabel(method?: PaymentMethod | string | null): string {
  if (method === "MOMO") return "MoMo";
  if (method === "BANK_TRANSFER") return "Chuyển khoản ngân hàng / VietQR";
  return "Chưa rõ phương thức";
}

export function paymentStatusCopy(status?: PaymentStatus | string | null): string {
  if (status === "SUCCESS" || status === "CONFIRMED") return "Thanh toán thành công";
  if (status === "FAILED" || status === "REJECTED") return "Thanh toán thất bại";
  if (status === "EXPIRED") return "Giao dịch đã hết hạn";
  if (status === "CANCELLED") return "Giao dịch đã bị hủy";
  return "Đang chờ thanh toán";
}

export function getPaymentIdFromRegistration(registration?: WorkspaceRegistration | null): string | null {
  if (!registration) return null;
  return registration.paymentId ?? registration.latestPaymentId ?? registration.payment?.id ?? registration.latestPayment?.id ?? null;
}

export function getPaymentRegistrationId(payment?: PaymentTransaction | null, routeRegistrationId?: string): string | null {
  return payment?.registrationId ?? payment?.workspaceRegistrationId ?? routeRegistrationId ?? null;
}

export function getQrCodeUrl(payment?: PaymentTransaction | null): string | null {
  return payment?.providerQrCodeUrl ?? payment?.qrCodeUrl ?? null;
}

export function getPaymentAmount(payment?: PaymentTransaction | null): number | null {
  return typeof payment?.amount === "number" ? payment.amount : null;
}
