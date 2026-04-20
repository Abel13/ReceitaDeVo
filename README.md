# 🍰 Receita de Vó

> Sabores que atravessam gerações — plataforma colaborativa de receitas

## Stack

| Camada        | Tecnologia                          |
|---------------|-------------------------------------|
| Frontend      | React 18 + Vite + TypeScript        |
| Estilização   | Tailwind CSS                        |
| Ícones        | Lucide React                        |
| Estado global | Zustand (persist para favoritos)    |
| Backend       | Firebase (Auth + Firestore + Storage) |
| PWA           | vite-plugin-pwa + Workbox           |
| Imagens       | browser-image-compression → WebP   |
| Arquitetura   | MVVM + Atomic Design + SOLID        |

## Estrutura de pastas

```
src/
├── assets/               # Fontes, imagens estáticas
├── components/
│   ├── atoms/            # Button, Input, Badge, Avatar, Skeleton, Divider
│   ├── molecules/        # RecipeCard, SearchBar, CategoryChip, Toast, AffiliateLink
│   ├── organisms/        # Navbar, BottomTabBar, ToastContainer, RecipeGrid
│   ├── templates/        # MainLayout, AuthLayout
│   └── pages/            # HomePage, RecipeDetailPage, CreateRecipePage, ...
├── models/               # Interfaces TypeScript (domínio puro)
├── services/
│   ├── firebase/         # authService, recipeService, config
│   └── image/            # imageService (compressão + upload)
├── store/                # Zustand stores (auth, savedRecipes, ui)
├── viewmodels/           # Hooks MVVM (ponte entre services e pages)
├── router/               # AppRouter + guards de rota
└── styles/               # globals.css
```

## Setup

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Firebase
1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com)
2. Ative: **Authentication** (Email/Senha + Google), **Firestore**, **Storage**
3. Copie `.env.example` → `.env.local` e preencha as chaves

### 3. Regras do Firestore (firestore.rules)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
    match /recipes/{recipeId} {
      allow read: if resource.data.isPublished == true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId;
    }
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.authorId;
    }
  }
}
```

### 4. Rodar em desenvolvimento
```bash
npm run dev
```

### 5. Build de produção
```bash
npm run build
```

## Padrões de desenvolvimento

### MVVM
- **Model**: `src/models/` — interfaces TypeScript puras
- **View**: `src/components/` — componentes React sem lógica de negócio
- **ViewModel**: `src/viewmodels/` — hooks que conectam services ao estado

### Atomic Design
- **Atoms**: componentes primitivos (Button, Input, Badge)
- **Molecules**: composições simples (RecipeCard, SearchBar)
- **Organisms**: seções completas (Navbar, RecipeGrid)
- **Templates**: layouts de página (MainLayout, AuthLayout)
- **Pages**: instâncias específicas com dados reais

### SOLID aplicado
- **S** — cada service tem responsabilidade única (authService, recipeService, imageService)
- **O** — componentes extensíveis via props sem modificar código existente
- **L** — ViewModels são intercambiáveis pois retornam contratos consistentes
- **I** — interfaces do modelo separadas por domínio
- **D** — Pages dependem de ViewModels (abstrações), não de services diretamente

### Otimização de imagens
Todo upload passa pelo `imageService`:
1. Comprime para WebP (máx 800 KB / 1200px)
2. Gera thumbnail (máx 150 KB / 400px)
3. Upload paralelo para Cloud Storage

### Monetização (links de afiliado)
- Campo `affiliateUrl` no modelo `Ingredient`
- Componente `AffiliateLink` na tela de detalhes da receita
- Detector automático planejado: serviço que verifica nome do ingrediente contra catálogo de produtos com links de afiliado

## Próximos passos sugeridos
- [ ] Integrar Algolia para busca textual avançada
- [ ] Sistema de comentários em tempo real (Firestore onSnapshot)
- [ ] Notificações push (Firebase Cloud Messaging)
- [ ] Sistema de seguir usuários
- [ ] Detector automático de afiliados por ingrediente
- [ ] Modo offline completo (Firestore cache)
- [ ] Testes com Vitest + React Testing Library
