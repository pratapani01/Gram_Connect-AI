import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { UserCheck, Users, FileText, X, Eye, EyeOff } from 'lucide-react'
import api from '../../api/axios'
import { EmptyState, PageHeader, SkeletonCard } from '../../components/common/UI'

function CreateSarpanchModal({ request, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: 'Sarpanch@123' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) return toast.error('Name and email are required')
    setLoading(true)
    try {
      await api.post('/admin/create-sarpanch', { ...form, villageId: request.village._id })
      toast.success(`Sarpanch created for ${request.village.name}! All pending complaints assigned.`)
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create Sarpanch')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Create Sarpanch</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              For {request.village.name}, {request.district.name}, {request.state.name}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 bg-amber-50 border-b border-amber-100">
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-amber-700">
              <Users className="w-4 h-4" />
              <span>{request.citizenCount} citizens registered</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700">
              <FileText className="w-4 h-4" />
              <span>{request.complaintCount} complaints waiting</span>
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-2">
            ℹ️ After creation, all {request.complaintCount} pending complaints will automatically be assigned to this Sarpanch.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sarpanch Full Name *</label>
            <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Enter sarpanch name" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
            <input type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              placeholder="sarpanch@village.in" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
            <input className="input" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})}
              placeholder="10-digit mobile number" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Initial Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} className="input pr-10" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Sarpanch will be prompted to change this on first login</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating...' : 'Create Sarpanch'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function AdminSarpanchRequests() {
  const queryClient = useQueryClient()
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [tab, setTab] = useState('pending')

  const { data, isLoading } = useQuery({
    queryKey: ['sarpanch-requests', tab],
    queryFn: () => api.get(`/admin/sarpanch-requests?status=${tab}&limit=50`).then(r => r.data),
  })

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Sarpanch Assignment Requests"
        description="Villages waiting for Sarpanch assignment"
      />

      {/* Tabs */}
      <div className="flex gap-2">
        {['pending', 'fulfilled'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors capitalize ${tab === t ? 'bg-saffron-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-saffron-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : data?.requests?.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title={tab === 'pending' ? 'No pending requests' : 'No fulfilled requests'}
          description={tab === 'pending' ? 'All villages have Sarpanch assigned!' : ''}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.requests.map((req, i) => (
            <motion.div key={req._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`card border-2 hover:shadow-md transition-all ${tab === 'pending' ? 'border-amber-200 hover:border-amber-400' : 'border-green-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{req.village?.name}</h3>
                  <p className="text-gray-500 text-sm">{req.district?.name}, {req.state?.name}</p>
                </div>
                {tab === 'pending'
                  ? <span className="badge bg-amber-100 text-amber-800">Pending</span>
                  : <span className="badge bg-green-100 text-green-800">Fulfilled</span>
                }
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>{req.citizenCount} Citizens</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <span>{req.complaintCount} Complaints</span>
                </div>
              </div>

              {tab === 'fulfilled' && req.sarpanchCreated && (
                <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-3">
                  ✅ Sarpanch: {req.sarpanchCreated.name} ({req.sarpanchCreated.email})<br />
                  Assigned: {new Date(req.fulfilledAt).toLocaleDateString('en-IN')}
                </p>
              )}

              <p className="text-xs text-gray-400 mb-3">
                Request created: {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>

              {tab === 'pending' && (
                <button onClick={() => setSelectedRequest(req)} className="btn-primary w-full flex items-center justify-center gap-2">
                  <UserCheck className="w-4 h-4" /> Create Sarpanch
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedRequest && (
          <CreateSarpanchModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onSuccess={() => {
              queryClient.invalidateQueries(['sarpanch-requests'])
              queryClient.invalidateQueries(['admin-stats'])
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
