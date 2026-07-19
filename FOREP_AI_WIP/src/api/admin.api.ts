import { adminPath, apiClient } from "./client";
import { isRecord, normalizeArray, normalizeObject, unwrapApiResponse } from "./response";
import type { AdminBusinessOwner, AdminDashboardOverview, AdminDashboardSeries, AdminFeedbackSummary, AdminMonitoring, AdminPaymentSummary, AiResult, AuditLog, BusinessFeedback, PaymentMethod, PaymentQrSetting, PaymentTransaction, PlatformWorkspace, SubscriptionPlan, UpdatePaymentQrSetting, UserStatus, WorkspaceActivationResult, WorkspaceRegistration, WorkspaceStatus } from "@/types/domain";
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

export async function getPlatformAiSummary(): Promise<AiResult | null> {
  const response = await apiClient.get(adminPath("/ai/platform-summary"));
  return normalizeObject<AiResult>(response.data);
}

export async function listAdminWorkspaces(): Promise<PlatformWorkspace[]> {
  const response = await apiClient.get(adminPath("/workspaces"));
  return normalizeArray<PlatformWorkspace>(response.data);
}

export async function createAdminWorkspace(payload: AdminCreateWorkspaceRequest): Promise<PlatformWorkspace> {
  const response = await apiClient.post(adminPath("/workspaces"), payload);
  return unwrapApiResponse<PlatformWorkspace>(response.data);
}

export async function getAdminWorkspace(id: string): Promise<PlatformWorkspace> {
  const response = await apiClient.get(adminPath(`/workspaces/${id}`));
  return unwrapApiResponse<PlatformWorkspace>(response.data);
}

export async function updateAdminWorkspace(id: string, payload: AdminUpdateWorkspaceRequest): Promise<PlatformWorkspace> {
  const response = await apiClient.put(adminPath(`/workspaces/${id}`), payload);
  return unwrapApiResponse<PlatformWorkspace>(response.data);
}

export async function updateAdminWorkspaceStatus(id: string, status: WorkspaceStatus): Promise<PlatformWorkspace> {
  if (status === "ACTIVE") {
    const response = await apiClient.patch(adminPath(`/workspaces/${id}/restore`));
    return unwrapApiResponse<PlatformWorkspace>(response.data);
  }
  if (status === "SUSPENDED") {
    const response = await apiClient.patch(adminPath(`/workspaces/${id}/suspend`));
    return unwrapApiResponse<PlatformWorkspace>(response.data);
  }
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
  const response = await apiClient.get(adminPath("/subscription-plans"));
  return normalizeArray<SubscriptionPlan>(response.data);
}

export async function createSubscriptionPlan(payload: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
  const response = await apiClient.post(adminPath("/subscription-plans"), payload);
  return unwrapApiResponse<SubscriptionPlan>(response.data);
}

export async function updateSubscriptionPlan(id: string, payload: UpdateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
  const response = await apiClient.put(adminPath(`/subscription-plans/${id}`), payload);
  return unwrapApiResponse<SubscriptionPlan>(response.data);
}

export async function activateSubscriptionPlan(id: string): Promise<SubscriptionPlan> {
  const response = await apiClient.patch(adminPath(`/subscription-plans/${id}/activate`));
  return unwrapApiResponse<SubscriptionPlan>(response.data);
}

export async function deactivateSubscriptionPlan(id: string): Promise<SubscriptionPlan> {
  const response = await apiClient.patch(adminPath(`/subscription-plans/${id}/deactivate`));
  return unwrapApiResponse<SubscriptionPlan>(response.data);
}

export async function listWorkspaceRegistrations(): Promise<WorkspaceRegistration[]> {
  const response = await apiClient.get(adminPath("/workspace-registrations"));
  return normalizeArray<WorkspaceRegistration>(response.data);
}

async function reviewRegistration(path: string, payload: ReviewRegistrationRequest): Promise<WorkspaceRegistration> {
  const response = await apiClient.patch(path, payload);
  return unwrapApiResponse<WorkspaceRegistration>(response.data);
}

export const confirmRegistrationPayment = (id: string, payload: ReviewRegistrationRequest) => reviewRegistration(`/admin/workspace-registrations/${id}/confirm-payment`, payload);
export const requestRegistrationPaymentCorrection = (id: string, payload: ReviewRegistrationRequest) => reviewRegistration(`/admin/workspace-registrations/${id}/request-payment-correction`, payload);
export const approveWorkspaceRegistration = (id: string, payload: ReviewRegistrationRequest) => reviewRegistration(adminPath(`/workspace-registrations/${id}/approve`), payload);
export const rejectWorkspaceRegistration = (id: string, payload: ReviewRegistrationRequest) => reviewRegistration(adminPath(`/workspace-registrations/${id}/reject`), payload);
export async function activateWorkspaceRegistration(id: string, payload: ReviewRegistrationRequest): Promise<WorkspaceActivationResult> {
  const response = await apiClient.post(`/admin/workspace-registrations/${id}/activate`, payload);
  return unwrapApiResponse<WorkspaceActivationResult>(response.data);
}

export async function confirmAdminPayment(paymentId: string, payload?: ReviewRegistrationRequest): Promise<PaymentTransaction> {
  const response = await apiClient.patch(adminPath(`/payments/${paymentId}/confirm`), payload ?? {});
  return unwrapApiResponse<PaymentTransaction>(response.data);
}

export async function rejectAdminPayment(paymentId: string, payload?: ReviewRegistrationRequest): Promise<PaymentTransaction> {
  const response = await apiClient.patch(adminPath(`/payments/${paymentId}/reject`), payload ?? {});
  return unwrapApiResponse<PaymentTransaction>(response.data);
}

export async function listAdminPayments(): Promise<PaymentTransaction[]> {
  const response = await apiClient.get(adminPath("/payments"));
  return normalizeArray<PaymentTransaction>(response.data);
}

export async function getAdminPayment(paymentId: string): Promise<PaymentTransaction> {
  const response = await apiClient.get(adminPath(`/payments/${paymentId}`));
  return unwrapApiResponse<PaymentTransaction>(response.data);
}

export async function listAdminAuditLogs(): Promise<AuditLog[]> {
  const response = await apiClient.get(adminPath("/audit-logs"));
  return normalizeArray<AuditLog>(response.data);
}

export async function listBusinessFeedback(): Promise<BusinessFeedback[]> {
  const response = await apiClient.get(adminPath("/business-feedback"));
  return normalizeArray<BusinessFeedback>(response.data);
}

export async function reviewBusinessFeedback(id: string, payload: ReviewBusinessFeedbackRequest): Promise<BusinessFeedback> {
  const response = await apiClient.patch(adminPath(`/business-feedback/${id}/mark-reviewed`), payload);
  return unwrapApiResponse<BusinessFeedback>(response.data);
}
export async function getAdminDashboardOverview(): Promise<AdminDashboardOverview> {
  const response = await apiClient.get(adminPath("/dashboard/overview"));
  return unwrapApiResponse<AdminDashboardOverview>(response.data);
}

async function getAdminDashboardSeries(path: string): Promise<AdminDashboardSeries> {
  const response = await apiClient.get(adminPath(path));
  return unwrapApiResponse<AdminDashboardSeries>(response.data);
}

export const getAdminRevenueMonthly = () => getAdminDashboardSeries("/dashboard/revenue/monthly");
export const getAdminRevenueQuarterly = () => getAdminDashboardSeries("/dashboard/revenue/quarterly");
export const getAdminRevenueYearly = () => getAdminDashboardSeries("/dashboard/revenue/yearly");
export const getAdminRevenueByPlan = () => getAdminDashboardSeries("/dashboard/revenue/by-plan");
export const getAdminWorkspacesByStatus = () => getAdminDashboardSeries("/dashboard/workspaces/by-status");
export const getAdminWorkspacesByPlan = () => getAdminDashboardSeries("/dashboard/workspaces/by-plan");

export async function getAdminPaymentSummary(): Promise<AdminPaymentSummary> {
  const response = await apiClient.get(adminPath("/dashboard/payments/summary"));
  return unwrapApiResponse<AdminPaymentSummary>(response.data);
}

export async function getAdminFeedbackSummary(): Promise<AdminFeedbackSummary> {
  const response = await apiClient.get(adminPath("/dashboard/feedback/summary"));
  return unwrapApiResponse<AdminFeedbackSummary>(response.data);
}

export async function listPaymentQrSettings(): Promise<PaymentQrSetting[]> {
  const response = await apiClient.get(adminPath("/payment-qr-settings"));
  const array = normalizeArray<PaymentQrSetting>(response.data);
  if (array.length > 0) return array;

  const value = unwrapApiResponse<unknown>(response.data);
  if (!isRecord(value)) return [];
  if (typeof value.paymentMethod === "string") return [value as PaymentQrSetting];
  const settings = isRecord(value.settings) ? value.settings : value;
  return (["MOMO", "BANK_TRANSFER"] as const).flatMap((paymentMethod) => {
    const setting = settings[paymentMethod];
    return isRecord(setting) ? [{ ...setting, paymentMethod } as PaymentQrSetting] : [];
  });
}

export async function uploadPaymentQrImage(paymentMethod: PaymentMethod, file: File, onProgress?: (percent: number) => void): Promise<PaymentQrSetting> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post(adminPath(`/payment-qr-settings/${paymentMethod}/qr-image`), formData, {
    onUploadProgress: (event) => {
      if (event.total && onProgress) onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
  return unwrapApiResponse<PaymentQrSetting>(response.data);
}

export async function removePaymentQrImage(paymentMethod: PaymentMethod): Promise<PaymentQrSetting> {
  const response = await apiClient.delete(adminPath(`/payment-qr-settings/${paymentMethod}/qr-image`));
  return unwrapApiResponse<PaymentQrSetting>(response.data);
}
export async function updatePaymentQrSetting(paymentMethod: PaymentMethod, payload: UpdatePaymentQrSetting): Promise<PaymentQrSetting> {
  const response = await apiClient.put(adminPath(`/payment-qr-settings/${paymentMethod}`), payload);
  return unwrapApiResponse<PaymentQrSetting>(response.data);
}
