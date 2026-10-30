import axios from 'axios'
import { auth } from './firebase'

const api = axios.create({ baseURL: '/api' })

const getActiveUserId = (): string => {
  if (auth?.currentUser?.uid) return auth.currentUser.uid
  try {
    const saved = localStorage.getItem('insightflow_guest_user')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed?.uid) return parsed.uid
    }
  } catch { /* ignore */ }
  return 'default'
}

api.interceptors.request.use((config) => {
  const uid = getActiveUserId()
  if (uid) {
    config.headers['X-User-ID'] = uid
  }
  return config
})

export interface Dataset { name: string; size: number }
export interface AnalyzeRequest {
  dataset_name: string
  question: string
  model: string
  openrouter_api_key?: string | null
  date_column?: string | null
  metric_column?: string | null
  group_column?: string | null
}

export const USER_OPENROUTER_KEY_STORAGE = 'insightflow_openrouter_api_key'

export const getUserOpenRouterKey = (): string => {
  try {
    return localStorage.getItem(USER_OPENROUTER_KEY_STORAGE)?.trim() || ''
  } catch {
    return ''
  }
}

export const setUserOpenRouterKey = (key: string): void => {
  try {
    if (key.trim()) {
      localStorage.setItem(USER_OPENROUTER_KEY_STORAGE, key.trim())
    } else {
      localStorage.removeItem(USER_OPENROUTER_KEY_STORAGE)
    }
  } catch {
    /* ignore storage errors */
  }
}

export const getDatasets = () => api.get<{ datasets: Dataset[] }>('/datasets').then(r => r.data)
export const uploadDataset = (file: File) => {
  const fd = new FormData(); fd.append('file', file)
  return api.post<{ filename: string; size: number }>('/upload', fd).then(r => r.data)
}
export const getPreview = (name: string) => api.get(`/datasets/${encodeURIComponent(name)}/preview`).then(r => r.data)
export const getColumns = (name: string) => api.get(`/datasets/${encodeURIComponent(name)}/columns`).then(r => r.data)
export const getAnalysis = () => api.get('/analysis').then(r => r.data)
export const getCharts = () => api.get<{ charts: { filename: string; url: string; title: string }[] }>('/charts').then(r => r.data)
export const getReports = () => api.get<{ reports: { filename: string; format: string; size: number; url: string }[] }>('/reports').then(r => r.data)
export const getReportContent = (filename: string) => api.get(`/reports/${encodeURIComponent(filename)}/content`).then(r => r.data)

export function createWorkflowSocket(
  request: AnalyzeRequest,
  onEvent: (event: WorkflowEvent) => void
): WebSocket {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const userId = getActiveUserId()

  // Inject user's local OpenRouter API key if running an OpenRouter model
  const payload = { ...request }
  if (payload.model.startsWith('openrouter/') && !payload.openrouter_api_key) {
    const key = getUserOpenRouterKey()
    if (key) payload.openrouter_api_key = key
  }

  const ws = new WebSocket(`${proto}://${window.location.host}/ws/workflow?user_id=${userId}`)
  ws.onopen = () => ws.send(JSON.stringify(payload))
  ws.onmessage = (e) => {
    try { onEvent(JSON.parse(e.data)) } catch { /* ignore */ }
  }
  return ws
}

export interface WorkflowEvent {
  type: 'step' | 'complete' | 'error'
  step?: number
  label?: string
  status?: 'running' | 'done' | 'warning'
  detail?: string
  results?: AnalysisResults
  message?: string
}

export interface AnalysisResults {
  quality: Record<string, unknown>
  statistics: Record<string, unknown>
  correlation: Record<string, unknown>
  trend: { date_column: string | null; metric_column: string | null; trend_points: { period: string; value: number }[] }
  distribution: { distributions: { column: string; mean: number; median: number; std: number; skew: number }[] }
  grouping: { group_column: string | null; metric_column: string | null; groups: Record<string, unknown>[] }
  outliers: { outlier_summary: { column: string; outlier_count: number; outlier_rate: number }[] }
  charts: { filename: string; url: string; title: string; chart_type: string }[]
  crew_result: string | null
  crew_error: string | null
  reports: { markdown: string; pdf: string }
  dataset_overview: Record<string, unknown>
  clean_summary: Record<string, unknown>
}

// ── Models & Settings ──────────────────────────────────────────────────────
export interface ModelEntry { id: string; label: string; provider: string; free: boolean }
export interface ModelsResponse {
  standard?: ModelEntry
  ollama: ModelEntry[]
  openrouter: ModelEntry[]
  ollama_available: boolean
}
export const getModels = () => api.get<ModelsResponse>('/models').then(r => r.data)
export const getSettings = () =>
  api.get<{ ollama_available: boolean; ollama_base_url: string }>('/settings').then(r => r.data)
export const saveSettings = (body: { openrouter_api_key: string }) =>
  api.post<{ success: boolean; valid: boolean }>('/settings', body).then(r => r.data)
