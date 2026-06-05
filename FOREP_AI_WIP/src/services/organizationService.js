import { apiClient, asArray, unwrapData, useMocks } from './apiClient.js'

const base = '/api/v1/organizations'

export async function getOrganizations() {
  // GET /api/v1/organizations
  if (useMocks) return []
  return asArray(await apiClient.get(base))
}

export async function getOrganizationById(id) {
  // GET /api/v1/organizations/{id}
  if (useMocks) return null
  return unwrapData(await apiClient.get(`${base}/${id}`))
}

export async function createOrganization(payload) {
  // POST /api/v1/organizations
  if (useMocks) return { id: `mock-org-${Date.now()}`, ...payload }
  return unwrapData(await apiClient.post(base, payload))
}

export async function updateOrganization(id, payload) {
  // PUT /api/v1/organizations/{id}
  if (useMocks) return { id, ...payload }
  return unwrapData(await apiClient.put(`${base}/${id}`, payload))
}

export async function deleteOrganization(id) {
  // DELETE /api/v1/organizations/{id}
  if (useMocks) return { id }
  return apiClient.delete(`${base}/${id}`)
}
