import { apiClient, tokenStorageKey, unwrapData, useMocks } from './apiClient.js'
import { extractToken, extractUser } from './responseNormalizer.js'

function decodeJwtPayload(token) {
  if (!token || !token.includes('.')) return null
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(atob(payload).split('').map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`).join(''))
    return JSON.parse(json)
  } catch {
    return null
  }
}

function hasAccountIdentity(value) {
  if (!value || typeof value !== 'object') return false
  return Boolean(
    value.role
    || value.roleName
    || value.authorities
    || value.roles
    || value.email
    || value.username
    || value.employeeId
    || value.organizationId
  )
}

function mergeAccountPayload(response, token) {
  const extracted = extractUser(response)
  const decoded = decodeJwtPayload(token)
  if (hasAccountIdentity(extracted) && hasAccountIdentity(decoded)) return { ...decoded, ...extracted }
  if (hasAccountIdentity(extracted)) return extracted
  if (hasAccountIdentity(decoded)) return decoded
  return extracted ?? decoded
}

export function getToken() {
  return localStorage.getItem(tokenStorageKey)
}

export function setToken(token) {
  if (token) localStorage.setItem(tokenStorageKey, token)
}

export function clearToken() {
  localStorage.removeItem(tokenStorageKey)
}

export function isAuthenticated() {
  return Boolean(getToken())
}

export async function login(credentials) {
  // POST /api/v1/auth/login
  if (useMocks) {
    const token = 'mock-development-token'
    setToken(token)
    return { token, redirectTo: '/dashboard' }
  }

  const response = await apiClient.post('/api/v1/auth/login', credentials)
  const token = extractToken(response)
  // TODO: Backend login response should return JWT token.
  if (token) setToken(token)
  const user = mergeAccountPayload(response, token)
  return { ...unwrapData(response), token, user, redirectTo: '/dashboard' }
}

export async function register(payload) {
  // POST /api/v1/auth/register
  if (useMocks) return { id: `mock-user-${Date.now()}`, ...payload }
  const response = await apiClient.post('/api/v1/auth/register', payload)
  const token = extractToken(response)
  if (token) setToken(token)
  const user = mergeAccountPayload(response, token)
  return { ...unwrapData(response), token, user }
}

export async function logout() {
  // POST /api/v1/auth/logout
  try {
    if (!useMocks) await apiClient.post('/api/v1/auth/logout')
  } finally {
    clearToken()
  }
  return { redirectTo: '/login' }
}

export async function getCurrentUser() {
  // GET /api/v1/auth/me
  if (useMocks) return { name: 'Marcus Chen', role: 'Manager' }
  const response = await apiClient.get('/api/v1/auth/me')
  return mergeAccountPayload(response, getToken())
}

export async function getOAuth2LoginLinks() {
  // GET /api/v1/auth/oauth2/links
  if (useMocks) return { google: '', github: '', jira: '' }
  return unwrapData(await apiClient.get('/api/v1/auth/oauth2/links'))
}
