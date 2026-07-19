import { hasAnyPermission, hasPermission } from "@/lib/permissions";
import type { Task, User } from "@/types/domain";

function employeeIdentity(user: User): string {
  return user.employeeId ?? user.id;
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
  if (hasAnyPermission(user, ["TASK_ASSIGN", "TASK_APPROVE"])) return true;
  if (!hasPermission(user, "TASK_UPDATE_OWN")) return false;
  if (getTaskAssignmentType(task) === "TEAM") {
    const participant = participantFor(user, task);
    return Boolean(participant && (participant.leader || participant.participantRole === "LEADER"));
  }
  return task.assigneeId === employeeIdentity(user) || participantFor(user, task)?.participantRole === "ASSIGNEE";
}

export function canAcceptTask(user?: User | null, task?: Task | null): boolean {
  if (!user || !task || !hasPermission(user, "TASK_UPDATE_OWN") || (task.status !== "ASSIGNED" && task.status !== "RETURNED")) return false;
  if (getTaskAssignmentType(task) === "INDIVIDUAL") {
    return task.assigneeId === employeeIdentity(user) || participantFor(user, task)?.participantRole === "ASSIGNEE";
  }
  return Boolean(participantFor(user, task));
}

export function canUpdateTaskProgress(user?: User | null, task?: Task | null): boolean {
  if (!user || !task || !hasPermission(user, "TASK_UPDATE_OWN") || !["ACCEPTED", "IN_PROGRESS", "BLOCKED", "RETURNED"].includes(task.status ?? "")) return false;
  return Boolean(task.assigneeId === employeeIdentity(user) || participantFor(user, task));
}

export function canSubmitTaskCompletion(user?: User | null, task?: Task | null): boolean {
  if (!user || !task || !hasPermission(user, "TASK_UPDATE_OWN") || ["ASSIGNED", "SUBMITTED", "COMPLETED", "CANCELLED"].includes(task.status ?? "")) return false;
  const participant = participantFor(user, task);
  if (getTaskAssignmentType(task) === "INDIVIDUAL") {
    return task.assigneeId === employeeIdentity(user) || participant?.participantRole === "ASSIGNEE";
  }
  return Boolean(participant && (participant.leader || participant.participantRole === "LEADER"));
}

export function canApproveTaskCompletion(user?: User | null, task?: Task | null): boolean {
  return Boolean(task?.status === "SUBMITTED" && hasPermission(user, "TASK_APPROVE"));
}

export function canReturnTask(user?: User | null, task?: Task | null): boolean {
  return Boolean(task?.status === "SUBMITTED" && hasPermission(user, "TASK_APPROVE"));
}
