import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Cpu, Database, Globe, Eye, EyeOff, CheckCircle2, Loader2, AlertCircle, ExternalLink, Trash2 } from 'lucide-react'
import { getSettings, saveSettings, getUserOpenRouterKey, setUserOpenRouterKey, getUserOllamaUrl, setUserOllamaUrl, checkOllama } from '../../lib/api'

export default function SettingsPage() {
  // OpenRouter key state
  const [keyInput, setKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [configured, setConfigured] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  // Ollama endpoint state
  const [ollamaUrl, setOllamaUrl] = useState(getUserOllamaUrl())
  const [ollamaSaved, setOllamaSaved] = useState(false)
  const [ollamaTesting, setOllamaTesting] = useState(false)
  const [ollamaTestResult, setOllamaTestResult] = useState<string | null>(null)

  useEffect(() => {
    const existingKey = getUserOpenRouterKey()
    if (existingKey) {
      setConfigured(true)
    }
    getSettings().then(() => {
      setSettingsLoaded(true)
    }).catch(() => setSettingsLoaded(true))
  }, [])

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyInput.trim()) return
    setSaving(true)
    setSaveError('')
    setSaveSuccess(false)
    try {
      await saveSettings({ openrouter_api_key: keyInput.trim() })
      setUserOpenRouterKey(keyInput.trim())
      setConfigured(true)
      setKeyInput('')
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to validate key. Please check your key at openrouter.ai/keys.'
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleClearKey = () => {
    setUserOpenRouterKey('')
    setConfigured(false)
    setKeyInput('')
  }

  const handleSaveOllamaEndpoint = (e: React.FormEvent) => {
    e.preventDefault()
    setUserOllamaUrl(ollamaUrl.trim() || 'http://localhost:11434')
    setOllamaSaved(true)
    setTimeout(() => setOllamaSaved(false), 2500)
  }

  const handleTestOllama = async () => {
    setOllamaTesting(true)
    setOllamaTestResult(null)
    try {
      const res = await checkOllama(ollamaUrl.trim() || 'http://localhost:11434')
      if (res.available) {
        setOllamaTestResult('connected')
      } else {
        setOllamaTestResult('not_responding')
      }
    } catch {
      setOllamaTestResult('not_responding')
    } finally {
      setOllamaTesting(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-sm text-slate-400">Configure models, API keys, and execution environments</p>
      </motion.div>

      {/* ── OpenRouter API Key (BYOK) ── */}
      <SettingsSection title="Bring Your Own Key (BYOK) — OpenRouter Cloud" icon={Globe} color="#8B5CF6" delay={0.05}>
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            OpenRouter gives you access to free cloud models (Mistral, Llama, Gemma, Phi-3).
            Your key is stored securely in your browser's <code className="text-cyan-400">LocalStorage</code> and transmitted per analysis request in memory.
          </p>
          <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold flex-shrink-0 ml-4 transition-all hover:opacity-80"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#A78BFA' }}>
            <ExternalLink size={11} /> Get free key
          </a>
        </div>

        {/* Current status */}
        {settingsLoaded && (
          <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-lg" style={{ background: configured ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${configured ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
            <div className="flex items-center gap-2">
              {configured
                ? <><CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" /><span className="text-xs text-emerald-300 font-medium">Secured in Browser LocalStorage — <code className="text-emerald-400 font-mono tracking-widest text-[11px]">••••••••••••••••</code></span></>
                : <><AlertCircle size={13} className="text-slate-500 flex-shrink-0" /><span className="text-xs text-slate-500">Not configured — Add your free OpenRouter key below</span></>}
            </div>
            {configured && (
              <button onClick={handleClearKey} title="Remove key from browser" className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors">
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>
        )}

        {/* Key input form */}
        <form onSubmit={handleSaveKey} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder={configured ? 'Paste new key to replace existing…' : 'sk-or-v1-...'}
              className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace' }}
              onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <button type="button" onClick={() => setShowKey(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <motion.button type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            disabled={saving || !keyInput.trim()}
            className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 flex-shrink-0 transition-all"
            style={{ background: keyInput.trim() ? 'linear-gradient(135deg,#7C3AED,#8B5CF6)' : 'rgba(255,255,255,0.06)', color: keyInput.trim() ? '#fff' : '#475569' }}>
            {saving ? <Loader2 size={13} className="animate-spin" /> : null}
            {saving ? 'Saving…' : 'Save Key'}
          </motion.button>
        </form>

        {saveSuccess && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 size={12} /> Key saved locally in browser! OpenRouter models are now unlocked in Analyze.
          </motion.div>
        )}
        {saveError && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center gap-2 text-xs text-rose-400">
            <AlertCircle size={12} /> {saveError}
          </motion.div>
        )}
      </SettingsSection>

      {/* ── Ollama Endpoint ── */}
      <SettingsSection title="Ollama (Local / Self-Hosted LLM)" icon={Cpu} color="#06B6D4" delay={0.1}>
        <p className="text-xs text-slate-400 leading-relaxed mb-3">
          Configure the base URL of your Ollama server. Defaults to <code className="text-cyan-400">http://localhost:11434</code> for local desktop execution, or your remote/tunneled Ollama address.
        </p>

        <form onSubmit={handleSaveOllamaEndpoint} className="flex gap-2 mb-3">
          <input
            type="text"
            value={ollamaUrl}
            onChange={e => setOllamaUrl(e.target.value)}
            placeholder="http://localhost:11434"
            className="flex-1 px-3 py-2.5 rounded-xl text-xs text-slate-200 outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace' }}
          />
          <button type="submit"
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-900 transition-all"
            style={{ background: 'linear-gradient(135deg,#06B6D4,#38BDF8)' }}>
            Save Endpoint
          </button>
          <button type="button" onClick={handleTestOllama} disabled={ollamaTesting}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white border transition-all flex items-center gap-1.5"
            style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)' }}>
            {ollamaTesting ? <Loader2 size={12} className="animate-spin text-cyan-400" /> : null}
            Test
          </button>
        </form>

        {ollamaSaved && (
          <div className="text-xs text-emerald-400 mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Ollama endpoint saved in browser!
          </div>
        )}

        {ollamaTestResult === 'connected' && (
          <div className="text-xs text-emerald-400 mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Ollama responded successfully at this endpoint!
          </div>
        )}
        {ollamaTestResult === 'not_responding' && (
          <div className="text-xs text-amber-400 mb-2 flex items-center gap-1.5">
            <AlertCircle size={12} /> Endpoint did not respond. If using Ollama locally with cloud deployment, expose it or run InsightFlow locally.
          </div>
        )}

        <div className="mt-4 flex flex-col gap-1.5">
          <div className="text-xs font-semibold text-slate-400 mb-1">Supported Ollama Models:</div>
          {['ollama/qwen2.5:3b', 'ollama/qwen2.5:7b', 'ollama/llama3:latest'].map(m => (
            <div key={m} className="flex items-center justify-between px-4 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <code className="text-xs text-slate-300">{m}</code>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4' }}>Ollama Ready</span>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* ── System Status ── */}
      <SettingsSection title="System Status" icon={Database} color="#6366F1" delay={0.15}>
        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-200">Analysis Engine Backend</span>
          </div>
          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">Operational</span>
        </div>
      </SettingsSection>
    </div>
  )
}

function SettingsSection({ title, icon: Icon, color, children, delay = 0 }: { title: string; icon: any; color: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="mb-4 rounded-2xl border p-5"
      style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
          <Icon size={14} style={{ color }} />
        </div>
        <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      </div>
      {children}
    </motion.div>
  )
}
