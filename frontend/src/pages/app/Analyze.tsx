import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp, Play, Cpu, Globe, Lock, ExternalLink, Zap, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getDatasets, getColumns, uploadDataset, createWorkflowSocket, getModels, getUserOpenRouterKey, setUserOpenRouterKey, saveSettings, type WorkflowEvent, type ModelEntry } from '../../lib/api'
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

  // Model catalog and BYOK state
  const [ollamaModels, setOllamaModels] = useState<ModelEntry[]>([])
  const [openrouterModels, setOpenrouterModels] = useState<ModelEntry[]>([])
  const [ollamaAvailable, setOllamaAvailable] = useState(true)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [userApiKey, setUserApiKey] = useState(getUserOpenRouterKey())
  const [inlineKeyInput, setInlineKeyInput] = useState('')
  const [inlineKeySaving, setInlineKeySaving] = useState(false)
  const [inlineKeyError, setInlineKeyError] = useState('')
  const [validationError, setValidationError] = useState('')

  const { selectedDataset, setSelectedDataset, question, setQuestion, model, setModel,
    dateColumn, metricColumn, groupColumn, setColumnOverrides,
    workflowRunning, workflowDone, steps, workflowError,
    startWorkflow, handleWorkflowEvent } = useStore()

  const navigate = useNavigate()

  // Load datasets and model catalog
  useEffect(() => {
    getDatasets().then(d => setDatasets(d.datasets)).catch(() => { })
    getModels().then(d => {
      setOllamaModels(d.ollama || [])
      setOpenrouterModels(d.openrouter || [])
      setOllamaAvailable(d.ollama_available)
      setModelsLoaded(true)
      // If Ollama is offline and user previously had an ollama model selected, safely default to standard free engine
      if (!d.ollama_available && model.startsWith('ollama/')) {
        setModel('standard')
      }
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

  const handleSaveInlineKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inlineKeyInput.trim()) return
    setInlineKeySaving(true)
    setInlineKeyError('')
    try {
      await saveSettings({ openrouter_api_key: inlineKeyInput.trim() })
      setUserOpenRouterKey(inlineKeyInput.trim())
      setUserApiKey(inlineKeyInput.trim())
      setInlineKeyInput('')
      setValidationError('')
    } catch (err: any) {
      setInlineKeyError(err?.response?.data?.detail || 'Invalid key format. Please check your key at openrouter.ai/keys.')
    } finally {
      setInlineKeySaving(false)
    }
  }

  const runWorkflow = () => {
    if (!selectedDataset) return
    setValidationError('')

    if (model === 'standard') {
      // 100% Free · No API Key Required
    } else if (model.startsWith('ollama/')) {
      if (!ollamaAvailable) {
        setValidationError('Ollama is not running on this server. Switch to the Standard Engine (No Key Needed) or OpenRouter Cloud AI.')
        return
      }
    } else if (model.startsWith('openrouter/')) {
      const activeKey = getUserOpenRouterKey()
      if (!activeKey) {
        setValidationError('Please enter your free OpenRouter API key above, or switch to "Standard Engine" to run without any key.')
        return
      }
    }

    const activeKey = getUserOpenRouterKey()
    startWorkflow()
    createWorkflowSocket({
      dataset_name: selectedDataset,
      question,
      model,
      openrouter_api_key: activeKey || null,
      date_column: dateColumn || null,
      metric_column: metricColumn || null,
      group_column: groupColumn || null,
    }, (event: WorkflowEvent) => {
      handleWorkflowEvent(event)
      if (event.type === 'complete') navigate('/app/results')
    })
  }

  const selectedProvider: 'standard' | 'openrouter' | 'ollama' =
    model === 'standard' ? 'standard' :
    model.startsWith('openrouter/') ? 'openrouter' : 'ollama'

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

      {/* Step 3 — Analysis Engine / Model */}
      <SectionCard title="3. Analysis Engine & AI Model" icon="🤖" delay={0.15}>
        {!modelsLoaded ? (
          <div className="skeleton h-28 rounded-xl" />
        ) : (
          <>
            {/* Engine Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
              {[
                { key: 'standard', label: 'Standard Engine', icon: Zap, color: '#10B981', badge: 'Free · Instant' },
                { key: 'openrouter', label: 'OpenRouter AI', icon: Globe, color: '#8B5CF6', badge: userApiKey ? 'Key Active' : 'Optional BYOK' },
                { key: 'ollama', label: 'Ollama (Desktop)', icon: Cpu, color: '#06B6D4', badge: ollamaAvailable ? 'Local Active' : 'Desktop Only' },
              ].map(p => {
                const isActive = selectedProvider === p.key
                return (
                  <button key={p.key}
                    type="button"
                    onClick={() => {
                      setValidationError('')
                      if (p.key === 'standard') {
                        setModel('standard')
                      } else if (p.key === 'openrouter') {
                        if (!model.startsWith('openrouter/')) {
                          setModel(openrouterModels[0]?.id || 'openrouter/mistralai/mistral-7b-instruct:free')
                        }
                      } else if (p.key === 'ollama') {
                        if (!model.startsWith('ollama/')) {
                          setModel(ollamaModels[0]?.id || 'ollama/qwen2.5:3b')
                        }
                      }
                    }}
                    className="flex flex-col items-start gap-1 p-3 rounded-xl text-left transition-all duration-200 border relative overflow-hidden"
                    style={{
                      background: isActive ? `${p.color}15` : 'rgba(255,255,255,0.02)',
                      borderColor: isActive ? `${p.color}50` : 'rgba(255,255,255,0.08)',
                      boxShadow: isActive ? `0 0 18px ${p.color}15` : 'none',
                    }}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 font-semibold text-xs" style={{ color: isActive ? p.color : '#94A3B8' }}>
                        <p.icon size={14} /> {p.label}
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold"
                        style={{
                          background: p.key === 'standard'
                            ? 'rgba(16,185,129,0.18)'
                            : p.key === 'ollama' && !ollamaAvailable
                            ? 'rgba(245,158,11,0.15)'
                            : 'rgba(255,255,255,0.08)',
                          color: p.key === 'standard'
                            ? '#34D399'
                            : p.key === 'ollama' && !ollamaAvailable
                            ? '#F59E0B'
                            : isActive ? p.color : '#64748B'
                        }}>
                        {p.badge}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Standard Engine (100% Free · Zero Keys Required) */}
            {selectedProvider === 'standard' && (
              <div className="p-4 rounded-xl border flex flex-col gap-3"
                style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.22)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-sm text-emerald-300">
                    <Sparkles size={16} className="text-emerald-400" />
                    <span>Instant Analytics Engine (Recommended)</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ 100% Free · No Keys Needed
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  No API key, signup, or Ollama installation needed. Automatically performs complete data cleaning, data quality scoring, Pearson correlations, IQR outlier detection, interactive visualizations, and an executive briefing with downloadable PDF.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-emerald-500/10 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" /> Full 6-Stage Pipeline</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" /> Zero Key Friction</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" /> Instant Execution</div>
                </div>
              </div>
            )}

            {/* Ollama models */}
            {selectedProvider === 'ollama' && (
              <div className="flex flex-col gap-2">
                {!ollamaAvailable && (
                  <div className="p-4 rounded-xl border text-sm mb-2" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.25)', color: '#FCD34D' }}>
                    <div className="flex items-center gap-2 font-semibold mb-1">
                      <AlertCircle size={14} className="text-amber-400" /> Local Desktop Ollama Not Connected
                    </div>
                    <div className="text-xs text-amber-200/70 leading-relaxed mb-3">
                      Ollama is designed to run locally on your desktop machine (<code>localhost:11434</code>) and is not available on this cloud server.
                      You can run your analysis immediately for free with zero setup using the <strong>Standard Engine</strong>, or use OpenRouter Cloud AI.
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setModel('standard')}
                        className="text-xs px-3.5 py-1.5 rounded-lg font-bold text-slate-900 transition-all shadow-md"
                        style={{ background: 'linear-gradient(135deg,#10B981,#34D399)' }}>
                        ⚡ Use Free Standard Engine (No Key Needed)
                      </button>
                      <button type="button" onClick={() => setModel(openrouterModels[0]?.id || 'openrouter/mistralai/mistral-7b-instruct:free')}
                        className="text-xs px-3.5 py-1.5 rounded-lg font-semibold text-white transition-all border border-purple-500/30"
                        style={{ background: 'rgba(139,92,246,0.18)' }}>
                        OpenRouter Cloud →
                      </button>
                    </div>
                  </div>
                )}
                {ollamaModels.map(m => (
                  <ModelOption key={m.id} m={m} selected={model === m.id} onSelect={() => setModel(m.id)} color="#06B6D4" disabled={!ollamaAvailable} />
                ))}
                <p className="text-xs text-slate-500 mt-1">
                  {ollamaAvailable ? 'Connected to local Ollama at localhost:11434' : 'Ollama requires a desktop installation to run locally on your machine'}
                </p>
              </div>
            )}

            {/* OpenRouter models (BYOK) */}
            {selectedProvider === 'openrouter' && (
              <div className="flex flex-col gap-3">
                {!userApiKey ? (
                  <div className="p-4 rounded-xl border text-sm" style={{ background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.25)', color: '#E2E8F0' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 font-semibold text-purple-300">
                        <Lock size={13} /> Bring Your Own Free Key (BYOK)
                      </div>
                      <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer"
                        className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold">
                        Get Free Key <ExternalLink size={10} />
                      </a>
                    </div>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      To run AI agents without using shared resources, provide your free OpenRouter API key.
                      It is kept in your browser's <code className="text-cyan-400">LocalStorage</code> and transmitted per analysis in memory.
                    </p>
                    <form onSubmit={handleSaveInlineKey} className="flex gap-2">
                      <input
                        type="password"
                        value={inlineKeyInput}
                        onChange={e => setInlineKeyInput(e.target.value)}
                        placeholder="Paste sk-or-v1-... key"
                        className="flex-1 px-3 py-2 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace' }}
                      />
                      <button type="submit" disabled={inlineKeySaving || !inlineKeyInput.trim()}
                        className="px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 text-white"
                        style={{ background: inlineKeyInput.trim() ? 'linear-gradient(135deg,#7C3AED,#8B5CF6)' : 'rgba(255,255,255,0.06)' }}>
                        {inlineKeySaving ? <Loader2 size={11} className="animate-spin" /> : null}
                        Save Key
                      </button>
                    </form>
                    {inlineKeyError && <div className="mt-2 text-xs text-rose-400">{inlineKeyError}</div>}
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span className="text-xs text-emerald-300 font-medium">Your OpenRouter Key is Active (Browser LocalStorage)</span>
                    </div>
                    <button onClick={() => navigate('/app/settings')} className="text-[11px] text-slate-400 hover:text-cyan-400 underline">
                      Manage / Change
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {openrouterModels.map(m => (
                    <ModelOption key={m.id} m={m} selected={model === m.id} onSelect={() => setModel(m.id)} color="#8B5CF6" />
                  ))}
                  <p className="text-xs text-slate-500 mt-1">All listed models are <span className="text-emerald-400 font-semibold">100% free</span> on OpenRouter.</p>
                </div>
              </div>
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

      {/* Validation warning */}
      {validationError && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3.5 rounded-xl border flex items-center gap-2.5 text-xs text-rose-300"
          style={{ background: 'rgba(244,63,94,0.08)', borderColor: 'rgba(244,63,94,0.25)' }}>
          <AlertCircle size={14} className="text-rose-400 flex-shrink-0" />
          <span>{validationError}</span>
        </motion.div>
      )}

      {/* Run button */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <motion.button
          disabled={!selectedDataset || workflowRunning}
          whileHover={!workflowRunning && selectedDataset ? { scale: 1.01, y: -1 } : {}}
          whileTap={!workflowRunning && selectedDataset ? { scale: 0.99 } : {}}
          onClick={runWorkflow}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all duration-200"
          style={{
            background: selectedDataset && !workflowRunning
              ? model === 'standard'
                ? 'linear-gradient(135deg,#059669 0%,#10B981 55%,#34D399 100%)'
                : 'linear-gradient(135deg,#0891B2 0%,#06B6D4 55%,#38BDF8 100%)'
              : 'rgba(255,255,255,0.06)',
            color: selectedDataset && !workflowRunning ? '#020D14' : '#475569',
            boxShadow: selectedDataset && !workflowRunning
              ? model === 'standard'
                ? '0 0 28px rgba(16,185,129,0.35)'
                : '0 0 28px rgba(6,182,212,0.35)'
              : 'none',
          }}>
          {workflowRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {workflowRunning
            ? 'Running Agentic Pipeline…'
            : model === 'standard'
            ? '🚀 Run Analysis (No Key Needed · Free)'
            : model.startsWith('openrouter/')
            ? '🤖 Run Cloud AI Analysis'
            : '💻 Run Local Ollama Analysis'}
        </motion.button>
      </motion.div>
    </div>
  )
}

/* ── Sub-components ── */
function ModelOption({ m, selected, onSelect, color, disabled = false }: { m: ModelEntry; selected: boolean; onSelect: () => void; color: string; disabled?: boolean }) {
  return (
    <button onClick={onSelect}
      disabled={disabled}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all duration-150",
        disabled && "opacity-50 cursor-not-allowed"
      )}
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
