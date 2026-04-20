import { useState, useCallback } from 'react'
import { Flame, Sparkles, Clock } from 'lucide-react'
import { SearchBar, CategoryChip } from '@/components/molecules'
import { RecipeGrid } from '@/components/organisms'
import { useRecipeListViewModel } from '@/viewmodels'
import type { DifficultyLevel } from '@/models'

// ─────────────────────────────────────────────
//  Page: HomePage
// ─────────────────────────────────────────────

const CATEGORIES = [
  { id: '',        label: 'Tudo' },
  { id: 'bolos',   label: 'Bolos' },
  { id: 'salgados', label: 'Salgados' },
  { id: 'sopas',   label: 'Sopas' },
  { id: 'doces',   label: 'Doces' },
  { id: 'massas',  label: 'Massas' },
  { id: 'carnes',  label: 'Carnes' },
  { id: 'saladas', label: 'Saladas' },
  { id: 'bebidas', label: 'Bebidas' },
]

const DIFFICULTY_FILTERS: { id: DifficultyLevel | ''; label: string }[] = [
  { id: '',        label: 'Qualquer dificuldade' },
  { id: 'facil',   label: 'Fácil' },
  { id: 'medio',   label: 'Médio' },
  { id: 'dificil', label: 'Difícil' },
]

const HomePage = () => {
  const [activeCategory, setCategory]   = useState('')
  const [activeDifficulty, setDifficulty] = useState<DifficultyLevel | ''>('')
  const [searchTerm, setSearchTerm]     = useState('')

  const { recipes, isLoading, hasMore, loadMore } = useRecipeListViewModel(
    activeCategory   || undefined,
    activeDifficulty || undefined
  )

  const filteredRecipes = searchTerm
    ? recipes.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : recipes

  const handleCategoryChange = useCallback((id: string) => {
    setCategory(id)
  }, [])

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="text-center py-8 md:py-12">
        <h1 className="font-display text-3xl md:text-5xl text-cafe leading-tight">
          Receitas feitas com
          <span className="text-terracota italic"> amor</span>
        </h1>
        <p className="mt-3 text-cafe-muted text-sm md:text-base max-w-md mx-auto">
          Descubra sabores que atravessam gerações e compartilhe as receitas da sua família.
        </p>

        <div className="mt-6 max-w-xl mx-auto">
          <SearchBar onSearch={setSearchTerm} placeholder="Buscar receitas, ingredientes..." />
        </div>
      </section>

      {/* Filtros rápidos */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(c => (
            <CategoryChip
              key={c.id}
              label={c.label}
              isActive={activeCategory === c.id}
              onClick={() => handleCategoryChange(c.id)}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {DIFFICULTY_FILTERS.map(d => (
            <CategoryChip
              key={d.id}
              label={d.label}
              isActive={activeDifficulty === d.id}
              onClick={() => setDifficulty(d.id as DifficultyLevel | '')}
            />
          ))}
        </div>
      </section>

      {/* Destaques rápidos */}
      {!searchTerm && !activeCategory && (
        <section className="grid grid-cols-3 gap-3">
          <QuickStat icon={<Flame size={16} />} label="Populares hoje" color="text-terracota" />
          <QuickStat icon={<Sparkles size={16} />} label="Novas receitas" color="text-ouro" />
          <QuickStat icon={<Clock size={16} />} label="Até 30 minutos" color="text-floresta" />
        </section>
      )}

      {/* Grade de receitas */}
      <section>
        {searchTerm && (
          <p className="text-sm text-cafe-muted mb-4">
            {filteredRecipes.length} resultado{filteredRecipes.length !== 1 ? 's' : ''} para{' '}
            <strong className="text-cafe">"{searchTerm}"</strong>
          </p>
        )}
        <RecipeGrid
          recipes={filteredRecipes}
          isLoading={isLoading}
          hasMore={hasMore && !searchTerm}
          onLoadMore={loadMore}
        />
      </section>
    </div>
  )
}

// ── Sub-component interno ────────────────────
const QuickStat = ({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) => (
  <button className="flex flex-col items-center gap-1.5 rounded-xl bg-white border border-cafe/10 py-3 px-2 hover:border-cafe/20 hover:shadow-card transition-all text-center focus-ring">
    <span className={color}>{icon}</span>
    <span className="text-[11px] font-bold text-cafe-muted leading-tight">{label}</span>
  </button>
)

export default HomePage
