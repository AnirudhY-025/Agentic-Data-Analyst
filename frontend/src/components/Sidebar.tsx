import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Database, BarChart3, FileText,
  Settings, ChevronLeft, ChevronRight, Sparkles, Activity
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../lib/utils'

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/datasets', icon: Database, label: 'Datasets' },
  { to: '/app/analyze', icon: Sparkles, label: 'Analyze' },
  { to: '/app/results', icon: Activity, label: 'Results' },
  { to: '/app/reports', icon: FileText, label: 'Reports' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 220 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="flex-shrink-0 h-screen flex flex-col border-r overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#0B1120 0%,#0E1525 100%)', borderColor: 'rgba(6,182,212,0.1)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 mb-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)' }}>
          <BarChart3 size={16} color="#fff" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}>
              <div className="font-bold text-sm leading-tight" style={{ color: '#E2E8F0' }}>InsightFlow</div>
              <div className="text-xs" style={{ color: '#475569' }}>AI Analytics</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}>
            {({ isActive }) => (
              <div className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group',
                isActive
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              )}
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(8,145,178,0.25), rgba(99,102,241,0.15))',
                  border: '1px solid rgba(6,182,212,0.25)',
                  boxShadow: '0 0 12px rgba(6,182,212,0.1)'
                } : { background: 'transparent', border: '1px solid transparent' }}>
                <Icon size={17} className={cn('flex-shrink-0', isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300')} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm truncate">
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-cyan-400 transition-colors"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </motion.aside>
  )
}
