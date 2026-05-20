import { initialDemoData } from '../data/mockData.js'

const storageKeys = {
  employees: 'forep.employees',
  teams: 'forep.teams',
  tasks: 'forep.tasks',
  events: 'forep.events',
  attendanceRecords: 'forep.attendanceRecords',
  leaveRequests: 'forep.leaveRequests',
  aiInsights: 'forep.aiInsights',
}

export function getStorageKey(key) {
  return storageKeys[key] ?? `forep.${key}`
}

export function getData(key, fallback = []) {
  const storageKey = getStorageKey(key)
  const initialValue = fallback.length || !initialDemoData[key] ? fallback : initialDemoData[key]

  try {
    const stored = localStorage.getItem(storageKey)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(storageKey, JSON.stringify(initialValue))
    return initialValue
  } catch {
    return initialValue
  }
}

export function setData(key, value) {
  localStorage.setItem(getStorageKey(key), JSON.stringify(value))
  return value
}

export function resetDemoData() {
  Object.entries(initialDemoData).forEach(([key, value]) => {
    localStorage.setItem(getStorageKey(key), JSON.stringify(value))
  })
}
