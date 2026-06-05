import { apiClient, asArray, useMocks, withQuery } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

const base = '/api/v1/tasks'

export async function getTasks() {
  // GET /api/v1/tasks
  if (useMocks) return mockData.tasks
  return asArray(await apiClient.get(base))
}

export async function getTaskById(id) {
  // GET /api/v1/tasks/{id}
  if (useMocks) return mockData.tasks.find((task) => task.id === id) ?? null
  return apiClient.get(`${base}/${id}`)
}

export async function createTask(payload) {
  // POST /api/v1/tasks
  if (useMocks) return { id: `mock-task-${Date.now()}`, ...payload }
  return apiClient.post(base, payload)
}

export async function updateTask(id, payload) {
  // PUT /api/v1/tasks/{id}
  if (useMocks) return { id, ...payload }
  return apiClient.put(`${base}/${id}`, payload)
}

export async function deleteTask(id) {
  // DELETE /api/v1/tasks/{id}
  if (useMocks) return { id }
  return apiClient.delete(`${base}/${id}`)
}

export async function updateTaskStatus(id, status) {
  // PATCH /api/v1/tasks/{id}/status?status={status}
  if (useMocks) return { id, status }
  return apiClient.patch(withQuery(`${base}/${id}/status`, { status }))
}

export async function getTasksByTeam(teamId) {
  // GET /api/v1/tasks/team/{teamId}
  if (useMocks) return mockData.tasks.filter((task) => task.teamId === teamId || task.team === teamId)
  return asArray(await apiClient.get(`${base}/team/${teamId}`))
}

export async function getTasksByStatus(status) {
  // GET /api/v1/tasks/status/{status}
  if (useMocks) return mockData.tasks.filter((task) => task.status === status)
  return asArray(await apiClient.get(`${base}/status/${status}`))
}

export async function getTasksBySprint(sprintId) {
  // GET /api/v1/tasks/sprint/{sprintId}
  if (useMocks) return mockData.tasks.filter((task) => task.sprintId === sprintId)
  return asArray(await apiClient.get(`${base}/sprint/${sprintId}`))
}

export async function getTasksByReporter(reporterId) {
  // GET /api/v1/tasks/reported-by/{reporterId}
  if (useMocks) return mockData.tasks.filter((task) => task.reporterId === reporterId)
  return asArray(await apiClient.get(`${base}/reported-by/${reporterId}`))
}

export async function getTasksByOrganization(organizationId) {
  // GET /api/v1/tasks/organization/{organizationId}
  if (useMocks) return mockData.tasks
  return asArray(await apiClient.get(`${base}/organization/${organizationId}`))
}

export async function getMyTasks() {
  // GET /api/v1/tasks/my-tasks
  if (useMocks) return mockData.tasks.slice(0, 3)
  return asArray(await apiClient.get(`${base}/my-tasks`))
}

export async function getManagedTeamTasks() {
  // GET /api/v1/tasks/managed-teams
  if (useMocks) return mockData.tasks
  return asArray(await apiClient.get(`${base}/managed-teams`))
}

export async function getTasksByEmployee(employeeId) {
  // GET /api/v1/tasks/employee/{employeeId}
  if (useMocks) return mockData.tasks.filter((task) => task.employeeId === employeeId || task.assigneeId === employeeId)
  return asArray(await apiClient.get(`${base}/employee/${employeeId}`))
}
