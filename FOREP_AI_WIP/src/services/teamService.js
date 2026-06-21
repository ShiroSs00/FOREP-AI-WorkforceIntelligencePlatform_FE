import { apiClient, asArray, unwrapData, useMocks, withQuery } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

const base = '/api/v1/teams'

export async function getTeams() {
  // GET /api/v1/teams
  if (useMocks) return mockData.teams
  return asArray(await apiClient.get(base))
}

export async function createTeam(payload) {
  // POST /api/v1/teams
  if (useMocks) return { id: `mock-team-${Date.now()}`, ...payload }
  return unwrapData(await apiClient.post(base, payload))
}

export async function getTeamById(id) {
  // GET /api/v1/teams/{id}
  if (useMocks) return mockData.teams.find((team) => team.id === id) ?? null
  return unwrapData(await apiClient.get(`${base}/${id}`))
}

export async function updateTeam(id, payload) {
  // PUT /api/v1/teams/{id}
  if (useMocks) return { id, ...payload }
  return unwrapData(await apiClient.put(`${base}/${id}`, payload))
}

export async function deleteTeam(id) {
  // DELETE /api/v1/teams/{id}
  if (useMocks) return { id }
  return apiClient.delete(`${base}/${id}`)
}

export async function assignEmployee(teamId, payload) {
  // PUT /api/v1/teams/{id}/assign-employee?employeeId={employeeId}
  const employeeId = typeof payload === 'string' ? payload : payload?.employeeId
  if (useMocks) return { teamId, employeeId }
  return unwrapData(await apiClient.put(withQuery(`${base}/${teamId}/assign-employee`, { employeeId })))
}

export async function requestTeamMembership(teamId) {
  // POST /api/v1/teams/{id}/members/request
  if (useMocks) return { teamId, status: 'REQUESTED' }
  return unwrapData(await apiClient.post(`${base}/${teamId}/members/request`))
}

export async function approveMembership(membershipId) {
  // POST /api/v1/teams/memberships/{membershipId}/approve
  if (useMocks) return { membershipId, status: 'APPROVED' }
  return unwrapData(await apiClient.post(`${base}/memberships/${membershipId}/approve`))
}

export async function endActiveMembership(employeeId) {
  // POST /api/v1/teams/members/{employeeId}/end-active
  if (useMocks) return { employeeId, status: 'ENDED' }
  return unwrapData(await apiClient.post(`${base}/members/${employeeId}/end-active`))
}

export async function getTeamMembers(teamId) {
  // GET /api/v1/teams/{id}/members
  if (useMocks) return mockData.employees.filter((employee) => employee.teamId === teamId || employee.team === teamId)
  return asArray(await apiClient.get(`${base}/${teamId}/members`))
}

export async function getTeamsByOrganization(organizationId) {
  // GET /api/v1/teams/organization/{organizationId}
  if (useMocks) return mockData.teams
  return asArray(await apiClient.get(`${base}/organization/${organizationId}`))
}

export async function getMyManagedTeams() {
  // GET /api/v1/teams/my-managed-teams
  if (useMocks) return mockData.teams
  return asArray(await apiClient.get(`${base}/my-managed-teams`))
}

export async function getTeamsManagedBy(managerId) {
  // GET /api/v1/teams/managed-by/{managerId}
  if (useMocks) return mockData.teams.filter((team) => team.managerId === managerId)
  return asArray(await apiClient.get(`${base}/managed-by/${managerId}`))
}
