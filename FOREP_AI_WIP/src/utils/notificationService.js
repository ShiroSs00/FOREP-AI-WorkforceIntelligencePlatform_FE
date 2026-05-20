const notificationKey = 'forep_notifications'
const updateEventName = 'forep-notifications-updated'

export function getNotifications() {
  try {
    return JSON.parse(localStorage.getItem(notificationKey)) ?? []
  } catch {
    return []
  }
}

export function saveNotifications(notifications) {
  localStorage.setItem(notificationKey, JSON.stringify(notifications))
  window.dispatchEvent(new Event(updateEventName))
  return notifications
}

export function createNotification({ title, message, type = 'System', severity = 'Info', link }) {
  const notification = {
    id: `notification-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title,
    message,
    type,
    severity,
    read: false,
    createdAt: new Date().toISOString(),
    link,
  }
  saveNotifications([notification, ...getNotifications()])
  return notification
}

export function markNotificationAsRead(id) {
  return saveNotifications(getNotifications().map((notification) => (notification.id === id ? { ...notification, read: true } : notification)))
}

export function markAllNotificationsAsRead() {
  return saveNotifications(getNotifications().map((notification) => ({ ...notification, read: true })))
}

export function deleteNotification(id) {
  return saveNotifications(getNotifications().filter((notification) => notification.id !== id))
}

export function clearNotifications() {
  return saveNotifications([])
}

export function getUnreadCount() {
  return getNotifications().filter((notification) => !notification.read).length
}

export { updateEventName }
