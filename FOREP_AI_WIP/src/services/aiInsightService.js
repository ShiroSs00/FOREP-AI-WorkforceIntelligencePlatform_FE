import { apiClient, asArray, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

const base = '/api/v1/ai'

export async function generateInsight(employeeId) {
  // POST /api/v1/ai/generate/{employeeId}
  if (useMocks) return { status: 'mock-disabled', message: 'Mock mode does not call the AI service.' }
  return apiClient.post(`${base}/generate/${employeeId}`)
}

export async function getInsightsByEmployee(employeeId) {
  // GET /api/v1/ai/insights/{employeeId}
  if (useMocks) return mockData.aiInsights
  return asArray(await apiClient.get(`${base}/insights/${employeeId}`))
}

export async function getInsightsByTeam(teamId) {
  // GET /api/v1/ai/insights/team/{teamId}
  if (useMocks) return mockData.aiInsights
  return asArray(await apiClient.get(`${base}/insights/team/${teamId}`))
}

export async function getInsightsByOrganization(organizationId) {
  // GET /api/v1/ai/insights/organization/{organizationId}
  if (useMocks) return mockData.aiInsights
  return asArray(await apiClient.get(`${base}/insights/organization/${organizationId}`))
}

export async function getMyInsights() {
  // GET /api/v1/ai/insights/my-insights
  if (useMocks) return mockData.aiInsights.slice(0, 3)
  return asArray(await apiClient.get(`${base}/insights/my-insights`))
}

export async function getManagedTeamInsights() {
  // GET /api/v1/ai/insights/managed-teams
  if (useMocks) return mockData.aiInsights
  return asArray(await apiClient.get(`${base}/insights/managed-teams`))
}

export async function getInsights() {
  return getInsightsByOrganization('current')
}

export async function requestInsightGeneration(payload) {
  return generateInsight(payload?.employeeId)
}
