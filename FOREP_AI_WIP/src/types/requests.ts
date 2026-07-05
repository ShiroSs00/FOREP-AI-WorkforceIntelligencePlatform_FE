import type {
  PaymentMethod,
  PaymentStatus,
  SeniorityLevel,
  SubscriptionPlanStatus,
  TaskPriority,
  TaskStatus,
  UpdateType,
  UserStatus,
  WorkspaceStatus,
} from "./domain";

export type LoginRequest = { email?: string; username?: string; password: string };
export type ChangePasswordRequest = { currentPassword: string; newPassword: string };
export type RegisterWorkspaceRequest = {
  workspaceName: string;
  shortCode: string;
  address?: string;
  ownerFullName: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerPassword: string;
};
export type WorkspaceRegistrationRequest = {
  businessName: string;
  workspaceName: string;
  contactEmail: string;
  contactPhone?: string;
  businessAddress?: string | null;
  representativeFullName: string;
  representativeEmail: string;
  representativePhone?: string | null;
};
export type SelectSubscriptionPlanRequest = { subscriptionPlanId: string };
export type CreatePaymentRequest = { paymentMethod: PaymentMethod };
export type SubmitPaymentRequest = { paymentProofUrl: string; paymentNote?: string };
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
export type AdminCreateWorkspaceRequest = {
  businessName: string;
  workspaceName: string;
  workspaceIdentifier: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress?: string;
  subscriptionPlanId: string;
  maxUsers?: number;
  activationDate?: string;
  expirationDate?: string;
  status?: WorkspaceStatus;
};
export type AdminUpdateWorkspaceRequest = Partial<Omit<AdminCreateWorkspaceRequest, "workspaceIdentifier">>;
export type AdminWorkspaceStatusRequest = { status: WorkspaceStatus } | WorkspaceStatus;
export type CreateBusinessOwnerRequest = {
  fullName: string;
  email: string;
  username?: string;
  temporaryPassword?: string;
  phone?: string;
  status?: UserStatus;
};
export type CreateSubscriptionPlanRequest = {
  name: string;
  description?: string;
  price: number;
  durationDays?: number;
  durationInMonths?: number;
  maxUsers?: number;
  maxOwnerAccounts?: number;
  maxEmployeeAccounts?: number;
  hasFullFeatures?: boolean;
  maxWorkspaces?: number;
  aiUsageLimit?: number;
  features?: string;
  status?: SubscriptionPlanStatus;
};
export type UpdateSubscriptionPlanRequest = Partial<CreateSubscriptionPlanRequest>;
export type ReviewRegistrationRequest = { note?: string };
export type ReviewBusinessFeedbackRequest = { supportNote?: string };
export type BusinessFeedbackRequest = { title: string; content: string };
export type PaymentStatusQuery = PaymentStatus | "ALL";
