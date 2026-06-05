import { getApiErrorMessage, normalizeArray, normalizeObject } from './responseNormalizer.js'

const baseURL = import.meta.env.VITE_API_BASE_URL
export const dataMode = import.meta.env.VITE_DATA_MODE ?? (import.meta.env.VITE_USE_MOCKS === 'true' ? 'mock' : 'api')
export const useMocks = dataMode === 'mock'
export const tokenStorageKey = 'forep_auth_token'
const requestTimeoutMs = 15000

// Current prototype uses React + Vite for fast development.
// Production frontend may migrate to Next.js App Router for SSR and SEO.

export class ApiNotConfiguredError extends Error {
  constructor(message = 'Backend API is not connected yet.') {
    super(message)
    this.name = 'ApiNotConfiguredError'
  }
}

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function withQuery(path, params = {}) {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  if (!entries.length) return path
  const query = new URLSearchParams(entries).toString()
  return `${path}${path.includes('?') ? '&' : '?'}${query}`
}

function getStoredToken() {
  return localStorage.getItem(tokenStorageKey)
}

function buildUrl(path) {
  if (!baseURL) throw new ApiNotConfiguredError()
  return `${baseURL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}

async function parseResponse(response) {
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiRequest(path, options = {}) {
  const token = getStoredToken()
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), requestTimeoutMs)
  const headers = {
    Accept: 'application/json',
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  try {
    const response = await fetch(buildUrl(path), { ...options, headers, signal: controller.signal })
    const payload = await parseResponse(response)

    if (!response.ok) {
      const details = {
        method: options.method ?? 'GET',
        path,
        response: payload,
      }
      const apiError = new ApiError(payload?.message ?? payload?.error, response.status, details)
      if (response.status === 401) {
        localStorage.removeItem(tokenStorageKey)
        window.dispatchEvent(new CustomEvent('forep-auth-expired'))
      }
      throw new ApiError(getApiErrorMessage(apiError), response.status, details)
    }

    return payload
  } catch (error) {
    if (error instanceof ApiError || error instanceof ApiNotConfiguredError) throw error
    throw new ApiError(getApiErrorMessage(error), 0, error)
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export const apiClient = {
  get: (path, options) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options) => apiRequest(path, { ...options, method: 'POST', ...(body === undefined ? {} : { body: body instanceof FormData ? body : JSON.stringify(body) }) }),
  put: (path, body, options) => apiRequest(path, { ...options, method: 'PUT', ...(body === undefined ? {} : { body: body instanceof FormData ? body : JSON.stringify(body) }) }),
  patch: (path, body, options) => apiRequest(path, { ...options, method: 'PATCH', ...(body === undefined ? {} : { body: body instanceof FormData ? body : JSON.stringify(body) }) }),
  delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
}

export const asArray = normalizeArray
export const unwrapData = normalizeObject
