import { apiClient, asArray, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

const base = '/api/v1/attendance'

export async function checkIn(payload = {}) {
  // POST /api/v1/attendance/check-in
  if (useMocks) return { id: `mock-attendance-${Date.now()}`, status: 'Present', ...payload }
  return apiClient.post(`${base}/check-in`, payload)
}

export async function checkOut(payload = {}) {
  // POST /api/v1/attendance/check-out
  if (useMocks) return { status: 'Checked Out', ...payload }
  return apiClient.post(`${base}/check-out`, payload)
}

export async function getAttendanceByTeam(teamId) {
  // GET /api/v1/attendance/team/{teamId}
  if (useMocks) return mockData.attendanceRecords.filter((record) => record.teamId === teamId)
  return asArray(await apiClient.get(`${base}/team/${teamId}`))
}

export async function getAttendanceByOrganization(organizationId) {
  // GET /api/v1/attendance/organization/{organizationId}
  if (useMocks) return mockData.attendanceRecords
  return asArray(await apiClient.get(`${base}/organization/${organizationId}`))
}

export async function getMyAttendanceHistory() {
  // GET /api/v1/attendance/my-history
  if (useMocks) return mockData.attendanceRecords.slice(0, 3)
  return asArray(await apiClient.get(`${base}/my-history`))
}

export async function getManagedTeamAttendance() {
  // GET /api/v1/attendance/managed-teams
  if (useMocks) return mockData.attendanceRecords
  return asArray(await apiClient.get(`${base}/managed-teams`))
}

export async function getAttendanceByEmployee(employeeId) {
  // GET /api/v1/attendance/employee/{employeeId}
  if (useMocks) return mockData.attendanceRecords.filter((record) => record.employeeId === employeeId)
  return asArray(await apiClient.get(`${base}/employee/${employeeId}`))
}

export async function getAttendanceRecords() {
  return getAttendanceByOrganization('current')
}
