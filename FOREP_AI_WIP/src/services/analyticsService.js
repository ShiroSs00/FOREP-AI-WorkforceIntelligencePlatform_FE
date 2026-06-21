import { apiClient, asArray, unwrapData, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

const workloadBase = '/api/v1/analytics/workload-history'
const analyticsBase = '/api/v1/analytics'
const burnoutBase = '/api/v1/burnout'

export async function getAnalyticsDashboard() {
  // GET /api/v1/analytics/dashboard
  if (useMocks) return { totalTasks: 0, completedTasks: 0, overdueTasks: 0, workloadByEmployee: [], burnoutRiskCount: {}, recentActivity: [], aiInsightSummary: {} }
  return unwrapData(await apiClient.get(`${analyticsBase}/dashboard`))
}

export async function getMyAnalyticsSummary() {
  // GET /api/v1/analytics/summary/my-summary
  if (useMocks) return {}
  return unwrapData(await apiClient.get(`${analyticsBase}/summary/my-summary`))
}

export async function getUserAnalyticsSummary(employeeId) {
  // GET /api/v1/analytics/summary/users/{employeeId}
  if (useMocks) return {}
  return unwrapData(await apiClient.get(`${analyticsBase}/summary/users/${employeeId}`))
}

export async function getTeamAnalyticsSummary(teamId) {
  // GET /api/v1/analytics/summary/teams/{teamId}
  if (useMocks) return {}
  return unwrapData(await apiClient.get(`${analyticsBase}/summary/teams/${teamId}`))
}

export async function getMyBurnout() {
  // GET /api/v1/burnout/my-burnout
  if (useMocks) return {}
  return unwrapData(await apiClient.get(`${burnoutBase}/my-burnout`))
}

export async function getUserBurnout(employeeId) {
  // GET /api/v1/burnout/users/{employeeId}
  if (useMocks) return {}
  return unwrapData(await apiClient.get(`${burnoutBase}/users/${employeeId}`))
}

export async function getTeamBurnout(teamId) {
  // GET /api/v1/burnout/teams/{teamId}
  if (useMocks) return {}
  return unwrapData(await apiClient.get(`${burnoutBase}/teams/${teamId}`))
}

export async function generateMockWorkloadHistory(employeeId) {
  // POST /api/v1/analytics/workload-history/generate-mock/{employeeId}
  return apiClient.post(`${workloadBase}/generate-mock/${employeeId}`)
}

export async function getWorkloadHistory(employeeId) {
  // GET /api/v1/analytics/workload-history/{employeeId}
  if (useMocks) return mockData.analyticsSummary
  return asArray(await apiClient.get(`${workloadBase}/${employeeId}`))
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
