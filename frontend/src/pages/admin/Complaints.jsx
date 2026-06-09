import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../api/axios'
import { StatusBadge, PriorityBadge, SkeletonCard, EmptyState, PageHeader } from '../../components/common/UI'

const STATUSES = ['All','Pending','In Progress','Resolved','Rejected','Escalated','Awaiting Sarpanch Assignment']

export default function AdminComplaints() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-complaints', page, search, status],
    queryFn: () => api.get('/admin/complaints', {
      params: { page, limit: 15, ...(search && { search }), ...(status !== 'All' && { status }) }
    }).then(r => r.data),
    keepPreviousData: true,
  })

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="All Complaints" description="Platform-wide complaint management" />

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9 text-sm" placeholder="Search by title or complaint number..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input text-sm w-auto min-w-36" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {!isLoading && data && (
        <p className="text-sm text-gray-500">{data.pagination.total} total complaints</p>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : data?.complaints?.length === 0 ? (
        <EmptyState title="No complaints found" />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['#No', 'Title', 'Citizen', 'Sarpanch', 'Village', 'Category', 'Priority', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.complaints.map((c, i) => (
                  <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">{c.complaintNumber}</td>
                    <td className="px-4 py-3 max-w-48">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{c.citizen?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{c.sarpanch?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{c.village?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{c.category}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
          <p className="text-sm text-gray-500">Page {page} of {data.pagination.pages}</p>
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
