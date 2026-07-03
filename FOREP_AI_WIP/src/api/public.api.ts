import { apiClient } from "./client";
import { normalizeArray, unwrapApiResponse } from "./response";
import type { SubscriptionPlan, WorkspaceRegistration } from "@/types/domain";
import type { SubmitPaymentRequest, WorkspaceRegistrationRequest } from "@/types/requests";

export async function listPublicSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const response = await apiClient.get("/subscription-plans");
  return normalizeArray<SubscriptionPlan>(response.data).filter((plan) => plan.status === "ACTIVE");
}

export async function submitWorkspaceRegistration(payload: WorkspaceRegistrationRequest): Promise<WorkspaceRegistration> {
  const response = await apiClient.post("/workspace-registrations", payload);
  return unwrapApiResponse<WorkspaceRegistration>(response.data);
}

export async function submitRegistrationPayment(id: string, payload: SubmitPaymentRequest): Promise<WorkspaceRegistration> {
  const response = await apiClient.patch(`/workspace-registrations/${id}/payment`, payload);
  return unwrapApiResponse<WorkspaceRegistration>(response.data);
}
