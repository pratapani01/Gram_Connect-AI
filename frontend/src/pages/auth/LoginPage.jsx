import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import { Eye, EyeOff, Leaf, Shield, Users } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.user, data.accessToken, data.refreshToken)
      toast.success(`Welcome back, ${data.user.name}!`)
      if (data.user.forcePasswordChange) {
        navigate('/change-password')
      } else {
        navigate(`/${data.user.role}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-saffron-50 flex">
      {/* Left Panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 to-primary-900 text-white flex-col justify-between p-12 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-saffron-400" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="font-bold text-2xl">GramConnect AI</div>
              <div className="text-primary-200 text-sm">Digital Governance Platform</div>
            </div>
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight mb-6">
            Empowering Villages<br />Through Technology
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed">
            Connect citizens with their Sarpanch. Report issues, track resolutions, and build a better tomorrow for Indian villages.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-4">
          {[
            { icon: <Users className="w-5 h-5" />, label: 'Multi-Village', sub: 'Platform' },
            { icon: <Shield className="w-5 h-5" />, label: 'Secure', sub: 'Authentication' },
            { icon: <Leaf className="w-5 h-5" />, label: 'Real-time', sub: 'Tracking' },
          ].map((item, i) => (
            <div key={i} className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">{item.icon}</div>
              <div className="font-semibold text-sm">{item.label}</div>
              <div className="text-primary-200 text-xs">{item.sub}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">GramConnect AI</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-center">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-500">
            New citizen?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">
              Create account
            </Link>
          </p>

          {/* <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200"> */}
            {/* <p className="text-xs text-amber-700 font-semibold mb-1">Demo Credentials</p> */}
            {/* <p className="text-xs text-amber-600">Admin: admin@gramconnect.ai / Admin@123</p> */}
          {/* </div> */}
        </motion.div>
      </div>
    </div>
  )
}
