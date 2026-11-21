import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'

export default function LoginPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setFormError('')

    if (!email || !password) {
      setErrors({ email: !email ? 'Email is required.' : '', password: !password ? 'Password is required.' : '' })
      return
    }

    setLoading(true)
    try {
      const user = await login(email, password)
      setUser(user)
      navigate(user.role === 'staff' ? '/quick-order' : '/', { replace: true })
    } catch (err) {
      setFormError(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <span className="text-4xl" aria-hidden="true">
            🍟
          </span>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">FastFood POS</h1>
          <p className="text-sm text-slate-500">Sign in to continue</p>
        </div>

        {formError && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 rounded-lg bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
          Demo accounts — admin@fastfood.test / staff@fastfood.test
          <br />
          Password: <span className="font-mono font-semibold">password</span>
        </p>
      </div>
    </div>
  )
}