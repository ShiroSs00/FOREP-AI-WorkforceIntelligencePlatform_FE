import { apiRequest, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

export async function getLeaveRequests() {
  // GET /api/leave-requests
  if (useMocks) return mockData.leaveRequests
  return apiRequest('/api/leave-requests')
}

export async function approveLeaveRequest(id) {
  // PATCH /api/leave-requests/{id}/approve
  if (useMocks) return { id, status: 'Approved' }
  return apiRequest(`/api/leave-requests/${id}/approve`, { method: 'PATCH' })
}

export async function rejectLeaveRequest(id) {
  // PATCH /api/leave-requests/{id}/reject
  if (useMocks) return { id, status: 'Rejected' }
  return apiRequest(`/api/leave-requests/${id}/reject`, { method: 'PATCH' })
}
