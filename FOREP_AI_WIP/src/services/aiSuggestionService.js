import { apiClient, asArray, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

const base = '/api/v1/ai/suggestions'

export async function adoptSuggestion(id) {
  // POST /api/v1/ai/suggestions/{id}/adopt
  if (useMocks) return { id, adopted: true }
  return apiClient.post(`${base}/${id}/adopt`)
}

export async function getSuggestions() {
  // GET /api/v1/ai/suggestions
  if (useMocks) return mockData.aiInsights
  return asArray(await apiClient.get(base))
}

export async function getSuggestionsByTeam(teamId) {
  // GET /api/v1/ai/suggestions/team/{teamId}
  if (useMocks) return mockData.aiInsights
  return asArray(await apiClient.get(`${base}/team/${teamId}`))
}

export async function getSuggestionsByOrganization(organizationId) {
  // GET /api/v1/ai/suggestions/organization/{organizationId}
  if (useMocks) return mockData.aiInsights
  return asArray(await apiClient.get(`${base}/organization/${organizationId}`))
}

export async function getManagedTeamSuggestions() {
  // GET /api/v1/ai/suggestions/managed-teams
  if (useMocks) return mockData.aiInsights
  return asArray(await apiClient.get(`${base}/managed-teams`))
}

export async function getSuggestionsByEmployee(employeeId) {
  // GET /api/v1/ai/suggestions/employee/{employeeId}
  if (useMocks) return mockData.aiInsights
  return asArray(await apiClient.get(`${base}/employee/${employeeId}`))
}
