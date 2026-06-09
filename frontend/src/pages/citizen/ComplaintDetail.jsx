import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { ArrowLeft, MapPin, Clock, ExternalLink, Image } from 'lucide-react'
import api from '../../api/axios'
import { StatusBadge, PriorityBadge, SkeletonCard } from '../../components/common/UI'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export default function ComplaintDetail() {
  const { id } = useParams()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => api.get(`/complaints/${id}`).then(r => r.data.complaint),
  })

  if (isLoading) return <div className="space-y-4">{Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
  if (isError || !data) return <div className="card text-center text-red-500 py-10">Complaint not found</div>

  const c = data

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/citizen/complaints" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="page-title flex-1 truncate">{c.title}</h1>
      </div>

      {/* Header Card */}
      <div className="card">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">#{c.complaintNumber}</span>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{c.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={c.priority} />
            <StatusBadge status={c.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <div><span className="text-gray-400 block">Category</span><span className="font-medium">{c.category}</span></div>
          <div><span className="text-gray-400 block">Village</span><span className="font-medium">{c.village?.name}</span></div>
          <div><span className="text-gray-400 block">Submitted</span><span className="font-medium">{new Date(c.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</span></div>
          <div><span className="text-gray-400 block">Sarpanch</span><span className="font-medium">{c.sarpanch?.name || 'Not assigned'}</span></div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-gray-600 mb-1">Description</p>
          <p className="text-gray-700 leading-relaxed">{c.description}</p>
        </div>

        {c.address && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{c.address}</span>
          </div>
        )}

        {c.resolutionNote && (
          <div className="mt-4 bg-green-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-green-700 mb-1">Resolution Note</p>
            <p className="text-green-800 text-sm">{c.resolutionNote}</p>
          </div>
        )}

        {c.rejectionReason && (
          <div className="mt-4 bg-red-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-700 mb-1">Rejection Reason</p>
            <p className="text-red-800 text-sm">{c.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* Images */}
      {c.images?.length > 0 && (
        <div className="card">
          <h3 className="section-title mb-3 flex items-center gap-2"><Image className="w-4 h-4" /> Complaint Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {c.images.map((img, i) => (
              <a key={i} href={img.url} target="_blank" rel="noopener noreferrer"
                className="aspect-square rounded-xl overflow-hidden border border-gray-100 hover:opacity-90 transition-opacity">
                <img src={img.url} alt={`Complaint image ${i + 1}`} className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Resolution Images */}
      {c.resolutionImages?.length > 0 && (
        <div className="card">
          <h3 className="section-title mb-3 flex items-center gap-2 text-green-700"><Image className="w-4 h-4" /> Resolution Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {c.resolutionImages.map((img, i) => (
              <a key={i} href={img.url} target="_blank" rel="noopener noreferrer"
                className="aspect-square rounded-xl overflow-hidden border border-green-100 hover:opacity-90 transition-opacity">
                <img src={img.url} alt={`Resolution image ${i + 1}`} className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Map */}
      {c.latitude && c.longitude && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title flex items-center gap-2"><MapPin className="w-4 h-4" /> Complaint Location</h3>
            <a href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`} target="_blank" rel="noopener noreferrer"
              className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:underline">
              <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
            </a>
          </div>
          <div className="h-64 rounded-xl overflow-hidden">
            <MapContainer center={[c.latitude, c.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
              <Marker position={[c.latitude, c.longitude]}>
                <Popup>
                  <strong>{c.title}</strong><br />
                  {c.address || 'No address provided'}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="card">
        <h3 className="section-title mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Status Timeline</h3>
        <div className="space-y-0">
          {c.updates?.slice().reverse().map((update, i) => (
            <div key={i} className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary-500 flex-shrink-0 mt-1.5 z-10" />
                {i < c.updates.length - 1 && <div className="w-0.5 bg-gray-200 flex-1 my-1" />}
              </div>
              <div className="pb-5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={update.status} />
                  <span className="text-xs text-gray-400">{new Date(update.createdAt).toLocaleString('en-IN')}</span>
                  {update.updatedBy && <span className="text-xs text-gray-400">by {update.updatedBy.name}</span>}
                </div>
                {update.remark && <p className="text-sm text-gray-600 mt-1">{update.remark}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
