
export type CanonicalRole = "PLATFORM_ADMIN" | "BUSINESS_OWNER" | "HR" | "MANAGER" | "EMPLOYEE" | "SYSTEM";
export type Role = CanonicalRole | "SYSTEM_ADMIN" | "OWNER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "INVITED";
export type SeniorityLevel = "INTERN" | "JUNIOR" | "MIDDLE" | "SENIOR" | "LEAD";
export type SkillRating = 1 | 2 | 3 | 4 | 5;
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskStatus = "ASSIGNED" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED" | "CANCELLED";
export type AssignmentType = "INDIVIDUAL" | "TEAM";
export type TaskParticipantRole = "ASSIGNEE" | "LEADER" | "MEMBER";
export type UpdateType = "PROGRESS" | "BLOCKER" | "COMPLETION";
export type WorkloadLevel = "NO_WORK" | "LOW" | "NORMAL" | "HIGH" | "OVERLOADED";
export type AiSuggestionStatus = "GENERATED" | "ACCEPTED" | "REJECTED";
export type WorkspaceStatus = "PENDING_PAYMENT" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXPIRED";
export type PaymentMethod = "MOMO" | "BANK_TRANSFER";
export type PaymentStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "EXPIRED" | "CANCELLED" | "REFUNDED" | "MANUAL_REVIEW" | "CONFIRMED" | "REJECTED" | "CORRECTION_REQUESTED";
export type RegistrationStatus = "PENDING_PLAN_SELECTION" | "PENDING_PAYMENT" | "PAYMENT_CONFIRMED" | "SUBMITTED" | "PAYMENT_PENDING" | "PAYMENT_SUBMITTED" | "APPROVED" | "REJECTED" | "CANCELLED" | "ACTIVE";
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
  description?: string | null;
  price: number;
  durationDays?: number | null;
  durationInMonths?: number | null;
  maxUsers?: number | null;
  maxOwnerAccounts?: number | null;
  maxEmployeeAccounts?: number | null;
  hasFullFeatures?: boolean | null;
  maxWorkspaces: number | null;
  aiUsageLimit: number | null;
  features: unknown;
  status: SubscriptionPlanStatus;
  createdAt: string;
  updatedAt: string;
};

export type PaymentTransaction = {
  id: string;
  registrationId?: string | null;
  workspaceRegistrationId?: string | null;
  paymentMethod?: PaymentMethod | string | null;
  status?: PaymentStatus | string | null;
  amount?: number | null;
  currency?: "VND" | string | null;
  paymentCode?: string | null;
  orderCode?: string | null;
  requestId?: string | null;
  providerTransactionId?: string | null;
  providerPaymentUrl?: string | null;
  providerDeeplink?: string | null;
  providerQrCodeUrl?: string | null;
  qrCodeUrl?: string | null;
  bankCode?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  transferContent?: string | null;
  providerReference?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  paidAt?: string | null;
  expiresAt?: string | null;
  expiredAt?: string | null;
  message?: string | null;
};

export type PublicPaymentStatus = {
  workspaceRegistrationId: string;
  workspaceId: string | null;
  registrationPaymentStatus?: "PENDING" | "CONFIRMED" | "REJECTED" | "CORRECTION_REQUESTED" | string;
  registrationStatus?: RegistrationStatus | string;
  paymentMethod: PaymentMethod;
  amount: number;
  currency: "VND" | string;
  paymentCode: string;
  providerPaymentUrl: string | null;
  providerDeeplink: string | null;
  providerQrCodeUrl: string | null;
  bankCode: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  transferContent: string | null;
  status: PaymentStatus;
  paidAt: string | null;
  expiredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkspaceRegistrationResult = WorkspaceRegistration & { registrationToken: string };

export type WorkspaceRegistration = {
  id: string;
  businessName: string;
  workspaceName: string;
  workspaceIdentifier: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress: string | null;
  subscriptionPlanId?: string | null;
  subscriptionPlan?: SubscriptionPlan | null;
  maxUsers?: number | null;
  ownerFullName?: string | null;
  ownerEmail?: string | null;
  ownerPhone: string | null;
  representativeFullName?: string | null;
  representativeEmail?: string | null;
  representativePhone?: string | null;
  paymentProofUrl: string | null;
  paymentStatus?: PaymentStatus | null;
  paymentId?: string | null;
  latestPaymentId?: string | null;
  payment?: PaymentTransaction | null;
  latestPayment?: PaymentTransaction | null;
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
  maxUsers?: number | null;
  maxOwnerAccounts?: number | null;
  maxEmployeeAccounts?: number | null;
  currentUsers?: number | null;
  currentOwnerAccounts?: number | null;
  currentEmployeeAccounts?: number | null;
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

export type AuditLog = {
  id?: string;
  timestamp?: string | null;
  createdAt?: string | null;
  actor?: string | null;
  actorName?: string | null;
  actorRole?: string | null;
  action?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  result?: string | null;
  ipAddress?: string | null;
  metadata?: unknown;
};

export type Employee = User & {
  workloadLevel?: WorkloadLevel;
};

export type TaskAssignee = {
  id: string;
  taskId: string;
  employeeId: string;
  participantRole: TaskParticipantRole;
  leader: boolean;
  allocatedHours: number;
  createdAt: string;
};

export type TaskAttachmentType = "REQUIREMENT" | "REFERENCE" | "RESULT" | "OTHER";
export type TaskAttachment = {
  id?: string;
  taskId?: string;
  fileName: string;
  fileUrl: string;
  contentType?: string | null;
  fileSize?: number | null;
  attachmentType?: TaskAttachmentType | null;
  uploadedBy?: string | null;
  createdAt?: string | null;
};

export type Task = {
  id: string;
  workspaceId?: string;
  title: string;
  requirements: string;
  description?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerDescription?: string | null;
  assigneeId?: string | null;
  assigneeName?: string;
  assignmentType?: AssignmentType;
  teamLeaderId?: string | null;
  teamLeaderName?: string | null;
  teamMemberIds?: string[];
  teamMembers?: Array<{ id?: string; fullName?: string; progressPercent?: number; status?: TaskStatus }>;
  participants?: TaskAssignee[];
  attachments?: TaskAttachment[];
  creatorId?: string;
  creatorName?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  deadline?: string;
  startDate?: string | null;
  estimatedHours?: number;
  difficulty?: 1 | 2 | 3 | 4 | 5 | null;
  requiredSkills?: string | null;
  requiredJobPositionId?: string | null;
  requiredJobPositionName?: string | null;
  taskDomain?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  progressPercent?: number;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
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

export type JobPosition = {
  id: string;
  title: string;
  departmentName?: string | null;
  description?: string | null;
  requiredSkills?: string | null;
  status?: "ACTIVE" | "INACTIVE";
  createdAt?: string | null;
  updatedAt?: string | null;
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
  isRead?: boolean;
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
  name?: string;
  userName?: string;
  userFullName?: string;
  employee?: { id?: string; fullName?: string; name?: string } | null;
  openTasks?: number;
  inProgressTasks?: number;
  blockedTasks?: number;
  completedTasks?: number;
  overdueTasks?: number;
  estimatedWorkload?: number;
  workloadScore?: number;
  workloadLevel?: WorkloadLevel;
};

export type MonthlyWorkload = WorkloadRecord & {
  year?: number;
  month?: number;
  assignedTasks?: number;
  completedHours?: number;
  estimatedHours?: number;
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
