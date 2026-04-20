import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, where, orderBy, limit,
  startAfter, type QueryDocumentSnapshot,
  serverTimestamp, increment, arrayUnion, arrayRemove,
} from 'firebase/firestore'
import { firestore } from './config'
import type { Recipe, IngredientSearchQuery } from '@/models'

// ─────────────────────────────────────────────
//  Recipe Service
//  Responsabilidade única: operações de receitas no Firestore
// ─────────────────────────────────────────────

const RECIPES_COLLECTION = 'recipes'
const PAGE_SIZE = 12

const recipesRef = () => collection(firestore, RECIPES_COLLECTION)

const fromFirestore = (snap: QueryDocumentSnapshot): Recipe => ({
  id: snap.id,
  ...(snap.data() as Omit<Recipe, 'id'>),
  likedBy:   snap.data().likedBy   ?? [],
  createdAt: snap.data().createdAt?.toDate?.() ?? new Date(),
  updatedAt: snap.data().updatedAt?.toDate?.() ?? new Date(),
})

export const recipeService = {
  create: async (data: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const ref = await addDoc(recipesRef(), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return ref.id
  },

  update: async (id: string, data: Partial<Recipe>): Promise<void> => {
    await updateDoc(doc(firestore, RECIPES_COLLECTION, id), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(firestore, RECIPES_COLLECTION, id))
  },

  getById: async (id: string): Promise<Recipe | null> => {
    const snap = await getDoc(doc(firestore, RECIPES_COLLECTION, id))
    return snap.exists() ? fromFirestore(snap as QueryDocumentSnapshot) : null
  },

  /** Listagem paginada com filtros opcionais */
  list: async (options: {
    category?: string
    difficulty?: string
    cursor?: QueryDocumentSnapshot
  } = {}): Promise<{ recipes: Recipe[]; cursor: QueryDocumentSnapshot | null }> => {
    let q = query(recipesRef(), where('isPublished', '==', true), orderBy('createdAt', 'desc'), limit(PAGE_SIZE))

    if (options.category)   q = query(q, where('category', '==', options.category))
    if (options.difficulty) q = query(q, where('difficulty', '==', options.difficulty))
    if (options.cursor)     q = query(q, startAfter(options.cursor))

    const snap = await getDocs(q)
    const recipes = snap.docs.map(fromFirestore)
    const cursor  = snap.docs[snap.docs.length - 1] ?? null

    return { recipes, cursor }
  },

  /** Busca textual simples por título (Firestore não tem full-text; usar Algolia em produção) */
  searchByTitle: async (term: string): Promise<Recipe[]> => {
    const q = query(
      recipesRef(),
      where('isPublished', '==', true),
      where('title', '>=', term),
      where('title', '<=', term + '\uf8ff'),
      limit(20)
    )
    const snap = await getDocs(q)
    return snap.docs.map(fromFirestore)
  },

  /**
   * Busca por ingredientes.
   * - inclusive: receitas que contêm ALGUM dos ingredientes
   * - exclusive: receitas que contêm APENAS esses ingredientes (filtragem no cliente)
   */
  searchByIngredients: async ({ ingredients, mode }: IngredientSearchQuery): Promise<Recipe[]> => {
    // Firestore array-contains-any suporta até 10 valores
    const terms = ingredients.slice(0, 10).map(i => i.toLowerCase())

    const q = query(
      recipesRef(),
      where('isPublished', '==', true),
      where('tags', 'array-contains-any', terms),
      limit(50)
    )
    const snap = await getDocs(q)
    const recipes = snap.docs.map(fromFirestore)

    if (mode === 'inclusive') return recipes

    // Modo exclusivo: filtrar no cliente para garantir que só contém esses ingredientes
    return recipes.filter(recipe => {
      const recipeIngredients = recipe.ingredients.map(i => i.name.toLowerCase())
      return recipeIngredients.every(ing => terms.some(t => ing.includes(t)))
    })
  },

  /** Receitas de um usuário específico */
  listByAuthor: async (authorId: string): Promise<Recipe[]> => {
    const q = query(recipesRef(), where('authorId', '==', authorId), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(fromFirestore)
  },

  // ── Interações ───────────────────────────────

  incrementLike: async (recipeId: string, userId: string): Promise<void> => {
    const ref = doc(firestore, RECIPES_COLLECTION, recipeId)
    await updateDoc(ref, {
      likesCount: increment(1),
      likedBy:    arrayUnion(userId),
    })
  },

  decrementLike: async (recipeId: string, userId: string): Promise<void> => {
    const ref = doc(firestore, RECIPES_COLLECTION, recipeId)
    await updateDoc(ref, {
      likesCount: increment(-1),
      likedBy:    arrayRemove(userId),
    })
  },
}
