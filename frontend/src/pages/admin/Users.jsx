import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Search, ChevronLeft, ChevronRight, UserX, UserCheck } from 'lucide-react'
import api from '../../api/axios'
import { EmptyState, PageHeader, SkeletonCard } from '../../components/common/UI'

const ROLES = ['All', 'citizen', 'sarpanch', 'admin']

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('All')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, role],
    queryFn: () => api.get('/admin/users', {
      params: { page, limit: 15, ...(search && { search }), ...(role !== 'All' && { role }) }
    }).then(r => r.data),
    keepPreviousData: true,
  })

  const toggleStatus = useMutation({
    mutationFn: (id) => api.patch(`/admin/users/${id}/toggle-status`),
    onSuccess: () => {
      toast.success('User status updated')
      queryClient.invalidateQueries(['admin-users'])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const roleColors = { citizen: 'bg-blue-100 text-blue-800', sarpanch: 'bg-purple-100 text-purple-800', admin: 'bg-saffron-100 text-saffron-800' }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="User Management" description="All registered users on the platform" />

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9 text-sm" placeholder="Search by name or email..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input text-sm w-auto min-w-32" value={role} onChange={e => { setRole(e.target.value); setPage(1) }}>
          {ROLES.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : data?.users?.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User', 'Role', 'Location', 'Joined', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.users.map((u, i) => (
                  <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {u.profilePicture
                            ? <img src={u.profilePicture} alt="" className="w-full h-full object-cover" />
                            : <span className="text-sm font-bold text-gray-500">{u.name?.[0]?.toUpperCase()}</span>
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${roleColors[u.role]} capitalize`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {u.village?.name ? `${u.village.name}, ${u.district?.name}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <button onClick={() => toggleStatus.mutate(u._id)} disabled={toggleStatus.isPending}
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                            u.isActive
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}>
                          {u.isActive ? <><UserX className="w-3 h-3" /> Deactivate</> : <><UserCheck className="w-3 h-3" /> Activate</>}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing page {page} of {data.pagination.pages} ({data.pagination.total} total)</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={page === data.pagination.pages} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
