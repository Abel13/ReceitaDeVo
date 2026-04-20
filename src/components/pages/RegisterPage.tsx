import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms'
import { useAuthViewModel } from '@/viewmodels'

const RegisterPage = () => {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const { signUpWithEmail, signInWithGoogle, error, isLoading } = useAuthViewModel()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signUpWithEmail(name, email, password)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl text-cafe">Criar sua conta</h2>
        <p className="text-sm text-cafe-muted mt-1">Compartilhe as receitas da sua família com o mundo</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          type="text"
          label="Seu nome"
          placeholder="Como quer ser chamado(a)?"
          value={name}
          onChange={e => setName(e.target.value)}
          leftIcon={<User size={15} />}
          required
          autoComplete="name"
        />

        <Input
          id="email"
          type="email"
          label="E-mail"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          leftIcon={<Mail size={15} />}
          required
          autoComplete="email"
        />

        <div className="relative">
          <Input
            id="password"
            type={showPass ? 'text' : 'password'}
            label="Senha"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            leftIcon={<Lock size={15} />}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            className="absolute right-3 top-8 text-cafe-subtle hover:text-cafe transition-colors focus-ring rounded-lg p-0.5"
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        <p className="text-xs text-cafe-subtle">
          Ao criar sua conta, você concorda com nossos{' '}
          <a href="/termos" className="text-terracota hover:underline">Termos de Uso</a>.
        </p>

        <Button type="submit" fullWidth isLoading={isLoading}>
          Criar conta
        </Button>
      </form>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t border-cafe/10" />
        <span className="text-xs text-cafe-subtle">ou</span>
        <div className="flex-1 border-t border-cafe/10" />
      </div>

      <Button variant="ghost" fullWidth onClick={signInWithGoogle} type="button">
        <GoogleIcon /> Continuar com Google
      </Button>

      <p className="text-center text-sm text-cafe-muted">
        Já tem conta?{' '}
        <Link to="/login" className="font-bold text-terracota hover:text-terracota-dark transition-colors">
          Entrar
        </Link>
      </p>
    </div>
  )
}

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default RegisterPage
