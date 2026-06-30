import type { Task } from "@/types/domain";

export function isTaskOverdue(task: Task, now = new Date()): boolean {
  if (!task.deadline) return false;
  if (task.status === "COMPLETED" || task.status === "CANCELLED") return false;
  const deadline = new Date(task.deadline);
  return Number.isFinite(deadline.getTime()) && deadline.getTime() < now.getTime();
}

export function formatDateTime(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date);
}


