import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDK_COkdyigF1Jngo0NZl66HA7DrXvZvQU",
  authDomain: "insightflow-ai-8bcf8.firebaseapp.com",
  projectId: "insightflow-ai-8bcf8",
  storageBucket: "insightflow-ai-8bcf8.firebasestorage.app",
  messagingSenderId: "249500909371",
  appId: "1:249500909371:web:c714bce836be39c4be011e",
  measurementId: "G-9TPPWZGBBX"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export default app
