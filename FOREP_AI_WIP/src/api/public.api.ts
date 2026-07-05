import { apiClient } from "./client";
import { normalizeArray, unwrapApiResponse } from "./response";
import type { PaymentMethod, PaymentTransaction, SubscriptionPlan, WorkspaceRegistration } from "@/types/domain";
import type { SelectSubscriptionPlanRequest, WorkspaceRegistrationRequest } from "@/types/requests";

export const publicApiPaths = {
  activeSubscriptionPlans: "/subscription-plans/active",
  workspaceRegistrations: "/workspace-registrations",
  selectPlan: (id: string) => `/workspace-registrations/${id}/select-plan`,
  createPayment: (id: string) => `/workspace-registrations/${id}/payments`,
  payment: (paymentId: string) => `/payments/${paymentId}`,
} as const;

export async function getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const response = await apiClient.get(publicApiPaths.activeSubscriptionPlans);
  return normalizeArray<SubscriptionPlan>(response.data).filter((plan) => plan.status === "ACTIVE");
}

export const listPublicSubscriptionPlans = getActiveSubscriptionPlans;

export async function createWorkspaceRegistration(payload: WorkspaceRegistrationRequest): Promise<WorkspaceRegistration> {
  const response = await apiClient.post(publicApiPaths.workspaceRegistrations, payload);
  return unwrapApiResponse<WorkspaceRegistration>(response.data);
}

export const submitWorkspaceRegistration = createWorkspaceRegistration;

export async function getWorkspaceRegistration(id: string): Promise<WorkspaceRegistration> {
  const response = await apiClient.get(`${publicApiPaths.workspaceRegistrations}/${id}`);
  return unwrapApiResponse<WorkspaceRegistration>(response.data);
}

export async function selectWorkspaceRegistrationPlan(id: string, subscriptionPlanId: string): Promise<WorkspaceRegistration> {
  const payload: SelectSubscriptionPlanRequest = { subscriptionPlanId };
  const response = await apiClient.patch(publicApiPaths.selectPlan(id), payload);
  return unwrapApiResponse<WorkspaceRegistration>(response.data);
}

export async function createRegistrationPayment(id: string, paymentMethod: PaymentMethod): Promise<PaymentTransaction> {
  const response = await apiClient.post(publicApiPaths.createPayment(id), { paymentMethod });
  return unwrapApiResponse<PaymentTransaction>(response.data);
}

export async function getPayment(paymentId: string): Promise<PaymentTransaction> {
  const response = await apiClient.get(publicApiPaths.payment(paymentId));
  return unwrapApiResponse<PaymentTransaction>(response.data);
}