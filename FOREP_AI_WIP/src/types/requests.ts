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
  TaskAttachmentType,
  AssignmentType,
  DepartmentStatus,
  EmployeeLevel,
  EmploymentType,
  PermissionGroup,
  WorkingStatus,
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
  departmentId?: string;
  jobPositionId?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  personalSummary?: string;
  employmentType?: EmploymentType;
  workingStatus?: WorkingStatus;
  employeeLevel?: EmployeeLevel;
  monthlyWorkingCapacityHours?: number;
  mainExpertise?: string;
  secondaryExpertise?: string;
};
export type UpdateEmployeeRequest = CreateEmployeeRequest & { status?: UserStatus };
export type CreateTaskRequest = {
  title: string;
  requirements: string;
  description?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerDescription?: string | null;
  assigneeId?: string | null;
  assignmentType: AssignmentType;
  teamLeaderId?: string | null;
  teamMemberIds?: string[];
  priority: TaskPriority;
  deadline: string;
  estimatedHours: number;
  startDate?: string | null;
  difficulty?: number | null;
  requiredSkills?: string | null;
  requiredJobPositionId?: string | null;
  taskDomain?: string | null;
  projectId?: string | null;
  departmentId?: string | null;
  attachments?: TaskAttachmentRequest[];
};
export type UpdateTaskRequest = CreateTaskRequest;
export type AssignTaskRequest = { assigneeId: string };
export type AssignIndividualRequest = { employeeId: string };
export type AssignTeamRequest = { teamLeaderId: string; teamMemberIds?: string[] };
export type TaskAttachmentRequest = { fileName: string; fileUrl: string; contentType?: string; fileSize?: number; attachmentType?: TaskAttachmentType };
export type UpdateTaskCustomerInfoRequest = { customerPhone?: string | null; customerEmail?: string | null; customerDescription?: string | null };
export type JobPositionRequest = { title: string; departmentName?: string; description?: string; requiredSkills?: string; status?: "ACTIVE" | "INACTIVE" };
export type DepartmentRequest = {
  name: string;
  code?: string;
  description?: string;
  status?: DepartmentStatus;
};
export type BusinessPositionRequest = {
  name: string;
  code?: string;
  permissionGroup: PermissionGroup;
  departmentId: string;
  description?: string;
  status?: DepartmentStatus;
};
export type UpdateTaskStatusRequest = { status: TaskStatus };
export type UpdateProgressRequest = {
  progressPercent?: number;
  content: string;
  updateType: UpdateType;
  attachment?: string;
};
export type SubmitTaskCompletionRequest = { content: string; attachment?: string };
export type ReturnTaskRequest = { reason: string; attachment?: string };
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
  taskDomain?: string;
  departmentId?: string;
  requiredJobPositionId?: string;
  requiredSkills?: string;
};
export type AnalyzeTaskRequest = {
  taskTitle: string;
  taskDescription: string;
  projectDescription?: string;
  departmentName?: string;
  startDate?: string;
  deadline?: string;
};
export type RecommendationExplanationRequest = {
  recommendationType: "INDIVIDUAL" | "TEAM_LEADER" | "TEAM_MEMBER";
  task: Record<string, unknown>;
  candidates: Array<Record<string, unknown>>;
};
export type RecommendationResultExplanationRequest = {
  task: Record<string, unknown>;
  selectedAssigneeOrTeam: Record<string, unknown>;
  rankingData?: Array<Record<string, unknown>>;
  comparisonWithOtherCandidates?: Array<Record<string, unknown>>;
  workloadData?: Record<string, unknown>;
  performanceData?: Record<string, unknown>;
};
export type EstimateHoursRequest = {
  taskTitle: string;
  taskDescription?: string;
  difficulty?: string;
  taskType?: string;
  startDate?: string;
  deadline?: string;
  backendWorkingDays?: number;
  backendDefaultHours?: number;
};
export type WorkloadRiskExplanationRequest = {
  employeeName: string;
  monthlyCapacityHours: number;
  monthlyWorkloadEvaluation: Array<Record<string, unknown>>;
  backendOverallRisk?: string;
};
export type EmployeeReportAiRequest = {
  employee: Record<string, unknown>;
  period: Record<string, unknown>;
  metrics: Record<string, unknown>;
  notableTasks?: Array<Record<string, unknown>>;
  risks?: string[];
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
