import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  BarChart3, Brain, Zap, FileText, GitBranch, ArrowRight, CheckCircle2,
  Cpu, Database, Shield, ChevronRight, Download, Sparkles, Layers,
  Activity, TrendingUp, AlertTriangle, ExternalLink, Play
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

/* ── Interactive Mockup Datasets ── */
const MOCK_REVENUE_TREND = [
  { month: 'Jan', revenue: 48000, profit: 14200, growth: '+12%' },
  { month: 'Feb', revenue: 59000, profit: 18900, growth: '+23%' },
  { month: 'Mar', revenue: 54000, profit: 16100, growth: '-8%' },
  { month: 'Apr', revenue: 72000, profit: 24500, growth: '+33%' },
  { month: 'May', revenue: 89000, profit: 31200, growth: '+24%' },
  { month: 'Jun', revenue: 104000, profit: 38400, growth: '+17%' },
  { month: 'Jul', revenue: 98000, profit: 34100, growth: '-6%' },
  { month: 'Aug', revenue: 124000, profit: 46200, growth: '+26%' },
  { month: 'Sep', revenue: 141000, profit: 53800, growth: '+14%' },
  { month: 'Oct', revenue: 158000, profit: 61400, growth: '+12%' },
  { month: 'Nov', revenue: 182000, profit: 73500, growth: '+15%' },
  { month: 'Dec', revenue: 215000, profit: 89200, growth: '+18%' },
]

const MOCK_CATEGORIES = [
  { name: 'Enterprise Cloud', value: 840, share: '39%' },
  { name: 'AI Workflows', value: 610, share: '28%' },
  { name: 'Data Pipeline', value: 430, share: '20%' },
  { name: 'Managed Infra', value: 280, share: '13%' },
]

const MOCK_AGENTS = [
  { step: 1, name: 'Planner Agent', role: 'Workflow Orchestration', desc: 'Decoded query intent into a 6-stage statistical execution blueprint', duration: '0.24s', icon: Brain },
  { step: 2, name: 'Data Preparation Agent', role: 'Schema & Sanitization', desc: 'Resolved UTF-8 encoding, normalized dates, handled 14 nulls across 12,450 rows', duration: '0.52s', icon: Zap },
  { step: 3, name: 'Statistical & Outlier Agent', role: 'Deterministic Math Engine', desc: 'Computed Pearson correlation matrix (+0.84 Volume/Margin) & isolated 23 IQR anomalies', duration: '0.48s', icon: Activity },
  { step: 4, name: 'Visualization Agent', role: 'Automated Visual Engine', desc: 'Rendered time-series trend curve, category distributions, and outlier scatter plots', duration: '0.38s', icon: BarChart3 },
  { step: 5, name: 'Strategic Insight Agent', role: 'Factual LLM Synthesis', desc: 'Generated 4 executive takeaways strictly backed by statistical proofs', duration: '0.86s', icon: Sparkles },
  { step: 6, name: 'Executive Report Agent', role: 'Document Generation', desc: 'Compiled comprehensive Markdown briefing and structured PDF report with KPI cards', duration: '0.31s', icon: FileText },
]

export default function Landing() {
  const [activeMockupTab, setActiveMockupTab] = useState<'visuals' | 'pipeline' | 'quality' | 'report'>('visuals')
  const [activeMetricView, setActiveMetricView] = useState<'revenue' | 'profit'>('revenue')

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* ── Background Grid & Atmosphere (Subtle & Refined, NOT harsh neon) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Soft studio ambient light */}
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[1100px] h-[550px] rounded-full opacity-25 blur-[120px] bg-gradient-to-b from-indigo-600 via-blue-700 to-transparent" />
        <div className="absolute top-[35%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-15 blur-[140px] bg-indigo-900/40" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] rounded-full opacity-10 blur-[160px] bg-slate-800" />
        
        {/* Fine technical grid lines */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ── Top Navigation Bar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/80 bg-[#0A0E17]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-950/60 border border-indigo-400/20 group-hover:scale-105 transition-transform duration-200">
              <BarChart3 size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                InsightFlow <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 -mt-0.5">Agentic Data Intelligence</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
            <a href="#tool-preview" className="hover:text-white transition-colors">Tool Preview</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a>
            <a href="#agent-architecture" className="hover:text-white transition-colors">6-Agent Engine</a>
            <a href="#comparison" className="hover:text-white transition-colors">Enterprise vs Manual</a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/AnirudhY-025/Agentic-Data-Analyst"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all"
            >
              <GitBranch size={13} className="text-slate-400" /> GitHub
            </a>
            <Link
              to="/app/analyze"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-md shadow-indigo-950/60 border border-indigo-400/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Launch Workspace <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-900/90 border border-slate-700/60 text-slate-300 mb-8 shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-slate-200 font-semibold">Multi-Tenant BYOK Enabled</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Zero Server-Side Key Persistence</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6"
          >
            Autonomous Data Analytics.<br />
            <span className="bg-gradient-to-r from-slate-100 via-indigo-200 to-blue-400 bg-clip-text text-transparent">
              Engineered for Real-World Chaos.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
          >
            Upload messy CSV or Excel spreadsheets. Six specialized CrewAI agents automatically sanitize schemas, compute mathematical correlations, isolate outliers, plot interactive visuals, and compile executive PDF briefings.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-4 flex-wrap mb-14"
          >
            <Link to="/app/analyze">
              <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-xl shadow-indigo-950/60 border border-indigo-400/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Play size={15} className="fill-current" /> Run Analysis Workspace
              </button>
            </Link>
            <a href="#tool-preview">
              <button className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-300 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/70 hover:text-white transition-all shadow-sm">
                Explore Tool Preview <ChevronRight size={15} />
              </button>
            </a>
          </motion.div>

          {/* Value Pillars Badges */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left"
          >
            {[
              { icon: Shield, title: 'Client-Side Privacy', desc: 'Keys stored in your browser' },
              { icon: Zap, title: 'Deterministic Math', desc: 'Python-verified calculations' },
              { icon: Cpu, title: 'Local & Cloud AI', desc: 'Ollama or Free OpenRouter' },
              { icon: FileText, title: 'Executive PDF Output', desc: 'Stakeholder-ready reports' },
            ].map(pill => (
              <div key={pill.title} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                <pill.icon size={16} className="text-indigo-400 mb-1.5" />
                <div className="text-xs font-semibold text-slate-200">{pill.title}</div>
                <div className="text-[11px] text-slate-400">{pill.desc}</div>
              </div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ── THE INTERACTIVE TOOL PREVIEW MOCKUP (Focal Visual of the Product) ── */}
      <section id="tool-preview" className="relative py-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 block">
            Interactive Product Interface
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            See the Autonomous Workspace in Action
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl mx-auto">
            Click through live analysis modules below to preview how raw data transforms into decisions.
          </p>
        </div>

        {/* Browser Window Mockup Frame */}
        <div className="rounded-2xl border border-slate-800/90 bg-[#0D1322] shadow-2xl shadow-black/80 overflow-hidden">
          
          {/* Window Chrome Header */}
          <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/40" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/40" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/40" />
              <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline">
                https://insightflow.ai/app/workspace/global_enterprise_sales_2024.csv
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Session
              </span>
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                Model: <strong className="text-indigo-300">Mistral 7B (Free Cloud)</strong>
              </span>
            </div>
          </div>

          {/* Mockup Tab Switcher Bar */}
          <div className="px-4 pt-3 border-b border-slate-800/80 bg-slate-900/50 flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'visuals', label: 'Interactive Visuals', icon: BarChart3 },
              { id: 'pipeline', label: '6-Agent Execution Flow', icon: Brain },
              { id: 'quality', label: 'Data Quality & Outliers', icon: Activity },
              { id: 'report', label: 'Executive PDF Deliverable', icon: FileText },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveMockupTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-all border-t border-x ${
                  activeMockupTab === tab.id
                    ? 'bg-[#0D1322] border-slate-800 text-indigo-300 border-b-transparent shadow-sm'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <tab.icon size={13} className={activeMockupTab === tab.id ? 'text-indigo-400' : 'text-slate-500'} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mockup Workspace Body */}
          <div className="p-5 sm:p-7 min-h-[460px] bg-[#0D1322]">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: VISUAL ANALYTICS */}
              {activeMockupTab === 'visuals' && (
                <motion.div
                  key="visuals"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs text-slate-400 font-medium">Processed Dataset</div>
                      <div className="text-xl font-extrabold text-white mt-1">12,450 rows</div>
                      <div className="text-[11px] text-emerald-400 mt-0.5">100% Validated · 0 Errors</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs text-slate-400 font-medium">Total Volume Analyzed</div>
                      <div className="text-xl font-extrabold text-white mt-1">$1.33M</div>
                      <div className="text-[11px] text-indigo-400 mt-0.5">+18.4% YoY Compound</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs text-slate-400 font-medium">Strongest Correlation</div>
                      <div className="text-xl font-extrabold text-white mt-1">r = +0.84</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Sales Volume ↔ Net Margin</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs text-slate-400 font-medium">Anomalies Isolated</div>
                      <div className="text-xl font-extrabold text-white mt-1">23 outliers</div>
                      <div className="text-[11px] text-amber-400 mt-0.5">Quarantined for Review</div>
                    </div>
                  </div>

                  {/* Interactive Chart Panel */}
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <TrendingUp size={15} className="text-indigo-400" />
                          Time-Series Revenue & Margin Trajectory
                        </h4>
                        <p className="text-xs text-slate-400">Deterministic aggregation with automatic seasonality baseline</p>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
                        <button
                          onClick={() => setActiveMetricView('revenue')}
                          className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all ${
                            activeMetricView === 'revenue' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Revenue Trend
                        </button>
                        <button
                          onClick={() => setActiveMetricView('profit')}
                          className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all ${
                            activeMetricView === 'profit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Net Margin
                        </button>
                      </div>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={MOCK_REVENUE_TREND} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.45} />
                              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                          <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                          <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                          <Tooltip
                            contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                            labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                          />
                          <Area
                            type="monotone"
                            dataKey={activeMetricView}
                            stroke="#6366F1"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorMetric)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        Autodetected Column: <code>Invoice_Date (Monthly)</code>
                      </span>
                      <span className="text-emerald-400 font-medium">Peak Performance: Dec ($215k revenue)</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: PIPELINE FLOW */}
              {activeMockupTab === 'pipeline' && (
                <motion.div
                  key="pipeline"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-semibold text-slate-300">Sequential Execution Graph · 6 Specialized AI Agents</div>
                    <div className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Pipeline completed in 2.79s
                    </div>
                  </div>

                  {MOCK_AGENTS.map((agent) => (
                    <div
                      key={agent.step}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
                          <agent.icon size={15} className="text-indigo-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{agent.step}. {agent.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                              {agent.role}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{agent.desc}</div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/25">
                          ✓ {agent.duration}
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* TAB 3: DATA QUALITY & OUTLIERS */}
              {activeMockupTab === 'quality' && (
                <motion.div
                  key="quality"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                        <Zap size={14} className="text-indigo-400" /> Ingestion & Cleaning Metrics
                      </h4>
                      <div className="space-y-2 text-xs text-slate-300">
                        <div className="flex justify-between py-1.5 border-b border-slate-800">
                          <span className="text-slate-400">File Format & Encoding</span>
                          <span className="font-mono text-white">CSV · UTF-8 (Autodetected)</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800">
                          <span className="text-slate-400">Raw Dimensions</span>
                          <span className="font-mono text-white">12,464 rows × 18 cols</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800">
                          <span className="text-slate-400">Duplicate Rows Removed</span>
                          <span className="font-mono text-emerald-400">14 duplicate rows</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800">
                          <span className="text-slate-400">Null Values Imputed</span>
                          <span className="font-mono text-indigo-300">38 missing values (Median)</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-400">Data Integrity Score</span>
                          <span className="font-mono text-emerald-400 font-bold">99.8% Healthy</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-amber-400" /> IQR Outlier Detection
                      </h4>
                      <div className="space-y-2 text-xs text-slate-300">
                        <div className="p-2.5 rounded-lg bg-black/30 border border-slate-800">
                          <div className="flex justify-between font-semibold">
                            <span className="text-white">Transaction_Amount</span>
                            <span className="text-amber-400 font-mono">18 anomalies (0.14%)</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            Threshold: &gt; $18,450 (IQR factor: 1.5). Excluded from baseline variance.
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-black/30 border border-slate-800">
                          <div className="flex justify-between font-semibold">
                            <span className="text-white">Discount_Rate</span>
                            <span className="text-amber-400 font-mono">5 anomalies (0.04%)</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            Unusually deep discounting spikes identified in European distributor cohort.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category Breakdown Bar Chart */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-xs font-bold text-white mb-3">Revenue Contribution by Segment</div>
                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MOCK_CATEGORIES} layout="vertical" margin={{ left: 10, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                          <XAxis type="number" stroke="#64748B" fontSize={11} tickFormatter={v => `$${v}k`} />
                          <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={11} width={110} />
                          <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                          <Bar dataKey="value" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: EXECUTIVE REPORT PREVIEW */}
              {activeMockupTab === 'report' && (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                          Generated Executive Dossier
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1">
                          FY24 Commercial Performance & Cohort Risk Analysis
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Prepared autonomously by InsightFlow AI Pipeline · Oct 31, 2026
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Link to="/app/reports">
                          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-sm">
                            <Download size={12} /> Download PDF
                          </button>
                        </Link>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                      <div>
                        <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-1.5">
                          1. Executive Summary
                        </h5>
                        <p className="text-slate-400">
                          Analysis of 12,450 records indicates strong top-line momentum with total recognized revenue reaching $1.33M (+18.4% YoY). However, operating margin compression in Q3 was driven by anomalous discounting in the European enterprise segment (5 transactions above 45% discount threshold).
                        </p>
                      </div>

                      <div>
                        <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-1.5">
                          2. Mathematical Key Findings
                        </h5>
                        <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                          <li><strong className="text-slate-200">Volume Elasticity:</strong> High Pearson correlation (r = +0.84) confirms unit volume directly predicts margin stability.</li>
                          <li><strong className="text-slate-200">Segment Dominance:</strong> Enterprise Cloud represents 39% ($840k) of gross billings with lowest churn variance.</li>
                          <li><strong className="text-slate-200">Outlier Exposure:</strong> 23 high-value invoices accounted for $425k in concentration risk.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Mockup Bottom Controls */}
          <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-900/70 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
            <span className="flex items-center gap-2">
              <Database size={13} className="text-slate-400" />
              <span>Dataset: <code className="text-slate-200">global_enterprise_sales_2024.csv</code></span>
            </span>
            <div className="flex items-center gap-3">
              <Link to="/app/analyze" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                Open in Full Application <ExternalLink size={11} />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS: 4-STAGE PIPELINE ── */}
      <section id="how-it-works" className="py-20 px-6 border-t border-slate-800/80 bg-[#0B0F1C]/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 block">
              Architectural Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From Messy Raw Data to Business Clarity
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              How the multi-agent system systematically handles errors, calculations, and reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              {
                step: '01',
                title: 'Robust Ingestion',
                subtitle: 'Multi-Encoding & Sniffing',
                desc: 'Handles multi-encoding fallbacks (UTF-8, Latin-1, CP1252), sniffs unknown delimiters, and normalizes date/metric schemas without crashes.',
                badge: 'Zero Schema Errors',
              },
              {
                step: '02',
                title: 'Mathematical Rigor',
                subtitle: 'Deterministic Python Engine',
                desc: 'Calculates true Pearson correlation matrices, computes IQR outlier thresholds, and groups distributions in verified Python math before LLM invocation.',
                badge: '100% Deterministic',
              },
              {
                step: '03',
                title: 'Smart Visualization',
                subtitle: 'Automated Chart Generation',
                desc: 'Inspects column types and automatically renders high-resolution trend curves, category histograms, and outlier plots formatted for executive review.',
                badge: 'Publication Grade',
              },
              {
                step: '04',
                title: 'Executive Deliverables',
                subtitle: 'Evidence-Based Dossiers',
                desc: 'Synthesizes mathematical proofs into actionable business strategies and exports formatted ReportLab PDFs and Markdown reports ready to share.',
                badge: 'PDF + Markdown',
              },
            ].map(item => (
              <div
                key={item.step}
                className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl font-black font-mono text-indigo-400/80 mb-3">{item.step}</div>
                  <h3 className="text-base font-bold text-white mb-0.5">{item.title}</h3>
                  <div className="text-xs font-medium text-slate-400 mb-3">{item.subtitle}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-6 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/25">
                    {item.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE 6 SPECIALIZED AGENTS ARCHITECTURE ── */}
      <section id="agent-architecture" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 block">
              Multi-Agent Orchestration
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Six Purpose-Built CrewAI Agents
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
              Instead of relying on a single prompt, work is divided across a sequential pipeline of specialized agents.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Brain,
                name: 'Planner Agent',
                role: 'Workflow Strategist',
                desc: 'Breaks complex business prompts into an ordered, step-by-step computational sequence tailored to the dataset.',
              },
              {
                icon: Zap,
                name: 'Data Preparation Agent',
                role: 'Sanitizer & Normalizer',
                desc: 'Validates schemas, imputes missing values, cleans column formats, and removes noisy duplicates.',
              },
              {
                icon: Activity,
                name: 'Analysis Agent',
                role: 'Statistical Calculator',
                desc: 'Executes descriptive statistics, correlation matrices, quartile outlier boundaries, and trend regressions in Python.',
              },
              {
                icon: BarChart3,
                name: 'Visualization Agent',
                role: 'Plotting Specialist',
                desc: 'Selects optimal visual representations (histograms, scatter plots, trend lines) and exports standalone chart files.',
              },
              {
                icon: Sparkles,
                name: 'Insight Agent',
                role: 'Factual Reasoning',
                desc: 'Converts quantitative evidence into strategic business findings, prohibiting hallucinated assumptions.',
              },
              {
                icon: FileText,
                name: 'Report Agent',
                role: 'Executive Documenter',
                desc: 'Composes stakeholder-ready Markdown briefings and compiles structured PDF dossiers with visual embeds.',
              },
            ].map(agent => (
              <div
                key={agent.name}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                    <agent.icon size={16} className="text-indigo-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-0.5">{agent.name}</h4>
                  <div className="text-[11px] font-medium text-indigo-300/80 mb-2">{agent.role}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{agent.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENTERPRISE COMPARISON TABLE ── */}
      <section id="comparison" className="py-20 px-6 border-t border-slate-800/80 bg-[#0B0F1C]/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 block">
              Feature Comparison
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              InsightFlow AI vs Traditional Analytics
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Why autonomous multi-agent pipelines outperform manual spreadsheet wrangling and generic chat bots.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/80 shadow-xl">
            <div className="grid grid-cols-3 p-4 bg-slate-900 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
              <div>Capability</div>
              <div className="text-indigo-300 font-bold">InsightFlow AI</div>
              <div>Traditional BI / Spreadsheets</div>
            </div>

            {[
              {
                feature: 'Data Ingestion & Cleaning',
                us: 'Automatic multi-encoding fallback & auto-imputation in seconds',
                them: 'Manual VLOOKUPs, formula cleaning, and crashes on encoding errors',
              },
              {
                feature: 'Mathematical Accuracy',
                us: 'Deterministic Python math engine (zero hallucinations)',
                them: 'Prone to human formula errors or raw LLM hallucinated arithmetic',
              },
              {
                feature: 'Outlier Isolation',
                us: 'Mathematical IQR boundaries with automated quarantine',
                them: 'Manual scatter plot inspection or overlooked anomalies',
              },
              {
                feature: 'Deliverable Generation',
                us: 'Automatic publication-ready PDF & Markdown dossier',
                them: 'Hours spent copy-pasting charts into PowerPoint decks',
              },
              {
                feature: 'Privacy & Key Security',
                us: 'Bring-Your-Own-Key in LocalStorage + optional local Ollama',
                them: 'Expensive per-seat subscriptions or corporate data leaks',
              },
            ].map((row, idx) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 p-4 text-xs items-center gap-3 border-b last:border-0 ${
                  idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/80'
                }`}
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <div className="font-semibold text-slate-200">{row.feature}</div>
                <div className="text-indigo-300 font-medium flex items-start gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{row.us}</span>
                </div>
                <div className="text-slate-400">{row.them}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION SECTION ── */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-slate-900 to-[#0D1322] border border-slate-800 shadow-2xl relative overflow-hidden">
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Turn Raw Datasets into Strategic Intelligence
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto mb-8 leading-relaxed">
              Launch the workspace, drag and drop any CSV or Excel file, and get complete statistical proofs and executive insights in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/app/analyze">
                <button className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-xl shadow-indigo-950/60 border border-indigo-400/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Start Free Analysis <ArrowRight size={15} />
                </button>
              </Link>
              <Link to="/app/datasets">
                <button className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all">
                  Browse Sample Datasets
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800/80 py-10 px-6 bg-[#080B12]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <BarChart3 size={13} />
            </div>
            <span className="font-bold text-slate-200">InsightFlow AI</span>
            <span className="text-slate-500">·</span>
            <span>Autonomous Data Intelligence</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/app/analyze" className="hover:text-slate-200 transition-colors">Workspace</Link>
            <Link to="/app/datasets" className="hover:text-slate-200 transition-colors">Datasets</Link>
            <Link to="/app/settings" className="hover:text-slate-200 transition-colors">Settings & BYOK</Link>
            <a
              href="https://github.com/AnirudhY-025/Agentic-Data-Analyst"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-200 transition-colors"
            >
              GitHub
            </a>
          </div>

          <div className="text-slate-500 text-[11px]">
            FastAPI · CrewAI · ReportLab · React 18 · Vite
          </div>
        </div>
      </footer>

    </div>
  )
}
