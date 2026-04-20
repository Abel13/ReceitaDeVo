import { useParams, useNavigate } from 'react-router-dom'
import {
  Heart, Bookmark, Share2, Flag, Clock, Users, Thermometer,
  ChefHat, Package, ArrowLeft, CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '@/components/atoms/Button'
import { Badge, Avatar, Skeleton } from '@/components/atoms'
import { StatPill, AffiliateLink } from '@/components/molecules'
import { useRecipeDetailViewModel } from '@/viewmodels'
import { difficultyToBadge, difficultyLabel } from '@/components/atoms'

// ─────────────────────────────────────────────
//  Page: RecipeDetailPage
// ─────────────────────────────────────────────
const RecipeDetailPage = () => {
  const { id }      = useParams<{ id: string }>()
  const navigate    = useNavigate()
  const { recipe, isLoading, isFavorite, isLiked, toggleFavorite, toggleLike } =
    useRecipeDetailViewModel(id!)

  if (isLoading) return <RecipeDetailSkeleton />
  if (!recipe)   return (
    <div className="py-20 text-center">
      <p className="font-display text-xl text-cafe-muted">Receita não encontrada</p>
      <Button variant="ghost" className="mt-4" onClick={() => navigate('/')}>Voltar ao início</Button>
    </div>
  )

  const ingredientsWithAffiliate = recipe.ingredients.filter(i => i.affiliateUrl)

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Voltar */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-cafe-muted hover:text-cafe transition-colors focus-ring rounded-lg">
        <ArrowLeft size={16} /> Voltar
      </button>

      {/* Foto principal */}
      {recipe.photos.length > 0 && (
        <div className="rounded-brand overflow-hidden h-64 md:h-96">
          <img src={recipe.photos[0]} alt={recipe.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Cabeçalho */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-terracota mb-1">{recipe.category}</p>
            <h1 className="font-display text-2xl md:text-3xl text-cafe leading-tight">{recipe.title}</h1>
          </div>
          <div className="flex gap-2 shrink-0">
            <IconAction
              icon={<Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />}
              active={isLiked}
              label={`${recipe.likesCount} curtidas`}
              onClick={toggleLike}
            />
            <IconAction
              icon={<Bookmark size={18} fill={isFavorite ? 'currentColor' : 'none'} />}
              active={isFavorite}
              label="Favoritar"
              onClick={toggleFavorite}
            />
            <IconAction icon={<Share2 size={18} />} label="Compartilhar" />
          </div>
        </div>

        {/* Autor */}
        <div className="flex items-center gap-2 mt-3">
          <Avatar name={recipe.authorName} photoURL={recipe.authorPhotoURL} size="sm" />
          <div>
            <p className="text-xs text-cafe-muted">Receita de</p>
            <p className="text-sm font-bold text-cafe">{recipe.authorName}</p>
          </div>
        </div>

        {recipe.description && (
          <p className="mt-4 text-sm text-cafe-muted leading-relaxed">{recipe.description}</p>
        )}
      </div>

      {/* Stats em pills */}
      <div className="flex flex-wrap gap-2">
        <StatPill icon={<Clock size={14} />}       label="Preparo"    value={`${recipe.prepTimeMin} min`} />
        <StatPill icon={<Clock size={14} />}        label="Cozimento"  value={`${recipe.cookTimeMin} min`} />
        <StatPill icon={<Clock size={14} />}        label="Total"      value={`${recipe.totalTimeMin} min`} />
        <StatPill icon={<Users size={14} />}        label="Rende"      value={`${recipe.servings} ${recipe.servingUnit}`} />
        {recipe.ovenTempCelsius && (
          <StatPill icon={<Thermometer size={14} />} label="Temperatura" value={`${recipe.ovenTempCelsius}°C`} />
        )}
        <Badge variant={difficultyToBadge(recipe.difficulty)} className="self-center px-3 py-1.5">
          {difficultyLabel(recipe.difficulty)}
        </Badge>
      </div>

      {/* Utensílios */}
      {recipe.utensils.length > 0 && (
        <Section icon={<ChefHat size={16} />} title="Utensílios necessários">
          <div className="flex flex-wrap gap-2">
            {recipe.utensils.map(u => (
              <span key={u} className="rounded-lg bg-quentinho border border-cafe/10 px-3 py-1.5 text-xs text-cafe">{u}</span>
            ))}
          </div>
        </Section>
      )}

      {/* Ingredientes */}
      <Section icon={<Package size={16} />} title="Ingredientes">
        <ul className="divide-y divide-cafe/6">
          {recipe.ingredients
            .slice()
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map(ing => (
              <li key={ing.id} className="flex items-start justify-between gap-4 py-2.5">
                <div>
                  <span className="text-sm font-semibold text-cafe">{ing.name}</span>
                  {ing.state !== 'cru' && (
                    <span className="ml-2 text-xs text-cafe-subtle">({formatIngredientState(ing.state)})</span>
                  )}
                  {ing.substitutes.length > 0 && (
                    <p className="text-xs text-cafe-subtle mt-0.5 flex items-center gap-1">
                      <RefreshCw size={10} /> Substituição: {ing.substitutes.join(' ou ')}
                    </p>
                  )}
                </div>
                <span className="text-sm text-cafe-muted whitespace-nowrap shrink-0">
                  {ing.quantity} {ing.unit}
                </span>
              </li>
            ))}
        </ul>
      </Section>

      {/* Modo de preparo */}
      <Section icon={<CheckCircle size={16} />} title="Modo de preparo">
        <ol className="space-y-4">
          {recipe.steps
            .slice()
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((step, idx) => (
              <li key={step.id} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-terracota text-creme text-xs font-bold mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-cafe leading-relaxed">{step.description}</p>
                  {step.durationMin && (
                    <p className="flex items-center gap-1 text-xs text-cafe-subtle mt-1">
                      <Clock size={10} /> {step.durationMin} minutos
                    </p>
                  )}
                  {step.tip && (
                    <div className="mt-2 flex gap-2 rounded-lg bg-ouro/10 border border-ouro/20 px-3 py-2">
                      <AlertCircle size={13} className="text-ouro-dark shrink-0 mt-0.5" />
                      <p className="text-xs text-ouro-dark">{step.tip}</p>
                    </div>
                  )}
                </div>
              </li>
            ))}
        </ol>
      </Section>

      {/* Armazenamento */}
      {recipe.storage.method !== 'nao_armazenar' && (
        <Section icon={<Package size={16} />} title="Armazenamento">
          <div className="rounded-xl bg-floresta/8 border border-floresta/15 px-4 py-3">
            <p className="text-sm font-semibold text-floresta-dark capitalize">
              {formatStorage(recipe.storage.method)}
              {recipe.storage.durationDays && ` — até ${recipe.storage.durationDays} dias`}
            </p>
            {recipe.storage.tip && (
              <p className="text-xs text-floresta-dark/70 mt-1">{recipe.storage.tip}</p>
            )}
          </div>
        </Section>
      )}

      {/* Links de afiliados */}
      {ingredientsWithAffiliate.length > 0 && (
        <Section icon={<Package size={16} />} title="Comprar ingredientes">
          <div className="space-y-2">
            {ingredientsWithAffiliate.map(ing => (
              <AffiliateLink
                key={ing.id}
                ingredientName={ing.name}
                url={ing.affiliateUrl!}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Reportar */}
      <div className="flex justify-center pt-4 pb-8">
        <button className="flex items-center gap-1.5 text-xs text-cafe-subtle hover:text-red-500 transition-colors focus-ring rounded-lg p-2">
          <Flag size={12} /> Reportar receita
        </button>
      </div>
    </div>
  )
}

// ── Sub-components internos ──────────────────

const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-cafe">
      <span className="text-terracota">{icon}</span>
      {title}
    </h2>
    {children}
  </section>
)

const IconAction = ({ icon, active, label, onClick }: {
  icon: React.ReactNode; active?: boolean; label: string; onClick?: () => void
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    className={clsx(
      'flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-150 focus-ring',
      active
        ? 'border-terracota bg-terracota/10 text-terracota'
        : 'border-cafe/15 bg-white text-cafe-muted hover:border-terracota/40 hover:text-terracota'
    )}
  >
    {icon}
  </button>
)

// ── Formatters ───────────────────────────────
const formatIngredientState = (state: string) =>
  ({ cozido: 'cozido', gelado: 'gelado', temperatura_ambiente: 'temp. ambiente', derretido: 'derretido', cru: 'cru' }[state] ?? state)

const formatStorage = (method: string) =>
  ({ geladeira: 'Geladeira', freezer: 'Freezer', temperatura_ambiente: 'Temperatura ambiente', nao_armazenar: '' }[method] ?? method)

// ── Skeleton ─────────────────────────────────
const RecipeDetailSkeleton = () => (
  <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
    <Skeleton className="h-6 w-20" />
    <Skeleton className="h-72 w-full" />
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-4 w-40" />
    <div className="flex gap-3">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-24" />)}
    </div>
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-60 w-full" />
  </div>
)

export default RecipeDetailPage
