import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  const queryClient                        = useQueryClient()
  const { user }                           = useAuthStore()
  const { addSaved, removeSaved, isSaved } = useSavedRecipesStore()
  const { addToast }                       = useUIStore()

  const { data: recipe, isLoading } = useQuery({
    queryKey: ['recipe', id],
    queryFn:  () => recipeService.getById(id),
    enabled:  !!id,
  })

  const isLiked = user ? (recipe?.likedBy ?? []).includes(user.uid) : false

  const handleToggleSaved = useCallback(() => {
    if (!recipe) return
    if (isSaved(recipe.id)) {
      removeSaved(recipe.id)
      addToast('Removido das salvas', 'info')
    } else {
      addSaved(recipe)
      addToast('Receita salva!')
    }
  }, [recipe, isSaved, addSaved, removeSaved, addToast])

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!recipe || !user) throw new Error('unauthenticated')
      if (isLiked) {
        await recipeService.decrementLike(recipe.id, user.uid)
      } else {
        await recipeService.incrementLike(recipe.id, user.uid)
      }
    },
    onMutate: async () => {
      // Atualização optimista
      await queryClient.cancelQueries({ queryKey: ['recipe', id] })
      const previous = queryClient.getQueryData<Recipe>(['recipe', id])
      if (previous && user) {
        queryClient.setQueryData<Recipe>(['recipe', id], {
          ...previous,
          likesCount: isLiked ? previous.likesCount - 1 : previous.likesCount + 1,
          likedBy:    isLiked
            ? previous.likedBy.filter(uid => uid !== user.uid)
            : [...previous.likedBy, user.uid],
        })
      }
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['recipe', id], ctx.previous)
    },
    onSuccess: () => {
      // Invalida lista de curtidas no perfil
      queryClient.invalidateQueries({ queryKey: ['likedRecipes'] })
    },
  })

  const handleToggleLike = useCallback(() => {
    if (!user) { addToast('Entre para curtir receitas', 'info'); return }
    likeMutation.mutate()
  }, [user, addToast, likeMutation])

  return {
    recipe:      recipe ?? null,
    isLoading,
    isSaved:     recipe ? isSaved(recipe.id) : false,
    isLiked,
    toggleSaved: handleToggleSaved,
    toggleLike:  handleToggleLike,
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
    data:   Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'photos' | 'thumbUrl' | 'authorId' | 'authorName' | 'authorPhotoURL' | 'likesCount' | 'likedBy' | 'favoritesCount' | 'commentsCount'>,
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
      likedBy:       [],
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

// ─────────────────────────────────────────────
//  useEditRecipeViewModel
//  Responsabilidade: edição e exclusão de receita existente
// ─────────────────────────────────────────────
export const useEditRecipeViewModel = (id: string) => {
  const queryClient              = useQueryClient()
  const { user }                 = useAuthStore()
  const { addToast }             = useUIStore()
  const [isSubmitting, setSubmitting] = useState(false)
  const [uploadProgress, setProgress] = useState(0)
  const [isDeleting, setDeleting]     = useState(false)

  const { data: recipe, isLoading } = useQuery({
    queryKey: ['recipe', id],
    queryFn:  () => recipeService.getById(id),
    enabled:  !!id,
  })

  const updateRecipe = useCallback(async (
    data: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'authorId' | 'authorName' | 'authorPhotoURL' | 'likesCount' | 'likedBy' | 'favoritesCount' | 'commentsCount'>,
    newPhotos: File[]
  ): Promise<boolean> => {
    if (!user) return false
    setSubmitting(true)
    setProgress(0)

    let photos   = recipe?.photos  ?? []
    let thumbUrl = recipe?.thumbUrl ?? null

    if (newPhotos.length > 0) {
      const uploadedUrls: string[] = []
      const total = newPhotos.length
      for (let i = 0; i < newPhotos.length; i++) {
        const { fullUrl, thumbUrl: t } = await imageService.uploadRecipePhoto(newPhotos[i], id, i)
        uploadedUrls.push(fullUrl)
        if (i === 0) thumbUrl = t
        setProgress(Math.round(((i + 1) / total) * 100))
      }
      photos   = uploadedUrls
      thumbUrl = thumbUrl
    }

    await recipeService.update(id, { ...data, photos, thumbUrl })
    queryClient.invalidateQueries({ queryKey: ['recipe', id] })
    setSubmitting(false)
    addToast('Receita atualizada!')
    return true
  }, [id, user, recipe, addToast, queryClient])

  const deleteRecipe = useCallback(async (): Promise<boolean> => {
    if (!user) return false
    setDeleting(true)
    await recipeService.delete(id)
    addToast('Receita excluída', 'info')
    return true
  }, [id, user, addToast])

  return { recipe, isLoading, isSubmitting, uploadProgress, isDeleting, updateRecipe, deleteRecipe }
}
