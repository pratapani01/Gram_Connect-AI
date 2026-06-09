import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { PlusCircle, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../api/axios'
import { StatusBadge, PriorityBadge, SkeletonCard, EmptyState, PageHeader } from '../../components/common/UI'

const CATEGORIES = ['All', 'Water Supply','Electricity','Drainage','Road Damage','Garbage','Street Light','Public Property','Education','Health','Other']
const STATUSES = ['All','Pending','In Progress','Resolved','Rejected','Escalated','Awaiting Sarpanch Assignment']

export default function CitizenComplaints() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [category, setCategory] = useState('All')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['citizen-complaints', page, search, status, category],
    queryFn: () => api.get('/complaints', {
      params: {
        page,
        limit: 10,
        ...(search && { search }),
        ...(status !== 'All' && { status }),
        ...(category !== 'All' && { category }),
      }
    }).then(r => r.data),
    keepPreviousData: true,
  })

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="My Complaints"
        description="Track all your submitted complaints"
        action={
          <Link to="/citizen/complaints/new" className="btn-primary flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> New Complaint
          </Link>
        }
      />

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input pl-9 text-sm" placeholder="Search complaints..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="input text-sm w-auto min-w-36" value={status}
            onChange={e => { setStatus(e.target.value); setPage(1) }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="input text-sm w-auto min-w-36" value={category}
            onChange={e => { setCategory(e.target.value); setPage(1) }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : isError ? (
        <div className="card text-center py-10 text-red-500">Failed to load complaints</div>
      ) : data?.complaints?.length === 0 ? (
        <EmptyState title="No complaints found" description="Try adjusting your filters or submit a new complaint." />
      ) : (
        <div className="space-y-3">
          {data.complaints.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={`/citizen/complaints/${c._id}`}
                className="card hover:shadow-md hover:border-primary-200 border border-gray-100 transition-all duration-200 block group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">{c.title}</span>
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{c.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">#{c.complaintNumber}</span>
                      <span>•</span>
                      <span>{c.category}</span>
                      <span>•</span>
                      <span>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                    {c.images?.length > 0 && (
                      <span className="text-xs text-gray-400">{c.images.length} image{c.images.length !== 1 ? 's' : ''}</span>
                    )}
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
          <p className="text-sm text-gray-500">
            Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, data.pagination.total)} of {data.pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-700">{page} / {data.pagination.pages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === data.pagination.pages} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
