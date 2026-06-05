import { apiClient, asArray, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

const base = '/api/v1/leaves'

export async function getLeaveRequests() {
  // GET /api/v1/leaves
  if (useMocks) return mockData.leaveRequests
  return asArray(await apiClient.get(base))
}

export async function createLeaveRequest(payload) {
  // POST /api/v1/leaves
  if (useMocks) return { id: `mock-leave-${Date.now()}`, status: 'Pending', ...payload }
  return apiClient.post(base, payload)
}

export async function approveLeaveRequest(id) {
  // PUT /api/v1/leaves/{id}/approve
  if (useMocks) return { id, status: 'Approved' }
  return apiClient.put(`${base}/${id}/approve`)
}

export async function rejectLeaveRequest(id) {
  // PUT /api/v1/leaves/{id}/reject
  if (useMocks) return { id, status: 'Rejected' }
  return apiClient.put(`${base}/${id}/reject`)
}

export async function getLeavesByTeam(teamId) {
  // GET /api/v1/leaves/team/{teamId}
  if (useMocks) return mockData.leaveRequests.filter((request) => request.teamId === teamId)
  return asArray(await apiClient.get(`${base}/team/${teamId}`))
}

export async function getLeavesByStatus(status) {
  // GET /api/v1/leaves/status/{status}
  if (useMocks) return mockData.leaveRequests.filter((request) => request.status === status)
  return asArray(await apiClient.get(`${base}/status/${status}`))
}

export async function getLeavesByOrganization(organizationId) {
  // GET /api/v1/leaves/organization/{organizationId}
  if (useMocks) return mockData.leaveRequests
  return asArray(await apiClient.get(`${base}/organization/${organizationId}`))
}

export async function getMyLeaveHistory() {
  // GET /api/v1/leaves/my-history
  if (useMocks) return mockData.leaveRequests.slice(0, 2)
  return asArray(await apiClient.get(`${base}/my-history`))
}

export async function getManagedTeamLeaves() {
  // GET /api/v1/leaves/managed-teams
  if (useMocks) return mockData.leaveRequests
  return asArray(await apiClient.get(`${base}/managed-teams`))
}

export async function getLeavesByEmployee(employeeId) {
  // GET /api/v1/leaves/employee/{employeeId}
  if (useMocks) return mockData.leaveRequests.filter((request) => request.employeeId === employeeId)
  return asArray(await apiClient.get(`${base}/employee/${employeeId}`))
}
