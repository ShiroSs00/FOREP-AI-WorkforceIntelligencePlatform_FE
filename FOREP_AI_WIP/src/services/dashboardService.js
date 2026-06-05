import { apiClient, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

export async function getEmployeeDashboard(employeeId) {
  // GET /api/v1/dashboard/employee/{employeeId}
  if (useMocks) return { employeeId, tasks: mockData.tasks.slice(0, 3), insights: mockData.aiInsights.slice(0, 2) }
  return apiClient.get(`/api/v1/dashboard/employee/${employeeId}`)
}

export async function getAdminDashboard() {
  // GET /api/v1/admin/dashboard
  if (useMocks) return { organizations: [], notifications: mockData.notifications }
  return apiClient.get('/api/v1/admin/dashboard')
}
