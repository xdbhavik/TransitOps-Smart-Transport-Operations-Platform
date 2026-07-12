import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { loginApi } from '../api/authService'


const ROLES = [
  { value: 'admin', label: 'Admin', email: 'seed.admin@transitops.local' },
  { value: 'fleet_manager', label: 'Fleet Manager', email: 'seed.fleet@transitops.local' },
  { value: 'driver', label: 'Driver (Dispatcher)', email: 'seed.dispatcher@transitops.local' },
  { value: 'safety_officer', label: 'Safety Officer', email: 'seed.safety@transitops.local' },
  { value: 'financial_analyst', label: 'Financial Analyst', email: 'seed.finance@transitops.local' },
]

export default function Login() {
  const [roleSelection, setRoleSelection] = useState('fleet_manager')
  const [email, setEmail] = useState(ROLES.find(r => r.value === 'fleet_manager')?.email || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const { success, error: toastError } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const data = await loginApi(email, password, roleSelection)
      login(
        { name: data.user?.name || email.split('@')[0], email, ...data.user, role: data.role || roleSelection },
        data.role || roleSelection,
        data.token || data.access_token || 'demo-token'
      )
      success('Signed in successfully!')
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Invalid credentials'
      setError(msg)
      toastError(msg)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="w-full">
      {/* Form Header */}
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold text-on-surface mb-2 tracking-tight">
          Operations Portal
        </h2>
        <p className="text-base text-on-surface-variant max-w-sm mx-auto">
          Please select your role and sign in to access your dashboard.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-error/10 border border-error/20 flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-[18px]">error</span>
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Role Selection */}
        <div>
          <label htmlFor="role" className="form-label">Role</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">badge</span>
            </div>
            <select
              id="role"
              value={roleSelection}
              onChange={(e) => {
                setRoleSelection(e.target.value)
                const selected = ROLES.find(role => role.value === e.target.value)
                if (selected?.email) {
                  setEmail(selected.email)
                }
              }}
              className="form-input pl-10 appearance-none bg-surface-container border border-outline-variant rounded-md text-sm h-11 w-full focus:ring-2 focus:ring-primary focus:border-primary text-on-surface"
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">expand_more</span>
            </div>
          </div>
        </div>
        {/* Email */}
        <div>
          <label htmlFor="email" className="form-label">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">mail</span>
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seed.fleet@transitops.local"
              required
              className="form-input pl-10"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="form-label">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">lock</span>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="form-input pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>



        {/* Remember me */}
        <div className="flex items-center justify-between py-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-outline-variant bg-surface-container text-primary" />
            <span className="text-sm text-on-surface-variant">Remember me</span>
          </label>
          <button type="button" className="text-sm text-primary hover:opacity-80 transition-opacity font-medium">
            Forgot password?
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center py-2.5 text-base"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
              Signing in...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">login</span>
              Sign In
            </>
          )}
        </button>

      </form>
    </div>
  )
}
