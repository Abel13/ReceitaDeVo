import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, firestore } from './config'
import type { User } from '@/models'

// ─────────────────────────────────────────────
//  Auth Service
//  Responsabilidade única: operações de autenticação
// ─────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider()

const USERS_COLLECTION = 'users'

/** Mapeia FirebaseUser → nosso modelo de domínio */
const toUserModel = (fb: FirebaseUser): Omit<User, 'bio' | 'followersCount' | 'followingCount' | 'recipesCount' | 'createdAt'> => ({
  uid:         fb.uid,
  displayName: fb.displayName ?? 'Anônimo',
  email:       fb.email ?? '',
  photoURL:    fb.photoURL,
})

/** Cria documento do usuário no Firestore se ainda não existe */
const ensureUserDocument = async (fb: FirebaseUser): Promise<void> => {
  const ref  = doc(firestore, USERS_COLLECTION, fb.uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return

  await setDoc(ref, {
    ...toUserModel(fb),
    bio:            '',
    followersCount: 0,
    followingCount: 0,
    recipesCount:   0,
    createdAt:      serverTimestamp(),
  })
}

export const authService = {
  signUpWithEmail: async (name: string, email: string, password: string): Promise<FirebaseUser> => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName: name })
    await ensureUserDocument(user)
    return user
  },

  signInWithEmail: async (email: string, password: string): Promise<FirebaseUser> => {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    return user
  },

  signInWithGoogle: (): Promise<void> =>
    signInWithRedirect(auth, googleProvider),

  // Chamado no boot da app para capturar o resultado do redirect do Google
  handleGoogleRedirect: async (): Promise<void> => {
    const result = await getRedirectResult(auth)
    if (result?.user) await ensureUserDocument(result.user)
  },

  signOut: (): Promise<void> => firebaseSignOut(auth),

  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) =>
    onAuthStateChanged(auth, callback),
}
