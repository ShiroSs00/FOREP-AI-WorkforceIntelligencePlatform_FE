import { apiClient, asArray, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

const workloadBase = '/api/v1/analytics/workload-history'

export async function generateMockWorkloadHistory(employeeId) {
  // POST /api/v1/analytics/workload-history/generate-mock/{employeeId}
  return apiClient.post(`${workloadBase}/generate-mock/${employeeId}`)
}

export async function getWorkloadHistory(employeeId) {
  // GET /api/v1/analytics/workload-history/{employeeId}
  if (useMocks) return mockData.analyticsSummary
  return apiClient.get(`${workloadBase}/${employeeId}`)
}

export async function getTeamWorkloadHistory(teamId) {
  // GET /api/v1/analytics/workload-history/team/{teamId}
  if (useMocks) return mockData.analyticsSummary
  return asArray(await apiClient.get(`${workloadBase}/team/${teamId}`))
}

export async function getOrganizationWorkloadHistory(organizationId) {
  // GET /api/v1/analytics/workload-history/organization/{organizationId}
  if (useMocks) return mockData.analyticsSummary
  return asArray(await apiClient.get(`${workloadBase}/organization/${organizationId}`))
}

export async function getMyWorkloadHistory() {
  // GET /api/v1/analytics/workload-history/my-history
  if (useMocks) return mockData.analyticsSummary
  return asArray(await apiClient.get(`${workloadBase}/my-history`))
}

export async function getManagedTeamsWorkloadHistory() {
  // GET /api/v1/analytics/workload-history/managed-teams
  if (useMocks) return mockData.analyticsSummary
  return asArray(await apiClient.get(`${workloadBase}/managed-teams`))
}

export async function getAnalyticsSummary() {
  if (useMocks) return mockData.analyticsSummary
  return getOrganizationWorkloadHistory('current')
}

export async function getWorkloadAnalytics() {
  if (useMocks) return { panels: mockData.analyticsSummary.overview }
  return getOrganizationWorkloadHistory('current')
}

export async function getProductivityAnalytics() {
  if (useMocks) return { panels: mockData.analyticsSummary.overview }
  return getOrganizationWorkloadHistory('current')
}
