import { useState, useEffect, useCallback, useRef } from 'react'
import type { QueryDocumentSnapshot } from 'firebase/firestore'
import { recipeService }        from '@/services/firebase/recipeService'
import { imageService }         from '@/services/image/imageService'
import { authService }          from '@/services/firebase/authService'
import { useAuthStore, useSavedRecipesStore, useUIStore } from '@/store'
import type { Recipe, IngredientSearchQuery } from '@/models'

// ─────────────────────────────────────────────
//  useAuthViewModel
//  Responsabilidade: lógica de autenticação + estado do usuário
// ─────────────────────────────────────────────
export const useAuthViewModel = () => {
  const { user, isLoading, setUser, setLoading } = useAuthStore()
  const { clearAll }  = useSavedRecipesStore()
  const { addToast }  = useUIStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    authService.handleGoogleRedirect()
    const unsub = authService.onAuthStateChanged((fb) => {
      setUser(fb)
      setLoading(false)
    })
    return unsub
  }, [setUser, setLoading])

  const signUpWithEmail = useCallback(async (name: string, email: string, password: string) => {
    try {
      setError(null)
      await authService.signUpWithEmail(name, email, password)
      addToast('Conta criada com sucesso! Bem-vindo(a)!')
    } catch {
      setError('Não foi possível criar a conta. Verifique os dados.')
    }
  }, [addToast])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setError(null)
      await authService.signInWithEmail(email, password)
      addToast('Bem-vindo(a) de volta!')
    } catch {
      setError('E-mail ou senha incorretos.')
    }
  }, [addToast])

  const signInWithGoogle = useCallback(async () => {
    try {
      setError(null)
      await authService.signInWithGoogle()
    } catch {
      setError('Não foi possível entrar com Google.')
    }
  }, [])

  const signOut = useCallback(async () => {
    await authService.signOut()
    clearAll()
    addToast('Até logo!', 'info')
  }, [clearAll, addToast])

  return { user, isLoading, error, signUpWithEmail, signInWithEmail, signInWithGoogle, signOut }
}

// ─────────────────────────────────────────────
//  useRecipeListViewModel
//  Responsabilidade: listagem paginada + filtros de receitas
// ─────────────────────────────────────────────
export const useRecipeListViewModel = (category?: string, difficulty?: string) => {
  const [recipes, setRecipes]   = useState<Recipe[]>([])
  const [isLoading, setLoading] = useState(true)
  const [hasMore, setHasMore]   = useState(true)
  const cursorRef = useRef<QueryDocumentSnapshot | null>(null)

  const fetchPage = useCallback(async (reset = false) => {
    setLoading(true)
    try {
      const { recipes: fetched, cursor } = await recipeService.list({
        category,
        difficulty,
        cursor: reset ? undefined : cursorRef.current ?? undefined,
      })
      cursorRef.current = cursor
      setHasMore(fetched.length === 12)
      setRecipes(prev => reset ? fetched : [...prev, ...fetched])
    } catch (err) {
      console.error('[recipeList] Firestore error:', err)
    } finally {
      setLoading(false)
    }
  }, [category, difficulty])

  useEffect(() => {
    cursorRef.current = null
    fetchPage(true)
  }, [fetchPage])

  return { recipes, isLoading, hasMore, loadMore: () => fetchPage(false) }
}

// ─────────────────────────────────────────────
//  useRecipeDetailViewModel
//  Responsabilidade: dados de uma receita + ações (like, favorito)
// ─────────────────────────────────────────────
export const useRecipeDetailViewModel = (id: string) => {
  const [recipe, setRecipe]     = useState<Recipe | null>(null)
  const [isLoading, setLoading] = useState(true)
  const { user }                = useAuthStore()
  const { addFavorite, removeFavorite, isFavorite, toggleLike, isLiked } = useSavedRecipesStore()
  const { addToast }            = useUIStore()

  useEffect(() => {
    setLoading(true)
    recipeService.getById(id).then(r => { setRecipe(r); setLoading(false) })
  }, [id])

  const handleToggleFavorite = useCallback(() => {
    if (!recipe) return
    if (isFavorite(recipe.id)) {
      removeFavorite(recipe.id)
      addToast('Removido dos favoritos', 'info')
    } else {
      addFavorite(recipe)
      addToast('Salvo nos favoritos!')
    }
  }, [recipe, isFavorite, addFavorite, removeFavorite, addToast])

  const handleToggleLike = useCallback(async () => {
    if (!recipe || !user) { addToast('Entre para curtir receitas', 'info'); return }
    const liked = isLiked(recipe.id)
    toggleLike(recipe.id)
    if (liked) {
      await recipeService.decrementLike(recipe.id, user.uid)
    } else {
      await recipeService.incrementLike(recipe.id, user.uid)
    }
  }, [recipe, user, isLiked, toggleLike, addToast])

  return {
    recipe, isLoading,
    isFavorite: recipe ? isFavorite(recipe.id) : false,
    isLiked:    recipe ? isLiked(recipe.id) : false,
    toggleFavorite: handleToggleFavorite,
    toggleLike:     handleToggleLike,
  }
}

// ─────────────────────────────────────────────
//  useIngredientSearchViewModel
//  Responsabilidade: busca de receitas por ingredientes
// ─────────────────────────────────────────────
export const useIngredientSearchViewModel = () => {
  const [query, setQuery]         = useState<IngredientSearchQuery>({ ingredients: [], mode: 'inclusive' })
  const [results, setResults]     = useState<Recipe[]>([])
  const [isLoading, setLoading]   = useState(false)
  const [hasSearched, setSearched]= useState(false)

  const addIngredient = useCallback((name: string) => {
    const clean = name.trim().toLowerCase()
    if (!clean) return
    setQuery(q => ({
      ...q,
      ingredients: q.ingredients.includes(clean) ? q.ingredients : [...q.ingredients, clean],
    }))
  }, [])

  const removeIngredient = useCallback((name: string) =>
    setQuery(q => ({ ...q, ingredients: q.ingredients.filter(i => i !== name) }))
  , [])

  const setMode = useCallback((mode: IngredientSearchQuery['mode']) =>
    setQuery(q => ({ ...q, mode }))
  , [])

  const search = useCallback(async () => {
    if (!query.ingredients.length) return
    setLoading(true)
    setSearched(true)
    const found = await recipeService.searchByIngredients(query)
    setResults(found)
    setLoading(false)
  }, [query])

  return { query, results, isLoading, hasSearched, addIngredient, removeIngredient, setMode, search }
}

// ─────────────────────────────────────────────
//  useCreateRecipeViewModel
//  Responsabilidade: formulário de criação/edição de receita
// ─────────────────────────────────────────────
export const useCreateRecipeViewModel = () => {
  const { user }     = useAuthStore()
  const { addToast } = useUIStore()
  const [isSubmitting, setSubmitting] = useState(false)
  const [uploadProgress, setProgress] = useState(0)

  const submitRecipe = useCallback(async (
    data:   Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'photos' | 'thumbUrl' | 'authorId' | 'authorName' | 'authorPhotoURL' | 'likesCount' | 'favoritesCount' | 'commentsCount'>,
    photos: File[]
  ): Promise<string | null> => {
    if (!user) { addToast('Faça login para publicar', 'error'); return null }

    setSubmitting(true)
    setProgress(0)

    // Cria a receita primeiro para obter o ID
    const recipeId = await recipeService.create({
      ...data,
      authorId:      user.uid,
      authorName:    user.displayName ?? 'Anônimo',
      authorPhotoURL: user.photoURL,
      photos:        [],
      thumbUrl:      null,
      likesCount:    0,
      favoritesCount: 0,
      commentsCount: 0,
      isPublished:   false,
    })

    // Upload paralelo de fotos com progresso
    const total = photos.length || 1
    const uploadedUrls: string[] = []
    let thumbUrl: string | null = null

    for (let i = 0; i < photos.length; i++) {
      const { fullUrl, thumbUrl: t } = await imageService.uploadRecipePhoto(photos[i], recipeId, i)
      uploadedUrls.push(fullUrl)
      if (i === 0) thumbUrl = t
      setProgress(Math.round(((i + 1) / total) * 100))
    }

    // Atualiza receita com URLs das fotos e publica
    await recipeService.update(recipeId, {
      photos:      uploadedUrls,
      thumbUrl,
      isPublished: true,
    })

    setSubmitting(false)
    addToast('Receita publicada com sucesso!')
    return recipeId
  }, [user, addToast])

  return { isSubmitting, uploadProgress, submitRecipe }
}
