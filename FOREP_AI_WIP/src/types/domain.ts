export type Role = "SYSTEM_ADMIN" | "OWNER" | "EMPLOYEE";
export type UserStatus = "ACTIVE" | "INACTIVE" | "INVITED";
export type SeniorityLevel = "INTERN" | "JUNIOR" | "MIDDLE" | "SENIOR" | "LEAD";
export type SkillRating = 1 | 2 | 3 | 4 | 5;
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskStatus = "ASSIGNED" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED" | "CANCELLED";
export type UpdateType = "PROGRESS" | "BLOCKER" | "COMPLETION";
export type WorkloadLevel = "NO_WORK" | "LOW" | "NORMAL" | "HIGH" | "OVERLOADED";
export type AiSuggestionStatus = "GENERATED" | "ACCEPTED" | "REJECTED";
export type WorkspaceStatus = "PENDING_PAYMENT" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXPIRED";
export type PaymentStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CORRECTION_REQUESTED";
export type RegistrationStatus = "SUBMITTED" | "PAYMENT_PENDING" | "PAYMENT_SUBMITTED" | "APPROVED" | "REJECTED";
export type SubscriptionPlanStatus = "ACTIVE" | "INACTIVE";
export type RoleFit = "STRONG" | "PARTIAL" | "UNCERTAIN";

export type User = {
  id: string;
  workspaceId: string | null;
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

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  maxUsers: number;
  maxWorkspaces: number | null;
  aiUsageLimit: number | null;
  features: string | null;
  status: SubscriptionPlanStatus;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceRegistration = {
  id: string;
  businessName: string;
  workspaceName: string;
  workspaceIdentifier: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress: string | null;
  subscriptionPlanId: string;
  maxUsers: number;
  ownerFullName: string;
  ownerEmail: string;
  ownerPhone: string | null;
  paymentProofUrl: string | null;
  paymentStatus: PaymentStatus;
  registrationStatus: RegistrationStatus;
  workspaceId: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlatformWorkspace = {
  id: string;
  businessName: string | null;
  workspaceName: string;
  workspaceIdentifier: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  businessAddress: string | null;
  subscriptionPlanId: string | null;
  subscriptionPlan?: SubscriptionPlan | null;
  maxUsers: number;
  currentUsers: number;
  status: WorkspaceStatus;
  paymentStatus: PaymentStatus;
  ownerId: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  lastActivityAt: string | null;
  createdAt: string;
};

export type AdminMonitoring = {
  totalWorkspaces?: number;
  activeWorkspaces?: number;
  suspendedWorkspaces?: number;
  expiredWorkspaces?: number;
  pendingRegistrations?: number;
  pendingPayments?: number;
  platformUserCount?: number;
  recentPlatformActivity?: Array<Record<string, unknown>>;
};

export type AdminBusinessOwner = {
  id: string;
  fullName: string;
  email: string;
  username: string | null;
  phone: string | null;
  status: UserStatus;
  temporaryPassword?: string | null;
  initialPassword?: string | null;
};

export type BusinessFeedback = {
  id: string;
  businessName?: string | null;
  workspaceName?: string | null;
  senderName?: string | null;
  senderEmail?: string | null;
  title?: string | null;
  content?: string | null;
  status?: string | null;
  reviewStatus?: string | null;
  supportNote?: string | null;
  reviewedAt?: string | null;
  createdAt?: string | null;
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

export type AiFallbackMetadata = {
  source?: "RULE_BASED_FALLBACK" | string;
  aiProviderFailed?: boolean;
  fallbackReason?: string | null;
};

export type AssigneeRecommendation = AiFallbackMetadata & {
  employeeId?: string;
  employeeName?: string;
  fullName?: string;
  score?: number;
  workloadLevel?: WorkloadLevel;
  requiredRole?: string | null;
  roleFit?: RoleFit | null;
  roleFitReason?: string | null;
  reason?: string;
  risk?: string;
};

export type AiSuggestion = AiFallbackMetadata & {
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

export type DelayRisk = AiFallbackMetadata & {
  taskId?: string;
  taskTitle?: string;
  reason?: string;
  riskLevel?: string;
  recommendedAction?: string;
  assigneeName?: string;
};

export type ActionSuggestion = AiFallbackMetadata & {
  id?: string;
  actionType?: string;
  targetEntityId?: string;
  targetEntityType?: string;
  reason?: string;
  confidence?: number;
  createdAt?: string;
};

export type DailyReportInsight = AiFallbackMetadata & {
  summary?: string;
  blockers?: Array<{ severity?: string; description?: string }>;
  actionSuggestions?: string[] | ActionSuggestion[];
};

export type MissingReportInsight = AiFallbackMetadata & {
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
