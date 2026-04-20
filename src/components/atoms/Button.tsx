import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

// ─────────────────────────────────────────────
//  Atom: Button
// ─────────────────────────────────────────────

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:    Variant
  size?:       Size
  isLoading?:  boolean
  fullWidth?:  boolean
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-terracota text-creme hover:bg-terracota-dark active:scale-95',
  secondary: 'border border-terracota text-terracota hover:bg-terracota/10 active:scale-95',
  ghost:     'bg-quentinho text-cafe hover:bg-quentinho/70 active:scale-95',
  danger:    'bg-red-500 text-white hover:bg-red-600 active:scale-95',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-sm rounded-full',
  md: 'px-6 py-2.5 text-sm rounded-full',
  lg: 'px-8 py-3 text-base rounded-full',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, fullWidth, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-body font-bold transition-all duration-150',
        'focus-ring disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading
        ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        : children}
    </button>
  )
)

Button.displayName = 'Button'
