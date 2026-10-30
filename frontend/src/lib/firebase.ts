import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDK_COkdyigF1Jngo0NZl66HA7DrXvZvQU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "insightflow-ai-8bcf8.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "insightflow-ai-8bcf8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "insightflow-ai-8bcf8.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "249500909371",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:249500909371:web:c714bce836be39c4be011e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9TPPWZGBBX"
}

let app: any = null
let auth: any = null
let googleProvider: any = null

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()
  googleProvider.setCustomParameters({ prompt: 'select_account' })
} catch (e) {
  console.error("Firebase initialization failed:", e)
}

export { auth, googleProvider }
export default app
