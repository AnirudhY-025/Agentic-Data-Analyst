import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, BarChart3, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const { signInEmail, signInGoogle, signInGuest, resetPassword } = useAuth()
  const navigate = useNavigate()

  const friendlyError = (code: string) => {
    const map: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/unauthorized-domain': `This domain (${window.location.hostname}) is not authorized in Firebase Console. Add '${window.location.hostname}' to Firebase Console > Authentication > Settings > Authorized domains. Or click 'Instant Guest Access' below to enter immediately!`,
      'auth/popup-blocked': "Sign-in popup was blocked by browser. Please allow popups or click 'Instant Guest Access' below.",
      'auth/popup-closed-by-user': 'Google sign-in popup was closed before completing.',
      'auth/operation-not-allowed': 'Google Sign-In is not enabled in Firebase Console. Please enable it under Authentication > Sign-in method.',
    }
    return map[code] || 'Authentication error. You can click "Instant Guest Access" below to enter immediately.'
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInEmail(email, password)
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

  const handleGuest = async () => {
    setError('')
    setGuestLoading(true)
    try {
      await signInGuest()
      navigate('/app')
    } catch (err: any) {
      setError(friendlyError(err.code || ''))
    } finally {
      setGuestLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setResetSent(true)
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#070D1A' }}>
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B1120 0%, #0E1A30 100%)', borderRight: '1px solid rgba(6,182,212,0.1)' }}>

        {/* Animated orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-20 animate-float"
            style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }} />
          <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full blur-3xl opacity-15 animate-float"
            style={{ background: 'radial-gradient(circle, #6366F1, transparent)', animationDelay: '3s' }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,1) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,1) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)' }}>
            <BarChart3 size={18} color="#fff" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">InsightFlow AI</div>
            <div className="text-xs" style={{ color: '#475569' }}>Your Autonomous Data Analyst</div>
          </div>
        </div>

        {/* Center quote */}
        <div className="relative">
          <div className="text-4xl font-black text-white leading-tight mb-4">
            Turn raw data into<br />
            <span className="gradient-text">actionable insights</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
            Six specialized AI agents collaborate to clean your data, run deep analysis,
            generate visualizations, and deliver professional reports — automatically.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {['🧹 Auto cleaning', '📈 Smart charts', '🤖 6 AI agents', '📄 PDF reports'].map(p => (
              <span key={p} className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}>{p}</span>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative grid grid-cols-3 gap-4">
          {[['6', 'AI Agents'], ['100%', 'Local LLM'], ['∞', 'Datasets']].map(([v, l]) => (
            <div key={l} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xl font-black gradient-text">{v}</div>
              <div className="text-xs" style={{ color: '#475569' }}>{l}</div>
            </div>
          ))}
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

          <AnimatePresence mode="wait">
            {resetMode ? (
              /* ── Password Reset ── */
              <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-2xl font-black text-white mb-1">Reset password</h1>
                <p className="text-sm mb-8" style={{ color: '#64748B' }}>Enter your email to receive a reset link.</p>

                {resetSent ? (
                  <div className="p-4 rounded-xl text-sm text-emerald-300 text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    ✅ Reset email sent! Check your inbox.
                    <button onClick={() => { setResetMode(false); setResetSent(false) }} className="block mx-auto mt-3 text-xs text-slate-400 hover:text-white transition-colors">← Back to login</button>
                  </div>
                ) : (
                  <form onSubmit={handleReset} className="flex flex-col gap-4">
                    <InputField icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={setEmail} label="Email address" />
                    {error && <ErrorBox message={error} />}
                    <SubmitButton loading={loading} label="Send reset link" />
                    <button type="button" onClick={() => setResetMode(false)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors text-center">← Back to login</button>
                  </form>
                )}
              </motion.div>
            ) : (
              /* ── Login ── */
              <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h1 className="text-2xl font-black text-white mb-1">Welcome back</h1>
                <p className="text-sm mb-8" style={{ color: '#64748B' }}>Sign in to your InsightFlow AI workspace.</p>

                {/* Google button */}
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleGoogle} disabled={googleLoading || loading || guestLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm mb-2.5 transition-all duration-200"
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

                {/* Instant Guest Mode button */}
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleGuest} disabled={guestLoading || loading || googleLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs mb-5 transition-all duration-200"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#A5B4FC' }}>
                  {guestLoading ? <Loader2 size={14} className="animate-spin text-indigo-400" /> : '🚀 Instant Guest Access (No Sign-in Needed)'}
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  <span className="text-xs" style={{ color: '#374151' }}>or with email</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <InputField icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={setEmail} label="Email address" />
                  <InputField icon={Lock} type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={setPassword} label="Password"
                    suffix={
                      <button type="button" onClick={() => setShowPassword(v => !v)} className="text-slate-500 hover:text-slate-300 transition-colors">
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    } />

                  {error && <ErrorBox message={error} />}

                  {/* Forgot password */}
                  <div className="text-right -mt-2">
                    <button type="button" onClick={() => setResetMode(true)} className="text-xs transition-colors hover:text-cyan-400" style={{ color: '#475569' }}>
                      Forgot password?
                    </button>
                  </div>

                  <SubmitButton loading={loading} label="Sign in" icon={<ArrowRight size={15} />} />
                </form>

                <p className="text-center text-xs mt-6" style={{ color: '#374151' }}>
                  Don't have an account?{' '}
                  <Link to="/signup" className="font-semibold transition-colors hover:text-cyan-400" style={{ color: '#06B6D4' }}>Create one</Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

/* ── Shared sub-components ── */

function InputField({ icon: Icon, type, placeholder, value, onChange, label, suffix }: {
  icon: any; type: string; placeholder: string; value: string
  onChange: (v: string) => void; label: string; suffix?: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#475569' }}>{label}</label>
      <div className="relative flex items-center">
        <Icon size={15} className="absolute left-3.5 text-slate-600 pointer-events-none" />
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} required
          className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
          onFocus={e => e.target.style.borderColor = 'rgba(6,182,212,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
        />
        {suffix && <div className="absolute right-3.5">{suffix}</div>}
      </div>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2.5 p-3 rounded-xl text-xs"
      style={{ background: 'rgba(244,63,94,0.09)', border: '1px solid rgba(244,63,94,0.2)', color: '#FDA4AF' }}>
      <AlertCircle size={14} className="flex-shrink-0 text-rose-400" />
      {message}
    </motion.div>
  )
}

function SubmitButton({ loading, label, icon }: { loading: boolean; label: string; icon?: React.ReactNode }) {
  return (
    <motion.button type="submit" whileHover={!loading ? { scale: 1.02, y: -1 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200"
      style={{ background: loading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#0891B2 0%,#06B6D4 55%,#38BDF8 100%)', color: loading ? '#475569' : '#020D14', boxShadow: loading ? 'none' : '0 0 20px rgba(6,182,212,0.3)' }}>
      {loading ? <Loader2 size={15} className="animate-spin" /> : icon}
      {loading ? 'Please wait…' : label}
    </motion.button>
  )
}
