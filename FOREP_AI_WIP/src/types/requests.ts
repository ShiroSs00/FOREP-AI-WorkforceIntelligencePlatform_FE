import type { SeniorityLevel, TaskPriority, TaskStatus, UpdateType, UserStatus } from "./domain";

export type LoginRequest = { email?: string; username?: string; password: string };
export type RegisterWorkspaceRequest = {
  workspaceName: string;
  shortCode: string;
  address?: string;
  ownerFullName: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerPassword: string;
};
export type CreateEmployeeRequest = {
  fullName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  seniorityLevel?: SeniorityLevel;
  skillRating?: number;
  yearsOfExperience?: number;
  skills?: string;
};
export type UpdateEmployeeRequest = CreateEmployeeRequest & { status?: UserStatus };
export type CreateTaskRequest = {
  title: string;
  requirements: string;
  description?: string;
  assigneeId: string;
  priority?: TaskPriority;
  deadline: string;
  estimatedHours?: number;
};
export type UpdateTaskRequest = CreateTaskRequest;
export type AssignTaskRequest = { assigneeId: string };
export type UpdateTaskStatusRequest = { status: TaskStatus };
export type UpdateProgressRequest = {
  progressPercent?: number;
  content: string;
  updateType: UpdateType;
  attachment?: string;
};
export type DailyReportRequest = {
  reportDate: string;
  todayCompleted: string;
  currentWork: string;
  blockers?: string;
  tomorrowPlan?: string;
};
export type RecommendAssigneeRequest = {
  title: string;
  requirements: string;
  deadline: string;
  estimatedHours?: number;
};
export type ExtractTasksRequest = {
  text: string;
  defaultDeadline?: string;
};
export type UpdateWorkspaceRequest = { name?: string; shortCode?: string; logo?: string; address?: string };

