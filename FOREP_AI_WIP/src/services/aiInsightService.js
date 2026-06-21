import { apiClient, asArray, useMocks } from './apiClient.js'
import { normalizeObject } from './responseNormalizer.js'
import { mockData } from '../mocks/mockData.js'

const base = '/api/v1/ai'

function requireId(value, label) {
  if (!value) throw new Error(`${label} is required before loading AI insights.`)
  return value
}

export async function generateInsight(employeeId) {
  // POST /api/v1/ai/generate/{employeeId}
  if (useMocks) return { status: 'mock-disabled', message: 'Mock mode does not call the AI service.' }
  return normalizeObject(await apiClient.post(`${base}/generate/${requireId(employeeId, 'Employee id')}`))
}

export async function getInsightsByEmployee(employeeId) {
  // GET /api/v1/ai/insights/{employeeId}
  if (useMocks) return mockData.aiInsights
  return asArray(await apiClient.get(`${base}/insights/${requireId(employeeId, 'Employee id')}`))
}

export async function getInsightsByTeam(teamId) {
  // GET /api/v1/ai/insights/team/{teamId}
  if (useMocks) return mockData.aiInsights
  return asArray(await apiClient.get(`${base}/insights/team/${requireId(teamId, 'Team id')}`))
}

export async function getInsightsByOrganization(organizationId) {
  // GET /api/v1/ai/insights/organization/{organizationId}
  if (useMocks) return mockData.aiInsights
  return asArray(await apiClient.get(`${base}/insights/organization/${requireId(organizationId, 'Organization id')}`))
}

export async function getInsightsByProject(projectId) {
  // GET /api/v1/ai/insights/project/{projectId}
  if (useMocks) return mockData.aiInsights
  return asArray(await apiClient.get(`${base}/insights/project/${requireId(projectId, 'Project id')}`))
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

export async function getAiRuntimeStatus() {
  // GET /api/v1/ai/runtime-status
  if (useMocks) return {}
  return normalizeObject(await apiClient.get(`${base}/runtime-status`))
}

export async function getInsights() {
  return getInsightsByOrganization('current')
}

export async function requestInsightGeneration(payload) {
  return generateInsight(payload?.employeeId)
}
