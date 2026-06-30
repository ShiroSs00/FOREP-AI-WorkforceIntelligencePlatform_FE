import { apiClient } from "./client";
import { normalizeArray, unwrapApiResponse } from "./response";
import type { AssigneeRecommendation, Task, TaskUpdate } from "@/types/domain";
import type { AssignTaskRequest, CreateTaskRequest, RecommendAssigneeRequest, UpdateProgressRequest, UpdateTaskRequest, UpdateTaskStatusRequest } from "@/types/requests";

export async function listTasks(): Promise<Task[]> {
  const response = await apiClient.get("/tasks");
  return normalizeArray<Task>(response.data);
}

export async function createTask(payload: CreateTaskRequest): Promise<Task> {
  const response = await apiClient.post("/tasks", payload);
  return unwrapApiResponse<Task>(response.data);
}

export async function getTask(id: string): Promise<Task> {
  const response = await apiClient.get(`/tasks/${id}`);
  return unwrapApiResponse<Task>(response.data);
}

export async function updateTask(id: string, payload: UpdateTaskRequest): Promise<Task> {
  const response = await apiClient.put(`/tasks/${id}`, payload);
  return unwrapApiResponse<Task>(response.data);
}

export async function assignTask(id: string, payload: AssignTaskRequest): Promise<Task> {
  const response = await apiClient.patch(`/tasks/${id}/assign`, payload);
  return unwrapApiResponse<Task>(response.data);
}

export async function updateTaskStatus(id: string, payload: UpdateTaskStatusRequest): Promise<Task> {
  const response = await apiClient.patch(`/tasks/${id}/status`, payload);
  return unwrapApiResponse<Task>(response.data);
}

export async function updateTaskProgress(id: string, payload: UpdateProgressRequest): Promise<TaskUpdate> {
  const response = await apiClient.patch(`/tasks/${id}/progress`, payload);
  return unwrapApiResponse<TaskUpdate>(response.data);
}

export async function listTaskUpdates(id: string): Promise<TaskUpdate[]> {
  const response = await apiClient.get(`/tasks/${id}/updates`);
  return normalizeArray<TaskUpdate>(response.data);
}

export async function createTaskUpdate(id: string, payload: UpdateProgressRequest): Promise<TaskUpdate> {
  const response = await apiClient.post(`/tasks/${id}/updates`, payload);
  return unwrapApiResponse<TaskUpdate>(response.data);
}

export async function cancelTask(id: string): Promise<Task> {
  const response = await apiClient.patch(`/tasks/${id}/cancel`);
  return unwrapApiResponse<Task>(response.data);
}

export async function recommendAssignee(payload: RecommendAssigneeRequest): Promise<AssigneeRecommendation[]> {
  const response = await apiClient.post("/ai/recommend-assignee", payload);
  return normalizeArray<AssigneeRecommendation>(response.data);
}


