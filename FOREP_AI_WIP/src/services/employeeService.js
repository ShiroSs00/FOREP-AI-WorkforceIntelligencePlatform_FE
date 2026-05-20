import { apiRequest, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

export async function getEmployees() {
  // GET /api/employees
  if (useMocks) return mockData.employees
  return apiRequest('/api/employees')
}

export async function getEmployeeById(id) {
  // GET /api/employees/{id}
  if (useMocks) return mockData.employees.find((employee) => employee.id === id) ?? null
  return apiRequest(`/api/employees/${id}`)
}
