import { apiRequest, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

export async function getTeams() {
  // GET /api/teams
  if (useMocks) return mockData.teams
  return apiRequest('/api/teams')
}

export async function getTeamById(id) {
  // GET /api/teams/{id}
  if (useMocks) return mockData.teams.find((team) => team.id === id) ?? null
  return apiRequest(`/api/teams/${id}`)
}
