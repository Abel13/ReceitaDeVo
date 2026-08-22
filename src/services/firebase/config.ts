import { initializeApp, getApps }  from 'firebase/app'
import { getAuth }                  from 'firebase/auth'
import { getFirestore }             from 'firebase/firestore'
import { getStorage }               from 'firebase/storage'

const env = import.meta.env

function assertFirebaseEnv(): void {
  const apiKey = (env.VITE_FIREBASE_API_KEY as string | undefined)?.trim()
  if (!apiKey || !/^AIza[0-9A-Za-z_-]{35}$/.test(apiKey)) {
    throw new Error(
      'Firebase: VITE_FIREBASE_API_KEY é inválida. Usa a chave Web do Firebase (começa por AIza) em .env.local ou nas variáveis de produção do GitHub Actions.'
    )
  }
}

assertFirebaseEnv()

// Variáveis de ambiente — configure no arquivo .env.local (dev) ou no CI (build)
const firebaseConfig = {
  apiKey:            env.VITE_FIREBASE_API_KEY,
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.VITE_FIREBASE_APP_ID,
}

// Evita re-inicialização em hot-reload
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const auth      = getAuth(app)
export const firestore = getFirestore(app)
export const storage   = getStorage(app)
export default app
