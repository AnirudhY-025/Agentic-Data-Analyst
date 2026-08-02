import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export interface Dataset { name: string; size: number }
export interface AnalyzeRequest {
  dataset_name: string
  question: string
  model: string
  date_column?: string | null
  metric_column?: string | null
  group_column?: string | null
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
  const ws = new WebSocket(`${proto}://${window.location.host}/ws/workflow`)
  ws.onopen = () => ws.send(JSON.stringify(request))
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
  ollama: ModelEntry[]
  openrouter: ModelEntry[]
  openrouter_configured: boolean
}
export const getModels = () => api.get<ModelsResponse>('/models').then(r => r.data)
export const getSettings = () =>
  api.get<{ openrouter_configured: boolean; openrouter_key_preview: string | null; ollama_base_url: string }>('/settings').then(r => r.data)
export const saveSettings = (body: { openrouter_api_key: string }) =>
  api.post<{ success: boolean; openrouter_configured: boolean }>('/settings', body).then(r => r.data)
