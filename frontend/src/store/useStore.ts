import { create } from 'zustand'
import type { AnalysisResults, WorkflowEvent } from '../lib/api'

interface StepState { step: number; label: string; status: 'idle' | 'running' | 'done' | 'warning'; detail?: string }

interface AppState {
  // Dataset
  selectedDataset: string | null
  setSelectedDataset: (name: string | null) => void
  uploadedFile: File | null
  setUploadedFile: (f: File | null) => void

  // Column overrides
  dateColumn: string | null
  metricColumn: string | null
  groupColumn: string | null
  setColumnOverrides: (d: string | null, m: string | null, g: string | null) => void

  // Analysis config
  question: string
  setQuestion: (q: string) => void
  model: string
  setModel: (m: string) => void

  // Workflow
  workflowRunning: boolean
  workflowDone: boolean
  steps: StepState[]
  results: AnalysisResults | null
  workflowError: string | null
  startWorkflow: () => void
  handleWorkflowEvent: (event: WorkflowEvent) => void
  resetWorkflow: () => void
}

const INITIAL_STEPS: StepState[] = [
  { step: 1, label: 'Cleaning & validating dataset', status: 'idle' },
  { step: 2, label: 'Generating data quality report', status: 'idle' },
  { step: 3, label: 'Computing statistics & analysis', status: 'idle' },
  { step: 4, label: 'Generating visualizations', status: 'idle' },
  { step: 5, label: 'Building Markdown & PDF reports', status: 'idle' },
  { step: 6, label: 'Running CrewAI LLM agents', status: 'idle' },
]

export const useStore = create<AppState>((set) => ({
  selectedDataset: null,
  setSelectedDataset: (name) => set({ selectedDataset: name }),
  uploadedFile: null,
  setUploadedFile: (f) => set({ uploadedFile: f }),

  dateColumn: null, metricColumn: null, groupColumn: null,
  setColumnOverrides: (d, m, g) => set({ dateColumn: d, metricColumn: m, groupColumn: g }),

  question: 'Analyze this dataset and surface the most important business insights.',
  setQuestion: (q) => set({ question: q }),
  model: 'ollama/qwen2.5:3b',
  setModel: (m) => set({ model: m }),

  workflowRunning: false,
  workflowDone: false,
  steps: INITIAL_STEPS,
  results: null,
  workflowError: null,

  startWorkflow: () => set({ workflowRunning: true, workflowDone: false, steps: INITIAL_STEPS, workflowError: null, results: null }),

  handleWorkflowEvent: (event) => set((state) => {
    if (event.type === 'step' && event.step != null) {
      const steps = state.steps.map(s =>
        s.step === event.step ? { ...s, status: event.status || 'done', detail: event.detail } : s
      )
      return { steps }
    }
    if (event.type === 'complete') {
      return { workflowRunning: false, workflowDone: true, results: event.results || null }
    }
    if (event.type === 'error') {
      return { workflowRunning: false, workflowError: event.message || 'Unknown error' }
    }
    return {}
  }),

  resetWorkflow: () => set({ workflowRunning: false, workflowDone: false, steps: INITIAL_STEPS, results: null, workflowError: null }),
}))
