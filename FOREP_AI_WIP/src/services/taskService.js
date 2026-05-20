import { apiRequest, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

export async function getTasks() {
  // GET /api/tasks
  if (useMocks) return mockData.tasks
  return apiRequest('/api/tasks')
}

export async function createTask(payload) {
  // POST /api/tasks
  if (useMocks) return { id: `mock-task-${Date.now()}`, ...payload }
  return apiRequest('/api/tasks', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateTask(id, payload) {
  // PUT /api/tasks/{id}
  if (useMocks) return { id, ...payload }
  return apiRequest(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function updateTaskStatus(id, status) {
  // PATCH /api/tasks/{id}/status
  if (useMocks) return { id, status }
  return apiRequest(`/api/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

export async function deleteTask(id) {
  // DELETE /api/tasks/{id}
  if (useMocks) return { id }
  return apiRequest(`/api/tasks/${id}`, { method: 'DELETE' })
}
