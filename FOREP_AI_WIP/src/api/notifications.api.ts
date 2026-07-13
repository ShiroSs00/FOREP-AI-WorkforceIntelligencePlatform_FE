import { apiClient } from "./client";
import { normalizeArray, unwrapApiResponse } from "./response";
import type { NotificationItem } from "@/types/domain";

export async function listNotifications(): Promise<NotificationItem[]> {
  const response = await apiClient.get("/notifications");
  return normalizeArray<NotificationItem>(response.data).map((item) => ({ ...item, read: item.read ?? item.isRead ?? false }));
}

export async function markNotificationRead(id: string): Promise<NotificationItem> {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  const item = unwrapApiResponse<NotificationItem>(response.data);
  return { ...item, read: item.read ?? item.isRead ?? true };
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch("/notifications/read-all");
}


