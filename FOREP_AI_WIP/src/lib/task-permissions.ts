import { normalizeRole } from "@/lib/role";
import type { Task, User } from "@/types/domain";

export function getTaskAssignmentType(task: Task): "INDIVIDUAL" | "TEAM" {
  if (task.assignmentType) return task.assignmentType;
  return task.participants?.some((participant) => participant.leader || participant.participantRole === "LEADER") ? "TEAM" : "INDIVIDUAL";
}

export function canEditTaskCustomerInfo({ user, task }: { user?: User | null; task?: Task | null }): boolean {
  if (!user || !task) return false;
  const role = normalizeRole(user.role);
  if (role === "BUSINESS_OWNER" || role === "MANAGER") return true;
  if (role !== "EMPLOYEE") return false;
  if (getTaskAssignmentType(task) === "TEAM") {
    return Boolean(task.participants?.some((participant) => participant.employeeId === user.id && (participant.leader || participant.participantRole === "LEADER")));
  }
  return task.assigneeId === user.id || task.participants?.some((participant) => participant.employeeId === user.id && participant.participantRole === "ASSIGNEE") === true;
}
