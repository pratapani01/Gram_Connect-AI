import { AlertCircle, FileX, Inbox } from 'lucide-react'

export const StatusBadge = ({ status }) => {
  const map = {
    'Pending': 'badge status-pending',
    'In Progress': 'badge status-in-progress',
    'Resolved': 'badge status-resolved',
    'Rejected': 'badge status-rejected',
    'Escalated': 'badge status-escalated',
    'Assigned': 'badge status-assigned',
    'Awaiting Sarpanch Assignment': 'badge status-awaiting',
  }
  return <span className={map[status] || 'badge bg-gray-100 text-gray-700'}>{status}</span>
}

export const PriorityBadge = ({ priority }) => {
  const map = {
    'Low': 'badge bg-green-100 text-green-800',
    'Medium': 'badge bg-yellow-100 text-yellow-800',
    'High': 'badge bg-orange-100 text-orange-800',
    'Urgent': 'badge bg-red-100 text-red-800',
  }
  return <span className={map[priority] || 'badge bg-gray-100 text-gray-700'}>{priority}</span>
}

export const SkeletonCard = () => (
  <div className="card animate-pulse space-y-3">
    <div className="skeleton h-5 w-1/2 rounded" />
    <div className="skeleton h-4 w-full rounded" />
    <div className="skeleton h-4 w-2/3 rounded" />
    <div className="flex gap-2 mt-2">
      <div className="skeleton h-6 w-20 rounded-full" />
      <div className="skeleton h-6 w-16 rounded-full" />
    </div>
  </div>
)

export const EmptyState = ({ icon: Icon = Inbox, title = 'No data found', description = '' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-lg font-semibold text-gray-600 mb-1">{title}</h3>
    {description && <p className="text-sm text-center max-w-xs">{description}</p>}
  </div>
)

export const ErrorState = ({ message = 'Something went wrong', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
      <AlertCircle className="w-8 h-8 text-red-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-600 mb-1">Error</h3>
    <p className="text-sm text-center max-w-xs mb-4">{message}</p>
    {onRetry && <button onClick={onRetry} className="btn-secondary text-sm">Try Again</button>}
  </div>
)

export const StatCard = ({ icon: Icon, label, value, color = 'primary', trend }) => {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-gray-50 text-gray-600',
  }
  return (
    <div className="stat-card">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
      </div>
    </div>
  )
}

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} border-3 border-gray-200 border-t-primary-600 rounded-full animate-spin`} />
    </div>
  )
}

export const PageHeader = ({ title, description, action }) => (
  <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
    <div>
      <h1 className="page-title">{title}</h1>
      {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
)
