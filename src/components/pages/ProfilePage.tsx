import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, BookOpen, Heart, ChefHat } from 'lucide-react'
import { Avatar, Skeleton } from '@/components/atoms'
import { Button } from '@/components/atoms/Button'
import { RecipeGrid } from '@/components/organisms'
import { useAuthViewModel } from '@/viewmodels'
import { useSavedRecipesStore } from '@/store'
import { recipeService } from '@/services/firebase/recipeService'
import type { Recipe } from '@/models'

// ─────────────────────────────────────────────
//  Page: ProfilePage (dashboard do usuário)
// ─────────────────────────────────────────────
type Tab = 'minhas' | 'favoritas' | 'curtidas'

const ProfilePage = () => {
  const { user, signOut }            = useAuthViewModel()
  const { favorites, liked }         = useSavedRecipesStore()
  const [tab, setTab]                = useState<Tab>('minhas')
  const [myRecipes, setMyRecipes]    = useState<Recipe[]>([])
  const [isLoading, setLoading]      = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    recipeService.listByAuthor(user.uid)
      .then(setMyRecipes)
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return null

  const displayedRecipes: Recipe[] =
    tab === 'minhas'    ? myRecipes :
    tab === 'favoritas' ? favorites :
    favorites.filter(r => liked.includes(r.id))

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header do perfil */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <Avatar name={user.displayName ?? ''} photoURL={user.photoURL} size="lg" />

        <div className="flex-1">
          <h1 className="font-display text-2xl text-cafe">{user.displayName}</h1>
          <p className="text-sm text-cafe-muted">{user.email}</p>

          {/* Stats */}
          <div className="flex gap-5 mt-3">
            <StatItem icon={<ChefHat size={14} />} value={myRecipes.length} label="receitas" />
            <StatItem icon={<Heart size={14} />}   value={liked.length}     label="curtidas" />
            <StatItem icon={<BookOpen size={14} />} value={favorites.length} label="favoritas" />
          </div>
        </div>

        <div className="flex gap-2 self-start">
          <Link to="/receita/nova">
            <Button size="sm">
              <PlusCircle size={14} /> Nova receita
            </Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={signOut}>Sair</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-cafe/10">
        {([ 
          { id: 'minhas',    label: 'Minhas receitas', icon: <ChefHat size={14} /> },
          { id: 'favoritas', label: 'Favoritas',       icon: <BookOpen size={14} /> },
          { id: 'curtidas',  label: 'Curtidas',        icon: <Heart size={14} /> },
        ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors focus-ring -mb-px ${
              tab === t.id
                ? 'border-terracota text-terracota'
                : 'border-transparent text-cafe-muted hover:text-cafe'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {isLoading && tab === 'minhas' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : (
        <RecipeGrid recipes={displayedRecipes} />
      )}

      {/* CTA para criar primeira receita */}
      {!isLoading && tab === 'minhas' && myRecipes.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <ChefHat size={48} className="mx-auto text-cafe-subtle/30" />
          <div>
            <p className="font-display text-lg text-cafe-muted">Você ainda não publicou receitas</p>
            <p className="text-sm text-cafe-subtle mt-1">Compartilhe a primeira receita da família!</p>
          </div>
          <Link to="/receita/nova">
            <Button><PlusCircle size={15} /> Criar receita</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

const StatItem = ({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-terracota">{icon}</span>
    <span className="text-sm font-bold text-cafe">{value}</span>
    <span className="text-xs text-cafe-subtle">{label}</span>
  </div>
)

export default ProfilePage
