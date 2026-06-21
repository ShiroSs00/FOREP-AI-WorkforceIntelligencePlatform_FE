import { apiClient, asArray, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

const base = '/api/v1/notifications'

// Notification creation should be handled by backend event processing later.

export async function getNotifications() {
  // GET /api/v1/notifications
  if (useMocks) return mockData.notifications
  return asArray(await apiClient.get(base))
}

export async function getAdminNotifications() {
  // GET /api/v1/notifications/admin/all
  if (useMocks) return mockData.notifications
  return asArray(await apiClient.get(`${base}/admin/all`))
}

export async function getUnreadNotifications() {
  // GET /api/v1/notifications/unread
  if (useMocks) return mockData.notifications.filter((item) => !item.read)
  return asArray(await apiClient.get(`${base}/unread`))
}

export async function getUnreadCount() {
  // GET /api/v1/notifications/unread-count
  if (useMocks) return mockData.notifications.filter((item) => !item.read).length
  const payload = await apiClient.get(`${base}/unread-count`)
  if (typeof payload === 'number') return payload
  return payload?.count ?? payload?.data?.count ?? 0
}

export async function markAsRead(id) {
  // PUT /api/v1/notifications/{id}/read
  if (useMocks) return { id, read: true }
  return apiClient.put(`${base}/${id}/read`)
}

export async function markAllAsRead() {
  // PUT /api/v1/notifications/read-all
  if (useMocks) return { read: true }
  return apiClient.put(`${base}/read-all`)
}

export async function deleteNotification(id) {
  // DELETE /api/v1/notifications/{id}
  if (useMocks) return { id }
  return apiClient.delete(`${base}/${id}`)
}
