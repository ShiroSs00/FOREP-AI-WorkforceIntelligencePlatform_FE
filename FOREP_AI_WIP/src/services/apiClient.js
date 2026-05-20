const baseURL = import.meta.env.VITE_API_BASE_URL
export const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export class ApiNotConfiguredError extends Error {
  constructor(message = 'Backend API is not connected yet.') {
    super(message)
    this.name = 'ApiNotConfiguredError'
  }
}

export async function apiRequest(path, options = {}) {
  if (!baseURL) {
    throw new ApiNotConfiguredError()
  }

  const response = await fetch(`${baseURL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  if (response.status === 204) return null
  return response.json()
}
