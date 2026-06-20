import { apiClient, asArray, unwrapData, useMocks } from './apiClient.js'

const base = '/api/v1/projects'

export async function getProjects() {
  // Backend currently supports POST /api/v1/projects, but not GET /api/v1/projects.
  // Use organization/team scoped reads instead.
  if (useMocks) return []
  return []
}

export async function getProjectById(id) {
  // GET /api/v1/projects/{id}
  if (useMocks) return null
  return unwrapData(await apiClient.get(`${base}/${id}`))
}

export async function createProject(payload) {
  // POST /api/v1/projects
  if (useMocks) return { id: `mock-project-${Date.now()}`, ...payload }
  return unwrapData(await apiClient.post(base, payload))
}

export async function updateProject(id, payload) {
  // PUT /api/v1/projects/{id}
  if (useMocks) return { id, ...payload }
  return unwrapData(await apiClient.put(`${base}/${id}`, payload))
}

export async function deleteProject(id) {
  // DELETE /api/v1/projects/{id}
  if (useMocks) return { id }
  return apiClient.delete(`${base}/${id}`)
}

export async function getProjectsByOrganization(organizationId) {
  // GET /api/v1/projects/organization/{organizationId}
  if (!organizationId) return []
  if (useMocks) return []
  return asArray(await apiClient.get(`${base}/organization/${organizationId}`))
}

export async function getProjectsByTeam(teamId) {
  // GET /api/v1/projects/team/{teamId}
  if (!teamId) return []
  if (useMocks) return []
  return asArray(await apiClient.get(`${base}/team/${teamId}`))
}
