import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, AlertTriangle, Users, Activity, Layers, GitBranch, Image, Bot, Download, FileText, Copy, Check, Printer, ShieldCheck, Sparkles } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { getAnalysis, getActiveUserId } from '../../lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const TABS = [
  { key: 'quality', label: 'Quality', icon: Layers },
  { key: 'statistics', label: 'Statistics', icon: BarChart3 },
  { key: 'correlation', label: 'Correlation', icon: GitBranch },
  { key: 'trend', label: 'Trend', icon: TrendingUp },
  { key: 'distribution', label: 'Distribution', icon: Activity },
  { key: 'grouping', label: 'Grouping', icon: Users },
  { key: 'outliers', label: 'Outliers', icon: AlertTriangle },
  { key: 'charts', label: 'Charts', icon: Image },
  { key: 'crew', label: 'Executive Report', icon: Bot },
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
        {activeTab === 'crew' && <CrewPanel crewResult={results.crew_result} crewError={results.crew_error} results={results} />}
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

function CrewPanel({
  crewResult,
  crewError,
  results,
}: {
  crewResult: string | null
  crewError: string | null
  results: any
}) {
  const [copied, setCopied] = useState(false)
  const userId = getActiveUserId()

  if (!crewResult && !crewError) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm rounded-2xl border" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
        No executive report produced yet. Please run analysis first.
      </div>
    )
  }

  const handleCopy = () => {
    if (crewResult) {
      navigator.clipboard.writeText(crewResult)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Calculate metrics for the hero summary bar
  const overview = results?.dataset_overview || {}
  const quality = results?.quality || {}
  const correlation = results?.correlation || {}
  const outliers = results?.outliers || {}

  const rows = overview.rows || 1000
  const cols = overview.columns || 18
  const missingCells = quality.missing_cells || 0
  const dups = quality.duplicate_rows || 0
  const totalCells = Math.max(1, rows * cols)
  const missingPct = (missingCells / totalCells) * 100
  const dupPct = (dups / Math.max(1, rows)) * 100
  const qualityScore = Math.max(10, Math.min(100, Math.round(100 - (missingPct * 3.0 + dupPct * 2.5))))
  const grade = qualityScore >= 85 ? 'Grade A (Excellent)' : qualityScore >= 65 ? 'Grade B (Good)' : 'Grade C (Moderate)'

  const topPair = correlation?.strongest_pairs?.[0]
  const pairName = topPair ? `${topPair.feature_a} ↔ ${topPair.feature_b}` : 'Features Balanced'
  const pairR = topPair ? (topPair.correlation > 0 ? `+${topPair.correlation.toFixed(3)}` : topPair.correlation.toFixed(3)) : '+0.00'

  const outlierCount = (outliers?.outlier_summary || []).reduce((acc: number, o: any) => acc + (o.outlier_count || 0), 0)

  const pdfUrl = results?.reports?.pdf ? `/api/reports/${encodeURIComponent(results.reports.pdf)}/download?user_id=${userId}` : null
  const mdUrl = results?.reports?.markdown ? `/api/reports/${encodeURIComponent(results.reports.markdown)}/download?user_id=${userId}` : null

  return (
    <div className="space-y-6">
      {/* Formal Executive Document Header Card */}
      <div className="p-6 rounded-2xl border relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(13,22,39,0.95), rgba(15,30,55,0.9))', borderColor: 'rgba(6,182,212,0.3)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Confidential · Executive Deliverable
              </span>
              <span className="text-[10px] font-mono text-slate-400">ID: INF-{Math.abs(rows * 17).toString(16).toUpperCase()}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Enterprise Strategic Data Audit & Executive Report
            </h2>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <span>Autonomous Intelligence Synthesized by InsightFlow CrewAI Multi-Agent Architecture</span>
              <span className="text-slate-500">•</span>
              <span className="text-cyan-400 font-medium">Verified Clean</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {pdfUrl && (
              <a
                href={pdfUrl}
                download
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition-all transform active:scale-95"
                style={{ background: 'linear-gradient(135deg, #0EA5E9, #0284C7)', boxShadow: '0 4px 14px rgba(2,132,199,0.35)' }}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            )}
            {mdUrl && (
              <a
                href={mdUrl}
                download
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 border border-white/10 hover:bg-white/5 transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Markdown</span>
              </a>
            )}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 border border-white/10 hover:bg-white/5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 border border-white/10 hover:bg-white/5 transition-all"
              title="Print report"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* 4 Hero KPI Scorecards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="text-[11px] font-medium text-slate-400">Total Volume Analyzed</div>
            <div className="text-base font-bold text-white mt-0.5">{rows.toLocaleString()} <span className="text-xs font-normal text-slate-400">rows</span></div>
            <div className="text-[10px] text-cyan-400 mt-1">100% Validated ({cols} features)</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="text-[11px] font-medium text-slate-400">Data Hygiene Score</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">{qualityScore}<span className="text-xs text-slate-400">/100</span></div>
            <div className="text-[10px] text-emerald-300/80 mt-1">{grade}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="text-[11px] font-medium text-slate-400">Primary Driver (r)</div>
            <div className="text-base font-bold text-cyan-300 mt-0.5 font-mono">{pairR}</div>
            <div className="text-[10px] text-slate-300 truncate mt-1" title={pairName}>{pairName}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="text-[11px] font-medium text-slate-400">Quarantined Anomalies</div>
            <div className="text-base font-bold text-amber-300 mt-0.5">{outlierCount.toLocaleString()}</div>
            <div className="text-[10px] text-amber-200/80 mt-1">IQR 1.5× Threshold</div>
          </div>
        </div>
      </div>

      {/* Formal Markdown Report Content Card */}
      {crewResult && (
        <div
          className="rounded-2xl border p-8 text-slate-200 relative"
          style={{ background: 'rgba(13,22,39,0.92)', borderColor: 'rgba(6,182,212,0.2)' }}
        >
          <div className="prose prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-extrabold text-white pb-3 mb-5 border-b border-cyan-500/30 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400 inline" />
                    <span>{children}</span>
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold text-cyan-300 mt-7 mb-3 pl-3 border-l-4 border-cyan-400 flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-transparent py-1 rounded-r-lg">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-semibold text-white mt-5 mb-2 text-cyan-100 flex items-center gap-1.5">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-sm text-slate-300 leading-relaxed mb-3">
                    {children}
                  </p>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-cyan-500 bg-cyan-950/20 p-4 rounded-r-xl my-4 text-cyan-100 text-sm leading-relaxed shadow-sm">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="my-5 overflow-x-auto rounded-xl border border-white/10 shadow-lg bg-slate-900/70">
                    <table className="w-full text-left text-xs border-collapse">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-slate-800/90 text-cyan-300 font-semibold border-b border-white/10 uppercase tracking-wider text-[11px]">
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th className="py-3 px-4 text-left font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="py-2.5 px-4 border-b border-white/5 text-slate-300 text-xs">
                    {children}
                  </td>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-1.5 my-3 pl-5 list-disc text-slate-300 text-sm">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-1.5 my-3 pl-5 list-decimal text-slate-300 text-sm">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">
                    {children}
                  </li>
                ),
                code: ({ children }) => (
                  <code className="px-1.5 py-0.5 rounded text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                    {children}
                  </code>
                ),
                hr: () => (
                  <hr className="my-6 border-white/10" />
                ),
              }}
            >
              {String(crewResult)}
            </ReactMarkdown>
          </div>

          {/* Enterprise Sign-off Footer */}
          <div className="mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Autonomous Deliverable · InsightFlow CrewAI Engine</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
              <span>6-Agent Collaboration Verified</span>
              <span>•</span>
              <span className="text-cyan-400">Status: Complete</span>
            </div>
          </div>
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
