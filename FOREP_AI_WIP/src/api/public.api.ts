import { apiClient, publicPath } from "./client";
import { normalizeArray, unwrapApiResponse } from "./response";
import type { CreateWorkspaceRegistrationResult, PaymentMethod, PublicPaymentStatus, SubscriptionPlan, WorkspaceRegistration } from "@/types/domain";
import type { SelectSubscriptionPlanRequest, WorkspaceRegistrationRequest } from "@/types/requests";
import { removeRegistrationToken } from "@/lib/registration-session";

export const publicApiPaths = {
  subscriptionPlans: publicPath("/subscription-plans"),
  workspaceRegistrations: publicPath("/workspace-registrations"),
  registration: (id: string) => publicPath(`/workspace-registrations/${id}`),
  selectPlan: (id: string) => publicPath(`/workspace-registrations/${id}/select-plan`),
  createPayment: (id: string) => publicPath(`/workspace-registrations/${id}/payments`),
  paymentStatus: (paymentCode: string) => publicPath(`/payments/${paymentCode}/status`),
} as const;

async function withRegistrationToken<T>(registrationId: string, request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : undefined;
    if (status === 401 || status === 403) removeRegistrationToken(registrationId);
    throw error;
  }
}

export async function getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const response = await apiClient.get(publicApiPaths.subscriptionPlans);
  return normalizeArray<SubscriptionPlan>(response.data).filter((plan) => !plan.status || plan.status === "ACTIVE");
}

export const listPublicSubscriptionPlans = getActiveSubscriptionPlans;

export async function createWorkspaceRegistration(payload: WorkspaceRegistrationRequest): Promise<CreateWorkspaceRegistrationResult> {
  const response = await apiClient.post(publicApiPaths.workspaceRegistrations, payload);
  return unwrapApiResponse<CreateWorkspaceRegistrationResult>(response.data);
}

export const submitWorkspaceRegistration = createWorkspaceRegistration;

export async function getWorkspaceRegistration(id: string, registrationToken: string): Promise<WorkspaceRegistration> {
  return withRegistrationToken(id, async () => {
    const response = await apiClient.get(publicApiPaths.registration(id), { params: { token: registrationToken } });
    return unwrapApiResponse<WorkspaceRegistration>(response.data);
  });
}

export async function selectWorkspaceRegistrationPlan(id: string, subscriptionPlanId: string, registrationToken: string): Promise<WorkspaceRegistration> {
  const payload: SelectSubscriptionPlanRequest = { subscriptionPlanId };
  return withRegistrationToken(id, async () => {
    const response = await apiClient.patch(publicApiPaths.selectPlan(id), payload, { params: { token: registrationToken } });
    return unwrapApiResponse<WorkspaceRegistration>(response.data);
  });
}

export async function createRegistrationPayment(id: string, paymentMethod: PaymentMethod, registrationToken: string): Promise<PublicPaymentStatus> {
  return withRegistrationToken(id, async () => {
    const response = await apiClient.post(publicApiPaths.createPayment(id), { paymentMethod }, { params: { token: registrationToken } });
    return unwrapApiResponse<PublicPaymentStatus>(response.data);
  });
}

const replaceablePaymentStatuses = new Set(["FAILED", "EXPIRED", "CANCELLED", "REJECTED", "REFUNDED"]);

function existingPaymentCode(registration: WorkspaceRegistration, method: PaymentMethod): string | null {
  const payment = registration.latestPayment ?? registration.payment;
  if (!payment?.paymentCode || payment.paymentMethod !== method || replaceablePaymentStatuses.has(String(payment.status))) return null;
  return payment.paymentCode;
}

async function findExistingRegistrationPayment(id: string, method: PaymentMethod, registrationToken: string): Promise<PublicPaymentStatus | null> {
  const registration = await getWorkspaceRegistration(id, registrationToken);
  const paymentCode = existingPaymentCode(registration, method);
  return paymentCode ? getPublicPaymentStatus(paymentCode, registrationToken, id) : null;
}

export async function createOrReuseRegistrationPayment(id: string, paymentMethod: PaymentMethod, registrationToken: string): Promise<PublicPaymentStatus> {
  const existing = await findExistingRegistrationPayment(id, paymentMethod, registrationToken);
  if (existing) return existing;
  try {
    return await createRegistrationPayment(id, paymentMethod, registrationToken);
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : undefined;
    if (!status || status === 409 || status >= 500) {
      const recovered = await findExistingRegistrationPayment(id, paymentMethod, registrationToken);
      if (recovered) return recovered;
    }
    throw error;
  }
}
export async function getPublicPaymentStatus(paymentCode: string, registrationToken: string, registrationId?: string): Promise<PublicPaymentStatus> {
  const request = async () => {
    const response = await apiClient.get(publicApiPaths.paymentStatus(paymentCode), { params: { token: registrationToken } });
    return unwrapApiResponse<PublicPaymentStatus>(response.data);
  };
  return registrationId ? withRegistrationToken(registrationId, request) : request();
}
