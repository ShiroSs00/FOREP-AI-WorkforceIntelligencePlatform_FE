import { apiClient } from "./client";
import { normalizeArray, unwrapApiResponse } from "./response";
import type { Employee, UserStatus, WorkloadRecord } from "@/types/domain";
import type { CreateEmployeeRequest, UpdateEmployeeRequest } from "@/types/requests";

export async function listEmployees(): Promise<Employee[]> {
  const response = await apiClient.get("/employees");
  return normalizeArray<Employee>(response.data);
}

export async function createEmployee(payload: CreateEmployeeRequest): Promise<Employee> {
  const response = await apiClient.post("/employees", payload);
  return unwrapApiResponse<Employee>(response.data);
}

export async function getEmployee(id: string): Promise<Employee> {
  const response = await apiClient.get(`/employees/${id}`);
  return unwrapApiResponse<Employee>(response.data);
}

export async function updateEmployee(id: string, payload: UpdateEmployeeRequest): Promise<Employee> {
  const response = await apiClient.put(`/employees/${id}`, payload);
  return unwrapApiResponse<Employee>(response.data);
}

export async function updateEmployeeStatus(id: string, status: UserStatus): Promise<Employee> {
  const response = await apiClient.patch(`/employees/${id}/status`, null, { params: { status } });
  return unwrapApiResponse<Employee>(response.data);
}

export async function getEmployeeWorkload(id: string): Promise<WorkloadRecord> {
  const response = await apiClient.get(`/analytics/employees/${id}/workload`);
  return unwrapApiResponse<WorkloadRecord>(response.data);
}


