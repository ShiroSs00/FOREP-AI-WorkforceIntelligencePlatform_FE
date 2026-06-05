import { apiClient, asArray, unwrapData, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

const base = '/api/v1/employees'

export async function getEmployees() {
  // GET /api/v1/employees
  if (useMocks) return mockData.employees
  return asArray(await apiClient.get(base))
}

export async function getEmployeeById(id) {
  // GET /api/v1/employees/{id}
  if (useMocks) return mockData.employees.find((employee) => employee.id === id) ?? null
  return unwrapData(await apiClient.get(`${base}/${id}`))
}

export async function updateEmployee(id, payload) {
  // PUT /api/v1/employees/{id}
  if (useMocks) return { id, ...payload }
  return unwrapData(await apiClient.put(`${base}/${id}`, payload))
}

export async function deleteEmployee(id) {
  // DELETE /api/v1/employees/{id}
  if (useMocks) return { id }
  return apiClient.delete(`${base}/${id}`)
}

export async function getProfile() {
  // GET /api/v1/employees/profile
  if (useMocks) return mockData.employees[0] ?? null
  return unwrapData(await apiClient.get(`${base}/profile`))
}

export async function updateProfile(payload) {
  // PUT /api/v1/employees/profile
  if (useMocks) return { ...(mockData.employees[0] ?? {}), ...payload }
  return unwrapData(await apiClient.put(`${base}/profile`, payload))
}

export async function getEmployeesByTeam(teamId) {
  // GET /api/v1/employees/team/{teamId}
  if (useMocks) return mockData.employees.filter((employee) => employee.teamId === teamId || employee.team === teamId)
  return asArray(await apiClient.get(`${base}/team/${teamId}`))
}

export async function getEmployeesByOrganization(organizationId) {
  // GET /api/v1/employees/organization/{organizationId}
  if (useMocks) return mockData.employees
  return asArray(await apiClient.get(`${base}/organization/${organizationId}`))
}
