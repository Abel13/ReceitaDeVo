import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { Button } from '@/components/atoms/Button'

const NotFoundPage = () => (
  <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 text-center px-4">
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

export default NotFoundPage
