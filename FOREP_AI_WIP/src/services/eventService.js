import { apiClient, asArray, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

export async function getEvents() {
  // GET /api/v1/events
  if (useMocks) return mockData.events
  return asArray(await apiClient.get('/api/v1/events'))
}

export async function getEventById(id) {
  // GET /api/v1/events/{id}
  if (useMocks) return mockData.events.find((event) => event.id === id) ?? null
  return apiClient.get(`/api/v1/events/${id}`)
}
