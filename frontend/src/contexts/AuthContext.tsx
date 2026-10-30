import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInEmail: (email: string, password: string) => Promise<void>
  signUpEmail: (email: string, password: string, displayName: string) => Promise<void>
  signInGoogle: () => Promise<void>
  signInGuest: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const GUEST_STORAGE_KEY = 'insightflow_guest_user'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | any>(() => {
    try {
      const saved = localStorage.getItem(GUEST_STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      const saved = localStorage.getItem(GUEST_STORAGE_KEY)
      if (saved) {
        try { setUser(JSON.parse(saved)) } catch { setUser(null) }
      }
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        localStorage.removeItem(GUEST_STORAGE_KEY)
      } else {
        const saved = localStorage.getItem(GUEST_STORAGE_KEY)
        if (saved) {
          try { setUser(JSON.parse(saved)) } catch { setUser(null) }
        } else {
          setUser(null)
        }
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUpEmail = async (email: string, password: string, displayName: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName })
  }

  const signInGoogle = async () => {
    await signInWithPopup(auth, googleProvider)
  }

  const signInGuest = async () => {
    try {
      if (auth) {
        const cred = await signInAnonymously(auth)
        if (cred?.user) {
          setUser(cred.user)
          return
        }
      }
    } catch {
      /* Fallback to local guest session */
    }

    const guestUser: any = {
      uid: 'guest_' + Math.random().toString(36).substring(2, 10),
      email: 'guest@insightflow.ai',
      displayName: 'Guest Analyst',
      isAnonymous: true,
    }
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestUser))
    setUser(guestUser)
  }

  const logout = async () => {
    localStorage.removeItem(GUEST_STORAGE_KEY)
    if (auth) {
      try {
        await signOut(auth)
      } catch {
        /* ignore */
      }
    }
    setUser(null)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInEmail, signUpEmail, signInGoogle, signInGuest, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
