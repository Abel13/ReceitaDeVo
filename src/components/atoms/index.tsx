import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { Minus, Plus } from 'lucide-react'
import type { DifficultyLevel } from '@/models'

// ─────────────────────────────────────────────
//  Atom: Input
// ─────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:    string
  error?:    string
  leftIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className, id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-cafe-muted">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cafe-subtle">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={clsx(
            'w-full rounded-xl border bg-white py-2.5 text-sm text-cafe placeholder:text-cafe-subtle',
            'transition-colors duration-150 focus-ring outline-none',
            error ? 'border-red-400' : 'border-cafe/20 focus:border-terracota',
            leftIcon ? 'pl-10 pr-4' : 'px-4',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// ─────────────────────────────────────────────
//  Atom: NumericInput (otimizado para mobile)
// ─────────────────────────────────────────────
interface NumericInputProps {
  id:           string
  label?:       string
  value:        number | string
  onChange:     (value: number) => void
  min?:         number
  max?:         number
  step?:        number
  placeholder?: string
  disabled?:    boolean
  leftIcon?:    React.ReactNode
  className?:   string
}

export const NumericInput = ({
  id,
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  placeholder,
  disabled = false,
  leftIcon,
  className,
}: NumericInputProps) => {
  const [inputValue, setInputValue] = useState(value === '' || value === 0 ? '' : String(value))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    
    if (val === '') {
      setInputValue('')
      onChange(min ?? 0)
      return
    }

    const parsed = parseFloat(val.replace(',', '.'))
    if (!isNaN(parsed)) {
      setInputValue(val)
      const clamped = max !== undefined ? Math.min(max, Math.max(min, parsed)) : Math.max(min, parsed)
      onChange(clamped)
    }
  }

  const handleBlur = () => {
    if (inputValue === '') {
      setInputValue('')
    } else {
      const parsed = parseFloat(String(inputValue).replace(',', '.'))
      if (!isNaN(parsed)) {
        const clamped = max !== undefined ? Math.min(max, Math.max(min, parsed)) : Math.max(min, parsed)
        setInputValue(String(clamped))
      }
    }
  }

  const increment = () => {
    const current = inputValue === '' ? min : parseFloat(String(inputValue).replace(',', '.'))
    const newVal = current + step
    const clamped = max !== undefined ? Math.min(max, newVal) : newVal
    setInputValue(String(clamped))
    onChange(clamped)
  }

  const decrement = () => {
    const current = inputValue === '' ? min : parseFloat(String(inputValue).replace(',', '.'))
    const newVal = Math.max(min, current - step)
    setInputValue(String(newVal))
    onChange(newVal)
  }

  const currentValue = inputValue === '' ? min : parseFloat(String(inputValue).replace(',', '.'))
  const canDecrement = currentValue > min
  const canIncrement = max === undefined || currentValue < max

  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-cafe-muted">
          {label}
        </label>
      )}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || !canDecrement}
          className={clsx(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-all active:scale-95',
            'focus-ring',
            canDecrement && !disabled
              ? 'border-terracota/30 bg-terracota/5 text-terracota hover:bg-terracota/10 active:bg-terracota/20'
              : 'border-cafe/10 bg-quentinho text-cafe-subtle/40 cursor-not-allowed'
          )}
        >
          <Minus size={18} strokeWidth={3} />
        </button>
        
        <div className="relative flex-1">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cafe-subtle">
              {leftIcon}
            </span>
          )}
          <input
            id={id}
            type="text"
            inputMode="decimal"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={clsx(
              'w-full rounded-xl border-2 bg-white py-2.5 text-center text-sm font-semibold text-cafe placeholder:text-cafe-subtle placeholder:font-normal',
              'transition-colors duration-150 focus-ring outline-none',
              'border-cafe/20 focus:border-terracota',
              leftIcon ? 'pl-10 pr-4' : 'px-4',
              disabled && 'bg-quentinho cursor-not-allowed'
            )}
          />
        </div>

        <button
          type="button"
          onClick={increment}
          disabled={disabled || !canIncrement}
          className={clsx(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-all active:scale-95',
            'focus-ring',
            canIncrement && !disabled
              ? 'border-terracota/30 bg-terracota/5 text-terracota hover:bg-terracota/10 active:bg-terracota/20'
              : 'border-cafe/10 bg-quentinho text-cafe-subtle/40 cursor-not-allowed'
          )}
        >
          <Plus size={18} strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}
NumericInput.displayName = 'NumericInput'

// ─────────────────────────────────────────────
//  Atom: Badge
// ─────────────────────────────────────────────
type BadgeVariant = 'category' | 'easy' | 'medium' | 'hard' | 'time' | 'neutral'

const badgeVariants: Record<BadgeVariant, string> = {
  category: 'bg-quentinho text-cafe-light',
  easy:     'bg-green-100 text-green-800',
  medium:   'bg-amber-100 text-amber-800',
  hard:     'bg-red-100 text-red-800',
  time:     'bg-quentinho text-cafe-muted',
  neutral:  'bg-quentinho text-cafe',
}

export const difficultyToBadge = (d: DifficultyLevel): BadgeVariant =>
  d === 'facil' ? 'easy' : d === 'medio' ? 'medium' : 'hard'

export const difficultyLabel = (d: DifficultyLevel): string =>
  d === 'facil' ? 'Fácil' : d === 'medio' ? 'Médio' : 'Difícil'

interface BadgeProps {
  variant?:  BadgeVariant
  children:  React.ReactNode
  className?: string
}

export const Badge = ({ variant = 'neutral', children, className }: BadgeProps) => (
  <span className={clsx(
    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold',
    badgeVariants[variant],
    className
  )}>
    {children}
  </span>
)

// ─────────────────────────────────────────────
//  Atom: Avatar
// ─────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-terracota text-creme',
  'bg-floresta text-creme',
  'bg-ouro text-cafe',
  'bg-cafe-light text-creme',
]

const colorFromName = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

interface AvatarProps {
  name:       string
  photoURL?:  string | null
  size?:      'sm' | 'md' | 'lg'
  className?: string
}

const sizePx: Record<string, string> = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
}

export const Avatar = ({ name, photoURL, size = 'md', className }: AvatarProps) => {
  const [imgError, setImgError] = useState(false)
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  if (photoURL && !imgError) {
    return (
      <img
        src={photoURL}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={clsx('rounded-full object-cover', sizePx[size], className)}
      />
    )
  }

  return (
    <span className={clsx(
      'inline-flex items-center justify-center rounded-full font-display font-semibold select-none',
      sizePx[size],
      colorFromName(name),
      className
    )}>
      {initials}
    </span>
  )
}

// ─────────────────────────────────────────────
//  Atom: Skeleton
// ─────────────────────────────────────────────
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={clsx('skeleton', className)} />
)

// ─────────────────────────────────────────────
//  Atom: Divider
// ─────────────────────────────────────────────
export const Divider = ({ className }: { className?: string }) => (
  <hr className={clsx('border-cafe/10', className)} />
)

// ─────────────────────────────────────────────
//  Atom: Textarea
// ─────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-cafe-muted">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={clsx(
          'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-cafe placeholder:text-cafe-subtle',
          'transition-colors duration-150 focus-ring outline-none resize-none',
          error ? 'border-red-400' : 'border-cafe/20 focus:border-terracota',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'
