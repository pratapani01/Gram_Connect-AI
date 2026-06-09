import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck, Check } from 'lucide-react'
import api from '../../api/axios'
import { EmptyState, PageHeader, SkeletonCard } from '../../components/common/UI'

const typeColors = {
  complaint_submitted: 'bg-blue-50 text-blue-600',
  complaint_accepted: 'bg-green-50 text-green-600',
  complaint_rejected: 'bg-red-50 text-red-600',
  complaint_resolved: 'bg-emerald-50 text-emerald-600',
  status_changed: 'bg-purple-50 text-purple-600',
  escalated: 'bg-orange-50 text-orange-600',
  new_complaint: 'bg-yellow-50 text-yellow-600',
  sarpanch_request: 'bg-indigo-50 text-indigo-600',
  default: 'bg-gray-50 text-gray-600',
}

export default function CitizenNotifications() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications?limit=50').then(r => r.data),
  })

  const markRead = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  })

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/mark-all-read'),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  })

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <PageHeader
        title="Notifications"
        description={data?.unreadCount > 0 ? `${data.unreadCount} unread` : 'All caught up!'}
        action={
          data?.unreadCount > 0 && (
            <button onClick={() => markAllRead.mutate()} className="btn-secondary flex items-center gap-2 text-sm">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )
        }
      />

      {isLoading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : data?.notifications?.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You'll see complaint updates and important alerts here." />
      ) : (
        <div className="space-y-2">
          {data.notifications.map((n, i) => (
            <motion.div key={n._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className={`card p-4 border transition-all ${!n.isRead ? 'border-primary-200 bg-primary-50/30' : 'border-gray-100'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${typeColors[n.type] || typeColors.default}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.isRead && (
                        <button onClick={() => markRead.mutate(n._id)} title="Mark as read"
                          className="text-primary-600 hover:text-primary-700">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                    {n.complaint && (
                      <Link to={`/citizen/complaints/${n.complaint._id}`}
                        className="text-xs text-primary-600 font-medium hover:underline">
                        View complaint →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
