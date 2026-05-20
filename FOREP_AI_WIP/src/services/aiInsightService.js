import { apiRequest, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

export async function getInsights() {
  // GET /api/ai-insights
  if (useMocks) return mockData.aiInsights
  return apiRequest('/api/ai-insights')
}

export async function requestInsightGeneration(payload) {
  // POST /api/ai-insights/generate
  if (useMocks) return { status: 'mock-disabled', message: 'Mock mode does not call an AI service.', payload }
  return apiRequest('/api/ai-insights/generate', { method: 'POST', body: JSON.stringify(payload) })
}
