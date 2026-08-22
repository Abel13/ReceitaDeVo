import { AppRouter } from '@/router'
import { useAuthBootstrap } from '@/viewmodels'
import '@/styles/globals.css'

const AuthBootstrap = () => {
  useAuthBootstrap()
  return null
}

const App = () => (
  <>
    <AuthBootstrap />
    <AppRouter />
  </>
)

export default App
