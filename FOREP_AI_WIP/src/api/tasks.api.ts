import { apiClient, workspacePath } from "./client";
import { normalizeArray, unwrapApiResponse } from "./response";
import type { AssigneeRecommendation, Task, TaskAttachment, TaskUpdate } from "@/types/domain";
import type { AssignIndividualRequest, AssignTaskRequest, AssignTeamRequest, CreateTaskRequest, RecommendAssigneeRequest, ReturnTaskRequest, SubmitTaskCompletionRequest, TaskAttachmentRequest, UpdateProgressRequest, UpdateTaskCustomerInfoRequest, UpdateTaskRequest, UpdateTaskStatusRequest } from "@/types/requests";

export const workspaceTaskPaths = {
  tasks: workspacePath("/tasks"),
  task: (id: string) => workspacePath(`/tasks/${id}`),
  assignIndividual: (id: string) => workspacePath(`/tasks/${id}/assign-individual`),
  assignTeam: (id: string) => workspacePath(`/tasks/${id}/assign-team`),
  customerInfo: (id: string) => workspacePath(`/tasks/${id}/customer-info`),
  attachments: (id: string) => workspacePath(`/tasks/${id}/attachments`),
  accept: (id: string) => workspacePath(`/tasks/${id}/accept`),
  submitCompletion: (id: string) => workspacePath(`/tasks/${id}/submit-completion`),
  approveCompletion: (id: string) => workspacePath(`/tasks/${id}/approve-completion`),
  returnForRevision: (id: string) => workspacePath(`/tasks/${id}/return`),
  recommendIndividual: workspacePath("/ai/recommendations/individual"),
  recommendTeamLeaders: workspacePath("/ai/recommendations/team-leaders"),
  recommendTeamMembers: workspacePath("/ai/recommendations/team-members"),
} as const;

export async function listTasks(): Promise<Task[]> {
  const response = await apiClient.get(workspaceTaskPaths.tasks);
  return normalizeArray<Task>(response.data);
}

export async function createTask(payload: CreateTaskRequest): Promise<Task> {
  const response = await apiClient.post(workspaceTaskPaths.tasks, payload);
  return unwrapApiResponse<Task>(response.data);
}

export async function getTask(id: string): Promise<Task> {
  const response = await apiClient.get(workspaceTaskPaths.task(id));
  return unwrapApiResponse<Task>(response.data);
}

export async function updateTask(id: string, payload: UpdateTaskRequest): Promise<Task> {
  const response = await apiClient.put(workspacePath(`/tasks/${id}`), payload);
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

export async function listWorkspaceTasks(): Promise<Task[]> {
  const response = await apiClient.get(workspaceTaskPaths.tasks);
  return normalizeArray<Task>(response.data);
}

export async function createWorkspaceTask(payload: CreateTaskRequest): Promise<Task> {
  const response = await apiClient.post(workspaceTaskPaths.tasks, payload);
  return unwrapApiResponse<Task>(response.data);
}

export async function getWorkspaceTask(id: string): Promise<Task> {
  const response = await apiClient.get(workspaceTaskPaths.task(id));
  return unwrapApiResponse<Task>(response.data);
}

export async function updateWorkspaceTask(id: string, payload: UpdateTaskRequest): Promise<Task> {
  const response = await apiClient.put(workspaceTaskPaths.task(id), payload);
  return unwrapApiResponse<Task>(response.data);
}

export async function updateTaskCustomerInfo(id: string, payload: UpdateTaskCustomerInfoRequest): Promise<Task> {
  const response = await apiClient.patch(workspaceTaskPaths.customerInfo(id), payload);
  return unwrapApiResponse<Task>(response.data);
}

export async function assignIndividual(id: string, payload: AssignIndividualRequest): Promise<Task> {
  const response = await apiClient.patch(workspaceTaskPaths.assignIndividual(id), payload);
  return unwrapApiResponse<Task>(response.data);
}

export async function assignTeam(id: string, payload: AssignTeamRequest): Promise<Task> {
  const response = await apiClient.patch(workspaceTaskPaths.assignTeam(id), payload);
  return unwrapApiResponse<Task>(response.data);
}

export async function listTaskAttachments(id: string): Promise<TaskAttachment[]> {
  const response = await apiClient.get(workspaceTaskPaths.attachments(id));
  return normalizeArray<TaskAttachment>(response.data);
}

export async function addTaskAttachment(id: string, payload: TaskAttachmentRequest): Promise<TaskAttachment> {
  const response = await apiClient.post(workspaceTaskPaths.attachments(id), payload);
  return unwrapApiResponse<TaskAttachment>(response.data);
}

export async function acceptTask(id: string): Promise<Task> {
  const response = await apiClient.patch(workspaceTaskPaths.accept(id));
  return unwrapApiResponse<Task>(response.data);
}

export async function submitTaskCompletion(id: string, payload: SubmitTaskCompletionRequest): Promise<Task> {
  const response = await apiClient.patch(workspaceTaskPaths.submitCompletion(id), payload);
  return unwrapApiResponse<Task>(response.data);
}

export async function approveTaskCompletion(id: string): Promise<Task> {
  const response = await apiClient.patch(workspaceTaskPaths.approveCompletion(id));
  return unwrapApiResponse<Task>(response.data);
}

export async function returnTaskForRevision(id: string, payload: ReturnTaskRequest): Promise<Task> {
  const response = await apiClient.patch(workspaceTaskPaths.returnForRevision(id), payload);
  return unwrapApiResponse<Task>(response.data);
}

export async function recommendIndividuals(payload: RecommendAssigneeRequest): Promise<AssigneeRecommendation[]> {
  const response = await apiClient.post(workspaceTaskPaths.recommendIndividual, payload);
  return normalizeArray<AssigneeRecommendation>(response.data);
}

export async function recommendTeamLeaders(payload: RecommendAssigneeRequest): Promise<AssigneeRecommendation[]> {
  const response = await apiClient.post(workspaceTaskPaths.recommendTeamLeaders, payload);
  return normalizeArray<AssigneeRecommendation>(response.data);
}

export async function recommendTeamMembers(payload: RecommendAssigneeRequest): Promise<AssigneeRecommendation[]> {
  const response = await apiClient.post(workspaceTaskPaths.recommendTeamMembers, payload);
  return normalizeArray<AssigneeRecommendation>(response.data);
}


