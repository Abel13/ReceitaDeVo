import { Outlet } from 'react-router-dom'
import { Navbar, BottomTabBar, ToastContainer } from '@/components/organisms'

// ─────────────────────────────────────────────
//  Template: MainLayout
//  Envolve todas as páginas autenticadas e públicas
// ─────────────────────────────────────────────
export const MainLayout = () => (
  <div className="min-h-screen bg-creme">
    <Navbar />
    <main className="mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-6">
      <Outlet />
    </main>
    <BottomTabBar />
    <ToastContainer />
  </div>
)

// ─────────────────────────────────────────────
//  Template: AuthLayout
//  Layout centrado para login e cadastro
// ─────────────────────────────────────────────
export const AuthLayout = () => (
  <div className="min-h-screen bg-creme flex items-center justify-center px-4">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl text-terracota italic">Receita de Vó</h1>
        <p className="text-cafe-muted text-sm mt-1">Sabores que atravessam gerações</p>
      </div>
      <div className="bg-white rounded-brand border border-cafe/10 p-8 shadow-card">
        <Outlet />
      </div>
    </div>
    <ToastContainer />
  </div>
)
