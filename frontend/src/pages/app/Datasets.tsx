import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Database, Trash2, Eye, RefreshCw } from 'lucide-react'
import { getDatasets, uploadDataset } from '../../lib/api'
import { formatBytes } from '../../lib/utils'
import { useStore } from '../../store/useStore'
import { useNavigate } from 'react-router-dom'

export default function Datasets() {
  const [datasets, setDatasets] = useState<{ name: string; size: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const setSelectedDataset = useStore(s => s.setSelectedDataset)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    getDatasets().then(d => setDatasets(d.datasets)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    for (const file of Array.from(files)) {
      await uploadDataset(file).catch(() => {})
    }
    setUploading(false)
    load()
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const selectAndAnalyze = (name: string) => {
    setSelectedDataset(name)
    navigate('/app/analyze')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Datasets</h1>
        <p className="text-sm text-slate-400">Upload and manage your CSV and Excel files</p>
      </motion.div>

      {/* Drop zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="relative mb-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-16 cursor-pointer transition-all duration-200"
        style={{ borderColor: dragOver ? '#06B6D4' : 'rgba(255,255,255,0.1)', background: dragOver ? 'rgba(6,182,212,0.06)' : 'rgba(13,22,39,0.6)' }}
        onClick={() => document.getElementById('file-input')?.click()}>
        <input id="file-input" type="file" multiple accept=".csv,.xlsx,.xls" className="hidden" onChange={e => handleFiles(e.target.files)} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <RefreshCw size={32} className="text-cyan-400 animate-spin" />
            <p className="text-sm text-cyan-400 font-medium">Uploading…</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
              <Upload size={28} className="text-cyan-400" />
            </div>
            <p className="text-base font-semibold text-white mb-1">Drop files here or click to browse</p>
            <p className="text-xs text-slate-400">Supports CSV, XLS, XLSX</p>
          </>
        )}
      </motion.div>

      {/* Dataset list */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-300">Available Datasets ({datasets.length})</h2>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : datasets.length === 0 ? (
        <div className="p-12 rounded-2xl border text-center" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
          <Database size={36} className="mx-auto mb-3 text-slate-600" />
          <div className="text-sm text-slate-400">No datasets yet. Drop a file above to get started.</div>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(13,22,39,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
          {datasets.map((d, i) => (
            <motion.div key={d.name} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 px-5 py-4 border-b last:border-0 group hover:bg-white/[0.02] transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <Database size={14} className="text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200 truncate">{d.name}</div>
                <div className="text-xs text-slate-500">{formatBytes(d.size)}</div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => selectAndAnalyze(d.name)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)' }}>
                  <Eye size={12} /> Analyze
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
