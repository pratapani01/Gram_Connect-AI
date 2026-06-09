import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Select from 'react-select'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import { Eye, EyeOff, Leaf } from 'lucide-react'

const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: '0.75rem',
    borderColor: state.isFocused ? '#16a34a' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(22,163,74,0.2)' : 'none',
    padding: '2px 4px',
    fontSize: '14px',
    '&:hover': { borderColor: '#16a34a' },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '14px',
    backgroundColor: state.isSelected ? '#16a34a' : state.isFocused ? '#f0fdf4' : 'white',
    color: state.isSelected ? 'white' : '#374151',
  }),
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '', address: '' })

  const [states, setStates] = useState([])
  const [districts, setDistricts] = useState([])
  const [villages, setVillages] = useState([])
  const [selectedState, setSelectedState] = useState(null)
  const [selectedDistrict, setSelectedDistrict] = useState(null)
  const [selectedVillage, setSelectedVillage] = useState(null)
  const [loadingLoc, setLoadingLoc] = useState(false)

  useEffect(() => {
    api.get('/locations/states').then(r => setStates(r.data.states.map(s => ({ value: s._id, label: s.name }))))
  }, [])

  const handleStateChange = async (opt) => {
    setSelectedState(opt)
    setSelectedDistrict(null)
    setSelectedVillage(null)
    setDistricts([])
    setVillages([])
    if (opt) {
      setLoadingLoc(true)
      const r = await api.get(`/locations/districts/${opt.value}`)
      setDistricts(r.data.districts.map(d => ({ value: d._id, label: d.name })))
      setLoadingLoc(false)
    }
  }

  const handleDistrictChange = async (opt) => {
    setSelectedDistrict(opt)
    setSelectedVillage(null)
    setVillages([])
    if (opt) {
      setLoadingLoc(true)
      const r = await api.get(`/locations/villages/${opt.value}`)
      setVillages(r.data.villages.map(v => ({ value: v._id, label: v.name })))
      setLoadingLoc(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedState || !selectedDistrict || !selectedVillage) {
      return toast.error('Please select your complete location')
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', {
        ...form,
        state: selectedState.value,
        district: selectedDistrict.value,
        village: selectedVillage.value,
      })
      login(data.user, data.accessToken, data.refreshToken)
      toast.success('Registration successful! Welcome to GramConnect AI')
      navigate('/citizen')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-saffron-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="card shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">Create Account</div>
              <div className="text-gray-500 text-sm">Join GramConnect AI as a Citizen</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                <input className="input" placeholder="Ramesh Kumar" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                <input type="email" className="input" placeholder="ramesh@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} className="input pr-10" placeholder="Min 6 characters"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
                <input className="input" placeholder="9876543210" value={form.mobile}
                  onChange={e => setForm({ ...form, mobile: e.target.value })} />
              </div>
            </div>

            {/* Location Selection */}
            <div className="border-t pt-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">📍 Your Location (required)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">State *</label>
                  <Select options={states} value={selectedState} onChange={handleStateChange}
                    styles={selectStyles} placeholder="Select state..." isLoading={loadingLoc && !selectedState} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">District *</label>
                  <Select options={districts} value={selectedDistrict} onChange={handleDistrictChange}
                    styles={selectStyles} placeholder="Select district..." isDisabled={!selectedState}
                    isLoading={loadingLoc && selectedState && !selectedDistrict} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Village / City *</label>
                  <Select options={villages} value={selectedVillage} onChange={setSelectedVillage}
                    styles={selectStyles} placeholder="Select village..." isDisabled={!selectedDistrict}
                    isLoading={loadingLoc && selectedDistrict && !selectedVillage} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
              <textarea className="input resize-none h-20" placeholder="House No, Street, Locality..."
                value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>

            {selectedVillage && (
              <div className="bg-primary-50 rounded-xl p-3 text-sm text-primary-800">
                📍 Location: {selectedVillage.label}, {selectedDistrict?.label}, {selectedState?.label}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
