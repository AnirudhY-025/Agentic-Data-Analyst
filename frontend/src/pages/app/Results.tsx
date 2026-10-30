import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, AlertTriangle, Users, Activity, Layers, GitBranch, Image, Bot } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { getAnalysis } from '../../lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import ReactMarkdown from 'react-markdown'

const TABS = [
  { key: 'quality', label: 'Quality', icon: Layers },
  { key: 'statistics', label: 'Statistics', icon: BarChart3 },
  { key: 'correlation', label: 'Correlation', icon: GitBranch },
  { key: 'trend', label: 'Trend', icon: TrendingUp },
  { key: 'distribution', label: 'Distribution', icon: Activity },
  { key: 'grouping', label: 'Grouping', icon: Users },
  { key: 'outliers', label: 'Outliers', icon: AlertTriangle },
  { key: 'charts', label: 'Charts', icon: Image },
  { key: 'crew', label: 'AI Output', icon: Bot },
]

export default function Results() {
  const storeResults = useStore(s => s.results)
  const [results, setResults] = useState(storeResults)
  const [activeTab, setActiveTab] = useState('quality')
  const [loading, setLoading] = useState(!storeResults)

  useEffect(() => {
    if (storeResults) { setResults(storeResults); setLoading(false); return }
    getAnalysis().then(r => { setResults(r); setLoading(false) }).catch(() => setLoading(false))
  }, [storeResults])

  if (loading) return <LoadingState />
  if (!results) return <EmptyState />

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Analysis Results</h1>
        <p className="text-sm text-slate-400">Explore all outputs from the agentic pipeline</p>
      </motion.div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Rows', value: (results.dataset_overview as any)?.rows ?? '—' },
          { label: 'Cleaned Rows', value: (results.dataset_overview as any)?.cleaned_rows ?? '—' },
          { label: 'Rows Removed', value: ((results.dataset_overview as any)?.rows - (results.dataset_overview as any)?.cleaned_rows) || 0 },
          { label: 'Columns', value: (results.dataset_overview as any)?.columns ?? '—' },
        ].map(k => (
          <div key={k.label} className="p-4 rounded-xl border" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="text-xl font-black text-white">{k.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-6 pb-1">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0"
            style={{
              background: activeTab === tab.key ? 'linear-gradient(135deg, rgba(8,145,178,0.25), rgba(99,102,241,0.15))' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeTab === tab.key ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.07)'}`,
              color: activeTab === tab.key ? '#06B6D4' : '#64748B',
            }}>
            <tab.icon size={12} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {activeTab === 'quality' && <JsonPanel data={results.quality} />}
        {activeTab === 'statistics' && <JsonPanel data={results.statistics} />}
        {activeTab === 'correlation' && <JsonPanel data={results.correlation} />}
        {activeTab === 'trend' && <TrendPanel trend={results.trend} />}
        {activeTab === 'distribution' && <DistributionPanel distribution={results.distribution} />}
        {activeTab === 'grouping' && <GroupingPanel grouping={results.grouping} />}
        {activeTab === 'outliers' && <OutliersPanel outliers={results.outliers} />}
        {activeTab === 'charts' && <ChartsPanel charts={results.charts} />}
        {activeTab === 'crew' && <CrewPanel crewResult={results.crew_result} crewError={results.crew_error} />}
      </motion.div>
    </div>
  )
}

function JsonPanel({ data }: { data: unknown }) {
  return (
    <pre className="p-5 rounded-2xl text-xs overflow-auto max-h-[600px] leading-relaxed"
      style={{ background: 'rgba(13,22,39,0.95)', border: '1px solid rgba(255,255,255,0.07)', color: '#94A3B8' }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

function TrendPanel({ trend }: { trend: any }) {
  if (!trend?.trend_points?.length) return (
    <div className="p-8 rounded-2xl border text-center text-slate-400 text-sm" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
      No trend data — no datetime column was detected in this dataset.
    </div>
  )
  return (
    <div className="rounded-2xl border p-6" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
      <div className="text-xs text-slate-400 mb-4">Monthly trend of <strong className="text-cyan-400">{trend.metric_column}</strong> by <strong className="text-cyan-400">{trend.date_column}</strong></div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trend.trend_points}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="period" tick={{ fill: '#64748B', fontSize: 11 }} />
          <YAxis tick={{ fill: '#64748B', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#0D1627', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 10, color: '#E2E8F0', fontSize: 12 }} />
          <Line type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={2.5} dot={{ fill: '#06B6D4', r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function DistributionPanel({ distribution }: { distribution: any }) {
  const dists = distribution?.distributions || []
  if (!dists.length) return <JsonPanel data={distribution} />
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {dists.map((d: any) => (
        <div key={d.column} className="p-5 rounded-2xl border" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="text-sm font-semibold text-white mb-3">{d.column}</div>
          <div className="grid grid-cols-2 gap-2">
            {[['Mean', d.mean?.toFixed(2)],['Median',d.median?.toFixed(2)],['Std Dev',d.std?.toFixed(2)],['Skew',d.skew?.toFixed(3)]].map(([k,v]) => (
              <div key={k} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-xs text-slate-500">{k}</div>
                <div className="text-sm font-bold text-slate-200">{v ?? '—'}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function GroupingPanel({ grouping }: { grouping: any }) {
  const groups = grouping?.groups || []
  const metricCol = grouping?.metric_column
  const groupCol = grouping?.group_column
  if (!groups.length) return <JsonPanel data={grouping} />
  const data = groups.map((g: any) => ({ name: String(g[groupCol] ?? '—').slice(0, 20), sum: g.sum, mean: g.mean }))
  return (
    <div className="rounded-2xl border p-6" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
      <div className="text-xs text-slate-400 mb-4">Sum of <strong className="text-cyan-400">{metricCol}</strong> by <strong className="text-cyan-400">{groupCol}</strong></div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#0D1627', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 10, color: '#E2E8F0', fontSize: 12 }} />
          <Bar dataKey="sum" fill="#6366F1" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function OutliersPanel({ outliers }: { outliers: any }) {
  const summary = outliers?.outlier_summary || []
  if (!summary.length) return <div className="p-8 text-center text-slate-400 text-sm rounded-2xl border" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>No outliers detected.</div>
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
      <div className="px-5 py-3 border-b grid grid-cols-4 text-xs font-bold text-slate-400 uppercase tracking-wider" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div>Column</div><div>Lower Bound</div><div>Upper Bound</div><div>Outliers</div>
      </div>
      {summary.map((s: any) => (
        <div key={s.column} className="px-5 py-3.5 border-b last:border-0 grid grid-cols-4 text-sm" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="text-slate-200 font-medium">{s.column}</div>
          <div className="text-slate-400">{s.lower_bound?.toFixed(2)}</div>
          <div className="text-slate-400">{s.upper_bound?.toFixed(2)}</div>
          <div className="flex items-center gap-2">
            <span className={s.outlier_count > 0 ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>{s.outlier_count}</span>
            {s.outlier_count > 0 && <span className="text-xs text-slate-500">({s.outlier_rate}%)</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function ChartsPanel({ charts }: { charts: any[] }) {
  if (!charts?.length) return <div className="p-8 text-center text-slate-400 text-sm rounded-2xl border" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>No charts generated.</div>
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {charts.map(c => (
        <div key={c.filename} className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
          <img
            src={c.url}
            alt={c.title || c.filename}
            className="w-full object-contain bg-black/20"
            style={{ maxHeight: 340, minHeight: 180 }}
            onError={(e) => {
              const img = e.currentTarget
              if (!img.dataset.retried) {
                img.dataset.retried = 'true'
                img.src = `/api/charts/image/${c.filename}`
              }
            }}
          />
          <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="text-xs font-semibold text-slate-300">{c.title || c.filename}</div>
            <div className="text-xs text-slate-500">{c.chart_type}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CrewPanel({ crewResult, crewError }: { crewResult: string | null; crewError: string | null }) {
  if (!crewResult && !crewError) {
    return <div className="p-8 text-center text-slate-400 text-sm rounded-2xl border" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>No CrewAI output produced.</div>
  }

  const isOllamaError = crewError && (crewError.includes('Ollama is not running') || crewError.includes('Connection error') || crewError.includes('11434') || crewError.includes('OpenAI API'))
  const isKeyError = crewError && (crewError.includes('OpenRouter API key') || crewError.includes('API key required'))

  return (
    <div className="space-y-4">
      {crewError && !crewResult && (
        <div className="p-6 rounded-2xl border text-sm" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.25)', color: '#FCD34D' }}>
          <div className="text-base font-bold flex items-center gap-2 mb-2 text-amber-300">
            ⚠️ CrewAI LLM Step Skipped
          </div>
          <p className="text-xs text-amber-200/80 leading-relaxed mb-3">
            The deterministic analytical outputs (charts, statistics, correlation, trends, data quality, and PDF reports) were generated successfully and are fully available in the tabs above.
          </p>
          {isOllamaError && (
            <div className="mt-3 p-4 rounded-xl border bg-black/20" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
              <div className="font-semibold text-xs text-amber-300 mb-1">🖥️ Cloud Deployment Notice — Local Ollama Offline:</div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Ollama runs locally on your desktop machine (<code>localhost:11434</code>) and does not exist inside the cloud container.
                To get full AI agent synthesis in cloud mode, switch to an OpenRouter model with your free personal key.
              </p>
              <a href="/app/analyze" className="inline-block text-xs px-4 py-2 rounded-lg font-bold text-white transition-all shadow-md"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#8B5CF6)' }}>
                Switch to OpenRouter Cloud & Re-run →
              </a>
            </div>
          )}
          {isKeyError && (
            <div className="mt-3 p-4 rounded-xl border bg-black/20" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
              <div className="font-semibold text-xs text-amber-300 mb-1">🔑 Bring Your Own Key Required:</div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                To keep InsightFlow free and multi-tenant without burning shared server keys, please provide your free OpenRouter API key.
              </p>
              <a href="/app/settings" className="inline-block text-xs px-4 py-2 rounded-lg font-bold text-white transition-all shadow-md"
                style={{ background: 'linear-gradient(135deg,#D97706,#F59E0B)' }}>
                Configure Key in Settings →
              </a>
            </div>
          )}
          {!isOllamaError && !isKeyError && (
            <div className="text-xs font-mono text-slate-400 bg-black/30 p-3 rounded-lg border border-white/5 mt-2">
              {crewError}
            </div>
          )}
        </div>
      )}

      {crewError && crewResult && (
        <div className="px-4 py-3 rounded-xl border text-xs flex items-center justify-between" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)', color: '#FCD34D' }}>
          <div className="flex items-center gap-2">
            <span>ℹ️</span>
            <span className="font-medium text-amber-200/90">Autonomous Strategic Synthesis (Multi-Agent Analytical Briefing)</span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">Synthesized</span>
        </div>
      )}

      {crewResult && (
        <div className="rounded-2xl border p-6 prose prose-invert max-w-none text-sm leading-relaxed text-slate-300" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(6,182,212,0.15)' }}>
          <ReactMarkdown>{String(crewResult)}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="skeleton h-8 w-48 mb-8 rounded-xl" />
      <div className="grid grid-cols-4 gap-3 mb-6">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      <div className="skeleton h-10 w-full mb-4 rounded-xl" />
      <div className="skeleton h-64 w-full rounded-2xl" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Activity size={48} className="text-slate-600 mb-4" />
      <h2 className="text-xl font-bold text-slate-300 mb-2">No results yet</h2>
      <p className="text-slate-500 text-sm mb-6">Run an analysis from the Analyze page to see results here.</p>
      <a href="/app/analyze" className="text-sm px-5 py-2.5 rounded-xl font-semibold text-white" style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)' }}>Go to Analyze</a>
    </div>
  )
}
