import { initializeApp, getApps }  from 'firebase/app'
import { getAuth }                  from 'firebase/auth'
import { getFirestore }             from 'firebase/firestore'
import { getStorage }               from 'firebase/storage'

const env = import.meta.env

function assertFirebaseEnv(): void {
  const apiKey = (env.VITE_FIREBASE_API_KEY as string | undefined)?.trim()
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error(
      'Firebase: VITE_FIREBASE_API_KEY em falta ou placeholder. Em desenvolvimento, copia .env.example para .env.local e preenche com os valores do Firebase Console. Em produção, as variáveis VITE_FIREBASE_* têm de existir no momento do build (ex.: secrets/variáveis do GitHub Actions).'
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
