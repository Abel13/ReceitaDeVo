import { useParams, useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/atoms'
import { RecipeFormContent, type RecipeFormData } from './CreateRecipePage'
import { useEditRecipeViewModel } from '@/viewmodels'

const EditRecipePage = () => {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const { recipe, isLoading, isSubmitting, uploadProgress, isDeleting, updateRecipe, deleteRecipe } =
    useEditRecipeViewModel(id!)

  const handleSubmit = async (data: RecipeFormData, photos: File[]) => {
    const ok = await updateRecipe(data, photos)
    if (ok) navigate(`/receita/${id}`)
  }

  const handleDelete = async () => {
    const ok = await deleteRecipe()
    if (ok) navigate('/')
  }

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )

  if (!recipe) return (
    <div className="py-20 text-center">
      <p className="font-display text-xl text-cafe-muted">Receita não encontrada</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-2xl text-cafe">Editar receita</h1>
      <RecipeFormContent
        key={recipe.id}
        defaultValues={recipe}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        uploadProgress={uploadProgress}
        submitLabel="Salvar alterações"
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}

export default EditRecipePage
