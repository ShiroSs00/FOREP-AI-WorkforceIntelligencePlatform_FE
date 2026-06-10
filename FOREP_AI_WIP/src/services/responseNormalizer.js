export function normalizeArray(response) {
  if (Array.isArray(response)) return response
  if (!response || typeof response !== 'object') return []
  for (const key of ['data', 'content', 'items', 'result', 'results', 'records', 'payload']) {
    if (Array.isArray(response[key])) return response[key]
  }
  for (const key of ['data', 'result', 'payload']) {
    if (response[key] && typeof response[key] === 'object') return normalizeArray(response[key])
  }
  return []
}

export function normalizeObject(response) {
  if (!response || typeof response !== 'object') return {}
  for (const key of ['data', 'content', 'items', 'result', 'payload']) {
    if (response[key] && typeof response[key] === 'object' && !Array.isArray(response[key])) return response[key]
  }
  return response
}

export function normalizePage(response) {
  const source = normalizeObject(response)
  const content = normalizeArray(source)
  return {
    content,
    totalElements: source.totalElements ?? source.total ?? content.length,
    totalPages: source.totalPages ?? source.pages ?? 1,
    number: source.number ?? source.page ?? 0,
    size: source.size ?? content.length,
  }
}

export function extractToken(response) {
  return response?.token
    ?? response?.accessToken
    ?? response?.jwt
    ?? response?.data?.token
    ?? response?.data?.accessToken
    ?? response?.data?.jwt
    ?? response?.result?.token
    ?? response?.result?.accessToken
    ?? response?.result?.jwt
    ?? response?.payload?.token
    ?? response?.payload?.accessToken
    ?? response?.payload?.jwt
    ?? null
}

export function extractUser(response) {
  return response?.user
    ?? response?.data?.user
    ?? response?.result?.user
    ?? response?.payload?.user
    ?? response?.data
    ?? response?.result
    ?? response?.payload
    ?? response
    ?? null
}

export function extractBackendMessage(response, fallback = '') {
  if (!response) return fallback
  if (typeof response === 'string') return response || fallback

  const source = response.response && typeof response.response === 'object' ? response.response : response
  const messages = [
    source?.message,
    source?.error,
    source?.data?.message,
    source?.data?.error,
    source?.result?.message,
    source?.result?.error,
    source?.payload?.message,
    source?.payload?.error,
  ].filter(Boolean)

  const errorList = source?.errors ?? source?.data?.errors ?? source?.result?.errors ?? source?.payload?.errors
  if (Array.isArray(errorList) && errorList.length) {
    const details = errorList.map((item) => {
      if (typeof item === 'string') return item
      return item?.message ?? item?.defaultMessage ?? item?.detail ?? item?.reason ?? formatApiValue(item)
    }).filter(Boolean).join(' ')
    return [messages[0], details].filter(Boolean).join(': ') || fallback
  }
  if (errorList && typeof errorList === 'object') {
    const details = Object.values(errorList).flat().map((item) => (typeof item === 'string' ? item : formatApiValue(item))).filter(Boolean).join(' ')
    return [messages[0], details].filter(Boolean).join(': ') || fallback
  }

  return messages[0] ?? fallback
}

function firstValue(item, keys, fallback = '-') {
  if (!item || typeof item !== 'object') return fallback
  for (const key of keys) {
    const value = item[key]
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object') return getName(value) !== 'Untitled' ? getName(value) : fallback
      return value
    }
  }
  return fallback
}

export function getId(item) {
  return firstValue(item, ['id', 'employeeId', 'taskId', 'teamId', 'organizationId', 'notificationId', 'leaveId', 'attendanceId', 'insightId', 'suggestionId', 'sprintId'], 'missing-id')
}

export function getName(item) {
  if (item?.firstName || item?.lastName) return `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim()
  return firstValue(item, ['name', 'fullName', 'title', 'username', 'email', 'organizationName', 'teamName', 'sprintName', 'summary', 'sourceTaskTitle'], 'Untitled')
}

export function getStatus(item) {
  return firstValue(item, ['status', 'taskStatus', 'attendanceStatus', 'leaveStatus', 'burnoutRisk'], 'Unknown')
}

export function getDate(item) {
  return firstValue(item, ['createdAt', 'updatedAt', 'date', 'timestamp', 'dueDate', 'startDate', 'checkInDate'], '-')
}

export function valueOf(item, keys, fallback = '-') {
  return firstValue(item, keys, fallback)
}

export function formatApiValue(value, fallback = '-') {
  if (value === undefined || value === null || value === '') return fallback
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.length ? `${value.length} item${value.length === 1 ? '' : 's'}` : fallback
  if (typeof value === 'object') return getName(value) !== 'Untitled' ? getName(value) : JSON.stringify(value)
  return String(value)
}

export function humanizeKey(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function getDisplayFields(item, preferredKeys = [], limit = 6) {
  if (!item || typeof item !== 'object') return []
  const keys = [
    ...preferredKeys,
    ...Object.keys(item).filter((key) => !preferredKeys.includes(key)),
  ]
  return keys
    .filter((key) => item[key] !== undefined && item[key] !== null && item[key] !== '')
    .slice(0, limit)
    .map((key) => ({ key, label: humanizeKey(key), value: formatApiValue(item[key]) }))
}

export function getApiErrorMessage(error) {
  if (!error) return 'Backend API is unavailable or waking up. Please retry in a moment.'
  if (error.name === 'AbortError') return 'Backend API is unavailable or waking up. Please retry in a moment.'
  const response = error.details?.response ?? error.details
  const backendMessage = extractBackendMessage(response, error.message)
  if (backendMessage && backendMessage !== 'undefined') return backendMessage
  if (error.status === 401) return 'Session expired. Please log in again.'
  if (error.status === 403) return 'You do not have permission to access this feature.'
  if (error.status === 404) return 'This feature is not available in the backend yet.'
  if (error.status >= 500) {
    if (String(backendMessage).toLowerCase().includes('constraint') || String(backendMessage).toLowerCase().includes('foreign key')) {
      return 'This record cannot be changed because related data still depends on it.'
    }
    return 'Backend could not process this request. Please retry or contact the backend owner.'
  }
  if (!error.status) return 'Backend API is unavailable or waking up. Please retry in a moment.'
  return backendMessage ?? 'Backend API is unavailable or waking up. Please retry in a moment.'
}
