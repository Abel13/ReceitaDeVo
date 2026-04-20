import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlusCircle, Trash2, GripVertical, Clock,
  Thermometer, Camera, ChefHat, Package, BookOpen
} from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { Input, Textarea } from '@/components/atoms'
import { useCreateRecipeViewModel } from '@/viewmodels'
import type { Ingredient, Recipe, RecipeStep, DifficultyLevel, StorageMethod, IngredientState } from '@/models'
import { clsx } from 'clsx'

// ─────────────────────────────────────────────
//  Constantes do formulário
// ─────────────────────────────────────────────
type FormStep = 'info' | 'ingredientes' | 'preparo' | 'detalhes' | 'fotos'

const FORM_STEPS: { id: FormStep; label: string; icon: React.ReactNode }[] = [
  { id: 'info',         label: 'Informações',  icon: <BookOpen size={14} /> },
  { id: 'ingredientes', label: 'Ingredientes', icon: <Package size={14} /> },
  { id: 'preparo',      label: 'Preparo',      icon: <ChefHat size={14} /> },
  { id: 'detalhes',     label: 'Detalhes',     icon: <Clock size={14} /> },
  { id: 'fotos',        label: 'Fotos',        icon: <Camera size={14} /> },
]

export const CATEGORIES = ['Bolos', 'Salgados', 'Sopas', 'Doces', 'Massas', 'Carnes', 'Saladas', 'Bebidas', 'Lanches', 'Sobremesas']
const DIFFICULTY: { id: DifficultyLevel; label: string }[] = [
  { id: 'facil', label: 'Fácil' }, { id: 'medio', label: 'Médio' }, { id: 'dificil', label: 'Difícil' }
]
const STORAGE_METHODS: { id: StorageMethod; label: string }[] = [
  { id: 'temperatura_ambiente', label: 'Temperatura ambiente' },
  { id: 'geladeira',            label: 'Geladeira' },
  { id: 'freezer',              label: 'Freezer' },
  { id: 'nao_armazenar',        label: 'Consumir imediatamente' },
]
const INGREDIENT_STATES: { id: IngredientState; label: string }[] = [
  { id: 'cru',                  label: 'Cru / Natural' },
  { id: 'temperatura_ambiente', label: 'Temp. ambiente' },
  { id: 'gelado',               label: 'Gelado' },
  { id: 'derretido',            label: 'Derretido' },
  { id: 'cozido',               label: 'Cozido' },
]

const emptyIngredient = (index: number): Ingredient => ({
  id: crypto.randomUUID(), name: '', quantity: 1, unit: 'g',
  state: 'cru', orderIndex: index, substitutes: [], affiliateUrl: null,
})

const emptyStep = (index: number): RecipeStep => ({
  id: crypto.randomUUID(), orderIndex: index, description: '', durationMin: null, tip: null,
})

// ─────────────────────────────────────────────
//  RecipeFormContent — compartilhado entre criar e editar
// ─────────────────────────────────────────────
export interface RecipeFormData {
  title: string; description: string; category: string; difficulty: DifficultyLevel
  prepTimeMin: number; cookTimeMin: number; totalTimeMin: number
  servings: number; servingUnit: string; ovenTempCelsius: number | null
  utensils: string[]; ingredients: Ingredient[]; steps: RecipeStep[]
  storage: { method: StorageMethod; durationDays: number | null; tip: string | null }
  tags: string[]; photos: string[]; thumbUrl: string | null; isPublished: boolean
}

interface RecipeFormContentProps {
  defaultValues?: Partial<Recipe>
  onSubmit:       (data: RecipeFormData, photos: File[]) => Promise<void>
  isSubmitting:   boolean
  uploadProgress: number
  submitLabel:    string
  onDelete?:      () => void
  isDeleting?:    boolean
}

export const RecipeFormContent = ({
  defaultValues,
  onSubmit,
  isSubmitting,
  uploadProgress,
  submitLabel,
  onDelete,
  isDeleting = false,
}: RecipeFormContentProps) => {
  const [activeStep, setActiveStep] = useState<FormStep>('info')

  const [title,       setTitle]      = useState(defaultValues?.title       ?? '')
  const [description, setDesc]       = useState(defaultValues?.description ?? '')
  const [category,    setCategory]   = useState(defaultValues?.category    ?? '')
  const [difficulty,  setDifficulty] = useState<DifficultyLevel>(defaultValues?.difficulty ?? 'facil')
  const [prepTime,    setPrepTime]   = useState(defaultValues?.prepTimeMin  ?? 30)
  const [cookTime,    setCookTime]   = useState(defaultValues?.cookTimeMin  ?? 30)
  const [servings,    setServings]   = useState(defaultValues?.servings     ?? 4)
  const [servingUnit, setServUnit]   = useState(defaultValues?.servingUnit  ?? 'porções')
  const [ovenTemp,    setOvenTemp]   = useState<number | null>(defaultValues?.ovenTempCelsius ?? null)
  const [utensils,    setUtensils]   = useState<string[]>(defaultValues?.utensils?.length ? defaultValues.utensils : [''])
  const [ingredients, setIngredients] = useState<Ingredient[]>(defaultValues?.ingredients?.length ? defaultValues.ingredients : [emptyIngredient(0)])
  const [steps,       setSteps]      = useState<RecipeStep[]>(defaultValues?.steps?.length ? defaultValues.steps : [emptyStep(0)])
  const [storageMethod, setStorageMethod] = useState<StorageMethod>(defaultValues?.storage?.method ?? 'temperatura_ambiente')
  const [storageDays,   setStorageDays]   = useState<number | null>(defaultValues?.storage?.durationDays ?? 3)
  const [storageTip,    setStorageTip]    = useState(defaultValues?.storage?.tip ?? '')
  const [photos,      setPhotos]     = useState<File[]>([])
  const [photosPreviews, setPreviews] = useState<string[]>(defaultValues?.photos ?? [])
  const [tags,        setTags]       = useState(defaultValues?.tags?.join(', ') ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const updateIngredient = useCallback((id: string, field: keyof Ingredient, value: unknown) => {
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }, [])
  const addIngredient    = () => setIngredients(prev => [...prev, emptyIngredient(prev.length)])
  const removeIngredient = (id: string) => setIngredients(prev => prev.filter(i => i.id !== id))

  const updateStep = useCallback((id: string, field: keyof RecipeStep, value: unknown) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }, [])
  const addStep    = () => setSteps(prev => [...prev, emptyStep(prev.length)])
  const removeStep = (id: string) => setSteps(prev => prev.filter(s => s.id !== id))

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 5)
    setPhotos(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleSubmit = async () => {
    await onSubmit({
      title, description, category, difficulty,
      prepTimeMin: prepTime, cookTimeMin: cookTime,
      totalTimeMin: prepTime + cookTime,
      servings, servingUnit, ovenTempCelsius: ovenTemp,
      ingredients, steps,
      utensils: utensils.filter(Boolean),
      storage: { method: storageMethod, durationDays: storageDays, tip: storageTip || null },
      tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      photos: defaultValues?.photos ?? [],
      thumbUrl: defaultValues?.thumbUrl ?? null,
      isPublished: true,
    }, photos)
  }

  const stepIndex   = FORM_STEPS.findIndex(s => s.id === activeStep)
  const isLastStep  = stepIndex === FORM_STEPS.length - 1
  const isFirstStep = stepIndex === 0

  return (
    <>
      {/* Progress steps */}
      <div className="flex gap-1">
        {FORM_STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveStep(s.id)}
            className={clsx(
              'flex flex-1 flex-col items-center gap-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all focus-ring',
              activeStep === s.id
                ? 'bg-terracota text-creme'
                : i < stepIndex
                  ? 'bg-floresta/15 text-floresta'
                  : 'bg-quentinho text-cafe-subtle'
            )}
          >
            {s.icon}
            <span className="hidden sm:block">{s.label}</span>
          </button>
        ))}
      </div>

      {/* ── Seção: Informações ── */}
      {activeStep === 'info' && (
        <FormSection title="Informações básicas">
          <Input id="title" label="Nome da receita" placeholder="Ex: Bolo de Fubá da Vó Maria" value={title} onChange={e => setTitle(e.target.value)} required />
          <Textarea id="desc" label="Descrição" placeholder="Conte a história dessa receita..." value={description} onChange={e => setDesc(e.target.value)} rows={3} />

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cafe-muted mb-2">Categoria</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={clsx('rounded-full px-3 py-1.5 text-xs font-bold border transition-all focus-ring',
                    category === c ? 'bg-terracota text-creme border-terracota' : 'border-cafe/15 text-cafe-muted hover:border-terracota/50')}
                >{c}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cafe-muted mb-2">Dificuldade</p>
            <div className="flex gap-2">
              {DIFFICULTY.map(d => (
                <button key={d.id} onClick={() => setDifficulty(d.id)}
                  className={clsx('flex-1 rounded-xl py-2 text-xs font-bold border transition-all focus-ring',
                    difficulty === d.id ? 'bg-terracota text-creme border-terracota' : 'border-cafe/15 text-cafe-muted hover:border-terracota/40')}
                >{d.label}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input id="prep" type="number" label="Preparo (min)" value={prepTime} onChange={e => setPrepTime(Number(e.target.value))} min={1} />
            <Input id="cook" type="number" label="Cozimento (min)" value={cookTime} onChange={e => setCookTime(Number(e.target.value))} min={0} />
            <Input id="serv" type="number" label="Rendimento" value={servings} onChange={e => setServings(Number(e.target.value))} min={1} />
            <Input id="unit" label="Unidade" placeholder="porções" value={servingUnit} onChange={e => setServUnit(e.target.value)} />
          </div>
        </FormSection>
      )}

      {/* ── Seção: Ingredientes ── */}
      {activeStep === 'ingredientes' && (
        <FormSection title="Ingredientes">
          <p className="text-xs text-cafe-subtle">Defina a ordem de uso, estado e possíveis substituições.</p>
          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div key={ing.id} className="rounded-xl border border-cafe/10 p-4 space-y-3 bg-white animate-fade-in">
                <div className="flex items-center gap-2">
                  <GripVertical size={14} className="text-cafe-subtle/50 cursor-grab" />
                  <span className="text-xs font-bold text-cafe-subtle">#{idx + 1}</span>
                  <button onClick={() => removeIngredient(ing.id)} className="ml-auto text-cafe-subtle hover:text-red-500 focus-ring rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input id={`name-${ing.id}`} label="Ingrediente" placeholder="Ex: Farinha de trigo" value={ing.name} onChange={e => updateIngredient(ing.id, 'name', e.target.value)} />
                  <div className="grid grid-cols-2 gap-1">
                    <Input id={`qty-${ing.id}`} type="number" label="Qtd" value={ing.quantity} onChange={e => updateIngredient(ing.id, 'quantity', Number(e.target.value))} min={0} step={0.5} />
                    <Input id={`unit-${ing.id}`} label="Unid." placeholder="g" value={ing.unit} onChange={e => updateIngredient(ing.id, 'unit', e.target.value)} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-cafe-muted mb-1.5">Estado</p>
                  <div className="flex flex-wrap gap-1.5">
                    {INGREDIENT_STATES.map(s => (
                      <button key={s.id} onClick={() => updateIngredient(ing.id, 'state', s.id)}
                        className={clsx('rounded-full px-2.5 py-1 text-[11px] font-bold border transition-all focus-ring',
                          ing.state === s.id ? 'bg-terracota text-creme border-terracota' : 'border-cafe/15 text-cafe-subtle')}
                      >{s.label}</button>
                    ))}
                  </div>
                </div>
                <Input id={`sub-${ing.id}`} label="Substituição (opcional)" placeholder="Ex: manteiga por margarina" value={ing.substitutes.join(', ')} onChange={e => updateIngredient(ing.id, 'substitutes', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
              </div>
            ))}
          </div>
          <Button variant="ghost" onClick={addIngredient} fullWidth>
            <PlusCircle size={15} /> Adicionar ingrediente
          </Button>
        </FormSection>
      )}

      {/* ── Seção: Preparo ── */}
      {activeStep === 'preparo' && (
        <FormSection title="Modo de preparo">
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={step.id} className="rounded-xl border border-cafe/10 p-4 space-y-3 bg-white animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terracota text-creme text-xs font-bold">{idx + 1}</span>
                  <span className="text-xs text-cafe-subtle flex-1">Passo {idx + 1}</span>
                  {steps.length > 1 && (
                    <button onClick={() => removeStep(step.id)} className="text-cafe-subtle hover:text-red-500 focus-ring rounded">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <Textarea id={`step-${step.id}`} placeholder="Descreva o passo..." value={step.description} onChange={e => updateStep(step.id, 'description', e.target.value)} rows={3} />
                <div className="grid grid-cols-2 gap-2">
                  <Input id={`dur-${step.id}`} type="number" label="Duração (min)" placeholder="Opcional" value={step.durationMin ?? ''} onChange={e => updateStep(step.id, 'durationMin', e.target.value ? Number(e.target.value) : null)} min={0} />
                  <Input id={`tip-${step.id}`} label="Dica (opcional)" placeholder="Ex: Não misture demais" value={step.tip ?? ''} onChange={e => updateStep(step.id, 'tip', e.target.value || null)} />
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" onClick={addStep} fullWidth>
            <PlusCircle size={15} /> Adicionar passo
          </Button>
        </FormSection>
      )}

      {/* ── Seção: Detalhes ── */}
      {activeStep === 'detalhes' && (
        <FormSection title="Detalhes e armazenamento">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cafe-muted mb-2">Utensílios necessários</p>
            {utensils.map((u, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input id={`ut-${i}`} placeholder="Ex: Batedeira, forma 20cm..." value={u} onChange={e => { const n = [...utensils]; n[i] = e.target.value; setUtensils(n) }} />
                {utensils.length > 1 && (
                  <button onClick={() => setUtensils(prev => prev.filter((_, j) => j !== i))} className="text-cafe-subtle hover:text-red-500 focus-ring rounded px-1">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => setUtensils(p => [...p, ''])} className="text-xs text-terracota font-bold hover:text-terracota-dark focus-ring rounded">
              + Adicionar utensílio
            </button>
          </div>

          <div>
            <Input id="oven" type="number" label="Temperatura do forno (°C) — se aplicável" placeholder="Ex: 180" value={ovenTemp ?? ''} onChange={e => setOvenTemp(e.target.value ? Number(e.target.value) : null)} leftIcon={<Thermometer size={15} />} />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cafe-muted mb-2">Armazenamento</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {STORAGE_METHODS.map(m => (
                <button key={m.id} onClick={() => setStorageMethod(m.id)}
                  className={clsx('rounded-xl py-2 px-3 text-xs font-bold border text-left transition-all focus-ring',
                    storageMethod === m.id ? 'bg-floresta text-creme border-floresta' : 'border-cafe/15 text-cafe-muted')}
                >{m.label}</button>
              ))}
            </div>
            {storageMethod !== 'nao_armazenar' && (
              <div className="grid grid-cols-2 gap-2">
                <Input id="days" type="number" label="Validade (dias)" value={storageDays ?? ''} onChange={e => setStorageDays(e.target.value ? Number(e.target.value) : null)} min={1} />
                <Input id="stip" label="Dica de armazenamento" placeholder="Cubra com plástico filme" value={storageTip} onChange={e => setStorageTip(e.target.value)} />
              </div>
            )}
          </div>

          <Input id="tags" label="Tags (separe por vírgula)" placeholder="Ex: sem glúten, vegano, rápido" value={tags} onChange={e => setTags(e.target.value)} />
        </FormSection>
      )}

      {/* ── Seção: Fotos ── */}
      {activeStep === 'fotos' && (
        <FormSection title="Fotos da receita">
          <p className="text-xs text-cafe-subtle">
            {defaultValues?.photos?.length
              ? 'Selecione novas fotos para substituir as existentes, ou avance sem alterar.'
              : 'Adicione até 5 fotos. As imagens serão otimizadas automaticamente antes do envio.'}
          </p>
          <label className="flex flex-col items-center justify-center gap-3 rounded-brand border-2 border-dashed border-cafe/20 py-10 cursor-pointer hover:border-terracota/40 transition-colors">
            <Camera size={32} className="text-cafe-subtle/40" />
            <span className="text-sm text-cafe-muted font-medium">Clique para selecionar fotos</span>
            <span className="text-xs text-cafe-subtle">JPEG, PNG ou WebP · máx. 10MB cada</span>
            <input type="file" accept="image/*" multiple onChange={handlePhotos} className="sr-only" />
          </label>

          {photosPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photosPreviews.map((src, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden aspect-square">
                  <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && <span className="absolute top-1 left-1 rounded-full bg-terracota/90 px-2 py-0.5 text-[10px] font-bold text-white">Capa</span>}
                </div>
              ))}
            </div>
          )}

          {isSubmitting && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-cafe-muted">
                <span>Enviando fotos...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-quentinho overflow-hidden">
                <div className="h-full bg-terracota rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </FormSection>
      )}

      {/* Navegação */}
      <div className="flex justify-between gap-3 pb-4">
        <Button variant="ghost" onClick={() => setActiveStep(FORM_STEPS[stepIndex - 1]?.id)} disabled={isFirstStep}>
          Anterior
        </Button>
        {isLastStep ? (
          <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!title || !category}>
            {submitLabel}
          </Button>
        ) : (
          <Button onClick={() => setActiveStep(FORM_STEPS[stepIndex + 1].id)}>
            Próximo
          </Button>
        )}
      </div>

      {/* Zona de exclusão (apenas no modo edição) */}
      {onDelete && (
        <div className="border-t border-red-100 pt-6 pb-8">
          {confirmDelete ? (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-3">
              <p className="text-sm font-semibold text-red-700">Tem certeza? Esta ação não pode ser desfeita.</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
                <Button variant="danger" size="sm" onClick={onDelete} isLoading={isDeleting}>
                  Sim, excluir receita
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors focus-ring rounded-lg"
            >
              <Trash2 size={14} /> Excluir receita
            </button>
          )}
        </div>
      )}
    </>
  )
}

// ─────────────────────────────────────────────
//  Page: CreateRecipePage
// ─────────────────────────────────────────────
const CreateRecipePage = () => {
  const navigate = useNavigate()
  const { isSubmitting, uploadProgress, submitRecipe } = useCreateRecipeViewModel()

  const handleSubmit = async (data: RecipeFormData, photos: File[]) => {
    const id = await submitRecipe(
      {
        title:          data.title,
        description:    data.description,
        category:       data.category,
        difficulty:     data.difficulty,
        prepTimeMin:    data.prepTimeMin,
        cookTimeMin:    data.cookTimeMin,
        totalTimeMin:   data.totalTimeMin,
        servings:       data.servings,
        servingUnit:    data.servingUnit,
        ovenTempCelsius: data.ovenTempCelsius,
        utensils:       data.utensils,
        ingredients:    data.ingredients,
        steps:          data.steps,
        storage:        data.storage,
        tags:           data.tags,
        isPublished:    true,
      },
      photos
    )
    if (id) navigate(`/receita/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-2xl text-cafe">Nova receita</h1>
      <RecipeFormContent
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        uploadProgress={uploadProgress}
        submitLabel="Publicar receita"
      />
    </div>
  )
}

const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-brand border border-cafe/10 p-6 space-y-5 shadow-card animate-fade-in">
    <h2 className="font-display text-lg text-cafe">{title}</h2>
    {children}
  </div>
)

export default CreateRecipePage
