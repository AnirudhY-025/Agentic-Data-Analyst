import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Database, BarChart3, FileText, Sparkles, TrendingUp, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getDatasets, getReports, getCharts } from '../../lib/api'
import { formatBytes } from '../../lib/utils'

export default function Dashboard() {
  const [datasets, setDatasets] = useState<{ name: string; size: number }[]>([])
  const [reports, setReports] = useState<{ filename: string; format: string; size: number }[]>([])
  const [charts, setCharts] = useState<{ filename: string; url: string }[]>([])

  useEffect(() => {
    getDatasets().then(d => setDatasets(d.datasets)).catch(() => {})
    getReports().then(r => setReports(r.reports)).catch(() => {})
    getCharts().then(c => setCharts(c.charts)).catch(() => {})
  }, [])

  const kpis = [
    { label: 'Datasets', value: datasets.length, icon: Database, color: '#06B6D4', sub: 'Available for analysis' },
    { label: 'Reports Generated', value: reports.length, icon: FileText, color: '#6366F1', sub: 'MD + PDF files' },
    { label: 'Charts Created', value: charts.length, icon: BarChart3, color: '#10B981', sub: 'Auto-visualizations' },
    { label: 'AI Agents', value: 6, icon: Sparkles, color: '#8B5CF6', sub: 'Sequential pipeline' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-sm text-slate-400">Overview of your InsightFlow AI workspace</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="p-5 rounded-2xl border hover-glow"
            style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}18`, border: `1px solid ${k.color}28` }}>
                <k.icon size={17} style={{ color: k.color }} />
              </div>
              <TrendingUp size={14} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white mb-1">{k.value}</div>
            <div className="text-xs font-semibold text-slate-300 mb-0.5">{k.label}</div>
            <div className="text-xs text-slate-500">{k.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
        <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><Sparkles size={15} className="text-cyan-400" /> Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: '/app/analyze', label: 'New Analysis', desc: 'Upload and analyze a dataset', icon: Sparkles, color: '#06B6D4', gradient: 'linear-gradient(135deg,#0891B2,#06B6D4)' },
            { to: '/app/datasets', label: 'Manage Datasets', desc: 'Browse and upload files', icon: Database, color: '#6366F1', gradient: 'linear-gradient(135deg,#4F46E5,#6366F1)' },
            { to: '/app/reports', label: 'View Reports', desc: 'Download MD and PDF files', icon: FileText, color: '#10B981', gradient: 'linear-gradient(135deg,#059669,#10B981)' },
          ].map(a => (
            <Link key={a.to} to={a.to}>
              <motion.div whileHover={{ y: -3, scale: 1.01 }} className="p-5 rounded-2xl border cursor-pointer transition-all duration-200"
                style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: a.gradient }}>
                  <a.icon size={17} color="#fff" />
                </div>
                <div className="text-sm font-semibold text-white mb-1">{a.label}</div>
                <div className="text-xs text-slate-400">{a.desc}</div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Datasets */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
        <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><Database size={15} className="text-cyan-400" /> Recent Datasets</h2>
        {datasets.length === 0 ? (
          <div className="p-8 rounded-2xl border text-center" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <Database size={28} className="mx-auto mb-3 text-slate-600" />
            <div className="text-sm text-slate-400 mb-3">No datasets yet</div>
            <Link to="/app/datasets" className="text-xs px-4 py-2 rounded-xl font-semibold text-white" style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)' }}>Upload Dataset</Link>
          </div>
        ) : (
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
            {datasets.slice(0, 5).map((d, i) => (
              <div key={d.name} className="flex items-center justify-between px-5 py-3.5 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)' }}>
                    <Database size={13} className="text-cyan-400" />
                  </div>
                  <span className="text-sm text-slate-200 font-medium">{d.name}</span>
                </div>
                <span className="text-xs text-slate-500">{formatBytes(d.size)}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Reports */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><Activity size={15} className="text-cyan-400" /> Recent Reports</h2>
        {reports.length === 0 ? (
          <div className="p-8 rounded-2xl border text-center" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <FileText size={28} className="mx-auto mb-3 text-slate-600" />
            <div className="text-sm text-slate-400">No reports yet. Run an analysis to generate one.</div>
          </div>
        ) : (
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
            {reports.slice(0, 5).map(r => (
              <div key={r.filename} className="flex items-center justify-between px-5 py-3.5 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: r.format === 'PDF' ? 'rgba(244,63,94,0.15)' : 'rgba(6,182,212,0.12)', color: r.format === 'PDF' ? '#F43F5E' : '#06B6D4' }}>{r.format}</span>
                  <span className="text-sm text-slate-200">{r.filename}</span>
                </div>
                <a href={`/api/reports/${r.filename}/download`} className="text-xs text-cyan-400 hover:text-cyan-300">Download</a>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
