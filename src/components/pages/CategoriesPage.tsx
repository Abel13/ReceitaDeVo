import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState, useCallback } from 'react'
import {
  Cake, Sandwich, Soup, Candy, Utensils, Beef,
  Salad, GlassWater, ChefHat, ArrowLeft,
} from 'lucide-react'
import { clsx } from 'clsx'
import { RecipeGrid } from '@/components/organisms'
import { CategoryChip } from '@/components/molecules'
import { useRecipeListViewModel } from '@/viewmodels'
import type { DifficultyLevel } from '@/models'

// ─────────────────────────────────────────────
//  Definição das categorias
// ─────────────────────────────────────────────
// slug = usado na URL (lowercase); value = valor exato salvo no Firestore
const CATEGORIES = [
  { slug: 'bolos',    value: 'Bolos',    label: 'Bolos',    icon: Cake,       bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-700',   iconBg: 'bg-amber-100' },
  { slug: 'salgados', value: 'Salgados', label: 'Salgados', icon: Sandwich,   bg: 'bg-orange-50',  border: 'border-orange-200', text: 'text-orange-700',  iconBg: 'bg-orange-100' },
  { slug: 'sopas',    value: 'Sopas',    label: 'Sopas',    icon: Soup,       bg: 'bg-teal-50',    border: 'border-teal-200',   text: 'text-teal-700',    iconBg: 'bg-teal-100' },
  { slug: 'doces',    value: 'Doces',    label: 'Doces',    icon: Candy,      bg: 'bg-pink-50',    border: 'border-pink-200',   text: 'text-pink-700',    iconBg: 'bg-pink-100' },
  { slug: 'massas',   value: 'Massas',   label: 'Massas',   icon: Utensils,   bg: 'bg-yellow-50',  border: 'border-yellow-200', text: 'text-yellow-700',  iconBg: 'bg-yellow-100' },
  { slug: 'carnes',   value: 'Carnes',   label: 'Carnes',   icon: Beef,       bg: 'bg-red-50',     border: 'border-red-200',    text: 'text-red-700',     iconBg: 'bg-red-100' },
  { slug: 'saladas',  value: 'Saladas',  label: 'Saladas',  icon: Salad,      bg: 'bg-green-50',   border: 'border-green-200',  text: 'text-green-700',   iconBg: 'bg-green-100' },
  { slug: 'bebidas',  value: 'Bebidas',  label: 'Bebidas',  icon: GlassWater, bg: 'bg-sky-50',     border: 'border-sky-200',    text: 'text-sky-700',     iconBg: 'bg-sky-100' },
]

const DIFFICULTY_FILTERS: { id: DifficultyLevel | ''; label: string }[] = [
  { id: '',        label: 'Qualquer dificuldade' },
  { id: 'facil',   label: 'Fácil' },
  { id: 'medio',   label: 'Médio' },
  { id: 'dificil', label: 'Difícil' },
]

// ─────────────────────────────────────────────
//  Page: CategoriesPage — grid de categorias
// ─────────────────────────────────────────────
export const CategoriesPage = () => (
  <div className="space-y-8 animate-fade-in">
    <div>
      <h1 className="font-display text-3xl text-cafe">Categorias</h1>
      <p className="text-cafe-muted text-sm mt-1">Explore receitas por tipo de prato</p>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {CATEGORIES.map(cat => {
        const Icon = cat.icon
        return (
          <Link
            key={cat.slug}
            to={`/categorias/${cat.slug}`}
            className={clsx(
              'group flex flex-col items-center gap-3 rounded-brand border p-6',
              'transition-all duration-200 hover:shadow-lift hover:-translate-y-0.5 focus-ring',
              cat.bg, cat.border
            )}
          >
            <span className={clsx('flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110', cat.iconBg)}>
              <Icon size={28} className={cat.text} strokeWidth={1.5} />
            </span>
            <span className={clsx('font-display text-base font-semibold', cat.text)}>
              {cat.label}
            </span>
          </Link>
        )
      })}
    </div>
  </div>
)

// ─────────────────────────────────────────────
//  Page: CategoryDetailPage — receitas da categoria
// ─────────────────────────────────────────────
export const CategoryDetailPage = () => {
  const { slug }   = useParams<{ slug: string }>()
  const navigate   = useNavigate()
  const [difficulty, setDifficulty] = useState<DifficultyLevel | ''>('')

  const cat = CATEGORIES.find(c => c.slug === slug)
  const { recipes, isLoading, hasMore, loadMore } = useRecipeListViewModel(
    cat?.value,
    difficulty || undefined
  )

  const handleDifficulty = useCallback((id: DifficultyLevel | '') => {
    setDifficulty(id)
  }, [])

  if (!cat) return (
    <div className="py-20 text-center">
      <ChefHat size={48} className="mx-auto text-cafe-subtle/30 mb-4" />
      <p className="font-display text-xl text-cafe-muted">Categoria não encontrada</p>
      <button onClick={() => navigate('/categorias')} className="mt-4 text-sm text-terracota hover:underline focus-ring rounded">
        Ver todas as categorias
      </button>
    </div>
  )

  const Icon = cat.icon

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Voltar */}
      <button
        onClick={() => navigate('/categorias')}
        className="flex items-center gap-1.5 text-sm text-cafe-muted hover:text-cafe transition-colors focus-ring rounded-lg"
      >
        <ArrowLeft size={16} /> Categorias
      </button>

      {/* Header da categoria */}
      <div className={clsx('flex items-center gap-4 rounded-brand border p-6', cat.bg, cat.border)}>
        <span className={clsx('flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl', cat.iconBg)}>
          <Icon size={32} className={cat.text} strokeWidth={1.5} />
        </span>
        <div>
          <h1 className={clsx('font-display text-2xl md:text-3xl font-semibold', cat.text)}>
            {cat.label}
          </h1>
          {!isLoading && (
            <p className="text-sm text-cafe-muted mt-0.5">
              {recipes.length}{hasMore ? '+' : ''} receita{recipes.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Filtro de dificuldade */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {DIFFICULTY_FILTERS.map(d => (
          <CategoryChip
            key={d.id}
            label={d.label}
            isActive={difficulty === d.id}
            onClick={() => handleDifficulty(d.id as DifficultyLevel | '')}
          />
        ))}
      </div>

      {/* Grade de receitas */}
      <RecipeGrid
        recipes={recipes}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  )
}

export default CategoriesPage
