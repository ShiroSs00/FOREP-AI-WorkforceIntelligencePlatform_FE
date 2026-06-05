import { apiClient, asArray, useMocks } from './apiClient.js'

export async function getTaskComments(taskId) {
  // GET /api/v1/tasks/{taskId}/comments
  if (useMocks) return []
  return asArray(await apiClient.get(`/api/v1/tasks/${taskId}/comments`))
}

export async function createTaskComment(taskId, payload) {
  // POST /api/v1/tasks/{taskId}/comments
  if (useMocks) return { id: `mock-comment-${Date.now()}`, taskId, ...payload }
  return apiClient.post(`/api/v1/tasks/${taskId}/comments`, payload)
}

export async function deleteTaskComment(taskId, commentId) {
  // DELETE /api/v1/tasks/{taskId}/comments/{commentId}
  if (useMocks) return { taskId, commentId }
  return apiClient.delete(`/api/v1/tasks/${taskId}/comments/${commentId}`)
}
