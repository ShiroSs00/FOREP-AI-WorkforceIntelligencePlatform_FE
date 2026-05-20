import { apiRequest, useMocks } from './apiClient.js'
import { mockData } from '../mocks/mockData.js'

export async function getAttendanceRecords() {
  // GET /api/attendance
  if (useMocks) return mockData.attendanceRecords
  return apiRequest('/api/attendance')
}
