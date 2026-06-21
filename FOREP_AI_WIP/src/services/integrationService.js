import { apiClient, asArray, unwrapData, useMocks } from './apiClient.js'

const base = '/api/v1/integrations'

export const integrationProviders = ['INTERNAL', 'GITHUB', 'JIRA']
export const integrationSyncStatuses = ['RUNNING', 'SUCCESS', 'FAILED']

export async function getIntegrationsByTeam(teamId) {
  // GET /api/v1/integrations/team/{teamId}
  if (!teamId) return []
  if (useMocks) return []
  return asArray(await apiClient.get(`${base}/team/${teamId}`))
}

export async function getIntegrations() {
  // Backend currently supports POST /api/v1/integrations, but not GET /api/v1/integrations.
  // Use team-scoped reads instead.
  if (useMocks) return []
  return []
}

export async function createIntegration(payload) {
  // POST /api/v1/integrations
  if (useMocks) return { id: `mock-integration-${Date.now()}`, ...payload }
  return unwrapData(await apiClient.post(base, payload))
}

export async function updateIntegration(id, payload) {
  // PUT /api/v1/integrations/{id}
  if (useMocks) return { id, ...payload }
  return unwrapData(await apiClient.put(`${base}/${id}`, payload))
}

export async function deleteIntegration(id) {
  // DELETE /api/v1/integrations/{id}
  if (useMocks) return { id }
  return apiClient.delete(`${base}/${id}`)
}

export async function syncIntegration(id) {
  // POST /api/v1/integrations/{id}/sync
  if (useMocks) return { message: 'Mock sync completed.' }
  return apiClient.post(`${base}/${id}/sync`)
}

export async function syncAllIntegrations() {
  // POST /api/v1/integrations/sync
  if (useMocks) return { message: 'Mock sync-all completed.' }
  return apiClient.post(`${base}/sync`)
}

export async function getIntegrationSyncLogs(id) {
  // GET /api/v1/integrations/{id}/sync-logs
  if (useMocks) return []
  return asArray(await apiClient.get(`${base}/${id}/sync-logs`))
}

export async function getIntegrationRuntimeStatus() {
  // GET /api/v1/integrations/runtime-status
  if (useMocks) return {}
  return unwrapData(await apiClient.get(`${base}/runtime-status`))
}

export async function connectIntegration(payload) {
  // POST /api/v1/integrations/connect
  if (useMocks) return { configId: `mock-config-${Date.now()}`, webhookRegistered: false, message: 'Mock connection created.' }
  return unwrapData(await apiClient.post(`${base}/connect`, payload))
}

export async function triggerGithubWebhook(configId, payload, signature) {
  // POST /api/v1/webhooks/github/{configId}
  if (useMocks) return { message: 'Mock GitHub webhook accepted.' }
  return apiClient.post(`/api/v1/webhooks/github/${configId}`, payload, signature ? { headers: { 'X-Hub-Signature-256': signature } } : undefined)
}

export async function triggerJiraWebhook(configId, payload) {
  // POST /api/v1/webhooks/jira/{configId}
  if (useMocks) return { message: 'Mock Jira webhook accepted.' }
  return apiClient.post(`/api/v1/webhooks/jira/${configId}`, payload)
}
