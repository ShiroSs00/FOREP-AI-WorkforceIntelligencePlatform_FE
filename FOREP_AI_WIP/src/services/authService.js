import { apiRequest } from './apiClient.js'

export async function login(payload) {
  // Future endpoint: POST /api/auth/login
  if (!payload) return { redirectTo: '/dashboard' }
  return { redirectTo: '/dashboard' }
}

export async function logout() {
  // Future endpoint: POST /api/auth/logout
  return { redirectTo: '/login' }
}

export async function getCurrentUser() {
  // Future endpoint: GET /api/auth/me
  try {
    return apiRequest('/api/auth/me')
  } catch {
    return null
  }
}
