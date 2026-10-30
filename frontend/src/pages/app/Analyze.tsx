import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp, Play, Cpu, Globe, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getDatasets, getColumns, uploadDataset, createWorkflowSocket, getModels, type WorkflowEvent, type ModelEntry } from '../../lib/api'
import { useStore } from '../../store/useStore'
import { cn } from '../../lib/utils'

const STEP_ICONS = ['🧹', '📊', '🔢', '📈', '📄', '🤖']

export default function Analyze() {
  const [datasets, setDatasets] = useState<{ name: string; size: number }[]>([])
  const [allCols, setAllCols] = useState<string[]>([])
  const [detectedCols, setDetectedCols] = useState<{ date_column?: string | null; metric_column?: string | null; group_column?: string | null }>({})
  const [showOverrides, setShowOverrides] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Model catalog from backend
  const [ollamaModels, setOllamaModels] = useState<ModelEntry[]>([])
  const [openrouterModels, setOpenrouterModels] = useState<ModelEntry[]>([])
  const [openrouterConfigured, setOpenrouterConfigured] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)

  const { selectedDataset, setSelectedDataset, question, setQuestion, model, setModel,
    dateColumn, metricColumn, groupColumn, setColumnOverrides,
    workflowRunning, workflowDone, steps, workflowError,
    startWorkflow, handleWorkflowEvent } = useStore()

  const navigate = useNavigate()

  // Load datasets and model catalog
  useEffect(() => {
    getDatasets().then(d => setDatasets(d.datasets)).catch(() => { })
    getModels().then(d => {
      setOllamaModels(d.ollama)
      setOpenrouterModels(d.openrouter)
      setOpenrouterConfigured(d.openrouter_configured)
      setModelsLoaded(true)
    }).catch(() => setModelsLoaded(true))
  }, [])

  useEffect(() => {
    if (!selectedDataset) return
    getColumns(selectedDataset).then(d => {
      setAllCols(d.columns || [])
      setDetectedCols(d.detected || {})
      if (!dateColumn && d.detected?.date_column) setColumnOverrides(d.detected.date_column, metricColumn, groupColumn)
      if (!metricColumn && d.detected?.metric_column) setColumnOverrides(dateColumn, d.detected.metric_column, groupColumn)
      if (!groupColumn && d.detected?.group_column) setColumnOverrides(dateColumn, metricColumn, d.detected.group_column)
    }).catch(() => { })
  }, [selectedDataset])

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    const r = await uploadDataset(files[0]).catch(() => null)
    setUploading(false)
    if (r) {
      setSelectedDataset(r.filename)
      getDatasets().then(d => setDatasets(d.datasets)).catch(() => { })
    }
  }, [])

  const runWorkflow = () => {
    if (!selectedDataset) return
    startWorkflow()
    createWorkflowSocket({
      dataset_name: selectedDataset,
      question,
      model,
      date_column: dateColumn || null,
      metric_column: metricColumn || null,
      group_column: groupColumn || null,
    }, (event: WorkflowEvent) => {
      handleWorkflowEvent(event)
      if (event.type === 'complete') navigate('/app/results')
    })
  }

  const selectedProvider = model.startsWith('openrouter/') ? 'openrouter' : 'ollama'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Analyze Dataset</h1>
        <p className="text-sm text-slate-400">Configure your analysis and run the six-agent pipeline</p>
      </motion.div>

      {/* Step 1 — Dataset */}
      <SectionCard title="1. Dataset" icon="📂" delay={0.05}>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => document.getElementById('analyze-file-input')?.click()}
          className="relative mb-4 rounded-xl border-2 border-dashed flex items-center justify-center py-6 cursor-pointer transition-all duration-200"
          style={{ borderColor: dragOver ? '#06B6D4' : 'rgba(255,255,255,0.1)', background: dragOver ? 'rgba(6,182,212,0.05)' : 'rgba(255,255,255,0.02)' }}>
          <input id="analyze-file-input" type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => handleFiles(e.target.files)} />
          {uploading ? <Loader2 size={18} className="text-cyan-400 animate-spin mr-2" /> : <Upload size={16} className="text-slate-500 mr-2" />}
          <span className="text-sm text-slate-400">{uploading ? 'Uploading…' : 'Drop a CSV/Excel file or click to browse'}</span>
        </div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Or select existing dataset</label>
        <select value={selectedDataset || ''} onChange={e => setSelectedDataset(e.target.value || null)}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: selectedDataset ? '#E2E8F0' : '#475569' }}>
          <option value="">— Choose a dataset —</option>
          {datasets.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
        </select>
      </SectionCard>

      {/* Step 2 — Question */}
      <SectionCard title="2. Analysis Objective" icon="💬" delay={0.1}>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Business question or objective</label>
        <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={3}
          placeholder="e.g. Why did profit decrease? Show customer trends. Generate an executive report."
          className="w-full px-3 py-2.5 rounded-xl text-sm text-slate-200 outline-none resize-none placeholder:text-slate-600 transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
      </SectionCard>

      {/* Step 3 — Model */}
      <SectionCard title="3. AI Model" icon="🤖" delay={0.15}>
        {!modelsLoaded ? (
          <div className="skeleton h-28 rounded-xl" />
        ) : (
          <>
            {/* Provider tabs */}
            <div className="flex gap-2 mb-4">
              {[
                { key: 'ollama', label: 'Ollama (Local)', icon: Cpu, color: '#06B6D4' },
                { key: 'openrouter', label: 'OpenRouter (Cloud)', icon: Globe, color: '#8B5CF6' },
              ].map(p => (
                <button key={p.key}
                  onClick={() => {
                    const first = p.key === 'ollama' ? ollamaModels[0] : openrouterModels[0]
                    if (first) setModel(first.id)
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border"
                  style={{
                    background: selectedProvider === p.key ? `${p.color}18` : 'rgba(255,255,255,0.03)',
                    borderColor: selectedProvider === p.key ? `${p.color}40` : 'rgba(255,255,255,0.08)',
                    color: selectedProvider === p.key ? p.color : '#475569',
                  }}>
                  <p.icon size={12} /> {p.label}
                  {p.key === 'openrouter' && !openrouterConfigured && (
                    <Lock size={10} className="text-amber-400 ml-1" />
                  )}
                </button>
              ))}
            </div>

            {/* Ollama models */}
            {selectedProvider === 'ollama' && (
              <div className="flex flex-col gap-2">
                {ollamaModels.map(m => (
                  <ModelOption key={m.id} m={m} selected={model === m.id} onSelect={() => setModel(m.id)} color="#06B6D4" />
                ))}
                <p className="text-xs text-slate-500 mt-1">Ollama must be running locally at <code className="text-cyan-500">localhost:11434</code></p>
              </div>
            )}

            {/* OpenRouter models */}
            {selectedProvider === 'openrouter' && (
              <>
                {!openrouterConfigured ? (
                  <div className="p-4 rounded-xl border text-sm" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)', color: '#FCD34D' }}>
                    <div className="flex items-center gap-2 font-semibold mb-1"><Lock size={13} /> OpenRouter API key not configured</div>
                    <div className="text-xs text-amber-200/60">Go to <strong>Settings</strong> to add your free OpenRouter API key, then come back here.</div>
                    <button onClick={() => navigate('/app/settings')}
                      className="mt-3 text-xs px-3 py-1.5 rounded-lg font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg,#D97706,#F59E0B)' }}>
                      Open Settings →
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {openrouterModels.map(m => (
                      <ModelOption key={m.id} m={m} selected={model === m.id} onSelect={() => setModel(m.id)} color="#8B5CF6" />
                    ))}
                    <p className="text-xs text-slate-500 mt-1">All listed models are <span className="text-emerald-400 font-semibold">free</span> on OpenRouter.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </SectionCard>

      {/* Column overrides */}
      {selectedDataset && allCols.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mb-4 rounded-2xl border overflow-hidden"
          style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
          <button onClick={() => setShowOverrides(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors">
            <span className="text-sm font-semibold text-slate-300">🛠️ Advanced Column Settings (Optional)</span>
            {showOverrides ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
          </button>
          <AnimatePresence>
            {showOverrides && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Date Column (for trends)', key: 'date', val: dateColumn, detected: detectedCols.date_column },
                    { label: 'Metric Column', key: 'metric', val: metricColumn, detected: detectedCols.metric_column },
                    { label: 'Grouping Column', key: 'group', val: groupColumn, detected: detectedCols.group_column },
                  ].map(col => (
                    <div key={col.key}>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">{col.label}</label>
                      <select value={col.val || ''}
                        onChange={e => {
                          const v = e.target.value || null
                          if (col.key === 'date') setColumnOverrides(v, metricColumn, groupColumn)
                          if (col.key === 'metric') setColumnOverrides(dateColumn, v, groupColumn)
                          if (col.key === 'group') setColumnOverrides(dateColumn, metricColumn, v)
                        }}
                        className="w-full px-2.5 py-2 rounded-lg text-xs text-slate-200 outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <option value="">Auto-detect{col.detected ? ` (${col.detected})` : ''}</option>
                        {allCols.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Workflow progress */}
      <AnimatePresence>
        {(workflowRunning || workflowDone || workflowError) && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-6 rounded-2xl border p-5"
            style={{ background: 'rgba(13,22,39,0.95)', borderColor: 'rgba(6,182,212,0.2)' }}>
            <div className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              {workflowRunning && <Loader2 size={14} className="text-cyan-400 animate-spin" />}
              {workflowDone && <CheckCircle2 size={14} className="text-emerald-400" />}
              {workflowError && <AlertCircle size={14} className="text-rose-400" />}
              {workflowRunning ? 'Running pipeline…' : workflowDone ? 'Analysis complete!' : 'Pipeline error'}
            </div>
            <div className="flex flex-col gap-2">
              {steps.map((s, i) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{
                      background: s.status === 'done' ? 'rgba(16,185,129,0.2)' : s.status === 'running' ? 'rgba(6,182,212,0.2)' : s.status === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                      border: s.status === 'done' ? '1px solid rgba(16,185,129,0.4)' : s.status === 'running' ? '1px solid rgba(6,182,212,0.4)' : '1px solid rgba(255,255,255,0.08)'
                    }}>
                    {s.status === 'done' ? '✓' : s.status === 'running' ? <Loader2 size={10} className="animate-spin text-cyan-400" /> : s.status === 'warning' ? '⚠' : i + 1}
                  </div>
                  <span className={cn('text-xs font-medium', s.status === 'done' ? 'text-emerald-400' : s.status === 'running' ? 'text-cyan-400' : s.status === 'warning' ? 'text-amber-400' : 'text-slate-500')}>
                    {STEP_ICONS[i]} {s.label}
                  </span>
                  {s.detail && <span className="text-xs text-slate-500">— {s.detail}</span>}
                </div>
              ))}
            </div>
            {workflowError && <div className="mt-3 p-3 rounded-lg text-xs text-rose-300" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>{workflowError}</div>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Run button */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <motion.button
          disabled={!selectedDataset || workflowRunning}
          whileHover={!workflowRunning && selectedDataset ? { scale: 1.02, y: -2 } : {}}
          whileTap={!workflowRunning && selectedDataset ? { scale: 0.98 } : {}}
          onClick={runWorkflow}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all duration-200"
          style={{
            background: selectedDataset && !workflowRunning ? 'linear-gradient(135deg,#0891B2 0%,#06B6D4 55%,#38BDF8 100%)' : 'rgba(255,255,255,0.06)',
            color: selectedDataset && !workflowRunning ? '#020D14' : '#475569',
            boxShadow: selectedDataset && !workflowRunning ? '0 0 28px rgba(6,182,212,0.35)' : 'none',
          }}>
          {workflowRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {workflowRunning ? 'Running Agentic Workflow…' : '🚀 Run Agentic Workflow'}
        </motion.button>
      </motion.div>
    </div>
  )
}

/* ── Sub-components ── */
function ModelOption({ m, selected, onSelect, color }: { m: ModelEntry; selected: boolean; onSelect: () => void; color: string }) {
  return (
    <button onClick={onSelect}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all duration-150"
      style={{
        background: selected ? `${color}12` : 'rgba(255,255,255,0.03)',
        borderColor: selected ? `${color}40` : 'rgba(255,255,255,0.07)',
      }}>
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: selected ? color : 'rgba(255,255,255,0.15)' }} />
        <span className="text-sm font-medium" style={{ color: selected ? '#E2E8F0' : '#94A3B8' }}>{m.label}</span>
      </div>
      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>Free</span>
    </button>
  )
}

function SectionCard({ title, icon, children, delay = 0 }: { title: string; icon: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="mb-4 rounded-2xl border p-5"
      style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
      <h2 className="text-sm font-semibold text-slate-200 mb-4">{icon} {title}</h2>
      {children}
    </motion.div>
  )
}
