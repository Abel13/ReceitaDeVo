import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User as FirebaseUser } from 'firebase/auth'
import type { Recipe } from '@/models'

// ─────────────────────────────────────────────
//  Auth Store  (sem persist — Firebase gerencia sessão)
// ─────────────────────────────────────────────
interface AuthState {
  user:        FirebaseUser | null
  isLoading:   boolean
  setUser:     (user: FirebaseUser | null) => void
  setLoading:  (v: boolean) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user:       null,
  isLoading:  true,
  setUser:    (user)      => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}))

// ─────────────────────────────────────────────
//  Saved Recipes Store  (persist em localStorage)
//  Armazena favoritos e receitas curtidas offline
// ─────────────────────────────────────────────
interface SavedRecipesState {
  favorites:     Recipe[]
  liked:         string[]           // IDs das receitas curtidas
  addFavorite:   (recipe: Recipe) => void
  removeFavorite:(id: string) => void
  isFavorite:    (id: string) => boolean
  toggleLike:    (id: string) => void
  isLiked:       (id: string) => boolean
  clearAll:      () => void
}

export const useSavedRecipesStore = create<SavedRecipesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      liked:     [],

      addFavorite: (recipe) =>
        set((s) => ({
          favorites: s.favorites.some(f => f.id === recipe.id)
            ? s.favorites
            : [recipe, ...s.favorites],
        })),

      removeFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.filter(f => f.id !== id) })),

      isFavorite: (id) => get().favorites.some(f => f.id === id),

      toggleLike: (id) =>
        set((s) => ({
          liked: s.liked.includes(id)
            ? s.liked.filter(l => l !== id)
            : [...s.liked, id],
        })),

      isLiked: (id) => get().liked.includes(id),

      clearAll: () => set({ favorites: [], liked: [] }),
    }),
    {
      name:    'receita-vo-saved',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ─────────────────────────────────────────────
//  UI Store  (toasts, modal state, etc.)
// ─────────────────────────────────────────────
export type ToastVariant = 'success' | 'error' | 'info'

interface Toast {
  id:      string
  message: string
  variant: ToastVariant
}

interface UIState {
  toasts:     Toast[]
  addToast:   (message: string, variant?: ToastVariant) => void
  removeToast:(id: string) => void
}

export const useUIStore = create<UIState>()((set) => ({
  toasts: [],

  addToast: (message, variant = 'success') => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3500)
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))
