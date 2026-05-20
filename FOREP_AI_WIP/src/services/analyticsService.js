import { apiRequest, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

export async function getAnalyticsSummary() {
  // GET /api/analytics/summary
  if (useMocks) return mockData.analyticsSummary
  return apiRequest('/api/analytics/summary')
}

export async function getWorkloadAnalytics() {
  // GET /api/analytics/workload
  if (useMocks) return { panels: mockData.analyticsSummary.overview }
  return apiRequest('/api/analytics/workload')
}

export async function getProductivityAnalytics() {
  // GET /api/analytics/productivity
  if (useMocks) return { panels: mockData.analyticsSummary.overview }
  return apiRequest('/api/analytics/productivity')
}
