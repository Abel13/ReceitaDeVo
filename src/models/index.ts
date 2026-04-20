// ─────────────────────────────────────────────
//  Domain Models  (pure TypeScript, no deps)
// ─────────────────────────────────────────────

export type DifficultyLevel = 'facil' | 'medio' | 'dificil'
export type IngredientState = 'cru' | 'cozido' | 'gelado' | 'temperatura_ambiente' | 'derretido'
export type StorageMethod   = 'geladeira' | 'freezer' | 'temperatura_ambiente' | 'nao_armazenar'

// ── User ────────────────────────────────────
export interface User {
  uid:          string
  displayName:  string
  email:        string
  photoURL:     string | null
  bio:          string
  createdAt:    Date
  followersCount: number
  followingCount: number
  recipesCount:   number
}

// ── Ingredient ──────────────────────────────
export interface Ingredient {
  id:           string
  name:         string
  quantity:     number
  unit:         string
  state:        IngredientState
  orderIndex:   number               // ordem de uso na receita
  substitutes:  string[]             // ex: ["manteiga por margarina"]
  affiliateUrl: string | null        // link de afiliado detectado
}

// ── Recipe Step ─────────────────────────────
export interface RecipeStep {
  id:          string
  orderIndex:  number
  description: string
  durationMin: number | null         // tempo parcial do passo (opcional)
  tip:         string | null
}

// ── Recipe ──────────────────────────────────
export interface Recipe {
  id:              string
  title:           string
  description:     string
  authorId:        string
  authorName:      string
  authorPhotoURL:  string | null
  category:        string
  difficulty:      DifficultyLevel
  prepTimeMin:     number
  cookTimeMin:     number
  totalTimeMin:    number            // computed: prep + cook
  servings:        number
  servingUnit:     string            // ex: "fatias", "porções", "unidades"
  ingredients:     Ingredient[]
  steps:           RecipeStep[]
  utensils:        string[]
  ovenTempCelsius: number | null
  storage: {
    method:    StorageMethod
    durationDays: number | null
    tip:       string | null
  }
  photos:          string[]          // URLs do Cloud Storage
  thumbUrl:        string | null     // primeira foto otimizada
  tags:            string[]
  likesCount:      number
  favoritesCount:  number
  commentsCount:   number
  isPublished:     boolean
  createdAt:       Date
  updatedAt:       Date
}

// ── Comment ─────────────────────────────────
export interface Comment {
  id:          string
  recipeId:    string
  authorId:    string
  authorName:  string
  authorPhoto: string | null
  text:        string
  createdAt:   Date
}

// ── Report ──────────────────────────────────
export type ReportReason = 'conteudo_falso' | 'ofensivo' | 'spam' | 'direitos_autorais' | 'outro'

export interface Report {
  id:        string
  recipeId:  string
  reporterId: string
  reason:    ReportReason
  details:   string
  createdAt: Date
}

// ── Ingredient Search Query ──────────────────
export interface IngredientSearchQuery {
  ingredients: string[]
  mode: 'exclusive' | 'inclusive'   // exclusivo = só esses / inclusivo = contendo esses
}

// ── Category ────────────────────────────────
export interface Category {
  id:    string
  label: string
  icon:  string   // nome do ícone Lucide
  slug:  string
}
