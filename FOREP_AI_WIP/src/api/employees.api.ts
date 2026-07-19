import { apiClient, workspacePath } from "./client";
import { isRecord, normalizeArray, unwrapApiResponse } from "./response";
import type { Employee, EmployeeImportBatch, EmployeeImportRow, EmployeeImportRowError, FileDownload, UserStatus, WorkloadRecord } from "@/types/domain";
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

export async function resetEmployeePassword(id: string): Promise<Employee> {
  const response = await apiClient.patch(`/employees/${id}/reset-password`);
  return unwrapApiResponse<Employee>(response.data);
}

export async function getEmployeeWorkload(id: string): Promise<WorkloadRecord> {
  const response = await apiClient.get(`/analytics/employees/${id}/workload`);
  return unwrapApiResponse<WorkloadRecord>(response.data);
}

const importPath = workspacePath("/hr/employees");

function firstString(value: Record<string, unknown>, keys: readonly string[]): string | undefined {
  for (const key of keys) if (typeof value[key] === "string") return value[key];
  return undefined;
}

function firstNumber(value: Record<string, unknown>, keys: readonly string[]): number | undefined {
  for (const key of keys) if (typeof value[key] === "number" && Number.isFinite(value[key])) return value[key];
  return undefined;
}

function normalizeRowError(value: unknown): EmployeeImportRowError | null {
  if (typeof value === "string" && value.trim()) return { message: value };
  if (!isRecord(value)) return null;
  const message = firstString(value, ["message", "error", "reason"]);
  return message ? { message, code: firstString(value, ["code"]), field: firstString(value, ["field", "column"]) } : null;
}

function normalizeImportRow(value: unknown, index: number): EmployeeImportRow | null {
  if (!isRecord(value)) return null;
  const data = isRecord(value.data) ? value.data : isRecord(value.employee) ? value.employee : value;
  const rawErrors = Array.isArray(value.errors) ? value.errors : Array.isArray(value.validationErrors) ? value.validationErrors : [];
  const errors = rawErrors.map(normalizeRowError).filter((item): item is EmployeeImportRowError => item !== null);
  const valid = typeof value.valid === "boolean" ? value.valid : typeof value.isValid === "boolean" ? value.isValid : errors.length === 0 && !["INVALID", "FAILED"].includes(String(value.status));
  return {
    rowNumber: firstNumber(value, ["rowNumber", "row", "rowIndex"]) ?? index + 1,
    valid,
    status: firstString(value, ["status"]),
    fullName: firstString(data, ["fullName", "name"]),
    email: firstString(data, ["email"]),
    employeeCode: firstString(data, ["employeeCode", "code"]),
    departmentName: firstString(data, ["departmentName", "department"]),
    businessPositionName: firstString(data, ["businessPositionName", "jobPositionName", "positionName"]),
    errors,
  };
}

function normalizeImportBatchValue(value: unknown): EmployeeImportBatch {
  if (!isRecord(value)) throw new Error("Backend chưa trả batch import hợp lệ.");
  const id = firstString(value, ["id", "batchId"]);
  if (!id) throw new Error("Backend chưa trả batchId cho lần kiểm tra file.");
  const rawRows = Array.isArray(value.rows) ? value.rows : Array.isArray(value.previewRows) ? value.previewRows : Array.isArray(value.items) ? value.items : [];
  return {
    id,
    fileName: firstString(value, ["fileName", "originalFileName"]),
    status: firstString(value, ["status"]),
    totalRows: firstNumber(value, ["totalRows", "rowCount"]),
    validRows: firstNumber(value, ["validRows", "validCount"]),
    invalidRows: firstNumber(value, ["invalidRows", "invalidCount", "errorRows"]),
    successCount: firstNumber(value, ["successCount", "importedRows", "importedCount"]),
    failureCount: firstNumber(value, ["failureCount", "failedRows", "failedCount"]),
    rows: rawRows.map(normalizeImportRow).filter((item): item is EmployeeImportRow => item !== null),
    createdAt: firstString(value, ["createdAt", "uploadedAt"]),
    completedAt: firstString(value, ["completedAt", "confirmedAt"]),
  };
}

function unwrapImportBatch(payload: unknown): EmployeeImportBatch {
  return normalizeImportBatchValue(unwrapApiResponse<unknown>(payload));
}

function downloadName(contentDisposition: unknown, fallback: string): string {
  if (typeof contentDisposition !== "string") return fallback;
  const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(contentDisposition);
  return match?.[1] ? decodeURIComponent(match[1]) : fallback;
}

export async function downloadEmployeeImportTemplate(): Promise<FileDownload> {
  const response = await apiClient.get(`${importPath}/import-template`, { responseType: "blob" });
  return { blob: response.data as Blob, fileName: downloadName(response.headers["content-disposition"], "forep-employee-import-template.xlsx") };
}

export async function validateEmployeeImport(file: File, onProgress?: (percent: number) => void): Promise<EmployeeImportBatch> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post(`${importPath}/import`, formData, { onUploadProgress: (event) => { if (event.total && onProgress) onProgress(Math.round((event.loaded / event.total) * 100)); } });
  return unwrapImportBatch(response.data);
}

export async function listEmployeeImports(): Promise<EmployeeImportBatch[]> {
  const response = await apiClient.get(`${importPath}/imports`);
  return normalizeArray<unknown>(response.data).map(normalizeImportBatchValue);
}

export async function getEmployeeImport(batchId: string): Promise<EmployeeImportBatch> {
  const response = await apiClient.get(`${importPath}/imports/${batchId}`);
  return unwrapImportBatch(response.data);
}

export async function confirmEmployeeImport(batchId: string): Promise<EmployeeImportBatch> {
  const response = await apiClient.post(`${importPath}/imports/${batchId}/confirm`);
  return unwrapImportBatch(response.data);
}

export async function cancelEmployeeImport(batchId: string): Promise<EmployeeImportBatch> {
  const response = await apiClient.delete(`${importPath}/imports/${batchId}`);
  return unwrapImportBatch(response.data);
}

export async function downloadEmployeeImportErrors(batchId: string): Promise<FileDownload> {
  const response = await apiClient.get(`${importPath}/imports/${batchId}/errors`, { responseType: "blob" });
  return { blob: response.data as Blob, fileName: downloadName(response.headers["content-disposition"], `forep-import-errors-${batchId}.xlsx`) };
}