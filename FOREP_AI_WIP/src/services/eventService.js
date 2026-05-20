import { apiRequest, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

export async function getEvents() {
  // GET /api/events
  if (useMocks) return mockData.events
  return apiRequest('/api/events')
}

export async function getEventById(id) {
  // GET /api/events/{id}
  if (useMocks) return mockData.events.find((event) => event.id === id) ?? null
  return apiRequest(`/api/events/${id}`)
}
