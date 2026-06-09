import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import api from '../../api/axios'
import { StatusBadge, PriorityBadge, SkeletonCard, EmptyState, PageHeader } from '../../components/common/UI'

const STATUSES = ['All','Pending','Assigned','In Progress','Resolved','Rejected','Escalated']
const CATEGORIES = ['All','Water Supply','Electricity','Drainage','Road Damage','Garbage','Street Light','Public Property','Education','Health','Other']
const PRIORITIES = ['All','Low','Medium','High','Urgent']

export default function SarpanchComplaints() {
  const [searchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(searchParams.get('status') || 'All')
  const [category, setCategory] = useState('All')
  const [priority, setPriority] = useState('All')

  const { data, isLoading } = useQuery({
    queryKey: ['sarpanch-complaints', page, search, status, category, priority],
    queryFn: () => api.get('/complaints', {
      params: {
        page, limit: 15,
        ...(search && { search }),
        ...(status !== 'All' && { status }),
        ...(category !== 'All' && { category }),
        ...(priority !== 'All' && { priority }),
      }
    }).then(r => r.data),
    keepPreviousData: true,
  })

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Village Complaints" description={`Manage all complaints from your village`} />

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9 text-sm" placeholder="Search by title or complaint number..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <div className="flex flex-wrap gap-3">
          <select className="input text-sm flex-1 min-w-28" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="input text-sm flex-1 min-w-28" value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="input text-sm flex-1 min-w-24" value={priority} onChange={e => { setPriority(e.target.value); setPage(1) }}>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Total count */}
      {!isLoading && data && (
        <p className="text-sm text-gray-500">{data.pagination.total} complaint{data.pagination.total !== 1 ? 's' : ''} found</p>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : data?.complaints?.length === 0 ? (
        <EmptyState title="No complaints found" description="Try adjusting your filters." />
      ) : (
        <div className="space-y-3">
          {data.complaints.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link to={`/sarpanch/complaints/${c._id}`}
                className="card hover:shadow-md hover:border-blue-200 border border-gray-100 transition-all duration-200 block group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-gray-900 group-hover:text-navy-700 transition-colors">{c.title}</span>
                      {c.isEscalated && (
                        <span className="badge bg-orange-100 text-orange-700 text-[10px]">🔺 Escalated</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-1 mb-2">{c.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">#{c.complaintNumber}</span>
                      <span>•</span>
                      <span className="font-medium text-gray-600">{c.citizen?.name}</span>
                      <span>•</span>
                      <span>{c.category}</span>
                      <span>•</span>
                      <span>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
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
