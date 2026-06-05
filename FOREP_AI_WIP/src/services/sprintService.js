import { apiClient, asArray, useMocks } from './apiClient.js'

const base = '/api/v1/sprints'

export async function getSprints() {
  // GET /api/v1/sprints
  if (useMocks) return []
  return asArray(await apiClient.get(base))
}

export async function getSprintById(id) {
  // GET /api/v1/sprints/{id}
  if (useMocks) return null
  return apiClient.get(`${base}/${id}`)
}

export async function createSprint(payload) {
  // POST /api/v1/sprints
  if (useMocks) return { id: `mock-sprint-${Date.now()}`, ...payload }
  return apiClient.post(base, payload)
}

export async function updateSprint(id, payload) {
  // PUT /api/v1/sprints/{id}
  if (useMocks) return { id, ...payload }
  return apiClient.put(`${base}/${id}`, payload)
}

export async function deleteSprint(id) {
  // DELETE /api/v1/sprints/{id}
  if (useMocks) return { id }
  return apiClient.delete(`${base}/${id}`)
}

export async function getSprintsByOrganization(organizationId) {
  // GET /api/v1/sprints/organization/{organizationId}
  if (useMocks) return []
  return asArray(await apiClient.get(`${base}/organization/${organizationId}`))
}

export async function getActiveSprintsByOrganization(organizationId) {
  // GET /api/v1/sprints/organization/{organizationId}/active
  if (useMocks) return []
  return asArray(await apiClient.get(`${base}/organization/${organizationId}/active`))
}

export async function getActiveSprints() {
  // GET /api/v1/sprints/active
  if (useMocks) return []
  return asArray(await apiClient.get(`${base}/active`))
}
