import { useState, useRef, useEffect } from 'react'
import { Bell, Search, LogOut, User, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function TopNav({ title = 'InsightFlow AI' }: { title?: string }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b"
      style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(7,13,26,0.8)', backdropFilter: 'blur(16px)' }}>
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-slate-300">{title}</h1>
        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> API Connected
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={13} className="absolute left-3 text-slate-500" />
          <input className="pl-8 pr-4 py-1.5 text-xs rounded-lg outline-none text-slate-300 placeholder:text-slate-600 w-48"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            placeholder="Search datasets, reports…" />
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-lg text-slate-500 hover:text-cyan-400 transition-colors relative"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropRef}>
          <button onClick={() => setDropOpen(v => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl transition-all duration-200 hover:bg-white/[0.05]">
            {/* Avatar */}
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover ring-1" style={{ ringColor: 'rgba(6,182,212,0.4)' }} />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)' }}>
                {initials}
              </div>
            )}
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-200 leading-tight max-w-[120px] truncate">
                {user?.displayName || 'User'}
              </div>
              <div className="text-[10px] text-slate-500 max-w-[120px] truncate">{user?.email}</div>
            </div>
            <ChevronDown size={12} className={`text-slate-500 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {dropOpen && (
              <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 rounded-xl border overflow-hidden z-50"
                style={{ background: '#0D1627', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>

                {/* User info */}
                <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="text-xs font-semibold text-slate-200 truncate">{user?.displayName || 'User'}</div>
                  <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                  <button onClick={() => { setDropOpen(false); navigate('/app/settings') }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors text-left">
                    <User size={13} className="text-slate-500" /> Profile & Settings
                  </button>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left"
                    style={{ color: '#F43F5E' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,63,94,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <LogOut size={13} /> Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
