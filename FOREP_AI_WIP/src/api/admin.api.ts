import { apiClient } from "./client";
import { normalizeArray, unwrapApiResponse } from "./response";
import type { AdminBusinessOwner, AdminMonitoring, BusinessFeedback, PlatformWorkspace, SubscriptionPlan, UserStatus, WorkspaceRegistration, WorkspaceStatus } from "@/types/domain";
import type {
  AdminCreateWorkspaceRequest,
  AdminUpdateWorkspaceRequest,
  CreateBusinessOwnerRequest,
  CreateSubscriptionPlanRequest,
  ReviewBusinessFeedbackRequest,
  ReviewRegistrationRequest,
  UpdateSubscriptionPlanRequest,
} from "@/types/requests";

export async function getAdminMonitoring(): Promise<AdminMonitoring> {
  const response = await apiClient.get("/admin/monitoring");
  return unwrapApiResponse<AdminMonitoring>(response.data);
}

export async function listAdminWorkspaces(): Promise<PlatformWorkspace[]> {
  const response = await apiClient.get("/admin/workspaces");
  return normalizeArray<PlatformWorkspace>(response.data);
}

export async function createAdminWorkspace(payload: AdminCreateWorkspaceRequest): Promise<PlatformWorkspace> {
  const response = await apiClient.post("/admin/workspaces", payload);
  return unwrapApiResponse<PlatformWorkspace>(response.data);
}

export async function getAdminWorkspace(id: string): Promise<PlatformWorkspace> {
  const response = await apiClient.get(`/admin/workspaces/${id}`);
  return unwrapApiResponse<PlatformWorkspace>(response.data);
}

export async function updateAdminWorkspace(id: string, payload: AdminUpdateWorkspaceRequest): Promise<PlatformWorkspace> {
  const response = await apiClient.put(`/admin/workspaces/${id}`, payload);
  return unwrapApiResponse<PlatformWorkspace>(response.data);
}

export async function updateAdminWorkspaceStatus(id: string, status: WorkspaceStatus): Promise<PlatformWorkspace> {
  const response = await apiClient.patch(`/admin/workspaces/${id}/status`, null, { params: { status } });
  return unwrapApiResponse<PlatformWorkspace>(response.data);
}

export async function listBusinessOwners(workspaceId: string): Promise<AdminBusinessOwner[]> {
  const response = await apiClient.get(`/admin/workspaces/${workspaceId}/business-owners`);
  return normalizeArray<AdminBusinessOwner>(response.data);
}

export async function createBusinessOwner(workspaceId: string, payload: CreateBusinessOwnerRequest): Promise<AdminBusinessOwner> {
  const response = await apiClient.post(`/admin/workspaces/${workspaceId}/business-owners`, payload);
  return unwrapApiResponse<AdminBusinessOwner>(response.data);
}

export async function resetBusinessOwnerPassword(id: string): Promise<AdminBusinessOwner> {
  const response = await apiClient.patch(`/admin/business-owners/${id}/reset-password`);
  return unwrapApiResponse<AdminBusinessOwner>(response.data);
}

export async function updateBusinessOwnerStatus(id: string, status: UserStatus): Promise<AdminBusinessOwner> {
  const response = await apiClient.patch(`/admin/business-owners/${id}/status`, null, { params: { status } });
  return unwrapApiResponse<AdminBusinessOwner>(response.data);
}

export async function listAdminSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const response = await apiClient.get("/admin/subscription-plans");
  return normalizeArray<SubscriptionPlan>(response.data);
}

export async function createSubscriptionPlan(payload: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
  const response = await apiClient.post("/admin/subscription-plans", payload);
  return unwrapApiResponse<SubscriptionPlan>(response.data);
}

export async function updateSubscriptionPlan(id: string, payload: UpdateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
  const response = await apiClient.put(`/admin/subscription-plans/${id}`, payload);
  return unwrapApiResponse<SubscriptionPlan>(response.data);
}

export async function listWorkspaceRegistrations(): Promise<WorkspaceRegistration[]> {
  const response = await apiClient.get("/admin/workspace-registrations");
  return normalizeArray<WorkspaceRegistration>(response.data);
}

async function reviewRegistration(path: string, payload: ReviewRegistrationRequest): Promise<WorkspaceRegistration> {
  const response = await apiClient.patch(path, payload);
  return unwrapApiResponse<WorkspaceRegistration>(response.data);
}

export const confirmRegistrationPayment = (id: string, payload: ReviewRegistrationRequest) => reviewRegistration(`/admin/workspace-registrations/${id}/confirm-payment`, payload);
export const requestRegistrationPaymentCorrection = (id: string, payload: ReviewRegistrationRequest) => reviewRegistration(`/admin/workspace-registrations/${id}/request-payment-correction`, payload);
export const approveWorkspaceRegistration = (id: string, payload: ReviewRegistrationRequest) => reviewRegistration(`/admin/workspace-registrations/${id}/approve`, payload);
export const rejectWorkspaceRegistration = (id: string, payload: ReviewRegistrationRequest) => reviewRegistration(`/admin/workspace-registrations/${id}/reject`, payload);

export async function listBusinessFeedback(): Promise<BusinessFeedback[]> {
  const response = await apiClient.get("/admin/business-feedback");
  return normalizeArray<BusinessFeedback>(response.data);
}

export async function reviewBusinessFeedback(id: string, payload: ReviewBusinessFeedbackRequest): Promise<BusinessFeedback> {
  const response = await apiClient.patch(`/admin/business-feedback/${id}/review`, payload);
  return unwrapApiResponse<BusinessFeedback>(response.data);
}
