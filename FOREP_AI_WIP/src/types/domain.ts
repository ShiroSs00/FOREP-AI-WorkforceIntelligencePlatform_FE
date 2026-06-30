export type Role = "OWNER" | "EMPLOYEE";
export type UserStatus = "ACTIVE" | "INACTIVE" | "INVITED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskStatus = "ASSIGNED" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED" | "CANCELLED";
export type UpdateType = "PROGRESS" | "BLOCKER" | "COMPLETION";
export type WorkloadLevel = "NO_WORK" | "LOW" | "NORMAL" | "HIGH" | "OVERLOADED";
export type AiSuggestionStatus = "GENERATED" | "ACCEPTED" | "REJECTED";

export type User = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: Role;
  status?: UserStatus;
  workspaceId?: string;
};

export type Workspace = {
  id: string;
  name: string;
  logo?: string | null;
  address?: string | null;
  createdAt?: string;
};

export type Employee = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  status?: UserStatus;
  createdAt?: string;
  workloadLevel?: WorkloadLevel;
};

export type Task = {
  id: string;
  title: string;
  requirements: string;
  description?: string | null;
  assigneeId?: string;
  assigneeName?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  deadline?: string;
  estimatedHours?: number;
  progressPercent?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type TaskUpdate = {
  id: string;
  taskId?: string;
  progressPercent?: number;
  content: string;
  updateType: UpdateType;
  attachment?: string | null;
  createdAt?: string;
  createdByName?: string;
};

export type DailyReport = {
  id: string;
  reportDate: string;
  todayCompleted: string;
  currentWork: string;
  blockers?: string | null;
  tomorrowPlan?: string | null;
  employeeName?: string;
  reviewed?: boolean;
  createdAt?: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message?: string;
  read?: boolean;
  createdAt?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
};

export type OwnerDashboard = {
  totalTasks?: number;
  activeTasks?: number;
  completedTasks?: number;
  overdueTasks?: number;
  totalEmployees?: number;
  activeEmployees?: number;
  unreadNotifications?: number;
  employeeWorkload?: WorkloadRecord[];
  recentlyUpdatedTasks?: Task[];
  aiRecommendations?: AiSuggestion[];
};

export type WorkloadRecord = {
  employeeId?: string;
  employeeName?: string;
  openTasks?: number;
  inProgressTasks?: number;
  blockedTasks?: number;
  completedTasks?: number;
  overdueTasks?: number;
  estimatedWorkload?: number;
  workloadScore?: number;
  workloadLevel?: WorkloadLevel;
};

export type AssigneeRecommendation = {
  employeeId?: string;
  employeeName?: string;
  score?: number;
  workloadLevel?: WorkloadLevel;
  reason?: string;
  risk?: string;
};

export type AiSuggestion = {
  id: string;
  title?: string;
  content?: string;
  status?: AiSuggestionStatus;
  createdAt?: string;
};

export type BusinessSummary = {
  title?: string;
  summary?: string;
  content?: string;
  createdAt?: string;
};

export type DelayRisk = {
  taskId?: string;
  taskTitle?: string;
  reason?: string;
  riskLevel?: string;
};


