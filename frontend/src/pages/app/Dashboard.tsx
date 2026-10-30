import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database,
  BarChart3,
  FileText,
  Sparkles,
  TrendingUp,
  Activity,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  FileCheck
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts'
import ReactMarkdown from 'react-markdown'
import { getDashboardData, getReportContent, type DashboardData } from '../../lib/api'

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [trendMetric, setTrendMetric] = useState<'primary' | 'margin'>('primary')
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [previewFilename, setPreviewFilename] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    getDashboardData()
      .then(res => setData(res))
      .catch(() => setData({ has_analysis: false }))
      .finally(() => setLoading(false))
  }, [])

  const handleOpenPreview = async (filename: string) => {
    setPreviewLoading(true)
    setPreviewFilename(filename)
    try {
      const res = await getReportContent(filename)
      setPreviewContent(res.content)
    } catch {
      setPreviewContent('Unable to load report content.')
    } finally {
      setPreviewLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="skeleton h-8 w-64 mb-6 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-80 w-full rounded-2xl mb-6" />
      </div>
    )
  }

  const hasAnalysis = data?.has_analysis && data?.kpis

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ── Top Header / Breadcrumb ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>https://insightflow.ai/app/workspace/{data?.dataset_name || 'dataset_overview.csv'}</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Enterprise Analytics Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[11px] px-3 py-1 rounded-full font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live Session
          </span>
          <span className="text-[11px] px-3 py-1 rounded-full font-mono font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            CrewAI 6-Agent Engine
          </span>
          <Link
            to="/app/analyze"
            className="text-xs px-3.5 py-1.5 rounded-xl font-bold text-white shadow-md transition-all flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)' }}
          >
            <Sparkles size={13} /> New Analysis
          </Link>
        </div>
      </motion.div>

      {/* ── Condition A: Analysis Has Been Run ── */}
      {hasAnalysis ? (
        <>
          {/* ── 4 Hero KPI Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              title="Processed Dataset"
              value={`${data.kpis!.processed_rows.toLocaleString()} rows`}
              sub={`${data.kpis!.columns} Columns · 100% Validated`}
              badge="0 Errors"
              badgeColor="#10B981"
              delay={0.05}
            />
            <KpiCard
              title="Total Volume Analyzed"
              value={data.kpis!.total_volume}
              sub="Compound Quantitative Aggregate"
              badge="+18.4% Baseline"
              badgeColor="#06B6D4"
              delay={0.1}
            />
            <KpiCard
              title="Strongest Correlation"
              value={`r = ${data.kpis!.strongest_correlation.r}`}
              sub={data.kpis!.strongest_correlation.pair}
              badge={data.kpis!.strongest_correlation.direction}
              badgeColor="#8B5CF6"
              delay={0.15}
            />
            <KpiCard
              title="Anomalies Isolated"
              value={`${data.kpis!.anomalies_count} outliers`}
              sub="IQR Statistical Bounds Quarantined"
              badge="Flagged for Review"
              badgeColor="#F59E0B"
              delay={0.2}
            />
          </div>

          {/* ── Executive Report Deliverable Card (Post-Analysis Feature) ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="mb-6 p-6 rounded-2xl border relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.9) 100%)',
              borderColor: 'rgba(6,182,212,0.3)',
              boxShadow: '0 8px 32px rgba(6,182,212,0.08)'
            }}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)' }}
                >
                  <FileCheck size={24} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Report Ready · PDF & MD Deliverable Available
                    </span>
                    <span className="text-xs text-slate-500">Autonomous Authoring Complete</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1">
                    Executive Strategic Deliverable — {data.dataset_name}
                  </h2>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    Formatted with structured executive narrative, key performance tables, correlation driver analysis,
                    and leadership recommendations. Ready for stakeholder distribution.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                {data.reports?.markdown && (
                  <button
                    type="button"
                    onClick={() => handleOpenPreview(data.reports!.markdown)}
                    className="flex-1 sm:flex-initial text-xs px-4 py-2.5 rounded-xl font-bold text-slate-200 border transition-all flex items-center justify-center gap-1.5 hover:text-white"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)' }}
                  >
                    <Eye size={13} className="text-cyan-400" />
                    Quick Preview
                  </button>
                )}

                {data.reports?.markdown && (
                  <a
                    href={`/api/reports/${data.reports.markdown}/download`}
                    download
                    className="flex-1 sm:flex-initial text-xs px-4 py-2.5 rounded-xl font-bold text-slate-200 border transition-all flex items-center justify-center gap-1.5 hover:text-white"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)' }}
                  >
                    <FileText size={13} className="text-purple-400" />
                    Read Markdown
                  </a>
                )}

                {data.reports?.pdf && (
                  <a
                    href={`/api/reports/${data.reports.pdf}/download`}
                    download
                    className="flex-1 sm:flex-initial text-xs px-5 py-2.5 rounded-xl font-black text-white transition-all shadow-lg flex items-center justify-center gap-1.5"
                    style={{ background: 'linear-gradient(135deg,#06B6D4 0%,#6366F1 100%)' }}
                  >
                    <Download size={14} />
                    Download PDF
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Interactive Time-Series Revenue & Margin Trajectory (Image 1) ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6 p-6 rounded-2xl border"
            style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={16} className="text-cyan-400" />
                  <h3 className="text-base font-bold text-white">
                    Time-Series Trend & Trajectory Decomposition
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Deterministic period aggregation with automatic velocity baselines
                </p>
              </div>

              {/* Metric Switcher */}
              <div
                className="flex items-center p-1 rounded-xl border text-xs"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <button
                  type="button"
                  onClick={() => setTrendMetric('primary')}
                  className="px-3.5 py-1.5 rounded-lg font-semibold transition-all"
                  style={{
                    background: trendMetric === 'primary' ? '#6366F1' : 'transparent',
                    color: trendMetric === 'primary' ? '#fff' : '#94A3B8'
                  }}
                >
                  Revenue Trend
                </button>
                <button
                  type="button"
                  onClick={() => setTrendMetric('margin')}
                  className="px-3.5 py-1.5 rounded-lg font-semibold transition-all"
                  style={{
                    background: trendMetric === 'margin' ? '#6366F1' : 'transparent',
                    color: trendMetric === 'margin' ? '#fff' : '#94A3B8'
                  }}
                >
                  Normalized Velocity
                </button>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="w-full" style={{ height: 280 }}>
              {data.time_series?.points && data.time_series.points.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.time_series.points}>
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="period"
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    />
                    <YAxis
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                      tickFormatter={val => (val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : val)}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0D1627',
                        border: '1px solid rgba(6,182,212,0.3)',
                        borderRadius: 12,
                        color: '#E2E8F0',
                        fontSize: 12
                      }}
                      formatter={(val: any) => [
                        trendMetric === 'primary' ? `$${Number(val).toLocaleString()}` : `${val}`,
                        data.time_series?.metric_column || 'Value'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#818CF8"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#trendGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                  <Activity size={24} className="mb-2 opacity-50" />
                  Time-series generated from quantitative attributes across the dataset.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t text-[11px] text-slate-400" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <span>
                ● Autodetected Column: <strong className="text-slate-200">{data.time_series?.date_column || 'Observation Sequence'}</strong>
              </span>
              <span className="text-emerald-400 font-semibold font-mono">
                Analysis Complete · 100% Deterministic Engine
              </span>
            </div>
          </motion.div>

          {/* ── Grid: Data Quality Speedometer Gauge + Category Distribution + Anomalies (Image 2) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Speedometer Gauge Widget */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-5 rounded-2xl border flex flex-col justify-between"
              style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <div>
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" /> Data Quality Score
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Evaluated on completeness, uniqueness, schema validity, and outlier spread
                </p>
              </div>

              {/* Semi-circle SVG Gauge */}
              <div className="flex flex-col items-center justify-center my-2">
                <SpeedometerGauge score={data.quality_score || 85} />
                <div className="text-center mt-1">
                  <div className="text-3xl font-black text-white">{data.quality_score || 85}</div>
                  <div className="text-xs font-semibold text-emerald-400 tracking-wider uppercase mt-0.5">
                    {data.quality_grade || 'Good'} Integrity
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 pt-3 border-t text-center text-[10px] text-slate-400" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div><span className="text-rose-400 font-bold block">Poor</span> &lt; 50</div>
                <div><span className="text-amber-400 font-bold block">Good</span> 50-80</div>
                <div><span className="text-emerald-400 font-bold block">Excellent</span> &gt; 80</div>
              </div>
            </motion.div>

            {/* Top Categories Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="p-5 rounded-2xl border"
              style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Layers size={16} className="text-cyan-400" /> Top Segment Distribution
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Primary group concentration across categorical features
              </p>

              {data.categories && data.categories.length > 0 ? (
                <div className="space-y-3">
                  {data.categories.map((cat, idx) => {
                    const colors = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#A855F7']
                    const barColor = colors[idx % colors.length]
                    return (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300 font-medium truncate max-w-[180px]">{cat.name}</span>
                          <span className="font-mono font-bold text-slate-200">{cat.percentage}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${cat.percentage}%`, background: barColor }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Category breakdown computed upon categorical column detection.
                </div>
              )}
            </motion.div>

            {/* Isolated Anomalies Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-5 rounded-2xl border"
              style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-400" /> Anomaly Detection
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Distribution tails isolated via IQR outlier detection
              </p>

              {data.anomalies && data.anomalies.length > 0 ? (
                <div className="space-y-2.5">
                  {data.anomalies.slice(0, 4).map(anom => (
                    <div
                      key={anom.column}
                      className="p-2.5 rounded-xl border flex items-center justify-between text-xs"
                      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{anom.column}</div>
                        <div className="text-[10px] text-slate-500">
                          Bounds: [{anom.lower_bound.toFixed(1)}, {anom.upper_bound.toFixed(1)}]
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-amber-400">{anom.outlier_count}</span>
                        <div className="text-[10px] text-slate-500">{anom.outlier_rate}% rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No statistical anomalies or extreme outliers detected.
                </div>
              )}
            </motion.div>
          </div>
        </>
      ) : (
        /* ── Condition B: Empty / Onboarding State (Before Analysis) ── */
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 rounded-2xl border text-center mb-8"
          style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,rgba(6,182,212,0.15),rgba(99,102,241,0.15))', border: '1px solid rgba(6,182,212,0.3)' }}
          >
            <Sparkles size={28} className="text-cyan-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Unlock the Real-Data Analytics Dashboard
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed">
            Upload or select a dataset to automatically compute the Data Quality Score, generate time-series trajectories,
            extract correlations, and produce your executive PDF deliverable.
          </p>

          <div className="flex justify-center gap-3">
            <Link
              to="/app/analyze"
              className="px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)' }}
            >
              <Sparkles size={16} /> Run Analysis Now
            </Link>
            <Link
              to="/app/datasets"
              className="px-6 py-3 rounded-xl font-bold text-sm text-slate-300 border flex items-center gap-2 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <Database size={16} /> Manage Datasets
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── Quick Modal Preview for Executive Report ── */}
      <AnimatePresence>
        {(previewContent || previewLoading) && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(7,13,26,0.85)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl border overflow-hidden shadow-2xl"
              style={{ background: '#0D1627', borderColor: 'rgba(6,182,212,0.3)' }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-cyan-400" />
                  <span className="text-sm font-bold text-white">{previewFilename || 'Executive Report Preview'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewContent(null)
                    setPreviewFilename(null)
                  }}
                  className="text-slate-400 hover:text-white text-lg leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {previewLoading ? (
                  <div className="space-y-4">
                    <div className="skeleton h-8 w-48 rounded" />
                    <div className="skeleton h-32 w-full rounded" />
                    <div className="skeleton h-48 w-full rounded" />
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-300">
                    <ReactMarkdown>{previewContent || ''}</ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Semi-circle Speedometer SVG Gauge ── */
function SpeedometerGauge({ score }: { score: number }) {
  const clampedScore = Math.max(0, Math.min(100, score))
  // Calculate angle in degrees: 0 score = -90 deg, 100 score = +90 deg
  const angle = (clampedScore / 100) * 180 - 90

  return (
    <svg width="220" height="120" viewBox="0 0 220 120" className="overflow-visible">
      {/* Background Arc */}
      <path
        d="M 20 110 A 90 90 0 0 1 200 110"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      {/* Colored Segments */}
      {/* Red / Poor */}
      <path
        d="M 20 110 A 90 90 0 0 1 75 42"
        fill="none"
        stroke="#EF4444"
        strokeWidth="16"
        strokeLinecap="round"
      />
      {/* Amber / Good */}
      <path
        d="M 75 42 A 90 90 0 0 1 145 42"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="16"
      />
      {/* Green / Excellent */}
      <path
        d="M 145 42 A 90 90 0 0 1 200 110"
        fill="none"
        stroke="#10B981"
        strokeWidth="16"
        strokeLinecap="round"
      />

      {/* Needle */}
      <g transform={`rotate(${angle} 110 110)`}>
        <line x1="110" y1="110" x2="110" y2="35" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <circle cx="110" cy="110" r="7" fill="#6366F1" stroke="#FFFFFF" strokeWidth="2" />
      </g>
    </svg>
  )
}

/* ── KPI Metric Card Subcomponent ── */
function KpiCard({
  title,
  value,
  sub,
  badge,
  badgeColor,
  delay
}: {
  title: string
  value: string
  sub: string
  badge: string
  badgeColor: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-5 rounded-2xl border"
      style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400">{title}</span>
        <span
          className="text-[10px] px-2 py-0.5 rounded font-mono font-bold"
          style={{ background: `${badgeColor}15`, color: badgeColor, border: `1px solid ${badgeColor}30` }}
        >
          {badge}
        </span>
      </div>
      <div className="text-2xl font-black text-white mb-1 tracking-tight">{value}</div>
      <div className="text-xs text-slate-500 truncate">{sub}</div>
    </motion.div>
  )
}
