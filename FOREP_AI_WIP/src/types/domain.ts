
export type CanonicalRole = "PLATFORM_ADMIN" | "BUSINESS_OWNER" | "HR" | "EXECUTIVE" | "MANAGER" | "EMPLOYEE" | "SYSTEM";
export type Role = CanonicalRole | "SYSTEM_ADMIN" | "OWNER";
export type PermissionGroup = "EMPLOYEE" | "MANAGER" | "EXECUTIVE";
export type UserStatus = "ACTIVE" | "INACTIVE" | "INVITED";
export type SeniorityLevel = "INTERN" | "JUNIOR" | "MIDDLE" | "SENIOR" | "LEAD";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN";
export type WorkingStatus = "WORKING" | "ON_LEAVE" | "RESIGNED";
export type EmployeeLevel = "INTERN" | "FRESHER" | "JUNIOR" | "MIDDLE" | "SENIOR" | "LEAD" | "MANAGER";
export type SkillRating = 1 | 2 | 3 | 4 | 5;
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskStatus = "ASSIGNED" | "ACCEPTED" | "IN_PROGRESS" | "BLOCKED" | "SUBMITTED" | "RETURNED" | "COMPLETED" | "CANCELLED";
export type AssignmentType = "INDIVIDUAL" | "TEAM";
export type TaskParticipantRole = "ASSIGNEE" | "LEADER" | "MEMBER";
export type UpdateType = "ACCEPTANCE" | "PROGRESS" | "BLOCKER" | "COMPLETION" | "COMPLETION_APPROVAL" | "RETURN";
export type WorkloadLevel = "NO_WORK" | "LOW" | "NORMAL" | "HIGH" | "OVERLOADED";
export type AiSuggestionStatus = "GENERATED" | "ACCEPTED" | "REJECTED";
export type WorkspaceStatus = "PENDING_PAYMENT" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXPIRED";
export type PaymentMethod = "MOMO" | "BANK_TRANSFER";
export type PaymentStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "EXPIRED" | "CANCELLED" | "REFUNDED" | "MANUAL_REVIEW" | "CONFIRMED" | "REJECTED" | "CORRECTION_REQUESTED";
export type RegistrationStatus = "PENDING_PLAN_SELECTION" | "PENDING_PAYMENT" | "PAYMENT_CONFIRMED" | "SUBMITTED" | "PAYMENT_PENDING" | "PAYMENT_SUBMITTED" | "APPROVED" | "REJECTED" | "CANCELLED" | "ACTIVE" | "ACTIVATED";
export type SubscriptionPlanStatus = "ACTIVE" | "INACTIVE";
export type RoleFit = "STRONG" | "PARTIAL" | "UNCERTAIN";

export type User = {
  id: string;
  employeeId?: string | null;
  workspaceId: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  username: string | null;
  employeeCode: string | null;
  initialPassword: string | null;
  role: Role;
  permissions: string[];
  avatar: string | null;
  status: UserStatus;
  jobTitle: string | null;
  seniorityLevel: SeniorityLevel | null;
  skillRating: SkillRating | null;
  yearsOfExperience: number | null;
  skills: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  jobPositionId?: string | null;
  jobPositionName?: string | null;
  permissionGroup?: PermissionGroup | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  personalSummary?: string | null;
  employmentType?: EmploymentType | null;
  workingStatus?: WorkingStatus | null;
  employeeLevel?: EmployeeLevel | null;
  monthlyWorkingCapacityHours?: number | null;
  mainExpertise?: string | null;
  secondaryExpertise?: string | null;
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

export type WorkspaceActivationResult = WorkspaceRegistration & {
  generatedBusinessOwners?: AdminBusinessOwner[];
  businessOwners?: AdminBusinessOwner[];
  ownerAccounts?: AdminBusinessOwner[];
  ownerProvisionedAt?: string | null;
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
  activeSubscription?: ActiveSubscription | null;
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

export type ActiveSubscription = {
  id?: string | null;
  plan?: SubscriptionPlan | null;
  subscriptionPlan?: SubscriptionPlan | null;
  planId?: string | null;
  planName?: string | null;
  status?: string | null;
  price?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  renewalDate?: string | null;
  maxUsers?: number | null;
  maxOwnerAccounts?: number | null;
  maxEmployeeAccounts?: number | null;
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
  userAgent?: string | null;
  requestId?: string | null;
  metadata?: unknown;
};

export type Employee = User & {
  workloadLevel?: WorkloadLevel;
  departmentId?: string | null;
  departmentName?: string | null;
  jobPositionId?: string | null;
  jobPositionName?: string | null;
  mainExpertise?: string | null;
  secondaryExpertise?: string | null;
};

export type DepartmentStatus = "ACTIVE" | "INACTIVE";

export type Department = {
  id: string;
  workspaceId?: string | null;
  name: string;
  code?: string | null;
  description?: string | null;
  status: DepartmentStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type BusinessPosition = {
  id: string;
  workspaceId?: string | null;
  name: string;
  code?: string | null;
  permissionGroup: PermissionGroup;
  departmentId: string;
  departmentName?: string | null;
  description?: string | null;
  status: DepartmentStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type TaskAssignee = {
  id: string;
  taskId: string;
  employeeId: string;
  participantRole: TaskParticipantRole;
  leader: boolean;
  allocatedHours: number;
  createdAt: string;
  employeeName?: string | null;
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
  returnReason?: string | null;
  returnAttachment?: string | null;
  returnedByName?: string | null;
  returnedAt?: string | null;
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
  actorName?: string | null;
};

export type JobPosition = {
  id: string;
  title: string;
  departmentId?: string | null;
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

export type PaymentQrSetting = {
  paymentMethod: PaymentMethod;
  qrCodeUrl?: string | null;
  paymentUrl?: string | null;
  deeplink?: string | null;
  bankCode?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  transferContentPrefix?: string | null;
  enabled: boolean;
  updatedAt?: string | null;
};

export type UpdatePaymentQrSetting = {
  qrCodeUrl?: string | null;
  paymentUrl?: string | null;
  deeplink?: string | null;
  bankCode?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  transferContentPrefix?: string | null;
  enabled: boolean;
};

export type DashboardSeriesPoint = {
  name?: string;
  label?: string;
  period?: string;
  value?: number;
  amount?: number;
  count?: number;
  [key: string]: unknown;
};

export type DashboardChart = {
  title?: string | null;
  series: DashboardSeriesPoint[];
  total?: number | null;
};

export type DashboardOverviewPeriod = {
  completed?: number;
  active?: number;
  overdue?: number;
  blocked?: number;
  submitted?: number;
  missingDailyReports?: number;
  missingDailyReport?: number;
  overloadedEmployees?: number;
  completionRate?: number;
};

export type DashboardEmployeeRef = {
  id?: string;
  employeeId?: string;
  fullName?: string;
  employeeName?: string;
  departmentName?: string | null;
};

export type DashboardTaskRisk = {
  id?: string;
  taskId?: string;
  title?: string;
  taskTitle?: string;
  assigneeName?: string | null;
  deadline?: string | null;
  status?: TaskStatus | string | null;
  riskLevel?: string | null;
  reason?: string | null;
  blocker?: string | null;
};

export type BusinessOwnerDashboard = {
  overviewCards?: {
    today?: DashboardOverviewPeriod;
    week?: DashboardOverviewPeriod;
    month?: DashboardOverviewPeriod;
  };
  dailyReportInsight?: {
    expected?: number;
    received?: number;
    missing?: number;
    reviewed?: number;
    missingEmployees?: DashboardEmployeeRef[];
  };
  workloadInsight?: {
    idle?: DashboardEmployeeRef[];
    light?: DashboardEmployeeRef[];
    normal?: DashboardEmployeeRef[];
    high?: DashboardEmployeeRef[];
    overloaded?: DashboardEmployeeRef[];
  };
  deadlineRisks?: DashboardTaskRisk[];
  blockedTasks?: DashboardTaskRisk[];
  taskStatusChart?: DashboardChart;
  workloadDistributionChart?: DashboardChart;
  recommendedActions?: Array<string | { title?: string; description?: string; action?: string; priority?: string }>;
  aiRecommendations?: AiSuggestion[];
  metadata?: { dataSource?: string; generatedAt?: string; note?: string; emptyStateNote?: string };
};

export type AdminDashboardOverview = Record<string, unknown> & {
  totalWorkspaces?: number;
  activeWorkspaces?: number;
  suspendedWorkspaces?: number;
  expiredWorkspaces?: number;
  newWorkspaces?: number;
  totalUsers?: number;
  revenue?: number;
  totalRevenue?: number;
  paymentSuccessRate?: number;
  failedPayments?: number;
  pendingManualPayments?: number;
  feedbackAverage?: number;
  aiUsage?: number;
};

export type AdminDashboardSeries = DashboardChart & { period?: string | null };
export type AdminPaymentSummary = Record<string, unknown> & {
  totalPayments?: number;
  successfulPayments?: number;
  failedPayments?: number;
  pendingManualPayments?: number;
  successRate?: number;
  pendingManualPaymentItems?: PaymentTransaction[];
  pendingPayments?: PaymentTransaction[];
};
export type AdminFeedbackSummary = Record<string, unknown> & {
  averageRating?: number;
  totalFeedback?: number;
  ratingChart?: DashboardChart;
  series?: DashboardSeriesPoint[];
  recentFeedback?: BusinessFeedback[];
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
  employeeName?: string;
  allocatedHours?: number;
  capacityHours?: number;
  utilizationRatio?: number;
  workloadLabel?: string;
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
  departmentId?: string | null;
  departmentName?: string | null;
  businessPositionId?: string | null;
  businessPositionName?: string | null;
  permissionGroup?: PermissionGroup | null;
  departmentSuitabilityScore?: number | null;
  businessPositionSuitabilityScore?: number | null;
  leadExperienceScore?: number | null;
  domainExperienceScore?: number | null;
  skillMatchScore?: number | null;
  similarTaskExperienceScore?: number | null;
  workloadAvailabilityScore?: number | null;
  performanceScore?: number | null;
  previousLeaderCount?: number | null;
  leadCompletionRate?: number | null;
  similarTaskCount?: number | null;
  scoreComponents?: Record<string, number | string | null> | null;
};

export type AiTaskAnalysis = AiFallbackMetadata & {
  taskType?: string | null;
  taskDomain?: string | null;
  suggestedDifficulty?: number | null;
  suggestedEmployeeLevel?: EmployeeLevel | string | null;
  requiredSkills?: string[] | string | null;
  requiredJobPositions?: string[] | null;
  relatedDepartment?: string | null;
  estimatedWorkingHoursSuggestion?: number | null;
  missingInformation?: string[] | null;
  clarifyingQuestions?: string[] | null;
  summary?: string | null;
};

export type AiHistoryStatus = "SUCCESS" | "FAILED" | "FALLBACK" | "PROCESSING" | "CANCELLED";

export type AiHistoryItem = {
  id?: string;
  calledAt?: string | null;
  createdAt?: string | null;
  callerName?: string | null;
  callerRole?: Role | string | null;
  function?: string | null;
  functionName?: string | null;
  status?: AiHistoryStatus | string | null;
};

export type AiResult = AiFallbackMetadata & Record<string, unknown>;

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
export type EmployeeImportRowError = {
  code?: string | null;
  field?: string | null;
  message: string;
};

export type EmployeeImportRow = {
  rowNumber?: number | null;
  valid: boolean;
  status?: string | null;
  fullName?: string | null;
  email?: string | null;
  employeeCode?: string | null;
  departmentName?: string | null;
  businessPositionName?: string | null;
  errors: EmployeeImportRowError[];
};

export type EmployeeImportBatch = {
  id: string;
  fileName?: string | null;
  status?: string | null;
  totalRows?: number | null;
  validRows?: number | null;
  invalidRows?: number | null;
  successCount?: number | null;
  failureCount?: number | null;
  rows: EmployeeImportRow[];
  createdAt?: string | null;
  completedAt?: string | null;
};

export type FileDownload = { blob: Blob; fileName: string };