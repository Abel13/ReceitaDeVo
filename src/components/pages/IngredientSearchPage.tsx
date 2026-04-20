import { useState, useRef, type KeyboardEvent } from 'react'
import { Search, Carrot } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { IngredientTag } from '@/components/molecules'
import { RecipeGrid } from '@/components/organisms'
import { useIngredientSearchViewModel } from '@/viewmodels'

// ─────────────────────────────────────────────
//  Page: IngredientSearchPage
// ─────────────────────────────────────────────
const IngredientSearchPage = () => {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { query, results, isLoading, hasSearched, addIngredient, removeIngredient, setMode, search } =
    useIngredientSearchViewModel()

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault()
      addIngredient(inputValue)
      setInputValue('')
    }
    if (e.key === 'Backspace' && !inputValue && query.ingredients.length > 0) {
      removeIngredient(query.ingredients[query.ingredients.length - 1])
    }
  }

  const handleAddClick = () => {
    if (inputValue.trim()) {
      addIngredient(inputValue)
      setInputValue('')
      inputRef.current?.focus()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-terracota/10 text-terracota mb-2">
          <Carrot size={28} />
        </div>
        <h1 className="font-display text-2xl md:text-3xl text-cafe">
          O que tem na sua geladeira?
        </h1>
        <p className="text-sm text-cafe-muted">
          Informe os ingredientes que você tem em casa e descubra receitas incríveis.
        </p>
      </div>

      {/* Input de ingredientes */}
      <div className="bg-white rounded-brand border border-cafe/10 p-5 space-y-4 shadow-card">
        <div
          className="flex flex-wrap gap-2 min-h-10 cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {query.ingredients.map(ing => (
            <IngredientTag key={ing} name={ing} onRemove={removeIngredient} />
          ))}
          <div className="flex items-center gap-2 flex-1 min-w-36">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={query.ingredients.length ? 'Adicionar ingrediente...' : 'Ex: farinha, ovos, leite...'}
              className="flex-1 text-sm text-cafe placeholder:text-cafe-subtle outline-none bg-transparent min-w-0"
            />
            {inputValue && (
              <button
                onClick={handleAddClick}
                className="text-xs font-bold text-terracota hover:text-terracota-dark transition-colors"
              >
                Adicionar
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-cafe-subtle">
          Pressione <kbd className="rounded bg-quentinho px-1.5 py-0.5 text-cafe">Enter</kbd> ou{' '}
          <kbd className="rounded bg-quentinho px-1.5 py-0.5 text-cafe">,</kbd> para adicionar cada ingrediente
        </p>

        {/* Modo de busca */}
        <div className="border-t border-cafe/8 pt-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-cafe-muted">Modo de busca</p>
          <div className="flex gap-3">
            <ModeOption
              id="inclusive"
              label="Contém esses ingredientes"
              description="Receitas que usam pelo menos um desses ingredientes"
              isActive={query.mode === 'inclusive'}
              onSelect={() => setMode('inclusive')}
            />
            <ModeOption
              id="exclusive"
              label="Apenas esses ingredientes"
              description="Receitas que usam somente os ingredientes que você tem"
              isActive={query.mode === 'exclusive'}
              onSelect={() => setMode('exclusive')}
            />
          </div>
        </div>

        <Button
          onClick={search}
          isLoading={isLoading}
          disabled={query.ingredients.length === 0}
          fullWidth
          className="mt-2"
        >
          <Search size={15} /> Buscar receitas
        </Button>
      </div>

      {/* Resultados */}
      {hasSearched && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-cafe">
              {results.length > 0
                ? `${results.length} receita${results.length !== 1 ? 's' : ''} encontrada${results.length !== 1 ? 's' : ''}`
                : 'Nenhuma receita encontrada'}
            </h2>
            {results.length > 0 && (
              <p className="text-xs text-cafe-subtle">
                com: {query.ingredients.join(', ')}
              </p>
            )}
          </div>
          <RecipeGrid recipes={results} isLoading={isLoading} />
        </div>
      )}
    </div>
  )
}

const ModeOption = ({ id, label, description, isActive, onSelect }: {
  id: string; label: string; description: string; isActive: boolean; onSelect: () => void
}) => (
  <button
    onClick={onSelect}
    className={`flex-1 text-left rounded-xl border p-3 transition-all duration-150 focus-ring ${
      isActive ? 'border-terracota bg-terracota/5' : 'border-cafe/15 hover:border-cafe/30'
    }`}
  >
    <div className="flex items-center gap-2 mb-1">
      <span className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
        isActive ? 'border-terracota' : 'border-cafe/30'
      }`}>
        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-terracota" />}
      </span>
      <p className="text-xs font-bold text-cafe">{label}</p>
    </div>
    <p className="text-[11px] text-cafe-subtle pl-5">{description}</p>
  </button>
)

export default IngredientSearchPage
