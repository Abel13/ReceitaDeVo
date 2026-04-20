import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Search, PlusCircle, Carrot, User, LogOut, BookOpen } from 'lucide-react'
import { clsx } from 'clsx'
import { Avatar } from '@/components/atoms'
import { Toast } from '@/components/molecules'
import { useAuthViewModel } from '@/viewmodels'
import { useUIStore } from '@/store'
import { RecipeCard } from '@/components/molecules'
import type { Recipe } from '@/models'

// ─────────────────────────────────────────────
//  Organism: Navbar (desktop)
// ─────────────────────────────────────────────
const NAV_LINKS = [
  { to: '/',            label: 'Início' },
  { to: '/categorias',  label: 'Categorias' },
  { to: '/ingredientes', label: 'Por ingrediente' },
]

export const Navbar = () => {
  const { pathname } = useLocation()
  const { user, signOut } = useAuthViewModel()

  return (
    <header className="sticky top-0 z-40 border-b border-cafe/10 bg-creme/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 h-14">
        {/* Logo */}
        <Link to="/" className="font-display text-lg font-semibold text-terracota shrink-0">
          Receita de Vó
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={clsx(
                'px-3 py-1.5 rounded-full text-sm transition-colors duration-150 focus-ring',
                pathname === to
                  ? 'text-terracota font-semibold bg-terracota/8'
                  : 'text-cafe-muted hover:text-cafe hover:bg-quentinho'
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Ações */}
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/receita/nova"
                className="hidden md:flex items-center gap-1.5 rounded-full bg-terracota px-4 py-2 text-sm font-bold text-creme hover:bg-terracota-dark transition-colors focus-ring"
              >
                <PlusCircle size={15} /> Nova receita
              </Link>
              <div className="relative group">
                <button className="focus-ring rounded-full">
                  <Avatar name={user.displayName ?? ''} photoURL={user.photoURL} size="sm" />
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 hidden group-focus-within:flex flex-col min-w-44 rounded-xl bg-white border border-cafe/10 shadow-lift py-1 z-50">
                  <Link to="/perfil" className="flex items-center gap-2 px-4 py-2.5 text-sm text-cafe hover:bg-quentinho transition-colors">
                    <User size={14} /> Meu perfil
                  </Link>
                  <Link to="/favoritos" className="flex items-center gap-2 px-4 py-2.5 text-sm text-cafe hover:bg-quentinho transition-colors">
                    <BookOpen size={14} /> Favoritos
                  </Link>
                  <button onClick={signOut} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
                    <LogOut size={14} /> Sair
                  </button>
                </div>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-terracota px-5 py-2 text-sm font-bold text-creme hover:bg-terracota-dark transition-colors focus-ring"
            >
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

// ─────────────────────────────────────────────
//  Organism: BottomTabBar (mobile PWA)
// ─────────────────────────────────────────────
const TABS = [
  { to: '/',             icon: Home,     label: 'Início' },
  { to: '/buscar',       icon: Search,   label: 'Buscar' },
  { to: '/receita/nova', icon: PlusCircle, label: 'Criar', highlight: true },
  { to: '/ingredientes', icon: Carrot,   label: 'Ingredientes' },
  { to: '/perfil',       icon: User,     label: 'Perfil' },
]

export const BottomTabBar = () => {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex bg-creme/95 backdrop-blur border-t border-cafe/10 pb-safe md:hidden">
      {TABS.map(({ to, icon: Icon, label, highlight }) => {
        const isActive = pathname === to
        return (
          <Link
            key={to}
            to={to}
            className={clsx(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors focus-ring',
              highlight
                ? 'text-terracota'
                : isActive ? 'text-terracota' : 'text-cafe-subtle'
            )}
          >
            <Icon size={highlight ? 26 : 22} strokeWidth={highlight ? 2.2 : isActive ? 2 : 1.5} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

// ─────────────────────────────────────────────
//  Organism: ToastContainer
// ─────────────────────────────────────────────
export const ToastContainer = () => {
  const { toasts, removeToast } = useUIStore()

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 md:bottom-6">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onClose={removeToast} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
//  Organism: RecipeGrid
// ─────────────────────────────────────────────
interface RecipeGridProps {
  recipes:    Recipe[]
  isLoading?: boolean
  hasMore?:   boolean
  onLoadMore?: () => void
}

import { Skeleton } from '@/components/atoms'
import { Button } from '@/components/atoms/Button'

export const RecipeGrid = ({ recipes, isLoading, hasMore, onLoadMore }: RecipeGridProps) => {
  const navigate = useNavigate()

  if (!isLoading && recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <BookOpen size={48} className="text-cafe-subtle/30 mb-4" />
        <p className="font-display text-lg text-cafe-muted">Nenhuma receita encontrada</p>
        <p className="text-sm text-cafe-subtle mt-1">Que tal criar a primeira?</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {recipes.map(r => (
          <RecipeCard key={r.id} recipe={r} onClick={() => navigate(`/receita/${r.id}`)} />
        ))}
        {isLoading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-brand overflow-hidden">
            <Skeleton className="h-44 w-full rounded-none" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
      {hasMore && !isLoading && (
        <div className="mt-8 flex justify-center">
          <Button variant="ghost" onClick={onLoadMore}>Carregar mais</Button>
        </div>
      )}
    </div>
  )
}
