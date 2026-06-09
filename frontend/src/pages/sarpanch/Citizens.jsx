// Citizens.jsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, Phone, Mail, Calendar } from 'lucide-react'
import api from '../../api/axios'
import { EmptyState, PageHeader, SkeletonCard } from '../../components/common/UI'

export function SarpanchCitizens() {
  const { data, isLoading } = useQuery({
    queryKey: ['village-citizens'],
    queryFn: () => api.get('/sarpanch/citizens').then(r => r.data.citizens),
  })

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Village Citizens" description={`${data?.length || 0} registered citizens`} />
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : data?.length === 0 ? (
        <EmptyState icon={Users} title="No citizens yet" description="Citizens will appear here after registration." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((citizen, i) => (
            <motion.div key={citizen._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {citizen.profilePicture
                    ? <img src={citizen.profilePicture} alt="" className="w-full h-full object-cover" />
                    : <span className="text-primary-600 font-bold text-lg">{citizen.name?.[0]?.toUpperCase()}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{citizen.name}</p>
                  <div className="mt-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Mail className="w-3 h-3" /><span className="truncate">{citizen.email}</span>
                    </div>
                    {citizen.mobile && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone className="w-3 h-3" /><span>{citizen.mobile}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>Joined {new Date(citizen.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                    </div>
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

export default SarpanchCitizens
