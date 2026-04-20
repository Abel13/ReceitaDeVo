import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout, AuthLayout } from "@/components/templates";
import { useAuthStore } from "@/store";
import { Skeleton } from "@/components/atoms";

// ── Lazy pages ──────────────────────────────
const HomePage = lazy(() => import("@/components/pages/HomePage"));
const RecipeDetailPage = lazy(
  () => import("@/components/pages/RecipeDetailPage"),
);
const CreateRecipePage = lazy(
  () => import("@/components/pages/CreateRecipePage"),
);
const IngredientSearch = lazy(
  () => import("@/components/pages/IngredientSearchPage"),
);
const ProfilePage = lazy(() => import("@/components/pages/ProfilePage"));
const FavoritesPage = lazy(() => import("@/components/pages/FavoritesPage"));
const LoginPage = lazy(() => import("@/components/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/components/pages/RegisterPage"));
const NotFoundPage = lazy(() => import("@/components/pages/NotFoundPage"));

// ── Route Guards ────────────────────────────
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader />;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader />;
  return !user ? <>{children}</> : <Navigate to="/" replace />;
};

const PageLoader = () => (
  <div className="flex flex-col gap-4 p-6">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-48" />
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────
//  App Router
// ─────────────────────────────────────────────
export const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Públicas com layout principal */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="receita/:id" element={<RecipeDetailPage />} />
          <Route path="ingredientes" element={<IngredientSearch />} />
          <Route path="categorias" element={<IngredientSearch />} />
          <Route path="buscar" element={<HomePage />} />

          {/* Privadas */}
          <Route
            path="receita/nova"
            element={
              <PrivateRoute>
                <CreateRecipePage />
              </PrivateRoute>
            }
          />
          <Route
            path="perfil"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="salvas"
            element={
              <PrivateRoute>
                <FavoritesPage />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Auth (sem navbar) */}
        <Route element={<AuthLayout />}>
          <Route
            path="login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="cadastro"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
