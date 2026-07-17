import { apiClient, workspacePath } from "./client";
import { normalizeArray, unwrapApiResponse } from "./response";
import type { BusinessPosition, Department, JobPosition } from "@/types/domain";
import type { BusinessPositionRequest, DepartmentRequest, JobPositionRequest } from "@/types/requests";

export type BusinessPositionFilters = { search?: string; departmentId?: string; permissionGroup?: string; status?: string };

export async function listDepartments(): Promise<Department[]> {
  const response = await apiClient.get(workspacePath("/hr/departments"));
  return normalizeArray<Department>(response.data);
}

export async function getDepartment(id: string): Promise<Department> {
  const response = await apiClient.get(workspacePath(`/hr/departments/${id}`));
  return unwrapApiResponse<Department>(response.data);
}

export async function createDepartment(payload: DepartmentRequest): Promise<Department> {
  const response = await apiClient.post(workspacePath("/hr/departments"), payload);
  return unwrapApiResponse<Department>(response.data);
}

export async function updateDepartment(id: string, payload: DepartmentRequest): Promise<Department> {
  const response = await apiClient.put(workspacePath(`/hr/departments/${id}`), payload);
  return unwrapApiResponse<Department>(response.data);
}

export async function setDepartmentActive(id: string, active: boolean): Promise<Department> {
  const response = await apiClient.patch(workspacePath(`/hr/departments/${id}/${active ? "activate" : "deactivate"}`));
  return unwrapApiResponse<Department>(response.data);
}

export async function listBusinessPositions(filters: BusinessPositionFilters = {}): Promise<BusinessPosition[]> {
  const response = await apiClient.get(workspacePath("/hr/business-positions"), { params: filters });
  return normalizeArray<BusinessPosition>(response.data);
}

export async function getBusinessPosition(id: string): Promise<BusinessPosition> {
  const response = await apiClient.get(workspacePath(`/hr/business-positions/${id}`));
  return unwrapApiResponse<BusinessPosition>(response.data);
}

export async function createBusinessPosition(payload: BusinessPositionRequest): Promise<BusinessPosition> {
  const response = await apiClient.post(workspacePath("/hr/business-positions"), payload);
  return unwrapApiResponse<BusinessPosition>(response.data);
}

export async function updateBusinessPosition(id: string, payload: BusinessPositionRequest): Promise<BusinessPosition> {
  const response = await apiClient.put(workspacePath(`/hr/business-positions/${id}`), payload);
  return unwrapApiResponse<BusinessPosition>(response.data);
}

export async function setBusinessPositionActive(id: string, active: boolean): Promise<BusinessPosition> {
  const response = await apiClient.patch(workspacePath(`/hr/business-positions/${id}/${active ? "activate" : "deactivate"}`));
  return unwrapApiResponse<BusinessPosition>(response.data);
}

export async function listJobPositions(): Promise<JobPosition[]> {
  const response = await apiClient.get(workspacePath("/hr/job-positions"));
  return normalizeArray<JobPosition>(response.data);
}

export async function createJobPosition(payload: JobPositionRequest): Promise<JobPosition> {
  const response = await apiClient.post(workspacePath("/hr/job-positions"), payload);
  return unwrapApiResponse<JobPosition>(response.data);
}

export async function updateJobPosition(id: string, payload: JobPositionRequest): Promise<JobPosition> {
  const response = await apiClient.put(workspacePath(`/hr/job-positions/${id}`), payload);
  return unwrapApiResponse<JobPosition>(response.data);
}

export async function updateJobPositionStatus(id: string, status: "ACTIVE" | "INACTIVE"): Promise<JobPosition> {
  const response = await apiClient.patch(workspacePath(`/hr/job-positions/${id}/status`), undefined, { params: { status } });
  return unwrapApiResponse<JobPosition>(response.data);
}
