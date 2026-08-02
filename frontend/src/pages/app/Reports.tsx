import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, RefreshCw, Eye } from 'lucide-react'
import { getReports, getReportContent } from '../../lib/api'
import { formatBytes } from '../../lib/utils'
import ReactMarkdown from 'react-markdown'

export default function Reports() {
  const [reports, setReports] = useState<{ filename: string; format: string; size: number; url: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState<{ filename: string; content: string } | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const load = () => {
    setLoading(true)
    getReports().then(r => setReports(r.reports)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openPreview = async (filename: string) => {
    setPreviewLoading(true)
    const d = await getReportContent(filename).catch(() => null)
    setPreview(d ? { filename, content: d.content } : null)
    setPreviewLoading(false)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Reports</h1>
        <p className="text-sm text-slate-400">Download generated Markdown and PDF reports</p>
      </motion.div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-400">{reports.length} report(s)</span>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : reports.length === 0 ? (
        <div className="p-12 rounded-2xl border text-center" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
          <FileText size={36} className="mx-auto mb-3 text-slate-600" />
          <div className="text-sm text-slate-400 mb-2">No reports yet.</div>
          <div className="text-xs text-slate-500">Run an analysis to generate Markdown and PDF reports.</div>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
          {reports.map((r, i) => (
            <motion.div key={r.filename} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 px-5 py-4 border-b last:border-0 group hover:bg-white/[0.02] transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: r.format === 'PDF' ? 'rgba(244,63,94,0.12)' : 'rgba(6,182,212,0.1)', border: `1px solid ${r.format === 'PDF' ? 'rgba(244,63,94,0.2)' : 'rgba(6,182,212,0.2)'}` }}>
                <FileText size={14} style={{ color: r.format === 'PDF' ? '#F43F5E' : '#06B6D4' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200 truncate">{r.filename}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: r.format === 'PDF' ? 'rgba(244,63,94,0.15)' : 'rgba(6,182,212,0.12)', color: r.format === 'PDF' ? '#F43F5E' : '#06B6D4' }}>{r.format}</span>
                  <span className="text-xs text-slate-500">{formatBytes(r.size)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {r.format === 'MD' && (
                  <button onClick={() => openPreview(r.filename)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-slate-300 border hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <Eye size={12} /> Preview
                  </button>
                )}
                <a href={r.url} download className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)' }}>
                  <Download size={12} /> Download
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {(preview || previewLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(7,13,26,0.85)', backdropFilter: 'blur(12px)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl border overflow-hidden"
            style={{ background: '#0D1627', borderColor: 'rgba(6,182,212,0.2)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <span className="text-sm font-semibold text-slate-200">{preview?.filename}</span>
              <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-white text-lg leading-none">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {previewLoading ? <div className="skeleton h-64 rounded-xl" /> : (
                <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed">
                  <ReactMarkdown>{preview?.content || ''}</ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
