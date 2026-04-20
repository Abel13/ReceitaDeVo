import { Link } from 'react-router-dom'
import { BookOpen, Home } from 'lucide-react'
import { useSavedRecipesStore } from '@/store'
import { RecipeGrid } from '@/components/organisms'
import { Button } from '@/components/atoms/Button'

// ─────────────────────────────────────────────
//  Page: FavoritesPage
// ─────────────────────────────────────────────
export const FavoritesPage = () => {
  const { favorites } = useSavedRecipesStore()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen size={22} className="text-terracota" />
        <h1 className="font-display text-2xl text-cafe">Receitas favoritas</h1>
      </div>

      {favorites.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <BookOpen size={48} className="mx-auto text-cafe-subtle/30" />
          <p className="font-display text-lg text-cafe-muted">Nenhuma receita salva ainda</p>
          <p className="text-sm text-cafe-subtle">Explore o início e salve suas favoritas!</p>
          <Link to="/">
            <Button variant="ghost">Explorar receitas</Button>
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-cafe-muted">
            {favorites.length} receita{favorites.length !== 1 ? 's' : ''} salva{favorites.length !== 1 ? 's' : ''}
          </p>
          <RecipeGrid recipes={favorites} />
        </>
      )}
    </div>
  )
}

export default FavoritesPage

// ─────────────────────────────────────────────
//  Page: NotFoundPage
// ─────────────────────────────────────────────
export const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center px-4">
    <p className="font-display text-6xl text-terracota">404</p>
    <div>
      <p className="font-display text-2xl text-cafe">Página não encontrada</p>
      <p className="text-cafe-muted mt-2">Essa receita saiu do forno mais cedo que o esperado...</p>
    </div>
    <Link to="/">
      <Button><Home size={15} /> Voltar ao início</Button>
    </Link>
  </div>
)
