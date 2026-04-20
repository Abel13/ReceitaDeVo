import { Heart, Bookmark, MessageCircle, Share2, Clock, Users, ChefHat } from 'lucide-react'
import { clsx } from 'clsx'
import { Badge, Avatar, Skeleton, difficultyToBadge, difficultyLabel } from '@/components/atoms'
import { useSavedRecipesStore } from '@/store'
import type { Recipe } from '@/models'

// ─────────────────────────────────────────────
//  Molecule: RecipeCard
// ─────────────────────────────────────────────
interface RecipeCardProps {
  recipe:    Recipe
  onClick?:  () => void
  className?: string
}

export const RecipeCard = ({ recipe, onClick, className }: RecipeCardProps) => {
  const { isFavorite, addFavorite, removeFavorite, isLiked, toggleLike } = useSavedRecipesStore()
  const favorited = isFavorite(recipe.id)
  const liked     = isLiked(recipe.id)

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    favorited ? removeFavorite(recipe.id) : addFavorite(recipe)
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleLike(recipe.id)
  }

  return (
    <article
      onClick={onClick}
      className={clsx(
        'group bg-white rounded-brand border border-cafe/10 overflow-hidden cursor-pointer',
        'hover:shadow-lift transition-shadow duration-200 animate-fade-in',
        className
      )}
    >
      {/* Foto */}
      <div className="relative h-44 bg-quentinho overflow-hidden">
        {recipe.thumbUrl
          ? <img src={recipe.thumbUrl} alt={recipe.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="h-full w-full flex items-center justify-center"><ChefHat size={48} className="text-cafe-subtle/30" /></div>
        }
        <button
          onClick={handleFavorite}
          aria-label={favorited ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
          className={clsx(
            'absolute top-3 right-3 rounded-full p-1.5 transition-all duration-150',
            favorited
              ? 'bg-terracota text-creme'
              : 'bg-white/80 text-cafe-subtle hover:bg-white hover:text-terracota'
          )}
        >
          <Bookmark size={14} fill={favorited ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Corpo */}
      <div className="p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-terracota mb-1">{recipe.category}</p>
        <h3 className="font-display text-base font-semibold text-cafe leading-tight mb-1 line-clamp-2">
          {recipe.title}
        </h3>
        <div className="flex items-center gap-1.5 mb-3">
          <Avatar name={recipe.authorName} photoURL={recipe.authorPhotoURL} size="sm" />
          <span className="text-xs text-cafe-subtle">{recipe.authorName}</span>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant={difficultyToBadge(recipe.difficulty)}>
            {difficultyLabel(recipe.difficulty)}
          </Badge>
          <Badge variant="time">
            <Clock size={10} /> {recipe.totalTimeMin} min
          </Badge>
          <Badge variant="neutral">
            <Users size={10} /> {recipe.servings} {recipe.servingUnit}
          </Badge>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-1 border-t border-cafe/8 pt-3">
          <ActionButton
            icon={<Heart size={13} fill={liked ? 'currentColor' : 'none'} />}
            label={String(recipe.likesCount + (liked ? 1 : 0))}
            active={liked}
            onClick={handleLike}
          />
          <ActionButton icon={<MessageCircle size={13} />} label={String(recipe.commentsCount)} />
          <ActionButton icon={<Share2 size={13} />} label="Compartilhar" />
        </div>
      </div>
    </article>
  )
}

const ActionButton = ({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick?: (e: React.MouseEvent) => void
}) => (
  <button
    onClick={onClick}
    className={clsx(
      'flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs transition-colors duration-150 focus-ring',
      active ? 'text-terracota' : 'text-cafe-subtle hover:bg-quentinho hover:text-cafe'
    )}
  >
    {icon} {label}
  </button>
)

// ─────────────────────────────────────────────
//  Molecule: SearchBar
// ─────────────────────────────────────────────
import { Search, X } from 'lucide-react'
import { useState, useRef } from 'react'

interface SearchBarProps {
  onSearch:   (term: string) => void
  placeholder?: string
  className?:   string
}

export const SearchBar = ({ onSearch, placeholder = 'Buscar receitas...', className }: SearchBarProps) => {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    onSearch(e.target.value)
  }

  const handleClear = () => {
    setValue('')
    onSearch('')
    inputRef.current?.focus()
  }

  return (
    <div className={clsx('relative flex items-center', className)}>
      <Search size={16} className="absolute left-4 text-cafe-subtle pointer-events-none" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-full border border-cafe/15 bg-white py-3 pl-11 pr-10 text-sm text-cafe placeholder:text-cafe-subtle focus:border-terracota focus:outline-none focus-ring transition-colors"
      />
      {value && (
        <button onClick={handleClear} className="absolute right-4 text-cafe-subtle hover:text-cafe focus-ring rounded-full">
          <X size={14} />
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
//  Molecule: CategoryChip
// ─────────────────────────────────────────────
interface CategoryChipProps {
  label:     string
  isActive:  boolean
  onClick:   () => void
}

export const CategoryChip = ({ label, isActive, onClick }: CategoryChipProps) => (
  <button
    onClick={onClick}
    className={clsx(
      'rounded-full px-4 py-2 text-xs font-bold transition-all duration-150 focus-ring whitespace-nowrap',
      isActive
        ? 'bg-terracota text-creme shadow-sm'
        : 'bg-white border border-cafe/15 text-cafe-muted hover:border-terracota/50 hover:text-terracota'
    )}
  >
    {label}
  </button>
)

// ─────────────────────────────────────────────
//  Molecule: Toast
// ─────────────────────────────────────────────
import { CheckCircle, AlertCircle, Info, X as CloseIcon } from 'lucide-react'
import type { ToastVariant } from '@/store'

const toastConfig: Record<ToastVariant, { icon: React.ReactNode; classes: string }> = {
  success: { icon: <CheckCircle size={16} />, classes: 'bg-floresta text-white' },
  error:   { icon: <AlertCircle size={16} />, classes: 'bg-red-600 text-white' },
  info:    { icon: <Info size={16} />,        classes: 'bg-cafe text-creme' },
}

interface ToastProps {
  id:       string
  message:  string
  variant:  ToastVariant
  onClose:  (id: string) => void
}

export const Toast = ({ id, message, variant, onClose }: ToastProps) => {
  const { icon, classes } = toastConfig[variant]
  return (
    <div className={clsx(
      'flex items-center gap-3 rounded-xl px-4 py-3 shadow-lift animate-toast-in min-w-56 max-w-sm',
      classes
    )}>
      {icon}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={() => onClose(id)} className="opacity-70 hover:opacity-100 transition-opacity">
        <CloseIcon size={14} />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
//  Molecule: IngredientTag
// ─────────────────────────────────────────────
import { X as RemoveIcon } from 'lucide-react'

interface IngredientTagProps {
  name:     string
  onRemove: (name: string) => void
}

export const IngredientTag = ({ name, onRemove }: IngredientTagProps) => (
  <span className="inline-flex items-center gap-1.5 rounded-lg bg-quentinho border border-cafe/15 px-3 py-1.5 text-xs text-cafe animate-scale-in">
    {name}
    <button
      onClick={() => onRemove(name)}
      aria-label={`Remover ${name}`}
      className="text-cafe-subtle hover:text-terracota transition-colors focus-ring rounded-full"
    >
      <RemoveIcon size={12} />
    </button>
  </span>
)

// ─────────────────────────────────────────────
//  Molecule: StatPill
// ─────────────────────────────────────────────
interface StatPillProps {
  icon:    React.ReactNode
  label:   string
  value:   string | number
}

export const StatPill = ({ icon, label, value }: StatPillProps) => (
  <div className="flex items-center gap-2 rounded-xl bg-quentinho px-3 py-2">
    <span className="text-terracota">{icon}</span>
    <div>
      <p className="text-[10px] text-cafe-subtle leading-none">{label}</p>
      <p className="text-xs font-bold text-cafe leading-none mt-0.5">{value}</p>
    </div>
  </div>
)

// ─────────────────────────────────────────────
//  Molecule: AffiliateLink  (monetização)
// ─────────────────────────────────────────────
import { ShoppingCart } from 'lucide-react'

interface AffiliateLinkProps {
  ingredientName: string
  url:            string
  price?:         string
}

export const AffiliateLink = ({ ingredientName, url, price }: AffiliateLinkProps) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer sponsored"
    className="flex items-center justify-between gap-3 rounded-xl bg-quentinho border border-cafe/10 px-4 py-3 hover:border-terracota/40 transition-colors group"
  >
    <div>
      <p className="text-[10px] text-cafe-subtle uppercase tracking-wide">Ingrediente da receita</p>
      <p className="text-sm font-semibold text-cafe">{ingredientName}</p>
    </div>
    <div className="flex items-center gap-2">
      {price && <span className="text-xs font-bold text-floresta">{price}</span>}
      <span className="flex items-center gap-1 rounded-full border border-floresta/40 px-3 py-1.5 text-xs font-bold text-floresta group-hover:bg-floresta group-hover:text-white transition-colors">
        <ShoppingCart size={11} /> Comprar
      </span>
    </div>
  </a>
)
