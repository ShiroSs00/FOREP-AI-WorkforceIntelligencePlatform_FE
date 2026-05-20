import { apiRequest, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

// Notification creation should be handled by backend event processing later.

export async function getNotifications() {
  // GET /api/notifications
  if (useMocks) return mockData.notifications
  return apiRequest('/api/notifications')
}

export async function markAsRead(id) {
  // PATCH /api/notifications/{id}/read
  if (useMocks) return { id, read: true }
  return apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' })
}

export async function markAllAsRead() {
  // PATCH /api/notifications/read-all
  if (useMocks) return { read: true }
  return apiRequest('/api/notifications/read-all', { method: 'PATCH' })
}

export async function deleteNotification(id) {
  // DELETE /api/notifications/{id}
  if (useMocks) return { id }
  return apiRequest(`/api/notifications/${id}`, { method: 'DELETE' })
}

export async function clearNotifications() {
  // DELETE /api/notifications
  if (useMocks) return []
  return apiRequest('/api/notifications', { method: 'DELETE' })
}
