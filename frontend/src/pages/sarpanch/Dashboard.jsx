import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp, Users } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import { StatCard, SkeletonCard, StatusBadge, PriorityBadge, PageHeader } from '../../components/common/UI'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const COLORS = ['#f59e0b','#3b82f6','#22c55e','#ef4444','#f97316','#8b5cf6']

export default function SarpanchDashboard() {
  const { user } = useAuthStore()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['sarpanch-stats'],
    queryFn: () => api.get('/sarpanch/village-stats').then(r => r.data.stats),
  })

  const { data: recentData, isLoading: recentLoading } = useQuery({
    queryKey: ['sarpanch-recent'],
    queryFn: () => api.get('/complaints?limit=5&sortBy=createdAt&sortOrder=desc').then(r => r.data),
  })

  const { data: trendData } = useQuery({
    queryKey: ['sarpanch-trend'],
    queryFn: () => api.get('/sarpanch/monthly-trend').then(r => r.data.data),
  })

  const { data: categoryData } = useQuery({
    queryKey: ['sarpanch-categories'],
    queryFn: () => api.get('/sarpanch/category-stats').then(r => r.data.data),
  })

  const chartData = trendData?.map(d => ({ name: MONTHS[d._id.month - 1], complaints: d.count })) || []

  const pieData = categoryData?.map(d => ({ name: d._id, value: d.count })) || []

  const statCards = [
    { label: 'Total Complaints', value: stats?.total, icon: FileText, color: 'primary' },
    { label: 'Total Citizens', value: stats?.totalCitizens, icon: Users, color: 'blue' },
    { label: 'Pending', value: stats?.Pending, icon: Clock, color: 'yellow' },
    { label: 'In Progress', value: stats?.['In Progress'], icon: TrendingUp, color: 'blue' },
    { label: 'Resolved', value: stats?.Resolved, icon: CheckCircle, color: 'green' },
    { label: 'Escalated', value: stats?.Escalated, icon: AlertTriangle, color: 'orange' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-900 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Namaste, Sarpanch {user?.name?.split(' ')[0]}! 🙏</h1>
        <p className="text-blue-200 mt-1 text-sm">
          Managing {user?.village?.name}, {user?.district?.name}, {user?.state?.name}
        </p>
        <div className="flex gap-3 mt-4 flex-wrap">
          <Link to="/sarpanch/complaints?status=Pending"
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            View Pending Complaints
          </Link>
          <Link to="/sarpanch/complaints?status=Escalated"
            className="bg-orange-500/80 hover:bg-orange-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Escalated ({stats?.Escalated || 0})
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsLoading
          ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <StatCard {...s} />
            </motion.div>
          ))
        }
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="section-title mb-4">Monthly Complaint Trend</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="complaints" fill="#1e3a8a" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data yet</div>}
        </div>

        <div className="card">
          <h3 className="section-title mb-4">Category Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No complaints yet</div>}
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Recent Complaints</h3>
          <Link to="/sarpanch/complaints" className="text-primary-600 text-sm font-semibold hover:underline">View all</Link>
        </div>
        {recentLoading
          ? <div className="space-y-3">{Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
          : recentData?.complaints?.length === 0
          ? <p className="text-gray-400 text-sm text-center py-8">No complaints yet</p>
          : (
            <div className="space-y-3">
              {recentData?.complaints?.map(c => (
                <Link key={c._id} to={`/sarpanch/complaints/${c._id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-navy-700">{c.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 flex-wrap">
                      <span>#{c.complaintNumber}</span>
                      <span>•</span>
                      <span>{c.citizen?.name}</span>
                      <span>•</span>
                      <span>{c.category}</span>
                      <span>•</span>
                      <span>{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                </Link>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}
