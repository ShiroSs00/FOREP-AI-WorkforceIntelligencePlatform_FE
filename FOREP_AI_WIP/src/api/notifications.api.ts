import { apiClient } from "./client";
import { normalizeArray, unwrapApiResponse } from "./response";
import type { NotificationItem } from "@/types/domain";

export async function listNotifications(): Promise<NotificationItem[]> {
  const response = await apiClient.get("/notifications");
  return normalizeArray<NotificationItem>(response.data);
}

export async function markNotificationRead(id: string): Promise<NotificationItem> {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return unwrapApiResponse<NotificationItem>(response.data);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch("/notifications/read-all");
}


