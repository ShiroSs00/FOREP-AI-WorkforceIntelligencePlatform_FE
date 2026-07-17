import { normalizeRole } from "@/lib/role";
import type { Task, User } from "@/types/domain";

function employeeIdentity(user: User): string {
  return user.employeeId ?? user.id;
}

function isTaskManager(user?: User | null): boolean {
  if (!user) return false;
  const role = normalizeRole(user.role);
  return role === "BUSINESS_OWNER" || role === "EXECUTIVE" || role === "MANAGER";
}

function participantFor(user: User, task: Task) {
  const employeeId = employeeIdentity(user);
  return task.participants?.find((participant) => participant.employeeId === employeeId);
}

export function getTaskAssignmentType(task: Task): "INDIVIDUAL" | "TEAM" {
  if (task.assignmentType) return task.assignmentType;
  return task.participants?.some((participant) => participant.leader || participant.participantRole === "LEADER") ? "TEAM" : "INDIVIDUAL";
}

export function canEditTaskCustomerInfo({ user, task }: { user?: User | null; task?: Task | null }): boolean {
  if (!user || !task) return false;
  const role = normalizeRole(user.role);
  if (isTaskManager(user)) return true;
  if (role !== "EMPLOYEE") return false;
  if (getTaskAssignmentType(task) === "TEAM") {
    const participant = participantFor(user, task);
    return Boolean(participant && (participant.leader || participant.participantRole === "LEADER"));
  }
  return task.assigneeId === employeeIdentity(user) || participantFor(user, task)?.participantRole === "ASSIGNEE";
}

export function canAcceptTask(user?: User | null, task?: Task | null): boolean {
  if (!user || !task || (task.status !== "ASSIGNED" && task.status !== "RETURNED")) return false;
  if (normalizeRole(user.role) !== "EMPLOYEE") return false;
  if (getTaskAssignmentType(task) === "INDIVIDUAL") {
    return task.assigneeId === employeeIdentity(user) || participantFor(user, task)?.participantRole === "ASSIGNEE";
  }
  return Boolean(participantFor(user, task));
}

export function canUpdateTaskProgress(user?: User | null, task?: Task | null): boolean {
  if (!user || !task || !["ACCEPTED", "IN_PROGRESS", "BLOCKED", "RETURNED"].includes(task.status ?? "")) return false;
  if (isTaskManager(user)) return true;
  return normalizeRole(user.role) === "EMPLOYEE" && Boolean(task.assigneeId === employeeIdentity(user) || participantFor(user, task));
}

export function canSubmitTaskCompletion(user?: User | null, task?: Task | null): boolean {
  if (!user || !task || ["ASSIGNED", "SUBMITTED", "COMPLETED", "CANCELLED"].includes(task.status ?? "")) return false;
  if (normalizeRole(user.role) !== "EMPLOYEE") return false;
  const participant = participantFor(user, task);
  if (getTaskAssignmentType(task) === "INDIVIDUAL") {
    return task.assigneeId === employeeIdentity(user) || participant?.participantRole === "ASSIGNEE";
  }
  return Boolean(participant && (participant.leader || participant.participantRole === "LEADER"));
}

export function canApproveTaskCompletion(user?: User | null, task?: Task | null): boolean {
  return Boolean(task?.status === "SUBMITTED" && isTaskManager(user));
}

export function canReturnTask(user?: User | null, task?: Task | null): boolean {
  return Boolean(task?.status === "SUBMITTED" && isTaskManager(user));
}
