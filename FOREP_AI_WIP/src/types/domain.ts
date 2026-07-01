export type Role = "OWNER" | "EMPLOYEE";
export type UserStatus = "ACTIVE" | "INACTIVE" | "INVITED";
export type SeniorityLevel = "INTERN" | "JUNIOR" | "MIDDLE" | "SENIOR" | "LEAD";
export type SkillRating = 1 | 2 | 3 | 4 | 5;
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskStatus = "ASSIGNED" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED" | "CANCELLED";
export type UpdateType = "PROGRESS" | "BLOCKER" | "COMPLETION";
export type WorkloadLevel = "NO_WORK" | "LOW" | "NORMAL" | "HIGH" | "OVERLOADED";
export type AiSuggestionStatus = "GENERATED" | "ACCEPTED" | "REJECTED";

export type User = {
  id: string;
  workspaceId: string;
  fullName: string;
  email: string;
  phone: string | null;
  username: string | null;
  employeeCode: string | null;
  initialPassword: string | null;
  role: Role;
  avatar: string | null;
  status: UserStatus;
  jobTitle: string | null;
  seniorityLevel: SeniorityLevel | null;
  skillRating: SkillRating | null;
  yearsOfExperience: number | null;
  skills: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Workspace = {
  id: string;
  name: string;
  shortCode: string | null;
  logo: string | null;
  address: string | null;
  ownerId: string;
  createdAt: string;
};

export type Employee = User & {
  workloadLevel?: WorkloadLevel;
};

export type Task = {
  id: string;
  title: string;
  requirements: string;
  description?: string | null;
  assigneeId?: string;
  assigneeName?: string;
  creatorId?: string;
  creatorName?: string;
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
  fullName?: string;
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
  type?: string;
  source?: string;
  inputData?: unknown;
  outputData?: unknown;
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
  recommendedAction?: string;
  assigneeName?: string;
};

export type ActionSuggestion = {
  id?: string;
  actionType?: string;
  targetEntityId?: string;
  targetEntityType?: string;
  reason?: string;
  confidence?: number;
  createdAt?: string;
};

export type DailyReportInsight = {
  summary?: string;
  blockers?: Array<{ severity?: string; description?: string }>;
  actionSuggestions?: string[] | ActionSuggestion[];
};

export type MissingReportInsight = {
  employeeId?: string;
  employeeName?: string;
  reportDate?: string;
  daysMissing?: number;
  recommendedAction?: string;
  confidence?: number;
};

export type ExtractedTaskSuggestion = {
  title?: string;
  requirements?: string;
  description?: string;
  priority?: TaskPriority;
  deadline?: string;
  estimatedHours?: number;
};

export type TaskAdjustment = {
  suggestedDeadline?: string;
  suggestedPriority?: TaskPriority;
  reason?: string;
  confidence?: number;
};

export type TaskSplitSuggestion = {
  title?: string;
  requirements?: string;
  description?: string;
  estimatedHours?: number;
};
