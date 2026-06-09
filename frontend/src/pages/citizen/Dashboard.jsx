import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, PlusCircle, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import { StatCard, SkeletonCard, StatusBadge, PriorityBadge } from '../../components/common/UI'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const COLORS = ['#f59e0b','#3b82f6','#22c55e','#ef4444','#f97316','#8b5cf6','#6b7280']

export default function CitizenDashboard() {
  const { user } = useAuthStore()

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['citizen-stats'],
    queryFn: () => api.get('/complaints/stats').then(r => r.data.stats),
  })

  const { data: recentData, isLoading: recentLoading } = useQuery({
    queryKey: ['citizen-recent-complaints'],
    queryFn: () => api.get('/complaints?limit=5&sortBy=createdAt&sortOrder=desc').then(r => r.data),
  })

  const { data: trendData } = useQuery({
    queryKey: ['citizen-trend'],
    queryFn: () => api.get('/complaints/monthly-trend').then(r => r.data.data),
  })

  const chartData = trendData?.map(d => ({
    name: MONTHS[d._id.month - 1],
    complaints: d.count,
  })) || []

  const pieData = statsData ? [
    { name: 'Pending', value: statsData.Pending || 0 },
    { name: 'In Progress', value: statsData['In Progress'] || 0 },
    { name: 'Resolved', value: statsData.Resolved || 0 },
    { name: 'Rejected', value: statsData.Rejected || 0 },
    { name: 'Escalated', value: statsData.Escalated || 0 },
  ].filter(d => d.value > 0) : []

  const stats = [
    { label: 'Total Complaints', value: statsData?.total, icon: FileText, color: 'primary' },
    { label: 'Pending', value: statsData?.Pending, icon: Clock, color: 'yellow' },
    { label: 'In Progress', value: statsData?.['In Progress'], icon: TrendingUp, color: 'blue' },
    { label: 'Resolved', value: statsData?.Resolved, icon: CheckCircle, color: 'green' },
    { label: 'Rejected', value: statsData?.Rejected, icon: XCircle, color: 'red' },
    { label: 'Escalated', value: statsData?.Escalated, icon: AlertTriangle, color: 'orange' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Namaste, {user?.name?.split(' ')[0]}! 🙏</h1>
            <p className="text-primary-100 mt-1 text-sm">
              📍 {user?.village?.name}, {user?.district?.name}, {user?.state?.name}
            </p>
            {!user?.village?.hasSarpanch && (
              <div className="mt-3 bg-white/20 rounded-xl px-3 py-2 text-sm inline-block">
                ⚠️ No Sarpanch assigned to your village yet. Complaints are stored safely.
              </div>
            )}
          </div>
          <Link to="/citizen/complaints/new"
            className="flex items-center gap-2 bg-white text-primary-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors shadow-sm">
            <PlusCircle className="w-5 h-5" />
            New Complaint
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsLoading
          ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <StatCard {...s} />
            </motion.div>
          ))
        }
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="card">
          <h3 className="section-title mb-4">Monthly Complaints</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="complaints" fill="#16a34a" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Pie chart */}
        <div className="card">
          <h3 className="section-title mb-4">Status Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No complaints yet</div>
          )}
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Recent Complaints</h3>
          <Link to="/citizen/complaints" className="text-primary-600 text-sm font-semibold hover:underline">View all</Link>
        </div>
        {recentLoading ? (
          <div className="space-y-3">{Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : recentData?.complaints?.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No complaints yet. <Link to="/citizen/complaints/new" className="text-primary-600 font-semibold">Submit your first complaint</Link></p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentData?.complaints?.map(c => (
              <Link key={c._id} to={`/citizen/complaints/${c._id}`}
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-primary-50 rounded-xl transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm truncate group-hover:text-primary-700">{c.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500">#{c.complaintNumber}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{c.category}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
