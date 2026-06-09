import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { MapPin, Users, Shield, FileText, AlertTriangle, CheckCircle, TrendingUp, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts'
import api from '../../api/axios'
import { StatCard, SkeletonCard, PageHeader } from '../../components/common/UI'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const COLORS = ['#f59e0b','#3b82f6','#22c55e','#ef4444','#f97316','#8b5cf6','#6b7280']

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data.stats),
  })

  const { data: growthData } = useQuery({
    queryKey: ['admin-growth'],
    queryFn: () => api.get('/admin/analytics/growth').then(r => r.data.data),
  })

  const { data: stateData } = useQuery({
    queryKey: ['admin-states'],
    queryFn: () => api.get('/admin/analytics/states').then(r => r.data.data),
  })

  const chartGrowth = growthData?.map(d => ({
    name: MONTHS[d._id.month - 1],
    complaints: d.count,
  })) || []

  const statusPie = stats?.complaintsByStatus ? Object.entries(stats.complaintsByStatus).map(([k, v]) => ({ name: k, value: v })).filter(d => d.value > 0) : []

  const statCards = [
    { label: 'Total States', value: stats?.totalStates, icon: MapPin, color: 'primary' },
    { label: 'Total Districts', value: stats?.totalDistricts, icon: MapPin, color: 'blue' },
    { label: 'Total Villages', value: stats?.totalVillages, icon: MapPin, color: 'green' },
    { label: 'Total Citizens', value: stats?.totalCitizens, icon: Users, color: 'purple' },
    { label: 'Sarpanches', value: stats?.totalSarpanches, icon: Shield, color: 'orange' },
    { label: 'Total Complaints', value: stats?.totalComplaints, icon: FileText, color: 'primary' },
    { label: 'Pending Requests', value: stats?.pendingRequests, icon: AlertTriangle, color: 'yellow' },
    { label: 'Resolved', value: stats?.complaintsByStatus?.Resolved || 0, icon: CheckCircle, color: 'green' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-saffron-500 to-saffron-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Admin Control Panel 👑</h1>
        <p className="text-saffron-100 mt-1 text-sm">Complete overview of GramConnect AI platform</p>
        <div className="flex gap-3 mt-4 flex-wrap">
          {stats?.pendingRequests > 0 && (
            <a href="/admin/sarpanch-requests"
              className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              ⚠️ {stats.pendingRequests} Pending Sarpanch Request{stats.pendingRequests !== 1 ? 's' : ''}
            </a>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading
          ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <StatCard {...s} />
            </motion.div>
          ))
        }
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="section-title mb-4">Complaint Growth (Monthly)</h3>
          {chartGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartGrowth}>
                <defs>
                  <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="complaints" stroke="#f97316" fill="url(#colorComplaints)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data yet</div>}
        </div>

        <div className="card">
          <h3 className="section-title mb-4">Complaint Status Distribution</h3>
          {statusPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {statusPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data</div>}
        </div>
      </div>

      {/* State-wise */}
      {stateData?.length > 0 && (
        <div className="card">
          <h3 className="section-title mb-4">State-wise Complaints</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stateData.slice(0, 10)} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis dataKey="state" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="total" name="Total" fill="#f97316" radius={[0, 4, 4, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
