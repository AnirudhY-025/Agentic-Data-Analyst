import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, BarChart3, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const passwordChecks = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
]

export default function Signup() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const { signUpEmail, signInGoogle } = useAuth()
  const navigate = useNavigate()

  const friendlyError = (code: string) => {
    const map: Record<string, string> = {
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password is too weak. Please choose a stronger one.',
    }
    return map[code] || 'Something went wrong. Please try again.'
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!passwordChecks.every(c => c.test(password))) {
      setError('Please meet all password requirements.')
      return
    }
    setLoading(true)
    try {
      await signUpEmail(email, password, displayName)
      navigate('/app')
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await signInGoogle()
      navigate('/app')
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setGoogleLoading(false)
    }
  }

  const strength = passwordChecks.filter(c => c.test(password)).length

  return (
    <div className="min-h-screen flex" style={{ background: '#070D1A' }}>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B1120 0%, #0E1A30 100%)', borderRight: '1px solid rgba(6,182,212,0.1)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-20 animate-float" style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }} />
          <div className="absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full blur-3xl opacity-15 animate-float" style={{ background: 'radial-gradient(circle, #06B6D4, transparent)', animationDelay: '2s' }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,1) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,1) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)' }}>
            <BarChart3 size={18} color="#fff" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">InsightFlow AI</div>
            <div className="text-xs" style={{ color: '#475569' }}>Your Autonomous Data Analyst</div>
          </div>
        </div>

        <div className="relative">
          <div className="text-4xl font-black text-white leading-tight mb-4">Start analyzing<br /><span className="gradient-text">smarter today</span></div>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#64748B' }}>
            Create your free account and get instant access to the full six-agent analytics pipeline.
            No credit card required.
          </p>
          <div className="flex flex-col gap-3">
            {['Upload CSV or Excel files instantly', 'AI-powered auto data cleaning', 'Professional Markdown & PDF reports', 'Per-user private workspace'].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                <span className="text-sm" style={{ color: '#94A3B8' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs" style={{ color: '#374151' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold transition-colors" style={{ color: '#06B6D4' }}>Sign in →</Link>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)' }}>
              <BarChart3 size={16} color="#fff" />
            </div>
            <span className="font-bold text-white text-sm">InsightFlow AI</span>
          </div>

          <h1 className="text-2xl font-black text-white mb-1">Create your account</h1>
          <p className="text-sm mb-8" style={{ color: '#64748B' }}>Free forever. No credit card needed.</p>

          {/* Google button */}
          <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleGoogle} disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm mb-5 transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2E8F0' }}>
            {googleLoading ? <Loader2 size={16} className="animate-spin text-cyan-400" /> : (
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
            )}
            {googleLoading ? 'Connecting…' : 'Continue with Google'}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-xs" style={{ color: '#374151' }}>or with email</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#475569' }}>Full name</label>
              <div className="relative flex items-center">
                <User size={15} className="absolute left-3.5 text-slate-600" />
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="John Smith" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(6,182,212,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#475569' }}>Email address</label>
              <div className="relative flex items-center">
                <Mail size={15} className="absolute left-3.5 text-slate-600" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(6,182,212,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#475569' }}>Password</label>
              <div className="relative flex items-center">
                <Lock size={15} className="absolute left-3.5 text-slate-600" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(6,182,212,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'} />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Strength meter */}
              {password.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                  <div className="flex gap-1.5 mb-2">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: i < strength ? (strength === 1 ? '#F43F5E' : strength === 2 ? '#F59E0B' : '#10B981') : 'rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>
                  <div className="flex flex-col gap-1">
                    {passwordChecks.map(c => (
                      <div key={c.label} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full flex items-center justify-center" style={{ background: c.test(password) ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)' }}>
                          {c.test(password) && <CheckCircle2 size={10} className="text-emerald-400" />}
                        </div>
                        <span className="text-xs" style={{ color: c.test(password) ? '#6EE7B7' : '#4B5563' }}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 p-3 rounded-xl text-xs"
                style={{ background: 'rgba(244,63,94,0.09)', border: '1px solid rgba(244,63,94,0.2)', color: '#FDA4AF' }}>
                <AlertCircle size={14} className="text-rose-400 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <motion.button type="submit" whileHover={!loading ? { scale: 1.02, y: -1 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200"
              style={{ background: loading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#0891B2 0%,#06B6D4 55%,#38BDF8 100%)', color: loading ? '#475569' : '#020D14', boxShadow: loading ? 'none' : '0 0 20px rgba(6,182,212,0.3)' }}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {loading ? 'Creating account…' : 'Create account'}
            </motion.button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: '#374151' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold transition-colors hover:text-cyan-400" style={{ color: '#06B6D4' }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
