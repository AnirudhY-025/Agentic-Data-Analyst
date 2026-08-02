import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BarChart3, Brain, Zap, FileText, GitBranch, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react'

const features = [
  { icon: Brain, title: 'Multi-Agent AI Pipeline', desc: 'Six specialized CrewAI agents collaborate sequentially — Planner, Preparer, Analyst, Visualizer, Insights, and Reporter — each owning a dedicated stage of the analysis.', color: '#06B6D4' },
  { icon: Zap, title: 'Instant Data Cleaning', desc: 'Auto-detects date columns, fills missing values, removes duplicates, and normalizes schemas — all within seconds of upload.', color: '#6366F1' },
  { icon: BarChart3, title: 'Auto Visualizations', desc: 'Dynamically selects the most relevant chart types based on your data structure — histograms, scatter plots, correlation heatmaps, trend lines, and bar charts.', color: '#10B981' },
  { icon: FileText, title: 'Professional Reports', desc: 'Generates polished Markdown and PDF reports ready for business stakeholders — with executive summary, findings, and recommendations.', color: '#F59E0B' },
  { icon: GitBranch, title: 'Full Analysis Suite', desc: 'Runs descriptive statistics, Pearson correlation, time-series trends, distribution analysis, group-by breakdowns, and IQR-based outlier detection.', color: '#8B5CF6' },
  { icon: CheckCircle2, title: 'Smart Column Detection', desc: 'Automatically identifies date, metric, and categorical columns from any schema. Override with a single click when needed.', color: '#F43F5E' },
]

const steps = [
  { n: '01', label: 'Upload', desc: 'Drop any CSV or Excel file' },
  { n: '02', label: 'Configure', desc: 'Set your question and column hints' },
  { n: '03', label: 'Analyze', desc: '6-step AI pipeline runs automatically' },
  { n: '04', label: 'Report', desc: 'Download MD and PDF reports' },
]

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: '#070D1A', color: '#E2E8F0' }}>
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b" style={{ background: 'rgba(7,13,26,0.85)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)' }}>
            <BarChart3 size={16} color="#fff" />
          </div>
          <span className="font-bold text-sm" style={{ color: '#E2E8F0' }}>InsightFlow AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/app" className="text-sm px-4 py-2 rounded-xl font-semibold transition-all duration-200 hover:opacity-80 text-white"
            style={{ background: 'linear-gradient(135deg, #0891B2, #6366F1)' }}>
            Open App →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-float" style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }} />
          <div className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15 animate-float" style={{ background: 'radial-gradient(circle, #6366F1, transparent)', animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-10 animate-float" style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)', animationDelay: '4s' }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-xs px-4 py-1.5 rounded-full mb-6 font-semibold tracking-wider uppercase"
              style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', color: '#06B6D4' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Agentic AI · Six-Agent CrewAI Pipeline
            </span>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-none tracking-tight">
              Turn raw data into<br />
              <span className="gradient-text">actionable insights</span>
            </h1>

            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload a CSV or Excel file, ask a business question, and watch six specialized AI agents
              automatically clean your data, run deep analysis, generate charts, and deliver a polished professional report.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/app/analyze">
                <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm transition-shadow"
                  style={{ background: 'linear-gradient(135deg,#0891B2 0%,#06B6D4 55%,#38BDF8 100%)', color: '#020D14', boxShadow: '0 0 32px rgba(6,182,212,0.35)' }}>
                  Start Analyzing <ArrowRight size={16} />
                </motion.button>
              </Link>
              <Link to="/app/datasets">
                <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-sm border text-slate-300 transition-colors hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  Browse Datasets
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Floating pills */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mt-12">
            {['🧹 Auto data cleaning', '📈 Smart visualizations', '🔍 Outlier detection', '📊 Correlation analysis', '💡 AI-powered insights', '📄 PDF reports'].map(p => (
              <span key={p} className="text-xs px-3 py-1.5 rounded-full text-slate-400 border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>{p}</span>
            ))}
          </motion.div>

          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-16 flex justify-center">
            <ChevronDown size={20} className="text-slate-600" />
          </motion.div>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-3">How it works</h2>
            <p className="text-slate-400">From raw file to professional report in four steps</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div key={s.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border text-center hover-glow"
                style={{ background: 'rgba(13,22,39,0.7)', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-3xl font-black mb-3 gradient-text">{s.n}</div>
                <div className="font-semibold text-sm mb-1 text-white">{s.label}</div>
                <div className="text-xs text-slate-500">{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4" style={{ background: 'rgba(13,22,39,0.5)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-3">Everything you need</h2>
            <p className="text-slate-400">Powered by CrewAI + Ollama, running 100% locally</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl border hover-glow group"
                style={{ background: 'rgba(13,22,39,0.8)', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.color}20`, border: `1px solid ${f.color}30` }}>
                  <f.icon size={18} style={{ color: f.color }} />
                </div>
                <h3 className="font-semibold text-sm text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Agent Pipeline Visualization ── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Six-agent pipeline</h2>
            <p className="text-slate-400">Each agent owns a specific analytical responsibility</p>
          </motion.div>
          <div className="flex flex-col gap-3">
            {[
              { n: 1, label: 'Planner Agent', desc: 'Designs execution order and workflow strategy', color: '#06B6D4' },
              { n: 2, label: 'Data Preparation Agent', desc: 'Loads, validates, cleans and summarizes the dataset', color: '#6366F1' },
              { n: 3, label: 'Analysis Agent', desc: 'Computes statistics, correlations, trends and outliers', color: '#10B981' },
              { n: 4, label: 'Visualization Agent', desc: 'Auto-generates the most relevant charts', color: '#F59E0B' },
              { n: 5, label: 'Insight Agent', desc: 'Converts findings into evidence-based business insights', color: '#8B5CF6' },
              { n: 6, label: 'Report Agent', desc: 'Produces polished Markdown and PDF reports', color: '#F43F5E' },
            ].map((a, i) => (
              <motion.div key={a.n} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="flex items-center gap-4 p-4 rounded-xl border"
                style={{ background: 'rgba(13,22,39,0.7)', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: `${a.color}25`, color: a.color, border: `1px solid ${a.color}40` }}>
                  {a.n}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{a.label}</div>
                  <div className="text-xs text-slate-400">{a.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-black mb-4">Ready to analyze?</h2>
            <p className="text-slate-400 mb-8">Upload your first dataset and let the agents work.</p>
            <Link to="/app/analyze">
              <motion.button whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}
                className="px-10 py-4 rounded-2xl font-bold text-sm"
                style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)', color: '#fff', boxShadow: '0 0 40px rgba(99,102,241,0.35)' }}>
                Start for Free →
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-8 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)' }}>
            <BarChart3 size={10} color="#fff" />
          </div>
          <span className="text-xs font-bold text-slate-400">InsightFlow AI</span>
        </div>
        <p className="text-xs text-slate-600">Powered by CrewAI · Ollama · FastAPI · React</p>
      </footer>
    </div>
  )
}
