import { useEffect } from 'react'
import { AppRouter } from '@/router'
import { useAuthViewModel } from '@/viewmodels'
import '@/styles/globals.css'

// Inicializa o listener de auth ao montar a aplicação
const AuthInitializer = () => {
  const { isLoading } = useAuthViewModel()

  // Listener já é registrado dentro do ViewModel via useEffect
  if (isLoading) return null
  return null
}

const App = () => (
  <>
    <AuthInitializer />
    <AppRouter />
  </>
)

export default App
